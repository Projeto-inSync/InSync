import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AnalysisScreen({ navigation }: Props) {
  
  // Criamos o valor animado para a rotação (começa em 0)
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Configura a animação de rotação contínua (loop)
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1, // Vai até 1 (representa 360 graus)
        duration: 1500, // Duração de uma volta completa
        easing: Easing.linear, // Movimento constante, sem aceleração/desaceleração
        useNativeDriver: true, // Usa o motor nativo para performance suave
      })
    ).start(); // Inicia o loop

    // Mantemos a lógica do temporizador de 3 segundos para navegar
    const timer = setTimeout(() => {
      navigation.navigate('FoodResult'); 
    }, 3000);

    return () => {
      // Limpa a animação e o timer se o usuário sair da tela
      spinValue.stopAnimation();
      clearTimeout(timer);
    };
  }, [navigation, spinValue]);

  // Interpolação: Converte o valor de 0-1 em 0deg-360deg para o estilo
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      
      {/* O "Card" central de análise (idêntico ao Figma) */}
      <View style={styles.analysisCard}>
        
        <Text style={styles.titleText}>
          [nome_pet] está analisando as propriedades do alimento, aguarde um instante.
        </Text>
        
        {/* Ícone de sincronização AGORA É UM Animated.View */}
        <Animated.View style={[styles.syncIcon, { transform: [{ rotate: spin }] }]}>
          <Ionicons 
            name="sync" 
            size={80} 
            color="#A5D6A7" 
          />
        </Animated.View>
        
        {/* O Panda pensativo oficial (thinking_panda.png) */}
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
  syncIcon: {
    // A animação de rotação é aplicada aqui
  },
  pandaImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain', 
    marginBottom: 20, 
  }
});