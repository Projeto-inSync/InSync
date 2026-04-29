import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AnalysisScreen({ navigation }: Props) {
  
  // Lógica de simulação de carregamento (mantida)
  useEffect(() => {
    // Simula o tempo do Panda "pensando" (3 segundos)
    const timer = setTimeout(() => {
      // Agora, em vez de voltar, vamos para a tela de resultados
      // que vamos criar no próximo passo!
      navigation.navigate('FoodResult'); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    // O container principal simula a mesa cinza escuro
    <View style={styles.container}>
      
      {/* O "Card" central de análise, com o fundo cinza claro e borda azul */}
      <View style={styles.analysisCard}>
        
        {/* Texto superior centralizado e negrito */}
        <Text style={styles.titleText}>
          [nome_pet] está analisando as propriedades do alimento, aguarde um instante.
        </Text>
        
        {/* Ícone de sincronização/carregamento verde */}
        <Ionicons 
          name="sync" 
          size={80} 
          color="#A5D6A7" // Um verde claro pastel para o ícone
          style={styles.syncIcon} 
        />
        
        {/* O Panda pensativo/triste oficial (thinking_panda.png) */}
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
    backgroundColor: '#333333', // Fundo escuro simulando a mesa
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analysisCard: {
    backgroundColor: '#E0E0E0', // Fundo cinza claro do card
    width: '100%',
    height: Dimensions.get('window').height * 0.8, // Ocupa 80% da altura da tela
    borderRadius: 30, // Bordas bem arredondadas
    borderWidth: 4,
    borderColor: '#42A5F5', // Borda azul viva
    padding: 30,
    alignItems: 'center',
    justifyContent: 'space-between', // Espalha os itens verticalmente
    elevation: 10, // Sombra para o card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  titleText: {
    fontSize: 22, // Fonte grande e legível
    fontWeight: 'bold', // Negrito
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
  },
  syncIcon: {
    // Pode adicionar uma animação de rotação aqui no futuro
  },
  pandaImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain', // Garante que a imagem não corte
    marginBottom: 20, // Dá um respiro na parte inferior
  }
});