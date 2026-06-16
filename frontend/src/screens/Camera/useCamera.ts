import { useState, useRef } from "react";
import { Alert } from "react-native";
import { CameraView, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export function useCamera(onResult: (base64: string) => void) {
    const [facing, setFacing] = useState<CameraType>("back");
    const cameraRef = useRef<CameraView>(null);

    const toggleFacing = () =>
        setFacing((f) => (f === "back" ? "front" : "back"));

    const takePhoto = async () => {
        if (!cameraRef.current) return;
        try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        if (photo?.base64) onResult(photo.base64);
        } catch {
        Alert.alert("Erro", "Não foi possível tirar a foto. Tente novamente.");
        }
    };

    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
        Alert.alert("Permissão necessária", "O acesso à galeria é fundamental para analisar os alimentos.");
        return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.5,
        base64: true,
        });
        if (!result.canceled && result.assets[0].base64) onResult(result.assets[0].base64);
    };

    return { facing, toggleFacing, cameraRef, takePhoto, pickImageFromGallery };
}