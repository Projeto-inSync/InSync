import { Audio } from 'expo-av';

// Variável que vai guardar a nossa música viva em todo o app
let backgroundMusic: Audio.Sound | null = null;

export const toggleBackgroundMusic = async (play: boolean) => {
  try {
    // Se o usuário quer tocar e a música ainda não foi carregada na memória
    if (play && !backgroundMusic) {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/trilha_insync.mp3'), // Coloque sua música aqui!
        {
          isLooping: true, // Aqui está a mágica do loop infinito!
          volume: 0.3,     // Volume em 30% para ficar como som ambiente suave
        }
      );
      backgroundMusic = sound;
    }

    // Se a música já existe na memória, apenas controlamos o Play e o Pause
    if (backgroundMusic) {
      if (play) {
        await backgroundMusic.playAsync();
      } else {
        await backgroundMusic.pauseAsync();
      }
    }
  } catch (error) {
    console.error('Erro ao controlar a música de fundo:', error);
  }
};