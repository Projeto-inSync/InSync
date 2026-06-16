import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";

interface ImpactBarProps {
    label: string;
    delta: number;
    color: string;
    isWarning?: boolean;
    }

    export function ImpactBar({ label, delta, color, isWarning = false }: ImpactBarProps) {
    const barWidth = Math.min(Math.max(delta, 0), 100);
    const hasImpact = delta > 0;

    return (
        <View style={styles.barContainer}>
        <View style={styles.barHeader}>
            <Text style={styles.barLabel}>{label}</Text>
            <Text
            style={[
                styles.barDelta,
                isWarning ? styles.barDeltaWarning : null,
                !hasImpact ? styles.barDeltaNeutral : null,
            ]}
            >
            {hasImpact ? `+${delta}%` : "—"}
            </Text>
        </View>
        <View style={styles.barBackground}>
            {hasImpact && (
            <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: color }]} />
            )}
        </View>
        </View>
    );
}