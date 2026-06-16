import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import CustomButton from "../../components/CustomButton";
import { usePayment } from "./usePayment";

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function PaymentScreen({ navigation }: Props) {
  const { selectedPlan, setSelectedPlan, handleSubscribe } = usePayment(
    () => navigation.navigate("HomeTab"),
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Escolha seu Plano</Text>
      <Text style={styles.subtitle}>
        Desbloqueie todo o potencial do InSync para a sua família.
      </Text>

      <TouchableOpacity
        style={[styles.planCard, selectedPlan === "duo" && styles.selectedCard]}
        onPress={() => setSelectedPlan("duo")}
        activeOpacity={0.9}
      >
        {selectedPlan === "duo" && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
        )}
        <Text style={styles.planName}>InSync: Pai e Filho</Text>
        <Text style={styles.planPrice}>
          R$ 29,90<Text style={styles.planPeriod}>/mês</Text>
        </Text>
        <Text style={styles.planDesc}>Ideal para 1 responsável e 1 dependente.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.planCard, selectedPlan === "family" && styles.selectedCard]}
        onPress={() => setSelectedPlan("family")}
        activeOpacity={0.9}
      >
        {selectedPlan === "family" && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={14} color="white" />
          </View>
        )}
        <View style={styles.tagWrapper}>
          <Text style={styles.tagText}>Mais Popular</Text>
        </View>
        <Text style={styles.planName}>InSync: Família</Text>
        <Text style={styles.planPrice}>
          R$ 49,90<Text style={styles.planPeriod}>/mês</Text>
        </Text>
        <Text style={styles.planDesc}>Para até 2 responsáveis e 4 dependentes.</Text>
      </TouchableOpacity>

      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Todos os planos incluem:</Text>
        <View style={styles.benefitRow}>
          <Ionicons name="camera-outline" size={18} color={colors.primaryGreen} />
          <Text style={styles.benefitText}>Scanner de IA ilimitado</Text>
        </View>
        <View style={styles.benefitRow}>
          <Ionicons name="bar-chart-outline" size={18} color={colors.primaryGreen} />
          <Text style={styles.benefitText}>Gráficos e histórico de saúde</Text>
        </View>
        <View style={styles.benefitRow}>
          <Ionicons name="game-controller-outline" size={18} color={colors.primaryGreen} />
          <Text style={styles.benefitText}>Todas as conquistas liberadas</Text>
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <CustomButton title="Assinar Agora" onPress={handleSubscribe} />
      </View>
    </ScrollView>
  );
}