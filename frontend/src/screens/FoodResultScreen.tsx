import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  ImageBackground,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors } from '../theme/colors';
import { isSoundEnabled } from '../utils/SoundManager';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CATEGORIAS_PREJUDICIAIS = new Set([
  'sweets', 'candy', 'chocolate', 'dessert',
  'snacks', 'snack', 'chips', 'cookies',
  'sausages', 'sausage',
]);

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
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const { analysisResult } = route.params || {
    analysisResult: {
      classification: "Nenhum dado recebido",
      status: { carboidrato: 0, glicemia: 0, proteina: 0 }
    }
  };

  const { carboidrato, glicemia, proteina } = analysisResult.status;
  const classificacaoLower = analysisResult.classification.toLowerCase();
  const ehPrejudicial = CATEGORIAS_PREJUDICIAIS.has(classificacaoLower);

  // Efeito para áudio de entrada e liberação do botão (2 segundos)
  useEffect(() => {
    let entrySound: Audio.Sound | null = null;
    let timer: ReturnType<typeof setTimeout>;

    const playEntrySound = async () => {
      try {
        if (isSoundEnabled) {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/analise_concluida.mp3')
          );
          entrySound = sound;
          await sound.playAsync();
        }
      } catch (error) {
        console.error('Erro ao tocar som de entrada:', error);
      }
    };

    playEntrySound();

    timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    return () => {
      if (timer) clearTimeout(timer);
      if (entrySound) {
        entrySound.unloadAsync();
      }
    };
  }, []);

  // Função para reproduzir o som dos botões
  const playButtonSound = async (type: 'success' | 'error') => {
    try {
      if (!isSoundEnabled) return;
      const audioSource = type === 'success'
        ? require('../assets/concluido.mp3')
        : require('../assets/erro.mp3');

      const { sound } = await Audio.Sound.createAsync(audioSource);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Erro ao tocar o som do botão:', error);
    }
  };

  // Envia os dados para o back-end e navega
  const handleFeed = async () => {
    if (!isReady || loading) return; // Segurança extra

    setLoading(true);
    playButtonSound('success');

    try {
      const idPaciente = await AsyncStorage.getItem('idPaciente');
      const idAtivo = await AsyncStorage.getItem('idAtivo');
      const usuarioAtivoTipo = await AsyncStorage.getItem('usuarioAtivoTipo');

      let idParaSalvar = idAtivo || idPaciente;

      if (usuarioAtivoTipo === 'responsavel' && idParaSalvar === idPaciente) {
        const depRes = await fetch(`${API_URL}/dependents/${idPaciente}`);
        const dependents = await depRes.json();
        if (!dependents.length) {
          Alert.alert('Erro', 'Nenhum dependente encontrado.');
          return;
        }
        idParaSalvar = String(dependents[0].idpaciente);
        await AsyncStorage.setItem('idAtivo', idParaSalvar);
      }

      const novoStatus = {
        idPaciente: Number(idParaSalvar),
        carboidrato,
        glicemia,
        proteina,
        classification: analysisResult.classification,
      };

      const response = await fetch(`${API_URL}/save-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoStatus),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert.alert('Erro ao salvar', err.detail || 'Tente novamente');
        return;
      }

      const data = await response.json();

      // Aguarda 1 segundo para o som tocar antes de mudar de tela
      setTimeout(() => {
        navigation.navigate('HomeTab', {
          screen: 'Home',
          params: {
            feedPanda: true,
            novasConquistas: data.novas_conquistas ?? [],
          }
        });
      }, 1000);

    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível salvar o status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isReady || loading) return;

    playButtonSound('error');
    
    setTimeout(() => {
      navigation.navigate('HomeTab');
    }, 1000);
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

          <View style={[
            styles.aiTextContainer,
            ehPrejudicial && styles.aiTextContainerWarning,
          ]}>
            {ehPrejudicial && (
              <View style={styles.warningRow}>
                <Ionicons name="warning" size={16} color="#E53935" />
                <Text style={styles.warningText}>
                  Atenção: este alimento eleva a glicemia!
                </Text>
              </View>
            )}
            <Text style={styles.aiText}>{analysisResult.classification}</Text>
          </View>

          <Text style={styles.subtitle}>Impacto estimado nos níveis do pet:</Text>
          
          <ImpactBar
            label="Carboidrato"
            delta={carboidrato}
            color={colors.lightGreen}
          />

          <ImpactBar
            label="Glicemia"
            delta={glicemia}
            color={ehPrejudicial || glicemia >= 20 ? '#E53935' : '#FFA000'}
            isWarning={ehPrejudicial || glicemia >= 20}
          />

          <ImpactBar
            label="Proteína"
            delta={proteina}
            color="#1565C0"
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primaryGreen}
              style={{ marginTop: 20 }}
            />
          ) : (
            <>
              <CustomButton
                title="Confirmar e Alimentar"
                onPress={handleFeed}
                disabled={!isReady}
                style={[styles.btnPrimary, { opacity: isReady ? 1 : 0.5 }] as any}
              />

              <CustomButton
                title="Descartar"
                onPress={handleCancel}
                variant="cancel"
                disabled={!isReady}
                style={[styles.btnCancel, { opacity: isReady ? 1 : 0.5 }] as any}
              />
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

interface ImpactBarProps {
  label: string;
  delta: number;
  color: string;
  isWarning?: boolean;
}

const ImpactBar = ({ label, delta, color, isWarning = false }: ImpactBarProps) => {
  const barWidth = Math.min(Math.max(delta, 0), 100);
  const hasImpact = delta > 0;

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[
          styles.barDelta,
          isWarning ? styles.barDeltaWarning : null,
          !hasImpact ? styles.barDeltaNeutral : null,
        ]}>
          {hasImpact ? `+${delta}%` : '—'}
        </Text>
      </View>
      <View style={styles.barBackground}>
        {hasImpact && (
          <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: color }]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    borderRadius: 25,
    padding: 25,
    elevation: 8,
  },
  header: { alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  aiTextContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryGreen,
  },
  aiTextContainerWarning: {
    backgroundColor: '#FFF3F3',
    borderLeftColor: '#E53935',
  },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  warningText: { fontSize: 12, color: '#E53935', fontWeight: '600' },
  aiText: { fontSize: 14, color: '#555', fontStyle: 'italic', lineHeight: 20 },
  subtitle: { fontSize: 16, color: '#777', textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  barContainer: { marginBottom: 15 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 5 },
  barLabel: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  barDelta: { fontSize: 14, fontWeight: 'bold', color: colors.primaryGreen },
  barDeltaWarning: { color: '#E53935' },
  barDeltaNeutral: { color: '#BDBDBD' },
  barBackground: { width: '100%', height: 12, backgroundColor: '#EEEEEE', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  btnPrimary: { marginTop: 20 },
  btnCancel: { marginTop: 10 },
});