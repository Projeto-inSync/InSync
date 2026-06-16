import React from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import { useAdminData } from "./useAdminData";
import { StatCard, UserRow, FilhoRow } from "./AdminComponents";

const screenWidth = Platform.OS === "web"
  ? Math.min(Dimensions.get("window").width - 64, 896)
  : Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
};

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AdminScreen({ navigation }: Props) {
  const { usersList, stats, monthlyData, loading, loadingUsers, toggleUserStatus } = useAdminData();

  const semesterData = {
    labels: monthlyData.labels.length > 1 ? monthlyData.labels : ["", ...monthlyData.labels],
    datasets: [
      {
        data: monthlyData.data.length > 1 ? monthlyData.data : [0, ...monthlyData.data],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ["Novos Cadastros por Mês"],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel Gerencial</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate("Login")}>
          <Ionicons name="log-out-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Visão Geral de Usuários</Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        ) : (
          <View style={styles.statsContainerVertical}>
            <StatCard icon="home" value={stats.totalAtivos} label="Usuários Ativos" color="#2196F3" />
            <StatCard icon="people" value={stats.totalResponsaveis} label="Responsáveis" color={colors.primaryGreen} />
            <StatCard icon="person" value={stats.totalFilhos} label="Filhos" color="#FFA000" />
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
              usersList.map((responsavel) => (
                <View key={responsavel.id} style={styles.responsavelGroup}>
                  <UserRow
                    responsavel={responsavel}
                    onToggle={() => toggleUserStatus(responsavel.id, responsavel.is_active)}
                  />
                  <View style={styles.filhosContainer}>
                    {responsavel.filhos.length === 0 ? (
                      <View style={styles.filhoRow}>
                        <View style={styles.treeConnector}>
                          <View style={styles.treeLine} />
                        </View>
                        <Text style={styles.semFilhosText}>Sem dependentes cadastrados</Text>
                      </View>
                    ) : (
                      responsavel.filhos.map((filho, index) => (
                        <FilhoRow
                          key={filho.id}
                          filho={filho}
                          isLast={index === responsavel.filhos.length - 1}
                          onToggle={() => toggleUserStatus(filho.id, filho.is_active, responsavel.id)}
                        />
                      ))
                    )}
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