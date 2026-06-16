import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toggleBackgroundMusic } from "../../utils/MusicPlayer";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Conquista = {
    idConquista: number;
    nome: string;
    descricao: string;
    icone: string;
    cor_fundo: string;
    cor_icone: string;
    desbloqueada_em: string;
    };

    export type { Conquista };

    export function useProfile(navigation: any) {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [parentName, setParentName] = useState("Responsável");
    const [dependents, setDependents] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState("");
    const [conquistas, setConquistas] = useState<Conquista[]>([]);
    const [loadingConquistas, setLoadingConquistas] = useState(false);
    const [tipoLoginOriginal, setTipoLoginOriginal] = useState("");
    const [usuarioAtivoTipo, setUsuarioAtivoTipo] = useState("");
    const [editandoFilho, setEditandoFilho] = useState<any | null>(null);
    const [novoNome, setNovoNome] = useState("");
    const [loadingAcao, setLoadingAcao] = useState(false);

    const fetchConquistas = async (idParaBuscar?: string) => {
        try {
        setLoadingConquistas(true);
        let id = idParaBuscar;
        if (!id) {
            let idAtivo = await AsyncStorage.getItem("idAtivo");
            if (!idAtivo) idAtivo = await AsyncStorage.getItem("idPaciente");
            id = idAtivo || undefined;
        }
        if (!id) return;
        const response = await fetch(`${API_URL}/conquistas/${id}`);
        if (response.ok) {
            const data = await response.json();
            setConquistas(data);
        }
        } catch (error) {
        console.log("Erro ao buscar conquistas:", error);
        } finally {
        setLoadingConquistas(false);
        }
    };

    const fetchFamilyData = async () => {
        setLoading(true);
        try {
        const idPaciente = await AsyncStorage.getItem("idPaciente");
        const nomeResponsavel = await AsyncStorage.getItem("nome");
        const ativoTipo = await AsyncStorage.getItem("usuarioAtivoTipo");
        const tipoOriginal = await AsyncStorage.getItem("tipoLoginOriginal");
        let idAtivo = await AsyncStorage.getItem("idAtivo");

        setTipoLoginOriginal(tipoOriginal || "");
        if (ativoTipo) setUsuarioAtivoTipo(ativoTipo);
        if (nomeResponsavel) setParentName(nomeResponsavel);

        if (tipoOriginal === "filho") {
            if (!idAtivo) {
            await AsyncStorage.setItem("idAtivo", idPaciente!);
            idAtivo = idPaciente;
            }
            setCurrentUser(nomeResponsavel || "Filho");
            await fetchConquistas(idAtivo || undefined);
            setLoading(false);
            return;
        }

        if (idPaciente) {
            await AsyncStorage.setItem("idResponsavel", idPaciente);
            if (!idAtivo) {
            await AsyncStorage.setItem("idAtivo", idPaciente);
            idAtivo = idPaciente;
            }
        }

        let deps: any[] = [];
        if (idPaciente) {
            const response = await fetch(`${API_URL}/dependents/${idPaciente}`);
            const data = await response.json();
            if (response.ok) {
            deps = data;
            setDependents(data);
            }
        }

        if (ativoTipo === "filho" && idAtivo && idAtivo !== idPaciente) {
            const filhoAtivo = deps.find((d: any) => String(d.idpaciente) === String(idAtivo));
            setCurrentUser(filhoAtivo ? filhoAtivo.nomefilho : "Filho");
        } else {
            const sufixo = tipoOriginal === "responsavel" ? " (Responsável)" : "";
            setCurrentUser(`${nomeResponsavel}${sufixo}`);
        }

        const idFinal =
            ativoTipo === "filho" && idAtivo && idAtivo !== idPaciente
            ? idAtivo
            : idPaciente;
        await fetchConquistas(idFinal || undefined);
        } catch (error) {
        console.log("Erro ao buscar dependentes:", error);
        } finally {
        setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
        fetchFamilyData();
        }, []),
    );

    const handleSwitchUser = async (name: string, isParent: boolean, idFilho?: number) => {
        setModalVisible(false);
        if (isParent) {
        const idResponsavel = await AsyncStorage.getItem("idResponsavel");
        if (idResponsavel) {
            await AsyncStorage.setItem("idAtivo", idResponsavel);
            await AsyncStorage.setItem("usuarioAtivoTipo", "responsavel");
            await AsyncStorage.setItem("tipo", "responsavel");
            await toggleBackgroundMusic(false);
            navigation.reset({ index: 0, routes: [{ name: "HomeTab" }] });
        }
        } else {
        if (idFilho) {
            await AsyncStorage.setItem("idAtivo", String(idFilho));
            await AsyncStorage.setItem("usuarioAtivoTipo", "filho");
            await AsyncStorage.setItem("tipo", "filho");
            navigation.reset({ index: 0, routes: [{ name: "HomeTab" }] });
        }
        }
    };

    const handleEditarFilho = (dep: any) => {
        setEditandoFilho(dep);
        setNovoNome(dep.nomefilho);
    };

    const handleSalvarNome = async () => {
        if (!novoNome.trim()) return;
        setLoadingAcao(true);
        try {
        const idResponsavel = await AsyncStorage.getItem("idPaciente");
        const res = await fetch(`${API_URL}/child/${editandoFilho.idpaciente}/username`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            idResponsavel: Number(idResponsavel),
            novoUsername: novoNome.trim(),
            }),
        });
        if (res.ok) {
            setEditandoFilho(null);
            await fetchFamilyData();
            Alert.alert("Sucesso!", "Nome do filho atualizado com sucesso.");
        } else {
            const err = await res.json();
            Alert.alert("Erro", err.detail || "Não foi possível atualizar.");
        }
        } catch {
        Alert.alert("Erro de conexão", "Tente novamente.");
        } finally {
        setLoadingAcao(false);
        }
    };

    const handleDeletarFilho = (dep: any) => {
        Alert.alert(
        "Remover dependente",
        `Deseja remover ${dep.nomefilho} da família? Esta ação não pode ser desfeita.`,
        [
            { text: "Cancelar", style: "cancel" },
            {
            text: "Remover",
            style: "destructive",
            onPress: async () => {
                setLoadingAcao(true);
                try {
                const idResponsavel = await AsyncStorage.getItem("idPaciente");
                const res = await fetch(
                    `${API_URL}/child/${dep.idpaciente}?id_responsavel=${idResponsavel}`,
                    { method: "DELETE" },
                );
                if (res.ok) {
                    await fetchFamilyData();
                } else {
                    const err = await res.json();
                    Alert.alert("Erro", err.detail || "Não foi possível remover.");
                }
                } catch {
                Alert.alert("Erro de conexão", "Tente novamente.");
                } finally {
                setLoadingAcao(false);
                }
            },
            },
        ],
        );
    };

    const conquistasRecentes = conquistas.slice(0, 3);

    return {
        modalVisible, setModalVisible,
        loading,
        parentName,
        dependents,
        currentUser,
        conquistas,
        conquistasRecentes,
        loadingConquistas,
        tipoLoginOriginal,
        usuarioAtivoTipo,
        editandoFilho, setEditandoFilho,
        novoNome, setNovoNome,
        loadingAcao,
        handleSwitchUser,
        handleEditarFilho,
        handleSalvarNome,
        handleDeletarFilho,
    };
}