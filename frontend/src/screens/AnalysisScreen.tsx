//tela de carregamento da análise do alimento
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

type RootStackParamList = {
  Analysis: { imageBase64: string };
};
import { Audio } from 'expo-av';

// 1. Importamos a variável global que diz se o som está liberado
import { isSoundEnabled } from '../utils/SoundManager';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AnalysisScreen({ navigation }: Props) {
  const route = useRoute<RouteProp<RootStackParamList, 'Analysis'>>();
  const { imageBase64 } = route.params || {};

  const spinValue = useRef(new Animated.Value(0)).current;
  const [petName, setPetName] = useState('');

  const fetchPetName = async () => {
    try {
      const idAtivo = await AsyncStorage.getItem('idAtivo');
      const tipo = await AsyncStorage.getItem('tipo');
      const idResponsavel = await AsyncStorage.getItem('idPaciente');

      if (!idAtivo) return;

      if (tipo === 'filho') {
        const response = await fetch(`${API_URL}/character-status/${idAtivo}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data?.nome) setPetName(data.nome);
        return;
      }

      if (tipo === 'responsavel') {
        if (idAtivo && idAtivo !== idResponsavel) {
          const response = await fetch(`${API_URL}/character-status/${idAtivo}`);
          if (!response.ok) return;
          const data = await response.json();
          if (data?.nome) setPetName(data.nome);
        } else {
          const response = await fetch(`${API_URL}/dependents/${idResponsavel}`);
          if (!response.ok) return;
          const dependents = await response.json();
          if (dependents.length === 0) { setPetName('Sem mascote'); return; }
          if (dependents[0].nomemascote) setPetName(dependents[0].nomemascote);
        }
      }
    } catch (error) {
      console.log('Erro ao buscar nome do pet:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPetName();
    }, [])
  );
  
  // Criamos uma referência persistente para o som não se perder entre as renderizações
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
  // Inicia a animação de rotação do ícone
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  // Variáveis de controle locais para sincronização
  let backendData: any = null;
  let timerFinished = false;

  // Função auxiliar para navegar com segurança quando ambos os critérios forem atendidos
  const tryNavigation = (data: any) => {
    if (timerFinished && data) {
      // Ambos terminaram! Limpa o som e troca de tela com os dados reais
      if (soundRef.current) {
        soundRef.current.stopAsync()
          .then(() => soundRef.current?.unloadAsync())
          .catch(err => console.log('Erro ao parar som:', err));
        soundRef.current = null;
      }
      navigation.replace('FoodResult', { analysisResult: data });
    }
  };

  // 1. Toca o som de análise
  const playAnalysisSound = async () => {
    try {
      if (isSoundEnabled) {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/analisando.mp3'),
          { isLooping: true }
        );
        soundRef.current = sound;
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Erro ao tocar o som de análise:', error);
    }
  };
  playAnalysisSound();

  const processImage = async () => {
    try {
      const response = await fetch(`${API_URL}/process-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 }),
      });

      if (!response.ok) throw new Error('Falha na comunicação com o backend');
      
      backendData = await response.json();
      tryNavigation(backendData);

    } catch (error) {
      console.error('[AnalysisScreen error]:', error);
      backendData = {
        classification: 'Erro ao analisar imagem',
        status: { carboidrato: 0, glicemia: 0, proteina: 0 }
      };
      tryNavigation(backendData);
    }
  };
  processImage();

  const timer = setTimeout(() => {
    timerFinished = true;
    if (backendData) {
      tryNavigation(backendData);
    }
  }, 3000);

    return () => {
      spinValue.stopAnimation();
      clearTimeout(timer);
      if (soundRef.current) {
        soundRef.current.stopAsync().then(() => {
          soundRef.current?.unloadAsync();
        }).catch(err => console.log('Erro no cleanup do som:', err));
      }
    };
  }, [navigation, spinValue, imageBase64]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <View style={styles.analysisCard}>
        <Text style={styles.titleText}>
          {petName} está analisando as propriedades do alimento, aguarde um instante.
        </Text>

        <Animated.View
          style={[styles.syncIcon, { transform: [{ rotate: spin }] }]}
        >
          <Ionicons
            name="sync"
            size={80}
            color="#A5D6A7"
          />
        </Animated.View>

        <Image
          source={require('../assets/thinking_panda.png')}
          style={styles.pandaImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analysisCard: {
    backgroundColor: '#E0E0E0',
    width: '100%',
    height: Dimensions.get('window').height * 0.8,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#42A5F5',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
  },
  syncIcon: {},
  pandaImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 20,
  }
});