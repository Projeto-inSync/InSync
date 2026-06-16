import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LIMITE_ALERTA = 60;

type Dependent = { idpaciente: number; nomefilho: string };

type Historico = {
    labels: string[];
    carboidrato: number[];
    glicemia: number[];
    proteina: number[];
    resumo: {
        media_carboidrato: number;
        media_glicemia: number;
        media_proteina: number;
        total_refeicoes: number;
        refeicoes_saudaveis: number;
    };
    };

    type Alerta = { metrica: string; valor: number; icone: string };

    export const HISTORICO_VAZIO: Historico = {
    labels: [],
    carboidrato: [],
    glicemia: [],
    proteina: [],
    resumo: {
        media_carboidrato: 0,
        media_glicemia: 0,
        media_proteina: 0,
        total_refeicoes: 0,
        refeicoes_saudaveis: 0,
    },
    };

    export type { Dependent, Historico, Alerta };

    export function useCalendar() {
    const [viewMode, setViewMode] = useState<"week" | "month">("week");
    const [dataFoco, setDataFoco] = useState<Date>(new Date());
    const [tipoUsuario, setTipoUsuario] = useState("");
    const [dependents, setDependents] = useState<Dependent[]>([]);
    const [filhoSelecionado, setFilhoSelecionado] = useState<Dependent | null>(null);
    const [historico, setHistorico] = useState<Historico>(HISTORICO_VAZIO);
    const [loading, setLoading] = useState(false);
    const [semDados, setSemDados] = useState(false);
    const [verificandoPermissao, setVerificandoPermissao] = useState(true);
    const [alertasAtivos, setAlertasAtivos] = useState<Alerta[]>([]);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);

    const formatarIntervaloData = () => {
        if (viewMode === "week") {
        const primeiroDiaSemana = new Date(dataFoco);
        primeiroDiaSemana.setDate(dataFoco.getDate() - 6);
        const op: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
        const inicioStr = primeiroDiaSemana.toLocaleDateString("pt-BR", op).replace(".", "");
        const fimStr = dataFoco.toLocaleDateString("pt-BR", op).replace(".", "");
        return `${inicioStr} - ${fimStr}`;
        } else {
        const mesStr = dataFoco.toLocaleDateString("pt-BR", { month: "long" });
        return `${mesStr.charAt(0).toUpperCase() + mesStr.slice(1)} ${dataFoco.getFullYear()}`;
        }
    };

    const handleVoltarData = () => {
        const novaData = new Date(dataFoco);
        if (viewMode === "week") novaData.setDate(dataFoco.getDate() - 7);
        else novaData.setMonth(dataFoco.getMonth() - 1);
        setDataFoco(novaData);
    };

    const handleAvancarData = () => {
        const novaData = new Date(dataFoco);
        if (viewMode === "week") novaData.setDate(dataFoco.getDate() + 7);
        else novaData.setMonth(dataFoco.getMonth() + 1);
        setDataFoco(novaData);
    };

    const verificarAlertas = useCallback(
        (data: Historico) => {
        if (tipoUsuario !== "responsavel") return;
        const resumo = data.resumo;
        const novosAlertas: Alerta[] = [];
        if (resumo.media_glicemia > LIMITE_ALERTA)
            novosAlertas.push({ metrica: "Glicemia", valor: resumo.media_glicemia, icone: "pulse" });
        if (resumo.media_carboidrato > LIMITE_ALERTA)
            novosAlertas.push({ metrica: "Carboidrato", valor: resumo.media_carboidrato, icone: "nutrition" });
        if (resumo.media_proteina > LIMITE_ALERTA)
            novosAlertas.push({ metrica: "Proteína", valor: resumo.media_proteina, icone: "barbell" });

        if (novosAlertas.length > 0) {
            setAlertasAtivos(novosAlertas);
            setMostrarAlerta(true);
        } else {
            setAlertasAtivos([]);
            setMostrarAlerta(false);
        }
        },
        [tipoUsuario],
    );

    const fetchDependents = async () => {
        const idPaciente = await AsyncStorage.getItem("idPaciente");
        const tipo = await AsyncStorage.getItem("usuarioAtivoTipo");
        setTipoUsuario(tipo || "");

        if (tipo === "filho") { setVerificandoPermissao(false); return; }

        if (tipo === "responsavel" && idPaciente) {
        const res = await fetch(`${API_URL}/dependents/${idPaciente}`);
        if (res.ok) {
            const data = await res.json();
            setDependents(data);
            if (data.length > 0 && !filhoSelecionado) setFilhoSelecionado(data[0]);
        }
        }
        setVerificandoPermissao(false);
    };

    const fetchHistorico = async (idPaciente: number, periodo: string, dataFocal: Date) => {
        setLoading(true);
        setSemDados(false);
        setMostrarAlerta(false);
        try {
        const ano = dataFocal.getFullYear();
        const mes = String(dataFocal.getMonth() + 1).padStart(2, "0");
        const dia = String(dataFocal.getDate()).padStart(2, "0");
        const formatoSql = `${ano}-${mes}-${dia}`;

        const res = await fetch(
            `${API_URL}/historico/${idPaciente}?periodo=${periodo}&data_ref=${formatoSql}`,
        );
        if (res.ok) {
            const data = await res.json();
            if (data.labels.length === 0) {
            setSemDados(true);
            setHistorico(HISTORICO_VAZIO);
            } else {
            setHistorico(data);
            verificarAlertas(data);
            }
        }
        } catch (error) {
        console.log("Erro ao buscar histórico:", error);
        setSemDados(true);
        } finally {
        setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
        fetchDependents();
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
        const idAtivo = filhoSelecionado?.idpaciente;
        if (!idAtivo) return;
        fetchHistorico(idAtivo, viewMode, dataFoco);
        }, [filhoSelecionado, viewMode, dataFoco]),
    );

    return {
        viewMode, setViewMode,
        dataFoco, setDataFoco,
        tipoUsuario,
        dependents,
        filhoSelecionado, setFilhoSelecionado,
        historico,
        loading,
        semDados,
        verificandoPermissao,
        alertasAtivos,
        mostrarAlerta, setMostrarAlerta,
        formatarIntervaloData,
        handleVoltarData,
        handleAvancarData,
        LIMITE_ALERTA,
    };
}