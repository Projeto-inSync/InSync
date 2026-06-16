import { useState } from "react";
import { Alert, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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

export function useRegister(navigation: NativeStackNavigationProp<any, any>) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
            notify("Atenção", "Preencha todos os campos para continuar.");
            return;
        }

        const emailRegex = /\S+\.\S+/;
        if (!emailRegex.test(email)) {
            notify("E-mail inválido", "Por favor, insira um e-mail em formato correto.");
            return;
        }

        if (password.length < 6) {
            notify("Senha fraca", "A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: name, email: email, senha: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                notify("Erro no cadastro", data.detail || "Tente novamente.");
                return;
            }

            await AsyncStorage.setItem("idPaciente", String(data.idPaciente));
            await AsyncStorage.setItem("tipo", "responsavel");
            await AsyncStorage.setItem("nome", name.trim());
            await AsyncStorage.setItem("idAtivo", String(data.idPaciente));

            navigation.replace("HomeTab");
        } catch {
            notify("Erro de conexão", "Não foi possível conectar ao servidor.");
        } finally {
            setLoading(false);
        }
    };

    return {
        name, setName,
        email, setEmail,
        password, setPassword,
        loading,
        handleContinue,
    };
}