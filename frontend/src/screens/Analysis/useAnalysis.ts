import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { isSoundEnabled } from "../../utils/SoundManager";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useAnalysis(imageBase64: string, onResult: (data: any) => void) {
    const spinValue = useRef(new Animated.Value(0)).current;
    const soundRef = useRef<Audio.Sound | null>(null);
    const [petName, setPetName] = useState("");

    const fetchPetName = async () => {
        try {
        const idPaciente = await AsyncStorage.getItem("idPaciente");
        const idAtivo = await AsyncStorage.getItem("idAtivo");
        const tipoLoginOriginal = await AsyncStorage.getItem("tipoLoginOriginal");
        const tipo = await AsyncStorage.getItem("tipo");

        if (tipoLoginOriginal === "filho") {
            if (!idPaciente) return;
            const response = await fetch(`${API_URL}/character-status/${idPaciente}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data?.nome) setPetName(data.nome);
            return;
        }

        if (tipo === "filho" && idAtivo) {
            const response = await fetch(`${API_URL}/character-status/${idAtivo}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data?.nome) setPetName(data.nome);
            return;
        }

        if (tipo === "responsavel") {
            const idResponsavel = idPaciente;
            if (idAtivo && idAtivo !== idResponsavel) {
            const response = await fetch(`${API_URL}/character-status/${idAtivo}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data?.nome) setPetName(data.nome);
            } else {
            const response = await fetch(`${API_URL}/dependents/${idResponsavel}`);
            if (!response.ok) return;
            const dependents = await response.json();
            if (dependents.length === 0) { setPetName("Sem mascote"); return; }
            if (dependents[0].nomemascote) setPetName(dependents[0].nomemascote);
            }
        }
        } catch (error) {
        console.log("Erro ao buscar nome do pet:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
        fetchPetName();
        }, []),
    );

    useEffect(() => {
        Animated.loop(
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
        }),
        ).start();

        let backendData: any = null;
        let timerFinished = false;

        const tryNavigation = (data: any) => {
        if (timerFinished && data) {
            if (soundRef.current) {
            soundRef.current
                .stopAsync()
                .then(() => soundRef.current?.unloadAsync())
                .catch((err) => console.log("Erro ao parar som:", err));
            soundRef.current = null;
            }
            onResult(data);
        }
        };

        const playAnalysisSound = async () => {
        try {
            if (isSoundEnabled) {
            const { sound } = await Audio.Sound.createAsync(
                require("../../assets/analisando.mp3"),
                { isLooping: true },
            );
            soundRef.current = sound;
            await sound.playAsync();
            }
        } catch (error) {
            console.error("Erro ao tocar o som de análise:", error);
        }
        };
        playAnalysisSound();

        const processImage = async () => {
        try {
            const response = await fetch(`${API_URL}/process-image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_base64: imageBase64 }),
            });
            if (!response.ok) throw new Error("Falha na comunicação com o backend");
            backendData = await response.json();
            tryNavigation(backendData);
        } catch (error) {
            console.error("[AnalysisScreen error]:", error);
            backendData = {
            classification: "Erro ao analisar imagem",
            status: { carboidrato: 0, glicemia: 0, proteina: 0 },
            };
            tryNavigation(backendData);
        }
        };
        processImage();

        const timer = setTimeout(() => {
        timerFinished = true;
        if (backendData) tryNavigation(backendData);
        }, 3000);

        return () => {
        spinValue.stopAnimation();
        clearTimeout(timer);
        if (soundRef.current) {
            soundRef.current
            .stopAsync()
            .then(() => soundRef.current?.unloadAsync())
            .catch((err) => console.log("Erro no cleanup do som:", err));
        }
        };
    }, [imageBase64]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return { petName, spin };
}