import { useState, useEffect, useCallback, useRef } from "react";
import { Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { isSoundEnabled } from "../../utils/SoundManager";
import { toggleBackgroundMusic } from "../../utils/MusicPlayer";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Conquista = {
    nome: string;
    descricao: string;
    icone: string;
    cor_fundo: string;
    cor_icone: string;
    };

    export type { Conquista };

    export function useHome(route: any, navigation: any) {
    const [isEating, setIsEating] = useState(false);
    const [petName, setPetName] = useState("");
    const [petStatus, setPetStatus] = useState({ carboidrato: 0, glicemia: 0, proteina: 0 });
    const [conquistaModal, setConquistaModal] = useState<Conquista | null>(null);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const breathAnim = useRef(new Animated.Value(1)).current;
    const eatScaleAnim = useRef(new Animated.Value(1)).current;
    const wobbleAnim = useRef(new Animated.Value(0)).current;
    const breathLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const eatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const eatSoundRef = useRef<Audio.Sound | null>(null);

    const startBreathing = useCallback(() => {
        breathLoopRef.current = Animated.loop(
        Animated.sequence([
            Animated.timing(breathAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
            Animated.timing(breathAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ]),
        );
        breathLoopRef.current.start();
    }, [breathAnim]);

    const stopBreathing = useCallback(() => {
        breathLoopRef.current?.stop();
        breathAnim.setValue(1);
    }, [breathAnim]);

    const playEatBounce = useCallback(() => {
        Animated.sequence([
        Animated.timing(eatScaleAnim, { toValue: 1.15, duration: 120, useNativeDriver: true }),
        Animated.timing(eatScaleAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
        Animated.timing(eatScaleAnim, { toValue: 1.08, duration: 100, useNativeDriver: true }),
        Animated.timing(eatScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    }, [eatScaleAnim]);

    const playWobble = useCallback(() => {
        wobbleAnim.setValue(0);
        Animated.sequence([
        Animated.timing(wobbleAnim, { toValue: 12, duration: 80, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: -12, duration: 80, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 10, duration: 70, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: -10, duration: 70, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    }, [wobbleAnim]);

    const playPandaSound = async () => {
        try {
        if (!isSoundEnabled) return;
        const { sound } = await Audio.Sound.createAsync(require("../../assets/panda_sound.mp3"));
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
        });
        await sound.playAsync();
        } catch (error) {
        console.error("Erro ao tocar o som interativo do panda:", error);
        }
    };

    const mostrarConquista = (conquista: Conquista) => {
        setConquistaModal(conquista);
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
    };

    const fecharConquista = () => {
        Animated.timing(scaleAnim, { toValue: 0, duration: 200, useNativeDriver: true })
        .start(() => setConquistaModal(null));
    };

    const fetchPetName = useCallback(async () => {
        try {
        const idPaciente = await AsyncStorage.getItem("idPaciente");
        const idAtivo = await AsyncStorage.getItem("idAtivo");
        const usuarioAtivoTipo = await AsyncStorage.getItem("usuarioAtivoTipo");

        if (!idAtivo && !idPaciente) return;
        let idParaBuscar = idAtivo || idPaciente;

        if (usuarioAtivoTipo === "responsavel" && idParaBuscar === idPaciente) {
            const depRes = await fetch(`${API_URL}/dependents/${idPaciente}`);
            if (depRes.ok) {
            const dependents = await depRes.json();
            if (dependents.length === 0) { setPetName("Sem mascote"); return; }
            idParaBuscar = String(dependents[0].idpaciente);
            await AsyncStorage.setItem("idAtivo", idParaBuscar);
            }
        }

        const response = await fetch(`${API_URL}/character-status/${idParaBuscar}`);
        if (!response.ok) { setPetName("Sem mascote"); return; }
        const data = await response.json();

        if (data?.nome) setPetName(data.nome);
        else setPetName("Sem mascote");

        const novaGlicemia = data.glicemia ?? 0;
        setPetStatus({
            carboidrato: data.carboidrato ?? 0,
            glicemia: novaGlicemia,
            proteina: data.proteina ?? 0,
        });

        if (usuarioAtivoTipo === "responsavel" && novaGlicemia > 60) {
            navigation.navigate("Calendar", {
            alertaGlicemiaImediato: {
                idpaciente: data.idpaciente,
                nomefilho: petName || "Seu filho",
                valorGlicemia: novaGlicemia,
            },
            });
        }
        } catch (error) {
        console.log("Erro ao buscar dados do pet:", error);
        }
    }, []);

    useEffect(() => {
        startBreathing();
        return () => stopBreathing();
    }, [startBreathing, stopBreathing]);

    useEffect(() => {
        if (!route.params?.feedPanda) return;

        stopBreathing();
        setIsEating(true);
        playEatBounce();
        playWobble();

        const playEatSound = async () => {
        try {
            if (!isSoundEnabled) return;
            const { sound } = await Audio.Sound.createAsync(require("../../assets/mastigando.mp3"));
            eatSoundRef.current = sound;
            await sound.playAsync();
        } catch (error) {
            console.error("Erro ao tocar o som do panda comendo:", error);
        }
        };
        playEatSound();

        if (eatTimerRef.current) clearTimeout(eatTimerRef.current);
        eatTimerRef.current = setTimeout(() => {
        setIsEating(false);
        startBreathing();
        navigation.setParams({ feedPanda: undefined });
        eatSoundRef.current?.unloadAsync();
        eatSoundRef.current = null;
        }, 3000);

        return () => {
        if (eatTimerRef.current) clearTimeout(eatTimerRef.current);
        eatSoundRef.current?.unloadAsync();
        eatSoundRef.current = null;
        };
    }, [route.params?.feedPanda]);

    useEffect(() => {
        if (route.params?.novasConquistas?.length > 0) {
        route.params.novasConquistas.forEach((conquista: Conquista, index: number) => {
            setTimeout(() => mostrarConquista(conquista), index * 3500);
        });
        navigation.setParams({ novasConquistas: undefined });
        }
    }, [route.params?.novasConquistas]);

    useFocusEffect(
        useCallback(() => {
        fetchPetName();
        const interval = setInterval(fetchPetName, 10000);
        return () => clearInterval(interval);
        }, [fetchPetName]),
    );

    useFocusEffect(
        useCallback(() => {
        const gerenciarMusica = async () => {
            const tipoLoginOriginal = await AsyncStorage.getItem("tipoLoginOriginal");
            const usuarioAtivoTipo = await AsyncStorage.getItem("usuarioAtivoTipo");
            const isFilho = tipoLoginOriginal === "filho" || usuarioAtivoTipo === "filho";
            await toggleBackgroundMusic(isFilho);
        };
        gerenciarMusica();
        }, []),
    );

    const pandaScale = isEating ? eatScaleAnim : breathAnim;

    return {
        isEating,
        petName,
        petStatus,
        conquistaModal,
        scaleAnim,
        wobbleAnim,
        pandaScale,
        playPandaSound,
        fecharConquista,
    };
}