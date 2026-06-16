import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { isSoundEnabled } from "../../utils/SoundManager";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const CATEGORIAS_PREJUDICIAIS = new Set([
    "sweets", "candy", "chocolate", "dessert", "snacks", "snack",
    "chips", "cookies", "sausages", "sausage", "junk food",
    "fast food", "fried", "processed",
    ]);

    interface AnalysisResult {
    classification: string;
    status: {
        carboidrato: number;
        glicemia: number;
        proteina: number;
    };
    }

    export function useFoodResult(analysisResult: AnalysisResult, onFeedSuccess: (data: any) => void, onCancel: () => void) {
    const [loading, setLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const { carboidrato, glicemia, proteina } = analysisResult.status;
    const classificacaoLower = analysisResult.classification.toLowerCase();
    const ehPrejudicial = [...CATEGORIAS_PREJUDICIAIS].some((cat) =>
        classificacaoLower.includes(cat),
    );

    useEffect(() => {
        let entrySound: Audio.Sound | null = null;
        const timer = setTimeout(() => setIsReady(true), 2000);

        const playEntrySound = async () => {
        try {
            if (isSoundEnabled) {
            const { sound } = await Audio.Sound.createAsync(
                require("../../assets/analise_concluida.mp3"),
            );
            entrySound = sound;
            await sound.playAsync();
            }
        } catch (error) {
            console.error("Erro ao tocar som de entrada:", error);
        }
        };
        playEntrySound();

        return () => {
        clearTimeout(timer);
        if (entrySound) entrySound.unloadAsync();
        };
    }, []);

    const playButtonSound = async (type: "success" | "error") => {
        try {
        if (!isSoundEnabled) return;
        const audioSource =
            type === "success"
            ? require("../../assets/concluido.mp3")
            : require("../../assets/erro.mp3");
        const { sound } = await Audio.Sound.createAsync(audioSource);
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
        });
        await sound.playAsync();
        } catch (error) {
        console.error("Erro ao tocar o som do botão:", error);
        }
    };

    const handleFeed = async () => {
        if (!isReady || loading) return;
        setLoading(true);
        playButtonSound("success");

        try {
        const idPaciente = await AsyncStorage.getItem("idPaciente");
        const idAtivo = await AsyncStorage.getItem("idAtivo");
        const usuarioAtivoTipo = await AsyncStorage.getItem("usuarioAtivoTipo");

        let idParaSalvar = idAtivo || idPaciente;

        if (usuarioAtivoTipo === "responsavel" && idParaSalvar === idPaciente) {
            const depRes = await fetch(`${API_URL}/dependents/${idPaciente}`);
            const dependents = await depRes.json();
            if (!dependents.length) {
            Alert.alert("Erro", "Nenhum dependente encontrado.");
            return;
            }
            idParaSalvar = String(dependents[0].idpaciente);
            await AsyncStorage.setItem("idAtivo", idParaSalvar);
        }

        const response = await fetch(`${API_URL}/save-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            idPaciente: Number(idParaSalvar),
            carboidrato,
            glicemia,
            proteina,
            classification: analysisResult.classification,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            Alert.alert("Erro ao salvar", err.detail || "Tente novamente");
            return;
        }

        const data = await response.json();
        setTimeout(() => onFeedSuccess(data), 1000);
        } catch {
        Alert.alert("Erro de conexão", "Não foi possível salvar o status");
        } finally {
        setLoading(false);
        }
    };

    const handleCancel = () => {
        if (!isReady || loading) return;
        playButtonSound("error");
        setTimeout(() => onCancel(), 1000);
    };

    return { loading, isReady, ehPrejudicial, carboidrato, glicemia, proteina, handleFeed, handleCancel };
}