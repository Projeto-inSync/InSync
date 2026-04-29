import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function PaymentScreen({ navigation }: Props) {
  // Começa com o plano básico selecionado por padrão
  const [selectedPlan, setSelectedPlan] = useState<'duo' | 'family'>('duo');

  const handleSubscribe = () => {
    // Aqui no futuro entraria a integração com Stripe ou Mercado Pago!
    Alert.alert(
      'Sucesso!',
      `Você assinou o ${selectedPlan === 'duo' ? 'Plano Pai e Filho' : 'Plano Família'} com sucesso. Bem-vindo ao Premium!`,
      [{ text: 'Começar', onPress: () => navigation.navigate('HomeTab') }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={colors.textDark} />
      </TouchableOpacity>

      <Text style={styles.title}>Escolha seu Plano</Text>
      <Text style={styles.subtitle}>Desbloqueie todo o potencial do InSync para a sua família.</Text>

      {/* Cartão: Plano Pai e Filho */}
      <TouchableOpacity 
        style={[styles.planCard, selectedPlan === 'duo' && styles.selectedCard]}
        onPress={() => setSelectedPlan('duo')}
        activeOpacity={0.9}
      >
        {selectedPlan === 'duo' && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
        <Text style={styles.planName}>InSync: Pai e Filho</Text>
        <Text style={styles.planPrice}>R$ 29,90<Text style={styles.planPeriod}>/mês</Text></Text>
        <Text style={styles.planDesc}>Ideal para 1 responsável e 1 dependente.</Text>
      </TouchableOpacity>

      {/* Cartão: Plano Família */}
      <TouchableOpacity 
        style={[styles.planCard, selectedPlan === 'family' && styles.selectedCard]}
        onPress={() => setSelectedPlan('family')}
        activeOpacity={0.9}
      >
        {selectedPlan === 'family' && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
        <View style={styles.tagWrapper}><Text style={styles.tagText}>Mais Popular</Text></View>
        <Text style={styles.planName}>InSync: Família</Text>
        <Text style={styles.planPrice}>R$ 49,90<Text style={styles.planPeriod}>/mês</Text></Text>
        <Text style={styles.planDesc}>Para até 2 responsáveis e 4 dependentes.</Text>
      </TouchableOpacity>

      {/* Lista de Benefícios Gerais */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Todos os planos incluem:</Text>
        <View style={styles.benefitRow}>
          <Ionicons name="camera-outline" size={22} color={colors.primaryGreen} />
          <Text style={styles.benefitText}>Scanner de IA ilimitado</Text>
        </View>
        <View style={styles.benefitRow}>
          <Ionicons name="bar-chart-outline" size={22} color={colors.primaryGreen} />
          <Text style={styles.benefitText}>Gráficos e histórico de saúde</Text>
        </View>
        <View style={styles.benefitRow}>
          <Ionicons name="game-controller-outline" size={22} color={colors.primaryGreen} />
          <Text style={styles.benefitText}>Todas as conquistas liberadas</Text>
        </View>
      </View>

      {/* Botão de Assinar */}
      <CustomButton 
        title="Assinar Agora" 
        onPress={handleSubscribe} 
        style={{ marginTop: 20, marginBottom: 40 }}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 25, paddingTop: 50 },
  backButton: { marginBottom: 20, width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.textDark, marginBottom: 10 },
  subtitle: { fontSize: 16, color: colors.textGray, marginBottom: 30, lineHeight: 22 },
  
  planCard: {
    backgroundColor: '#F9F9F9',
    borderWidth: 2,
    borderColor: '#EEEEEE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
  },
  selectedCard: {
    borderColor: colors.primaryGreen,
    backgroundColor: '#F0FAF0', // Um fundo verde bem clarinho
  },
  checkBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.primaryGreen,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  tagWrapper: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: '#FFA000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: { color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  
  planName: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 8, marginTop: 5 },
  planPrice: { fontSize: 32, fontWeight: '900', color: colors.primaryGreen, marginBottom: 8 },
  planPeriod: { fontSize: 16, fontWeight: 'normal', color: colors.textGray },
  planDesc: { fontSize: 14, color: colors.textGray },
  
  benefitsSection: { marginTop: 10, padding: 20, backgroundColor: '#FAFAFA', borderRadius: 15 },
  benefitsTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 15 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitText: { fontSize: 15, color: colors.textDark, marginLeft: 12 },
});