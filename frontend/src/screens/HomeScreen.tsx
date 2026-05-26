import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors } from '../theme/colors';
import { API_URL } from '@env';
import { isSoundEnabled } from '../utils/SoundManager';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

const { width: screenWidth } = Dimensions.get('window');

type Conquista = {
  nome: string;
  descricao: string;
  icone: string;
  cor_fundo: string;
  cor_icone: string;
};

export default function HomeScreen({ route, navigation }: any) {
  const [isEating, setIsEating] = useState(false);
  const [petName, setPetName] = useState('');
  const [petStatus, setPetStatus] = useState({
    carboidrato: 0,
    glicemia: 0,
    proteina: 0,
  });
  const [conquistaModal, setConquistaModal] = useState<Conquista | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const eatScaleAnim = useRef(new Animated.Value(1)).current;
  const wobbleAnim   = useRef(new Animated.Value(0)).current;
  const breathLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const eatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eatSoundRef = useRef<Audio.Sound | null>(null);

  const startBreathing = useCallback(() => {
    breathLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ])
    );
    breathLoopRef.current.start();
  }, [breathAnim]);

  const stopBreathing = useCallback(() => {
    breathLoopRef.current?.stop();
    breathAnim.setValue(1);
  }, [breathAnim]);

  const playEatBounce = useCallback(() => {
    Animated.sequence([
      Animated.timing(eatScaleAnim, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.timing(eatScaleAnim, { toValue: 0.95, duration: 120, useNativeDriver: true }),
      Animated.timing(eatScaleAnim, { toValue: 1.08, duration: 100, useNativeDriver: true }),
      Animated.timing(eatScaleAnim, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
  }, [eatScaleAnim]);

  const playWobble = useCallback(() => {
    wobbleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(wobbleAnim, { toValue:  12, duration: 80, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: -12, duration: 80, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue:  10, duration: 70, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: -10, duration: 70, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue:   6, duration: 60, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue:  -6, duration: 60, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue:   0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [wobbleAnim]);

  const playPandaSound = async () => {
    try {
      if (!isSoundEnabled) return;
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/panda_sound.mp3')
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      await sound.playAsync();
    } catch (error) {
      console.error('Erro ao tocar o som interativo do panda:', error);
    }
  };

  useEffect(() => {
    startBreathing();
    return () => stopBreathing();
  }, [startBreathing, stopBreathing]);

  useEffect(() => {
    if (!route.params?.feedPanda) return;

    stopBreathing();
    setIsEating(true);
    playEatBounce();
    playWobble();

    const playEatSound = async () => {
      try {
        if (!isSoundEnabled) return;
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/mastigando.mp3')
        );
        eatSoundRef.current = sound;
        await sound.playAsync();
      } catch (error) {
        console.error('Erro ao tocar o som do panda comendo:', error);
      }
    };
    playEatSound();

    if (eatTimerRef.current) clearTimeout(eatTimerRef.current);

    eatTimerRef.current = setTimeout(() => {
      setIsEating(false);
      startBreathing();
      navigation.setParams({ feedPanda: undefined });
      eatSoundRef.current?.unloadAsync();
      eatSoundRef.current = null;
    }, 3000);

    return () => {
      if (eatTimerRef.current) clearTimeout(eatTimerRef.current);
      eatSoundRef.current?.unloadAsync();
      eatSoundRef.current = null;
    };
  }, [route.params?.feedPanda]);

  const mostrarConquista = (conquista: Conquista) => {
    setConquistaModal(conquista);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const fecharConquista = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setConquistaModal(null));
  };

  const fetchPetName = useCallback(async () => {
    try {
      const idPaciente = await AsyncStorage.getItem('idPaciente');
      const idAtivo = await AsyncStorage.getItem('idAtivo');
      const usuarioAtivoTipo = await AsyncStorage.getItem('usuarioAtivoTipo');
      const tipoLoginOriginal = await AsyncStorage.getItem('tipoLoginOriginal');

      if (!idPaciente) return;

      // Filho logado diretamente: usa o próprio idPaciente
      if (tipoLoginOriginal === 'filho') {
        const response = await fetch(`${API_URL}/character-status/${idPaciente}`);
        if (!response.ok) { setPetName('Sem mascote'); return; }
        const data = await response.json();
        if (data?.nome) setPetName(data.nome);
        setPetStatus({
          carboidrato: data.carboidrato ?? 0,
          glicemia: data.glicemia ?? 0,
          proteina: data.proteina ?? 0,
        });
        return;
      }

      // Responsável visualizando filho específico
      if (usuarioAtivoTipo === 'filho' && idAtivo && idAtivo !== idPaciente) {
        const response = await fetch(`${API_URL}/character-status/${idAtivo}`);
        if (!response.ok) { setPetName('Sem mascote'); return; }
        const data = await response.json();
        if (data?.nome) setPetName(data.nome);
        setPetStatus({
          carboidrato: data.carboidrato ?? 0,
          glicemia: data.glicemia ?? 0,
          proteina: data.proteina ?? 0,
        });
        return;
      }

      // Responsável na própria conta: busca primeiro filho
      const depRes = await fetch(`${API_URL}/dependents/${idPaciente}`);
      if (depRes.ok) {
        const dependents = await depRes.json();
        if (dependents.length === 0) { setPetName('Sem mascote'); return; }
        const idFilho = String(dependents[0].idpaciente);
        await AsyncStorage.setItem('idAtivo', idFilho);
        const response = await fetch(`${API_URL}/character-status/${idFilho}`);
        if (!response.ok) { setPetName('Sem mascote'); return; }
        const data = await response.json();
        if (data?.nome) setPetName(data.nome);
        setPetStatus({
          carboidrato: data.carboidrato ?? 0,
          glicemia: data.glicemia ?? 0,
          proteina: data.proteina ?? 0,
        });

        const novaGlicemia = data.glicemia ?? 0;
        if (novaGlicemia > 60) {
          navigation.navigate('Calendar', {
            alertaGlicemiaImediato: {
              idpaciente: data.idpaciente,
              nomefilho: data.nome || 'Seu filho',
              valorGlicemia: novaGlicemia
            }
          });
        }
      }
    } catch (error) {
      console.log('Erro ao buscar dados do pet:', error);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchPetName();
      const interval = setInterval(fetchPetName, 10000);
      return () => clearInterval(interval);
    }, [fetchPetName])
  );

  useEffect(() => {
    if (route.params?.novasConquistas?.length > 0) {
      route.params.novasConquistas.forEach((conquista: Conquista, index: number) => {
        setTimeout(() => mostrarConquista(conquista), index * 3500);
      });
      navigation.setParams({ novasConquistas: undefined });
    }
  }, [route.params?.novasConquistas]);

  const pandaScale = isEating ? eatScaleAnim : breathAnim;
  // Função para tocar o som ao clicar no panda
  // const playPandaSound = async () => {
  //   try {
  //     // 2. Trava de som: Se estiver desligado, sai da função antes de carregar o áudio
  //     if (!isSoundEnabled) return;

  //     const { sound } = await Audio.Sound.createAsync(
  //       require('../assets/panda_sound.mp3') 
  //     );
      
  //     sound.setOnPlaybackStatusUpdate((status) => {
  //       if (status.isLoaded && status.didJustFinish) {
  //         sound.unloadAsync();
  //       }
  //     });

  //     await sound.playAsync();
  //   } catch (error) {
  //     console.error('Erro ao tocar o som interativo do panda:', error);
  //   }
  // };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let soundObject: Audio.Sound | null = null;

    const handleFeeding = async () => {
      if (route.params?.feedPanda) {
        setIsEating(true);

        try {
          // 3. Trava de som: Só carrega e toca o som de mastigar se estiver ativado
          if (isSoundEnabled) {
            const { sound } = await Audio.Sound.createAsync(
              require('../assets/mastigando.mp3')
            );
            soundObject = sound;
            await sound.playAsync();
          }
        } catch (error) {
          console.error('Erro ao tocar o som do panda comendo:', error);
        }

        timer = setTimeout(() => {
          setIsEating(false); 
          navigation.setParams({ feedPanda: undefined });
        }, 3000);
      }
    };

    handleFeeding();

    return () => {
      if (timer) clearTimeout(timer);
      if (soundObject) {
        soundObject.unloadAsync();
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
          <Text style={styles.petName}>{petName}</Text>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Carboidrato</Text>
              <Text style={styles.barValue}>{petStatus.carboidrato}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: (petStatus.carboidrato / 100) * (screenWidth - 80), backgroundColor: colors.lightGreen }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Glicemia</Text>
              <Text style={styles.barValue}>{petStatus.glicemia}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: (petStatus.glicemia / 100) * (screenWidth - 80), backgroundColor: '#FFA000' }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Proteína</Text>
              <Text style={styles.barValue}>{petStatus.proteina}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: (petStatus.proteina / 100) * (screenWidth - 80), backgroundColor: '#E53935' }]} />
            </View>
          </View>
        </View>

        <View style={styles.petContainer}>
          <Animated.View style={{
            transform: [
              { scale: pandaScale },
              { translateX: wobbleAnim },
            ]
          }}>
            {/* ✅ TouchableOpacity integrado na imagem do panda — sem duplicação */}
            <TouchableOpacity activeOpacity={0.8} onPress={playPandaSound}>
              <Image
                source={isEating ? require('../assets/eating_panda.png') : require('../assets/happy_panda.png')}
                style={styles.pandaImage}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

      </View>

      <Modal transparent visible={!!conquistaModal} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.modalTitulo}>Conquista Desbloqueada!</Text>
            {conquistaModal && (
              <>
                <View style={[styles.iconCircle, { backgroundColor: conquistaModal.cor_fundo }]}>
                  <Ionicons name={conquistaModal.icone as any} size={48} color={conquistaModal.cor_icone} />
                </View>
                <Text style={styles.modalNome}>{conquistaModal.nome}</Text>
                <Text style={styles.modalDescricao}>
                  Parabéns! Você desbloqueou uma nova conquista. Continue assim! 🎉
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.modalBotao} onPress={fecharConquista}>
              <Text style={styles.modalBotaoTexto}>Continuar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  healthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', width: '100%', borderRadius: 20,
    padding: 20, elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, zIndex: 1,
  },
  petName: { fontSize: 22, fontWeight: 'bold', color: colors.primaryGreen, textAlign: 'center', marginBottom: 15 },
  barContainer: { marginBottom: 12, width: '100%' },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barLabel: { fontSize: 12, fontWeight: 'bold', color: colors.textDark },
  barValue: { fontSize: 12, fontWeight: 'bold', color: colors.textGray },
  barBackground: { width: '100%', height: 12, backgroundColor: '#EEEEEE', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  petContainer: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', marginBottom: 50 },
  pandaImage: { width: screenWidth * 0.7, height: screenWidth * 0.7, resizeMode: 'contain' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    backgroundColor: 'white', borderRadius: 28, padding: 32,
    alignItems: 'center', width: screenWidth * 0.82,
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginBottom: 20, textAlign: 'center' },
  iconCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4 },
  modalNome: { fontSize: 22, fontWeight: 'bold', color: colors.primaryGreen, marginBottom: 8, textAlign: 'center' },
  modalDescricao: { fontSize: 14, color: '#757575', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBotao: { backgroundColor: colors.primaryGreen, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 25 },
  modalBotaoTexto: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});