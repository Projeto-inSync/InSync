import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  Image, // Importamos o componente de Imagem
  Dimensions 
} from 'react-native';
import { colors } from '../theme/colors';

// Pegamos a largura da tela para ajustar o tamanho do panda proporcionalmente
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <ImageBackground 
      source={require('../assets/background_bamboo.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        
        {/* Card de Saúde do Pet */}
        <View style={styles.healthCard}>
          <Text style={styles.petName}>[nome_pet]</Text>
          
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

        {/* Área do Mascote com a sua imagem happy_panda.png */}
        <View style={styles.petContainer}>
          <Image 
            source={require('../assets/happy_panda.png')} 
            style={styles.pandaImage}
          />
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60, 
    paddingHorizontal: 20,
  },
  healthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    textAlign: 'center',
    marginBottom: 15,
  },
  barContainer: {
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  barBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  petContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pandaImage: {
    width: width * 0.7, // 70% da largura da tela
    height: width * 0.7,
    resizeMode: 'contain', // Garante que a imagem não seja cortada
  }
});