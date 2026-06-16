import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface FilhoDB {
    id: number;
    nome: string;
    contato: string;
    tipo: "filho";
    is_active: boolean;
    }

    interface ResponsavelDB {
    id: number;
    nome: string;
    contato: string;
    tipo: "responsavel";
    is_active: boolean;
    filhos: FilhoDB[];
    }

    const notify = (title: string, message: string) => {
        if (Platform.OS === "web") {
            window.alert(`${title}: ${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    export function useAdminData() {
    const [usersList, setUsersList] = useState<ResponsavelDB[]>([]);
    const [stats, setStats] = useState({
        totalAtivos: 0,
        totalResponsaveis: 0,
        totalFilhos: 0,
    });
    const [monthlyData, setMonthlyData] = useState<{
        labels: string[];
        data: number[];
    }>({ labels: [], data: [] });
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    const fetchStats = async () => {
        try {
        const [statsRes, monthlyRes] = await Promise.all([
            fetch(`${API_URL}/admin-stats`),
            fetch(`${API_URL}/admin-monthly-registrations`),
        ]);
        const statsData = await statsRes.json();
        const monthly = await monthlyRes.json();
        setStats(statsData);
        setMonthlyData(monthly);
        } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        } finally {
        setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
        setLoadingUsers(true);
        const res = await fetch(`${API_URL}/admin-users-grouped`);
        const data = await res.json();
        setUsersList(data);
        } catch (error) {
        console.error("Erro ao buscar lista de usuários:", error);
        Alert.alert("Erro", "Não foi possível carregar a lista de usuários do banco.");
        } finally {
        setLoadingUsers(false);
        }
    };

    const toggleUserStatus = async (
        id: number,
        currentStatus: boolean,
        responsavelId?: number,
    ) => {
        const nextStatus = !currentStatus;

        setUsersList((prev) =>
        prev.map((resp) => {
            if (resp.id === id) {
            return {
                ...resp,
                is_active: nextStatus,
                filhos: resp.filhos.map((f) => ({ ...f, is_active: nextStatus })),
            };
            }
            if (resp.id === responsavelId) {
            return {
                ...resp,
                filhos: resp.filhos.map((f) =>
                f.id === id ? { ...f, is_active: nextStatus } : f,
                ),
            };
            }
            return resp;
        }),
        );

        try {
        const response = await fetch(`${API_URL}/admin-users/${id}/toggle`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: nextStatus }),
        });
        if (!response.ok) throw new Error("Erro no servidor");
        fetchStats();
        } catch (error) {
        console.error("Erro ao atualizar status:", error);
        Alert.alert("Erro", "Não foi possível salvar a alteração.");
        setUsersList((prev) =>
            prev.map((resp) => {
            if (resp.id === id) {
                return {
                ...resp,
                is_active: currentStatus,
                filhos: resp.filhos.map((f) => ({ ...f, is_active: currentStatus })),
                };
            }
            if (resp.id === responsavelId) {
                return {
                ...resp,
                filhos: resp.filhos.map((f) =>
                    f.id === id ? { ...f, is_active: currentStatus } : f,
                ),
                };
            }
            return resp;
            }),
        );
        }
    };

    return {
        usersList,
        stats,
        monthlyData,
        loading,
        loadingUsers,
        toggleUserStatus,
    };
}