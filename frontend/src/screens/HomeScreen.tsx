import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  Image,
  Dimensions 
} from 'react-native';
import { Audio } from 'expo-av'; // Importação do áudio
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen({ route, navigation }: any) {
  const [isEating, setIsEating] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let soundObject: Audio.Sound | null = null;

    const handleFeeding = async () => {
      if (route.params?.feedPanda) {
        setIsEating(true); // Troca para o panda comendo

        // 1. Carrega e toca o áudio instantaneamente
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/mastigando.mp3') // Caminho corrigido!
          );
          soundObject = sound;
          await sound.playAsync();
        } catch (error) {
          console.error('Erro ao tocar o som do panda:', error);
        }

        // 2. Cronômetro de 6 segundos da animação
        // O áudio tem 4s, então ele vai terminar naturalmente um pouco antes da imagem voltar ao normal
        timer = setTimeout(() => {
          setIsEating(false); // Volta a ser o panda feliz
          navigation.setParams({ feedPanda: undefined });
        }, 3000);
      }
    };

    handleFeeding();

    // 3. Limpeza de segurança caso a tela seja fechada
    return () => {
      if (timer) clearTimeout(timer);
      if (soundObject) {
        soundObject.unloadAsync(); // Limpa o áudio da memória
      }
    };
  }, [route.params?.feedPanda]);

  return (
    <ImageBackground 
      source={require('../assets/background_bamboo.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        
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