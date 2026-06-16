import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toggleBackgroundMusic } from "../../utils/MusicPlayer";
import { isSoundEnabled, toggleSoundEffects } from "../../utils/SoundManager";

export function useSettings() {
    const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [isFilho, setIsFilho] = useState(false);
    const isMounted = useRef(false);

    useEffect(() => {
        const checkTipo = async () => {
        const tipoLoginOriginal = await AsyncStorage.getItem("tipoLoginOriginal");
        const usuarioAtivoTipo = await AsyncStorage.getItem("usuarioAtivoTipo");
        const filho = tipoLoginOriginal === "filho" || usuarioAtivoTipo === "filho";
        setIsFilho(filho);
        };
        checkTipo();
    }, []);

    useEffect(() => {
        if (!isMounted.current) {
        isMounted.current = true;
        return;
        }
        toggleBackgroundMusic(musicEnabled);
    }, [musicEnabled]);

    const handleSoundToggle = (value: boolean) => {
        setSoundEnabled(value);
        toggleSoundEffects(value);
    };

    const handleLogout = async (navigation: any) => {
        await toggleBackgroundMusic(false);
        navigation.navigate("Login");
    };

    return {
        soundEnabled,
        musicEnabled, setMusicEnabled,
        isFilho,
        handleSoundToggle,
        handleLogout,
    };
}