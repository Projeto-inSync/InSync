import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { Alerta } from "./useCalendar";

interface AlertaBannerProps {
    alertas: Alerta[];
    nomeFilho: string;
    onFechar: () => void;
    }

    export function AlertaBanner({ alertas, nomeFilho, onFechar }: AlertaBannerProps) {
    const slideAnim = useRef(new Animated.Value(-200)).current;

    React.useEffect(() => {
        Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
        }).start();
    }, []);

    const fechar = () => {
        Animated.timing(slideAnim, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
        }).start(() => onFechar());
    };

    return (
        <Animated.View style={[styles.alertaBanner, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.alertaBannerHeader}>
            <View style={styles.alertaBannerTituloRow}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.alertaBannerTitulo}>Alerta: {nomeFilho}</Text>
            </View>
            <TouchableOpacity onPress={fechar}>
            <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
        </View>

        {alertas.map((a, i) => (
            <View key={i} style={styles.alertaItem}>
            <Ionicons name={a.icone as any} size={16} color="#fff" />
            <Text style={styles.alertaItemText}>
                {a.metrica}: <Text style={styles.alertaItemValor}>{a.valor}%</Text> — nível elevado!
            </Text>
            </View>
        ))}

        <TouchableOpacity style={styles.alertaBannerBotao} onPress={fechar}>
            <Text style={styles.alertaBannerBotaoText}>Entendido</Text>
        </TouchableOpacity>
        </Animated.View>
    );
    }

    interface SummaryRowProps {
    label: string;
    valor: number;
    unidade: string;
    alerta: boolean;
    }

    export function SummaryRow({ label, valor, unidade, alerta }: SummaryRowProps) {
    return (
        <View style={styles.summaryRow}>
        <View style={styles.summaryLabelRow}>
            {alerta && (
            <Ionicons name="warning" size={14} color="#E53935" style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.summaryLabel, alerta && styles.summaryLabelAlerta]}>
            {label}:
            </Text>
        </View>
        <Text style={[styles.summaryValue, alerta && styles.summaryValueAlerta]}>
            {valor} {unidade}
        </Text>
        </View>
    );
}