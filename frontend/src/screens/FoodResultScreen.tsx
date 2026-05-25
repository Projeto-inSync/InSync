import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; 
import { colors } from '../theme/colors';

// 1. Importando a nossa variável de controle de som
import { isSoundEnabled } from '../utils/SoundManager';

// Importando o nosso botão customizado com o efeito de "clique"
import CustomButton from '../components/CustomButton';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function FoodResultScreen({ navigation }: Props) {
  // Estado para controlar se os botões estão liberados para clique
  const [isReady, setIsReady] = useState(false);

  // Efeito disparado assim que a tela abre
  useEffect(() => {
    let entrySound: Audio.Sound | null = null;
    let timer: NodeJS.Timeout;

    const playEntrySound = async () => {
      try {
        // 2. Trava do som de entrada: só carrega e toca se estiver ativado
        if (isSoundEnabled) {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/analise_concluida.mp3') // Adicione este áudio nos assets
          );
          entrySound = sound;
          await sound.playAsync();
        }
      } catch (error) {
        console.error('Erro ao tocar som de entrada:', error);
      }
    };

    playEntrySound();

    // Inicia o cronômetro de 2 segundos para liberar os botões
    timer = setTimeout(() => {
      setIsReady(true);
    }, 2000);

    // Limpeza de memória caso o usuário saia da tela de alguma outra forma
    return () => {
      if (timer) clearTimeout(timer);
      if (entrySound) {
        entrySound.unloadAsync();
      }
    };
  }, []);

  // Função que toca o som dos botões e se auto-destrói da memória após o fim
  const playButtonSound = async (type: 'success' | 'error') => {
    try {
      // 3. Trava do som dos botões: se estiver desativado, encerra a função aqui mesmo (return)
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

  const handleFeed = () => {
    if (!isReady) return; // Trava de segurança extra para evitar cliques precoces

    playButtonSound('success'); 
    
    setTimeout(() => {
      navigation.navigate('HomeTab', { 
        screen: 'HomeTab', 
        params: { feedPanda: true } 
      });
    }, 1000);
  };

  const handleCancel = () => {
    if (!isReady) return; // Trava de segurança extra para evitar cliques precoces

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

          {/* Botões com bloqueio (disabled) e efeito visual de opacidade */}
          <CustomButton 
            title="Alimentar Mascote" 
            onPress={handleFeed} 
            disabled={!isReady}
            style={{ marginTop: 20, opacity: isReady ? 1 : 0.5 }} 
          />

          <CustomButton 
            title="Não alimentar" 
            onPress={handleCancel} 
            variant="cancel" 
            disabled={!isReady}
            style={{ marginTop: 10, opacity: isReady ? 1 : 0.5 }}
          />

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
  barFill: { height: '100%', borderRadius: 6 }
});