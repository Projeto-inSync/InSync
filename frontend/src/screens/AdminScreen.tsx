import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { API_URL } from '@env';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const screenWidth = Dimensions.get("window").width;

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

interface UserDB {
  id: number;
  nome: string;
  contato: string;
  tipo: 'responsavel' | 'filho';
  is_active: boolean;
}

export default function AdminScreen({ navigation }: Props) {
  const [usersList, setUsersList] = useState<UserDB[]>([]);
  const [stats, setStats] = useState({
    totalAtivos: 0,
    totalResponsaveis: 0,
    totalFilhos: 0
  })
  const [monthlyData, setMonthlyData] = useState<{labels: string[], data: number[]}>({
    labels: [],
    data: []
  });
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
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${API_URL}/admin-users`);
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error('Erro ao buscar lista de usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de usuários do banco.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    setUsersList(prevUsers =>
      prevUsers.map(user => (user.id === id ? { ...user, is_active: nextStatus } : user))
    );

    try {
      const response = await fetch(`${API_URL}/admin-users/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });

      if (!response.ok) throw new Error('Erro no servidor');
    fetchStats();
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    Alert.alert('Erro', 'Não foi possível salvar a alteração.');
    setUsersList(prevUsers =>
      prevUsers.map(user => (user.id === id ? { ...user, is_active: currentStatus } : user))
    );
  }
};

  const semesterData = {
    labels: monthlyData.labels.length > 1 ? monthlyData.labels : ["", ...monthlyData.labels],
    datasets: [
      {
        data: monthlyData.data.length > 1 ? monthlyData.data : [0, ...monthlyData.data], // Evolução positiva da saúde geral
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3
      }
    ],
    legend: ["Novos Cadastros por Mês"]
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
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel Gerencial</Text>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="log-out-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        <Text style={styles.sectionTitle}>Visão Geral de Usuários</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        ) : (
          <View style={styles.statsContainerVertical}>
            <View style={[styles.statCardVertical, { borderTopColor: '#2196F3', borderTopWidth: 4 }]}>
              <Ionicons name="home" size={30} color="#2196F3" />
              <Text style={styles.statValue}>{stats.totalAtivos}</Text>
              <Text style={styles.statLabel}>Usuários Ativos</Text>
            </View>
            <View style={[styles.statCardVertical, { borderTopColor: colors.primaryGreen, borderTopWidth: 4 }]}>
              <Ionicons name="people" size={30} color={colors.primaryGreen} />
              <Text style={styles.statValue}>{stats.totalResponsaveis}</Text>
              <Text style={styles.statLabel}>Responsáveis</Text>
            </View>
            <View style={[styles.statCardVertical, { borderTopColor: '#FFA000', borderTopWidth: 4 }]}>
              <Ionicons name="person" size={30} color="#FFA000" />
              <Text style={styles.statValue}>{stats.totalFilhos}</Text>
              <Text style={styles.statLabel}>Filhos</Text>
            </View>

          </View>
        )}

        <Text style={styles.sectionTitle}>Novos Cadastros por Mês</Text>
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

        <Text style={styles.sectionTitle}>Gerenciamento de Contas</Text>
        
        {loadingUsers ? (
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        ) : (
          <View style={styles.userListContainer}>
            {usersList.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum usuário cadastrado.</Text>
            ) : (
              usersList.map((user) => (
                <View key={user.id} style={[styles.userRow, !user.is_active && styles.userRowInactive]}>
                  
                  <View style={styles.userInfo}>
                    <View style={styles.userIconWrapper}>
                      <Ionicons
                        name={user.tipo === 'responsavel' ? "people" : "person"}
                        size={20}
                        color={user.is_active ? colors.primaryGreen : '#9E9E9E'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.userName, !user.is_active && styles.textInactive]}>{user.nome}</Text>
                      <Text style={styles.userDetail} numberOfLines={1}>
                        {user.contato} • <Text style={styles.typeBadge}>{user.tipo === 'responsavel' ? 'Responsável' : 'Filho'}</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.switchWrapper}>
                    <Text style={[styles.statusText, { color: user.is_active ? colors.primaryGreen : '#E53935' }]}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Text>
                    <Switch
                      trackColor={{ false: '#FFCDD2', true: '#C8E6C9' }}
                      thumbColor={user.is_active ? colors.primaryGreen : '#E53935'}
                      onValueChange={() => toggleUserStatus(user.id, user.is_active)}
                      value={user.is_active}
                    />
                  </View>
                  
                </View>
              ))
            )}
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    position: 'relative',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  logoutButton: {
    position: 'absolute',
    right: 20,
    bottom: 18,
  },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 15, marginTop: 10 },
  
  statsContainerVertical: {
    flexDirection: 'column',
    marginBottom: 20
  },
  statCardVertical: {
    backgroundColor: 'white',
    width: '100%',
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
    flex: 1,
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
  typeBadge: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  textInactive: {
    color: '#9E9E9E',
  },
  switchWrapper: {
    alignItems: 'center',
    marginLeft: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textGray,
    padding: 20,
  }
});