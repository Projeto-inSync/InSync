import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const screenWidth = Dimensions.get("window").width;

export default function CalendarScreen() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  // Dados de exemplo (Mock)
  const data = {
    labels: viewMode === 'week' ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] : ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    datasets: [
      {
        data: viewMode === 'week' ? [70, 85, 60, 90, 80, 95, 75] : [80, 75, 90, 85],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Verde InSync
        strokeWidth: 3
      }
    ],
    legend: ["Desempenho Geral"]
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Histórico de Saúde</Text>

      {/* Seletor de Visualização */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'week' && styles.activeToggle]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.toggleText, viewMode === 'week' && styles.activeToggleText]}>Semanal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'month' && styles.activeToggle]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.toggleText, viewMode === 'month' && styles.activeToggleText]}>Mensal</Text>
        </TouchableOpacity>
      </View>

      {/* Navegação de Datas */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity><Ionicons name="chevron-back" size={24} color={colors.primaryGreen} /></TouchableOpacity>
        <Text style={styles.currentDate}>
          {viewMode === 'week' ? "12 Abr - 18 Abr" : "Abril 2026"}
        </Text>
        <TouchableOpacity><Ionicons name="chevron-forward" size={24} color={colors.primaryGreen} /></TouchableOpacity>
      </View>

      {/* Gráfico */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier // Curva suave na linha
          style={styles.chart}
        />
      </View>

      {/* Resumo Rápido */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo do Período</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Média de Glicemia:</Text>
          <Text style={styles.summaryValue}>92 mg/dL</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Metas batidas:</Text>
          <Text style={[styles.summaryValue, {color: colors.primaryGreen}]}>85%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.textDark },
  toggleContainer: { 
    flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 15, 
    marginHorizontal: 30, padding: 4, marginBottom: 20 
  },
  toggleButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  activeToggle: { backgroundColor: 'white', elevation: 2 },
  toggleText: { fontWeight: '600', color: '#757575' },
  activeToggleText: { color: colors.primaryGreen },
  dateNavigation: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  currentDate: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20, color: colors.textDark },
  chartWrapper: { alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, borderRadius: 20, paddingVertical: 20, elevation: 3 },
  chart: { borderRadius: 16 },
  summaryCard: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 20, elevation: 2 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#757575' },
  summaryValue: { fontWeight: 'bold', color: colors.textDark }
});