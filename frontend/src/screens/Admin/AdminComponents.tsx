import React from "react";
import { View, Text, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./styles";

interface FilhoDB {
    id: number;
    nome: string;
    contato: string;
    tipo: "filho";
    is_active: boolean;
    }

    interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    value: number;
    label: string;
    color: string;
    }

    export function StatCard({ icon, value, label, color }: StatCardProps) {
    return (
        <View style={[styles.statCardVertical, { borderTopColor: color, borderTopWidth: 4 }]}>
        <Ionicons name={icon} size={30} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
    }

    interface UserRowProps {
    responsavel: {
        id: number;
        nome: string;
        contato: string;
        is_active: boolean;
    };
    onToggle: () => void;
    }

    export function UserRow({ responsavel, onToggle }: UserRowProps) {
    return (
        <View style={[styles.responsavelRow, !responsavel.is_active && styles.userRowInactive]}>
        <View style={styles.userInfo}>
            <View style={[styles.userIconWrapper, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons
                name="people"
                size={20}
                color={responsavel.is_active ? "#1B5E20" : "#9E9E9E"}
            />
            </View>
            <View style={{ flex: 1 }}>
            <Text style={[styles.userName, !responsavel.is_active && styles.textInactive]}>
                {responsavel.nome}
            </Text>
            <Text style={styles.userDetail} numberOfLines={1}>
                {responsavel.contato}
            </Text>
            </View>
        </View>
        <View style={styles.switchWrapper}>
            <Text style={[styles.statusText, { color: responsavel.is_active ? colors.primaryGreen : "#E53935" }]}>
            {responsavel.is_active ? "Ativo" : "Inativo"}
            </Text>
            <Switch
            trackColor={{ false: "#FFCDD2", true: "#C8E6C9" }}
            thumbColor={responsavel.is_active ? colors.primaryGreen : "#E53935"}
            onValueChange={onToggle}
            value={responsavel.is_active}
            />
        </View>
        </View>
    );
    }

    interface FilhoRowProps {
    filho: FilhoDB;
    isLast: boolean;
    onToggle: () => void;
    }

    export function FilhoRow({ filho, isLast, onToggle }: FilhoRowProps) {
    return (
        <View style={[styles.filhoRow, !filho.is_active && styles.userRowInactive]}>
        <View style={styles.treeConnector}>
            <View style={[styles.treeLine, isLast && styles.treeLineLast]} />
            <View style={styles.treeBranch} />
        </View>
        <View style={styles.userInfo}>
            <View style={[styles.userIconWrapper, { backgroundColor: "#FFF8E1", width: 34, height: 34, borderRadius: 17 }]}>
            <Ionicons name="person" size={17} color={filho.is_active ? "#FFA000" : "#9E9E9E"} />
            </View>
            <View style={{ flex: 1 }}>
            <Text style={[styles.userName, styles.filhoName, !filho.is_active && styles.textInactive]}>
                {filho.nome}
            </Text>
            </View>
        </View>
        <View style={styles.switchWrapper}>
            <Text style={[styles.statusText, { color: filho.is_active ? colors.primaryGreen : "#E53935" }]}>
            {filho.is_active ? "Ativo" : "Inativo"}
            </Text>
            <Switch
            trackColor={{ false: "#FFCDD2", true: "#C8E6C9" }}
            thumbColor={filho.is_active ? colors.primaryGreen : "#E53935"}
            onValueChange={onToggle}
            value={filho.is_active}
            />
        </View>
        </View>
    );
}