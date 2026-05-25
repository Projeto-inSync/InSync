import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av'; 

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AnalysisScreen({ navigation }: Props) {
  
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Criamos uma referência persistente para o som não se perder entre as renderizações
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Configura a animação de rotação contínua (loop)
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Função para carregar e tocar o som de análise
    const playAnalysisSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/analisando.mp3'),
          { isLooping: true }
        );
        soundRef.current = sound; // Guarda a instância do som na referência
        await sound.playAsync();
      } catch (error) {
        console.error('Erro ao tocar o som de análise:', error);
      }
    };

    playAnalysisSound();

    // Forçamos o som a parar exatamente aos 3 segundos, junto com a navegação
    const timer = setTimeout(async () => {
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null; // Limpa a referência
        } catch (error) {
          console.error('Erro ao parar o som no temporizador:', error);
        }
      }
      navigation.navigate('FoodResult'); 
    }, 3000);

    // Limpeza de segurança caso o usuário saia da tela antes dos 3 segundos acabar
    return () => {
      spinValue.stopAnimation();
      clearTimeout(timer);
      
      if (soundRef.current) {
        soundRef.current.stopAsync().then(() => {
          soundRef.current?.unloadAsync();
        }).catch(err => console.log('Erro no cleanup do som:', err));
      }
    };
  }, [navigation, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      
      <View style={styles.analysisCard}>
        
        <Text style={styles.titleText}>
          [nome_pet] está analisando as propriedades do alimento, aguarde um instante.
        </Text>
        
        <Animated.View style={[styles.syncIcon, { transform: [{ rotate: spin }] }]}>
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