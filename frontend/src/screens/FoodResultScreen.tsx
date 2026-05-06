import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';

interface AnalysisResult {
  classification: string;
  status: {
    carboidrato: number;
    glicemia: number;
    proteina: number;
  };
}

type RootStackParamList = {
  FoodResultScreen: { analysisResult: AnalysisResult };
};

type FoodResultScreenRouteProp = RouteProp<RootStackParamList, 'FoodResultScreen'>;

interface Props {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function FoodResultScreen({ navigation }: Props) {
  const route = useRoute<FoodResultScreenRouteProp>();

  const { analysisResult } = route.params || {
    analysisResult: {
      classification: "Nenhum dado recebido",
      status: { carboidrato: 0, glicemia: 0, proteina: 0 }
    }
  };

  const handleFeed = () => {
    navigation.navigate('HomeTab', {
      screen: 'HomeTab',
      params: { feedPanda: true }
    });
  };

  const handleCancel = () => {
    navigation.navigate('HomeTab');
  };

  return (
    <ImageBackground
      source={require('../assets/background_bamboo.png')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="analytics" size={60} color={colors.primaryGreen} />
            <Text style={styles.title}>Resultado da Análise</Text>
          </View>

          <View style={styles.aiTextContainer}>
            <Text style={styles.aiText}>{analysisResult.classification}</Text>
          </View>

          <Text style={styles.subtitle}>Impacto estimado nos níveis do pet:</Text>

          <ProgressBar
            label="Carboidrato"
            value={analysisResult.status.carboidrato}
            color={colors.lightGreen}
          />

          <ProgressBar
            label="Glicemia"
            value={analysisResult.status.glicemia}
            color="#FFA000"
            isWarning
          />

          <ProgressBar
            label="Proteína"
            value={analysisResult.status.proteina}
            color="#E53935"
          />

          <CustomButton
            title="Confirmar e Alimentar"
            onPress={handleFeed}
            style={styles.btnPrimary}
          />

          <CustomButton
            title="Descartar"
            onPress={handleCancel}
            variant="cancel"
            style={styles.btnCancel}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  color: string;
  isWarning?: boolean;
}

const ProgressBar = ({ label, value = 0, color, isWarning = false }: ProgressBarProps) => (
  <View style={styles.barContainer}>
    <View style={styles.barHeader}>
      <Text style={styles.barLabel}>{label}</Text>
      <Text style={[styles.barIncrease, isWarning && styles.barIncreaseWarning]}>
        {value > 0 ? `+${value}%` : `${value}%`}
      </Text>
    </View>
    <View style={styles.barBackground}>
      <View
        style={[
          styles.barFill,
          { width: `${Math.min(value, 100)}%`, backgroundColor: color }
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover'
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    borderRadius: 25,
    padding: 25,
    elevation: 8
  },
  header: {
    alignItems: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10
  },
  aiTextContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryGreen
  },
  aiText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 20
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600'
  },
  barContainer: {
    marginBottom: 15
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 5
  },
  barLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444'
  },
  barIncrease: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primaryGreen
  },
  barIncreaseWarning: {
    color: '#FFA000'
  },
  barBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 6
  },
  btnPrimary: {
    marginTop: 20
  },
  btnCancel: {
    marginTop: 10
  }
});