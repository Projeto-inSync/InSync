import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AnalysisScreen({ navigation }: Props) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const [petName, setPetName] = useState('');

  const fetcPethName =async () => {
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
          if (dependents.length === 0) {
            setPetName('Sem mascote');
            return;
          }
          if (dependents[0].nomemascote) {
            setPetName(dependents[0].nomemascote);
          }
        }
      }
    } catch (error) {
      console.log('Erro ao buscar nome do pet:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetcPethName();
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      navigation.navigate('FoodResult'); 
    }, 3000);

    return () => {
      spinValue.stopAnimation();
      clearTimeout(timer);
    };
  }, [navigation, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      
      {/* O "Card" central de análise (idêntico ao Figma) */}
      <View style={styles.analysisCard}>
        
        <Text style={styles.titleText}>
          {petName} está analisando as propriedades do alimento, aguarde um instante.
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