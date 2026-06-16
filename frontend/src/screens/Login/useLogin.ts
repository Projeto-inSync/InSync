import { useState } from "react";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const notify = (title: string, message: string) => {
    if (Platform.OS === "web") {
        window.alert(`${title}: ${message}`);
    } else {
        Alert.alert(title, message);
    }
};

export function useLogin(onAdmin: () => void, onSuccess: () => void) {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (login.trim() === "" || password.trim() === "") {
        notify("Atenção", "Por favor, preencha todos os campos para entrar no InSync.");
        return;
        }
        setLoading(true);
        try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login: login.trim(), senha: password.trim() }),
        });
        const data = await response.json();
        if (!response.ok) {
            notify("Erro", data.detail);
            return;
        }

        await AsyncStorage.setItem("idPaciente", String(data.user.idPaciente));
        await AsyncStorage.setItem("tipo", data.user.tipo);
        await AsyncStorage.setItem("nome", data.user.nome);
        await AsyncStorage.setItem("usuarioAtivoTipo", data.user.tipo);
        await AsyncStorage.setItem("tipoLoginOriginal", data.user.tipo);
        await AsyncStorage.removeItem("idAtivo");

        if (data.user.tipo === "admin") { onAdmin(); return; }
        onSuccess();
        } catch {
        notify("Erro", "Não foi possível conectar ao servidor");
        } finally {
        setLoading(false);
        }
    };
    return { login, setLogin, password, setPassword, loading, handleLogin };
}