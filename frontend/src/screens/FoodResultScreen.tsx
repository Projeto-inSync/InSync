import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function FoodResultScreen({ navigation }: Props) {
  
  const handleFeed = () => {
    // Mandamos o usuário para a Home, avisando que o panda deve comer!
    // Como a Home está dentro de abas, usamos essa estrutura de "screen" e "params"
    navigation.navigate('HomeTab', { 
      screen: 'HomeTab', 
      params: { feedPanda: true } 
    });
  };

  const handleCancel = () => {
    // Apenas volta para a Home, sem avisar nada (o panda continua normal)
    navigation.navigate('HomeTab');
  };

  return (
    <ImageBackground 
      source={require('../assets/background_bamboo.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        
        <View style={styles.card}>
          
          <View style={styles.header}>
            <Ionicons name="checkmark-circle" size={60} color={colors.primaryGreen} />
            <Text style={styles.title}>Análise Concluída!</Text>
          </View>

          <Text style={styles.subtitle}>Veja o impacto na saúde do [nome_pet]:</Text>

          <View style={styles.barContainer}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Carboidrato</Text>
              <Text style={styles.barIncrease}>+15%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '85%', backgroundColor: colors.lightGreen }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Glicemia</Text>
              <Text style={styles.barIncreaseWarning}>+30%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '90%', backgroundColor: '#FFA000' }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Proteína</Text>
              <Text style={styles.barIncrease}>+5%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '35%', backgroundColor: '#E53935' }]} />
            </View>
          </View>

          {/* Botão Principal: Alimentar */}
          <TouchableOpacity 
            style={styles.button}
            onPress={handleFeed}
          >
            <Text style={styles.buttonText}>Alimentar Mascote</Text>
          </TouchableOpacity>

          {/* Botão Secundário: Cancelar */}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Não alimentar</Text>
          </TouchableOpacity>

        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', width: '100%', borderRadius: 25, 
    padding: 25, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5,
  },
  header: { alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textDark, marginTop: 10 },
  subtitle: { fontSize: 16, color: colors.textGray, textAlign: 'center', marginBottom: 25 },
  barContainer: { marginBottom: 15 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 5 },
  barLabel: { fontSize: 14, fontWeight: 'bold', color: colors.textDark },
  barIncrease: { fontSize: 14, fontWeight: 'bold', color: colors.primaryGreen },
  barIncreaseWarning: { fontSize: 14, fontWeight: 'bold', color: '#FFA000' },
  barBackground: { width: '100%', height: 12, backgroundColor: '#EEEEEE', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  button: {
    backgroundColor: colors.primaryGreen, width: '100%', height: 55, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  cancelButton: {
    width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  cancelButtonText: { color: '#E53935', fontSize: 16, fontWeight: 'bold' } // Vermelho para indicar cancelamento
});