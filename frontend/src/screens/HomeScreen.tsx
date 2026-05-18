import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { API_URL } from '@env';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const { width } = Dimensions.get('window');

export default function HomeScreen({ route, navigation }: any) {
  const [isEating, setIsEating] = useState(false);
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
      fetchPetName();
    }, [])
  );

  useEffect(() => {
    if (route.params?.feedPanda) {
      setIsEating(true);

      const timer = setTimeout(() => {
        setIsEating(false);
        navigation.setParams({ feedPanda: undefined });
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [route.params?.feedPanda]);

  return (
    <ImageBackground 
      source={require('../assets/background_bamboo.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        
        <View style={styles.healthCard}>
          <Text style={styles.petName}>{petName}</Text>
          
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Carboidrato</Text>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '80%', backgroundColor: colors.lightGreen }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Glicemia</Text>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '60%', backgroundColor: '#FFA000' }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Proteína</Text>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: '30%', backgroundColor: '#E53935' }]} />
            </View>
          </View>
        </View>

        <View style={styles.petContainer}>
          <Image 
            source={isEating ? require('../assets/eating_panda.png') : require('../assets/happy_panda.png')} 
            style={styles.pandaImage}
          />
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  healthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', width: '100%', borderRadius: 20,
    padding: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 5, zIndex: 1,
  },
  petName: { fontSize: 22, fontWeight: 'bold', color: colors.primaryGreen, textAlign: 'center', marginBottom: 15 },
  barContainer: { marginBottom: 12 },
  barLabel: { fontSize: 12, fontWeight: 'bold', color: colors.textDark, marginBottom: 5 },
  barBackground: { width: '100%', height: 12, backgroundColor: '#EEEEEE', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  petContainer: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', marginBottom: 50 },
  pandaImage: { width: width * 0.7, height: width * 0.7, resizeMode: 'contain' }
});