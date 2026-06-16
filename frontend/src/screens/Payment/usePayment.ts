import { useState } from "react";
import { Alert } from "react-native";

export function usePayment(onSuccess: () => void) {
    const [selectedPlan, setSelectedPlan] = useState<"duo" | "family">("duo");

    const handleSubscribe = () => {
        Alert.alert(
        "Sucesso!",
        `Você assinou o ${selectedPlan === "duo" ? "Plano Pai e Filho" : "Plano Família"} com sucesso. Bem-vindo ao Premium!`,
        [{ text: "Começar", onPress: onSuccess }],
        );
    };

    return { selectedPlan, setSelectedPlan, handleSubscribe };
}