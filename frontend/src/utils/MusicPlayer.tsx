import { Audio } from 'expo-av';

let backgroundMusic: Audio.Sound | null = null;

export const toggleBackgroundMusic = async (play: boolean) => {
  try {
    if (play && !backgroundMusic) {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/trilha_insync.mp3'),
        {
          isLooping: true,
          volume: 0.3,
        }
      );
      backgroundMusic = sound;
    }

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