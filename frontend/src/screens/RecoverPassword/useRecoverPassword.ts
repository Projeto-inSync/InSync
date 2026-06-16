import { useState } from "react";
import { Alert, Platform } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const notify = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export function useRecoverPassword(navigation: NativeStackNavigationProp<any, any>) {
    const [step, setStep] = useState<"email" | "reset">("email");
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequestReset = async () => {
        if (!email.trim()) {
            notify("Atenção", "Informe seu e-mail.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await response.json();
            if (!response.ok) {
                notify("Erro", data.detail);
                return;
            }
            notify("Sucesso", "Se o e-mail estiver cadastrado, você receberá o código.");
            setStep("reset");
        } catch {
            notify("Erro", "Não foi possível conectar ao servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            notify("Atenção", "Preencha todos os campos.");
            return;
        }
        if (newPassword !== confirmPassword) {
            notify("Atenção", "As senhas não coincidem.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    token: token.trim(),
                    nova_senha: newPassword.trim(),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                notify("Erro", data.detail);
                return;
            }
            if (Platform.OS === "web") {
                window.alert("Sucesso: Senha redefinida com sucesso!");
                navigation.navigate("Login");
            } else {
                Alert.alert("Sucesso", "Senha redefinida com sucesso!", [
                    { text: "OK", onPress: () => navigation.navigate("Login") },
                ]);
            }
        } catch {
            notify("Erro", "Não foi possível conectar ao servidor.");
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        email, setEmail,
        token, setToken,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        loading,
        handleRequestReset,
        handleResetPassword,
    };
}