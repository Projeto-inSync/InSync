import { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function useAddDependent(onSuccess: () => void) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [petName, setPetName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!username.trim() || !password.trim() || !petName.trim()) {
        Alert.alert("Atenção", "Por favor, preencha o nome da criança e o nome do mascote.");
        return;
        }

        setLoading(true);

        try {
        const idResponsavel = await AsyncStorage.getItem("idPaciente");
        if (!idResponsavel) {
            Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
            return;
        }

        const childResponse = await fetch(`${API_URL}/create-child`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            username: username.trim(),
            senha: password.trim(),
            idResponsavel,
            }),
        });

        const childData = await childResponse.json();
        if (!childResponse.ok) {
            Alert.alert("Erro", childData.detail || "Erro ao criar dependente.");
            return;
        }

        const charResponse = await fetch(`${API_URL}/add-character-name`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            idPaciente: childData.idPaciente,
            nome: petName.trim(),
            }),
        });

        const charData = await charResponse.json();
        if (!charResponse.ok) {
            Alert.alert("Erro", charData.detail || "Filho criado, mas erro ao criar mascote.");
            return;
        }

        Alert.alert(
            "Sucesso!",
            `${username} foi adicionado(a) à sua família InSync!\nSeu mascote "${petName}" está pronto!`,
            [{ text: "OK", onPress: onSuccess }],
        );
        } catch (error) {
        Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.");
        } finally {
        setLoading(false);
        }
    };

    return { username, setUsername, password, setPassword, petName, setPetName, loading, handleAdd };
}