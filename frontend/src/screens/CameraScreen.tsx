import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '@env';

interface Props {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function CameraScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  /**
   * Abre a galeria do dispositivo para seleção de imagem
   * Converte o asset selecionado para Base64 para processamento via LLM
   */
  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'O acesso à galeria é fundamental para analisar os alimentos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      handleIntegrateLLM(result.assets[0].base64);
    }
  };

  /**
   * Envia a string Base64 para o endpoint de processamento
   * @param base64Data Payload da imagem
   */
  const handleIntegrateLLM = async (base64Data: string) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/process-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Data }),
      });

      if (!response.ok) throw new Error('Falha na comunicação com o backend');

      const data = await response.json();

      // Navegação para tela de resultados com o payload da análise
      navigation.navigate('FoodResult', { 
        analysisResult: data 
      });

    } catch (error) {
      console.error("[Backend Error]:", error);
      Alert.alert('Erro de Conexão', 'Certifique-se de que o servidor FastAPI está ativo.');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePicture = () => {
    // Placeholder para implementação futura da câmera nativa
    navigation.navigate('Analysis');
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.cameraVisor}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>O Panda está analisando...</Text>
          </View>
        ) : (
          <>
            <Ionicons name="scan-outline" size={250} color="rgba(255, 255, 255, 0.4)" />
            <Text style={styles.visorText}>Centralize a embalagem ou alimento</Text>
          </>
        )}
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity>
          <Ionicons name="flash-off-outline" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shutterButtonOuter} 
          onPress={handleTakePicture}
          disabled={loading}
        >
          <View style={styles.shutterButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity onPress={pickImageFromGallery} disabled={loading}>
          <Ionicons name="image-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraVisor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 18,
  },
  bottomControls: {
    height: 120,
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  shutterButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
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