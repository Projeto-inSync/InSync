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
  const [petStatus, setPetStatus] = useState({
    carboidrato: 0,
    glicemia: 0,
    proteina: 0,
  });

  const fetchPetName = async () => {
    try {
      const idAtivo = await AsyncStorage.getItem('idAtivo');
      const tipo = await AsyncStorage.getItem('tipo');
      const idResponsavel = await AsyncStorage.getItem('idPaciente');

      if (!idAtivo) return;

      let idParaBuscar = idAtivo;

      if (tipo === 'responsavel' && idAtivo === idResponsavel) {
        const response = await fetch(`${API_URL}/dependents/${idResponsavel}`);
        if (!response.ok) return;
        const dependents = await response.json();
        if (dependents.length === 0) {
          setPetName('Sem mascote');
          return;
        }
        idParaBuscar = String(dependents[0].idpaciente);
        if (dependents[0].nomemascote) {
          setPetName(dependents[0].nomemascote);
        }
      }

      // Busca o status do personagem
      const response = await fetch(`${API_URL}/character-status/${idParaBuscar}`);
      if (!response.ok) return;
      const data = await response.json();

      if (data?.nome) setPetName(data.nome);
      setPetStatus({
        carboidrato: data.carboidrato ?? 0,
        glicemia: data.glicemia ?? 0,
        proteina: data.proteina ?? 0,
      });
    } catch (error) {
      console.log('Erro ao buscar dados do pet:', error);
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
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Carboidrato</Text>
              <Text style={styles.barValue}>{petStatus.carboidrato}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, {
                width: `${petStatus.carboidrato}%`,
                backgroundColor: colors.lightGreen
              }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Glicemia</Text>
              <Text style={styles.barValue}>{petStatus.glicemia}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, {
                width: `${petStatus.glicemia}%`,
                backgroundColor: '#FFA000'
              }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Proteína</Text>
              <Text style={styles.barValue}>{petStatus.proteina}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, {
                width: `${petStatus.proteina}%`,
                backgroundColor: '#E53935'
              }]} />
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
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barLabel: { fontSize: 12, fontWeight: 'bold', color: colors.textDark },
  barValue: { fontSize: 12, fontWeight: 'bold', color: colors.textGray },
  barBackground: { width: '100%', height: 12, backgroundColor: '#EEEEEE', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  petContainer: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', marginBottom: 50 },
  pandaImage: { width: width * 0.7, height: width * 0.7, resizeMode: 'contain' }
});