import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';

const screenWidth = Dimensions.get("window").width;

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

// Dados mockados simulando o que viria do seu banco de dados (Back-end)
const MOCK_USERS = [
  { id: '1', name: 'Carlos Oliveira', email: 'carlos@email.com', plan: 'Pai e Filho', isActive: true },
  { id: '2', name: 'Ana Souza', email: 'ana@email.com', plan: 'Família', isActive: true },
  { id: '3', name: 'Roberto Almeida', email: 'roberto@email.com', plan: 'Pai e Filho', isActive: false },
  { id: '4', name: 'Fernanda Lima', email: 'fernanda@email.com', plan: 'Família', isActive: true },
];

export default function AdminScreen({ navigation }: Props) {
  // Estado para controlar a lista de usuários e suas ativações
  const [usersList, setUsersList] = useState(MOCK_USERS);
  
  // Dados simulados (Mock) para a visão semestral
  const semesterData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        data: [65, 68, 75, 82, 88, 92], 
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

  // Função que inverte o status (Ativo/Inativo) de um usuário específico
  const toggleUserStatus = (id: string) => {
    setUsersList(prevUsers => 
      prevUsers.map(user => 
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
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

        {/* NOVA SEÇÃO: Gerenciamento de Usuários */}
        <Text style={styles.sectionTitle}>Gerenciamento de Contas</Text>
        
        <View style={styles.userListContainer}>
          {usersList.map((user) => (
            <View key={user.id} style={[styles.userRow, !user.isActive && styles.userRowInactive]}>
              
              <View style={styles.userInfo}>
                <View style={styles.userIconWrapper}>
                  <Ionicons name="person" size={20} color={user.isActive ? colors.primaryGreen : '#9E9E9E'} />
                </View>
                <View>
                  <Text style={[styles.userName, !user.isActive && styles.textInactive]}>{user.name}</Text>
                  <Text style={styles.userDetail}>{user.email} • {user.plan}</Text>
                </View>
              </View>

              <View style={styles.switchWrapper}>
                <Text style={[styles.statusText, { color: user.isActive ? colors.primaryGreen : '#E53935' }]}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </Text>
                <Switch
                  trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
                  thumbColor={user.isActive ? colors.primaryGreen : '#E53935'}
                  onValueChange={() => toggleUserStatus(user.id)}
                  value={user.isActive}
                />
              </View>
              
            </View>
          ))}
        </View>
        
      </View>
      <View style={{ height: 40 }} /> {/* Espaçamento final */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F9F4' },
  header: { 
    backgroundColor: '#1B5E20',
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
  chartWrapper: { alignItems: 'center', backgroundColor: 'white', borderRadius: 20, paddingVertical: 20, elevation: 3, marginBottom: 20 },
  chart: { borderRadius: 16 },
  
  // Estilos da nova lista de usuários
  userListContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  userRowInactive: {
    backgroundColor: '#FAFAFA',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Faz a área de info ocupar o espaço restante
  },
  userIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  userDetail: {
    fontSize: 12,
    color: colors.textGray,
    marginTop: 2,
  },
  textInactive: {
    color: '#9E9E9E', // Deixa o nome cinza quando inativo
  },
  switchWrapper: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  }
});