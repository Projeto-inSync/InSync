import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function CameraScreen({ navigation }: Props) {
  
  const handleTakePicture = () => {
    // Por enquanto, apenas avisa que o botão funciona.
    // No próximo passo, faremos esse botão navegar para a tela do Panda Analisando!
    alert('📸 Click! Foto simulada com sucesso!');
  };

  return (
    <View style={styles.container}>
      
      {/* Área que simula o visor da câmera (escuro) */}
      <View style={styles.cameraVisor}>
        {/* Usamos um ícone de "scan" bem grande no meio para dar a ideia de leitura */}
        <Ionicons name="scan-outline" size={250} color="rgba(255, 255, 255, 0.4)" />
        <Text style={styles.visorText}>Centralize a embalagem ou alimento</Text>
      </View>

      {/* Barra inferior com o botão de tirar a foto */}
      <View style={styles.bottomControls}>
        
        {/* Botões laterais decorativos (Flash, Galeria) */}
        <TouchableOpacity>
          <Ionicons name="flash-off-outline" size={30} color="white" />
        </TouchableOpacity>

        {/* O botão principal de Captura (Obturador) */}
        <TouchableOpacity style={styles.shutterButtonOuter} onPress={handleTakePicture}>
          <View style={styles.shutterButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="image-outline" size={30} color="white" />
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Fundo preto como uma câmera real
  },
  cameraVisor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600',
  },
  bottomControls: {
    height: 120,
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20, // Espaço para não bater na barra de navegação
  },
  shutterButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  }
});