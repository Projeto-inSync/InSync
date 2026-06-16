import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import { useCalendar } from "./useCalendar";
import { AlertaBanner, SummaryRow } from "./CalendarComponents";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
};

export default function CalendarScreen() {
  const {
    viewMode, setViewMode,
    dataFoco, setDataFoco,
    tipoUsuario,
    dependents,
    filhoSelecionado, setFilhoSelecionado,
    historico,
    loading,
    semDados,
    alertasAtivos,
    mostrarAlerta, setMostrarAlerta,
    formatarIntervaloData,
    handleVoltarData,
    handleAvancarData,
    LIMITE_ALERTA,
  } = useCalendar();

  const chartData = {
    labels: historico.labels.length > 0 ? historico.labels : ["—"],
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
    legend: ["Glicemia", "Carboidrato", "Proteína"],
  };

  const totalRefeicoes = historico.resumo.total_refeicoes;
  const metasBatidasPorcentagem =
    totalRefeicoes > 0
      ? Math.round((historico.resumo.refeicoes_saudaveis / totalRefeicoes) * 100)
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.headerTitle}>Histórico de Saúde</Text>

        {tipoUsuario === "responsavel" && dependents.length > 0 && (
          <View style={styles.filhoSeletorContainer}>
            <Text style={styles.filhoSeletorLabel}>Visualizando:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filhoScroll}>
              {dependents.map((dep) => (
                <TouchableOpacity
                  key={String(dep.idpaciente)}
                  style={[
                    styles.filhoChip,
                    filhoSelecionado?.idpaciente === dep.idpaciente && styles.filhoChipAtivo,
                  ]}
                  onPress={() => setFilhoSelecionado(dep)}
                >
                  <Text
                    style={[
                      styles.filhoChipText,
                      filhoSelecionado?.idpaciente === dep.idpaciente && styles.filhoChipTextAtivo,
                    ]}
                  >
                    {dep.nomefilho}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === "week" && styles.activeToggle]}
            onPress={() => { setViewMode("week"); setDataFoco(new Date()); }}
          >
            <Text style={[styles.toggleText, viewMode === "week" && styles.activeToggleText]}>
              Semanal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === "month" && styles.activeToggle]}
            onPress={() => { setViewMode("month"); setDataFoco(new Date()); }}
          >
            <Text style={[styles.toggleText, viewMode === "month" && styles.activeToggleText]}>
              Mensal
            </Text>
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
                Nenhum dado registrado para este período.{"\n"}Os dashboards futuros aparecerão vazios.
              </Text>
            </View>
          ) : (
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Período</Text>
          <SummaryRow
            label="Média de Glicemia"
            valor={historico.resumo.media_glicemia}
            unidade="mg/dL"
            alerta={tipoUsuario === "responsavel" && historico.resumo.media_glicemia > LIMITE_ALERTA}
          />
          <SummaryRow label="Média de Carboidrato" valor={historico.resumo.media_carboidrato} unidade="g" alerta={false} />
          <SummaryRow label="Média de Proteína" valor={historico.resumo.media_proteina} unidade="g" alerta={false} />

          <View style={{ height: 1, backgroundColor: "#E0E0E0", marginVertical: 10 }} />

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
            <Text style={[styles.summaryValue, { color: colors.primaryGreen }]}>
              {historico.resumo.refeicoes_saudaveis}
            </Text>
          </View>
        </View>
      </ScrollView>

      {mostrarAlerta && alertasAtivos.length > 0 && filhoSelecionado && (
        <AlertaBanner
          alertas={alertasAtivos}
          nomeFilho={filhoSelecionado.nomefilho}
          onFechar={() => setMostrarAlerta(false)}
        />
      )}
    </View>
  );
}