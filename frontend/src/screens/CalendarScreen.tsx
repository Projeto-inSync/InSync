// historico de saude

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Animated, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { API_URL } from '@env';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const screenWidth = Dimensions.get("window").width;
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

type Alerta = {
  metrica: string;
  valor: number;
  icone: string;
};

const HISTORICO_VAZIO: Historico = {
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

function AlertaBanner({
  alertas,
  nomeFilho,
  onFechar,
}: {
  alertas: Alerta[];
  nomeFilho: string;
  onFechar: () => void;
}) {
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
            {a.metrica}:{' '}
            <Text style={styles.alertaItemValor}>{a.valor}%</Text> — nível elevado!
          </Text>
        </View>
      ))}

      <TouchableOpacity style={styles.alertaBannerBotao} onPress={fechar}>
        <Text style={styles.alertaBannerBotaoText}>Entendido</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SummaryRow({
  label,
  valor,
  unidade,
  alerta,
}: {
  label: string;
  valor: number;
  unidade: string;
  alerta: boolean;
}) {
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

export default function CalendarScreen() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [dataFoco, setDataFoco] = useState<Date>(new Date());
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [filhoSelecionado, setFilhoSelecionado] = useState<Dependent | null>(null);
  const [historico, setHistorico] = useState<Historico>(HISTORICO_VAZIO);
  const [loading, setLoading] = useState(false);
  const [semDados, setSemDados] = useState(false);
  const [verificandoPermissao, setVerificandoPermissao] = useState(true);
  const [alertasAtivos, setAlertasAtivos] = useState<Alerta[]>([]);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const formatarIntervaloData = () => {
    if (viewMode === 'week') {
      const primeiroDiaSemana = new Date(dataFoco);
      primeiroDiaSemana.setDate(dataFoco.getDate() - 6); 

      const op: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      const inicioStr = primeiroDiaSemana.toLocaleDateString('pt-BR', op).replace('.', '');
      const fimStr = dataFoco.toLocaleDateString('pt-BR', op).replace('.', '');
      return `${inicioStr} - ${fimStr}`;
    } else {
      const mesStr = dataFoco.toLocaleDateString('pt-BR', { month: 'long' });
      return `${mesStr.charAt(0).toUpperCase() + mesStr.slice(1)} ${dataFoco.getFullYear()}`;
    }
  };

  const handleVoltarData = () => {
    const novaData = new Date(dataFoco);
    if (viewMode === 'week') {
      novaData.setDate(dataFoco.getDate() - 7);
    } else {
      novaData.setMonth(dataFoco.getMonth() - 1);
    }
    setDataFoco(novaData);
  };

  const handleAvancarData = () => {
    const novaData = new Date(dataFoco);
    if (viewMode === 'week') {
      novaData.setDate(dataFoco.getDate() + 7);
    } else {
      novaData.setMonth(dataFoco.getMonth() + 1);
    }
    setDataFoco(novaData);
  };

  const verificarAlertas = useCallback(
    (data: Historico) => {
      if (tipoUsuario !== 'responsavel') return;

      const resumo = data.resumo;
      const novosAlertas: Alerta[] = [];

      if (resumo.media_glicemia > LIMITE_ALERTA) {
        novosAlertas.push({ metrica: 'Glicemia', valor: resumo.media_glicemia, icone: 'pulse' });
      }
      if (resumo.media_carboidrato > LIMITE_ALERTA) {
        novosAlertas.push({ metrica: 'Carboidrato', valor: resumo.media_carboidrato, icone: 'nutrition' });
      }
      if (resumo.media_proteina > LIMITE_ALERTA) {
        novosAlertas.push({ metrica: 'Proteína', valor: resumo.media_proteina, icone: 'barbell' });
      }

      if (novosAlertas.length > 0) {
        setAlertasAtivos(novosAlertas);
        setMostrarAlerta(true);
      } else {
        setAlertasAtivos([]);
        setMostrarAlerta(false);
      }
    },
    [tipoUsuario]
  );

  const fetchDependents = async () => {
    const idPaciente = await AsyncStorage.getItem('idPaciente');
    const tipo = await AsyncStorage.getItem('usuarioAtivoTipo');
    setTipoUsuario(tipo || '');

    if (tipo === 'filho') {
      setVerificandoPermissao(false);
      return;
    }

    if (tipo === 'responsavel' && idPaciente) {
      const res = await fetch(`${API_URL}/dependents/${idPaciente}`);
      if (res.ok) {
        const data = await res.json();
        setDependents(data);
        if (data.length > 0 && !filhoSelecionado) {
          setFilhoSelecionado(data[0]);
        }
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
      const mes = String(dataFocal.getMonth() + 1).padStart(2, '0');
      const dia = String(dataFocal.getDate()).padStart(2, '0');
      const formatoSql = `${ano}-${mes}-${dia}`;

      const res = await fetch(`${API_URL}/historico/${idPaciente}?periodo=${periodo}&data_ref=${formatoSql}`);
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
      console.log('Erro ao buscar histórico:', error);
      setSemDados(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await fetchDependents();
      };
      init();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const idAtivo = filhoSelecionado?.idpaciente;
      if (!idAtivo) return;
      fetchHistorico(idAtivo, viewMode, dataFoco);
    }, [filhoSelecionado, viewMode, dataFoco])
  );

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
  };

  const chartData = {
    labels: historico.labels.length > 0 ? historico.labels : ['—'],
    datasets: [
      {
        data: historico.glicemia.length > 0 ? historico.glicemia : [0],
        color: (opacity = 1) => `rgba(255, 160, 0, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: historico.carboidrato.length > 0 ? historico.carboidrato : [0],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: historico.proteina.length > 0 ? historico.proteina : [0],
        color: (opacity = 1) => `rgba(229, 57, 53, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Glicemia', 'Carboidrato', 'Proteína'],
  };

  const totalRefeicoes = historico.resumo.total_refeicoes;
  const metasBatidasPorcentagem =
    totalRefeicoes > 0
      ? Math.round((historico.resumo.refeicoes_saudaveis / totalRefeicoes) * 100)
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.headerTitle}>Histórico de Saúde</Text>

        {tipoUsuario === 'responsavel' && dependents.length > 0 && (
          <View style={styles.filhoSeletorContainer}>
            <Text style={styles.filhoSeletorLabel}>Visualizando:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filhoScroll}>
              {dependents.map((dep) => (
                <TouchableOpacity
                  key={String(dep.idpaciente)}
                  style={[styles.filhoChip, filhoSelecionado?.idpaciente === dep.idpaciente && styles.filhoChipAtivo]}
                  onPress={() => setFilhoSelecionado(dep)}
                >
                  <Text style={[styles.filhoChipText, filhoSelecionado?.idpaciente === dep.idpaciente && styles.filhoChipTextAtivo]}>
                    {dep.nomefilho}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleButton, viewMode === 'week' && styles.activeToggle]} onPress={() => { setViewMode('week'); setDataFoco(new Date()); }}>
            <Text style={[styles.toggleText, viewMode === 'week' && styles.activeToggleText]}>Semanal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, viewMode === 'month' && styles.activeToggle]} onPress={() => { setViewMode('month'); setDataFoco(new Date()); }}>
            <Text style={[styles.toggleText, viewMode === 'month' && styles.activeToggleText]}>Mensal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={handleVoltarData}>
            <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
          </TouchableOpacity>
          <Text style={styles.currentDate}>{formatarIntervaloData()}</Text>
          <TouchableOpacity onPress={handleAvancarData}>
            <Ionicons name="chevron-forward" size={24} color={colors.primaryGreen} />
          </TouchableOpacity>
        </View>

        <View style={styles.chartWrapper}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginVertical: 40 }} />
          ) : semDados ? (
            <View style={styles.semDadosContainer}>
              <Ionicons name="bar-chart-outline" size={40} color="#BDBDBD" />
              <Text style={styles.semDadosText}>
                Nenhum dado registrado para este período.{'\n'}Os dashboards futuros aparecerão vazios.
              </Text>
            </View>
          ) : (
            <LineChart data={chartData} width={screenWidth - 40} height={220} chartConfig={chartConfig} bezier style={styles.chart} />
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Período</Text>
          <SummaryRow label="Média de Glicemia" valor={historico.resumo.media_glicemia} unidade="mg/dL" alerta={tipoUsuario === 'responsavel' && historico.resumo.media_glicemia > LIMITE_ALERTA} />
          <SummaryRow label="Média de Carboidrato" valor={historico.resumo.media_carboidrato} unidade="g" alerta={false} />
          <SummaryRow label="Média de Proteína" valor={historico.resumo.media_proteina} unidade="g" alerta={false} />
          
          <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 }} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <Ionicons name="restaurant-outline" size={14} color="#757575" style={{ marginRight: 6 }} />
              <Text style={styles.summaryLabel}>Total de refeições feitas:</Text>
            </View>
            <Text style={styles.summaryValue}>{historico.resumo.total_refeicoes}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <Ionicons name="leaf-outline" size={14} color={colors.primaryGreen} style={{ marginRight: 6 }} />
              <Text style={styles.summaryLabel}>Refeições saudáveis:</Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.primaryGreen }]}>{historico.resumo.refeicoes_saudaveis}</Text>
          </View>
        </View>
      </ScrollView>

      {mostrarAlerta && alertasAtivos.length > 0 && filhoSelecionado && (
        <AlertaBanner alertas={alertasAtivos} nomeFilho={filhoSelecionado.nomefilho} onFechar={() => setMostrarAlerta(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: 60 },
  headerTitle: {
    fontSize: 24, fontWeight: 'bold', textAlign: 'center',
    marginBottom: 20, color: colors.textDark,
  },
  filhoSeletorContainer: { paddingHorizontal: 20, marginBottom: 16 },
  filhoSeletorLabel: { fontSize: 13, color: colors.textGray, marginBottom: 8, fontWeight: '600' },
  filhoScroll: { flexDirection: 'row' },
  filhoChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#E0E0E0', marginRight: 8,
  },
  filhoChipAtivo: { backgroundColor: colors.primaryGreen },
  filhoChipText: { fontSize: 14, fontWeight: '600', color: '#757575' },
  filhoChipTextAtivo: { color: 'white' },
  toggleContainer: {
    flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 15,
    marginHorizontal: 30, padding: 4, marginBottom: 20,
  },
  toggleButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  activeToggle: { backgroundColor: 'white', elevation: 2 },
  toggleText: { fontWeight: '600', color: '#757575' },
  activeToggleText: { color: colors.primaryGreen },
  dateNavigation: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  currentDate: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20, color: colors.textDark },
  chartWrapper: {
    alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20,
    borderRadius: 20, paddingVertical: 20, elevation: 3,
    minHeight: 150, justifyContent: 'center',
  },
  chart: { borderRadius: 16 },
  semDadosContainer: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  semDadosText: { textAlign: 'center', color: '#BDBDBD', fontSize: 14, lineHeight: 20 },
  summaryCard: {
    backgroundColor: 'white', margin: 20, marginBottom: 40 , padding: 20, borderRadius: 20, elevation: 2,
  },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.textDark },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center' },
  summaryLabel: { color: '#757575' },
  summaryLabelAlerta: { color: '#E53935', fontWeight: '600' },
  summaryValue: { fontWeight: 'bold', color: colors.textDark },
  summaryValueAlerta: { color: '#E53935' },
  alertaBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#C62828',
    borderRadius: 16,
    padding: 16,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 999,
  },
  alertaBannerHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  alertaBannerTituloRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertaBannerTitulo: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  alertaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  alertaItemText: { color: '#FFCDD2', fontSize: 14 },
  alertaItemValor: { color: '#fff', fontWeight: 'bold' },
  alertaBannerBotao: {
    marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, paddingVertical: 8, alignItems: 'center',
  },
  alertaBannerBotaoText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});