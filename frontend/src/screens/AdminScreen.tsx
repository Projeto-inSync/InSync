import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';

const screenWidth = Dimensions.get("window").width;

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AdminScreen({ navigation }: Props) {
  
  // Dados simulados (Mock) para a visão semestral
  const semesterData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        data: [65, 68, 75, 82, 88, 92], // Evolução positiva da saúde geral
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3
      }
    ],
    legend: ["Índice de Saúde Geral (%)"]
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Cabeçalho do Admin */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-out-outline" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel Gerencial</Text>
        <Ionicons name="shield-checkmark" size={28} color="white" />
      </View>

      <View style={styles.content}>
        
        <Text style={styles.sectionTitle}>Visão Geral de Usuários</Text>
        
        {/* Cartões de Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderTopColor: '#2196F3', borderTopWidth: 4 }]}>
            <Ionicons name="people" size={30} color="#2196F3" />
            <Text style={styles.statValue}>1.245</Text>
            <Text style={styles.statLabel}>Usuários Ativos</Text>
          </View>
          
          <View style={[styles.statCard, { borderTopColor: colors.primaryGreen, borderTopWidth: 4 }]}>
            <Ionicons name="person-add" size={30} color={colors.primaryGreen} />
            <Text style={styles.statValue}>800</Text>
            <Text style={styles.statLabel}>Plano Pai e Filho</Text>
          </View>

          <View style={[styles.statCard, { borderTopColor: '#FFA000', borderTopWidth: 4 }]}>
            <Ionicons name="home" size={30} color="#FFA000" />
            <Text style={styles.statValue}>445</Text>
            <Text style={styles.statLabel}>Plano Família</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Impacto InSync (Semestral)</Text>

        {/* Gráfico de Evolução da Saúde */}
        <View style={styles.chartWrapper}>
          <LineChart
            data={semesterData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F9F4' },
  header: { 
    backgroundColor: '#1B5E20', // Verde mais escuro para diferenciar do app normal
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 15, marginTop: 10 },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
    backgroundColor: 'white', 
    width: '48%', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 3,
  },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.textDark, marginTop: 10, marginBottom: 5 },
  statLabel: { fontSize: 12, color: colors.textGray, textAlign: 'center' },
  chartWrapper: { alignItems: 'center', backgroundColor: 'white', borderRadius: 20, paddingVertical: 20, elevation: 3, marginBottom: 40 },
  chart: { borderRadius: 16 }
});