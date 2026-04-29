import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground,
  Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function ProfileSelectionScreen({ navigation }: Props) {
  // Estado para guardar qual bolinha foi clicada (null significa nenhuma)
  const [perfil, setPerfil] = useState<string | null>(null);

  const handleCriarConta = () => {
    if (!perfil) {
      Alert.alert('Atenção', 'Por favor, selecione um perfil para continuar.');
      return;
    }
    
    // A mágica acontece aqui: o app decide para qual tela ir com base na bolinha selecionada!
    if (perfil === 'Filho') {
      navigation.navigate('ChildRegister');
    } else {
      Alert.alert('Aviso', 'A tela do Responsável será criada no próximo passo!');
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background_bamboo.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Selecione o perfil desta conta:</Text>

          {/* Opção Responsável */}
          <TouchableOpacity 
            style={styles.radioContainer} 
            onPress={() => setPerfil('Responsavel')}
          >
            {/* A bolinha de fora */}
            <View style={styles.outerCircle}>
              {/* A bolinha de dentro só aparece se este perfil estiver selecionado */}
              {perfil === 'Responsavel' && <View style={styles.innerCircle} />}
            </View>
            <Text style={styles.radioText}>Responsável</Text>
          </TouchableOpacity>

          {/* Opção Filho */}
          <TouchableOpacity 
            style={styles.radioContainer} 
            onPress={() => setPerfil('Filho')}
          >
            <View style={styles.outerCircle}>
              {perfil === 'Filho' && <View style={styles.innerCircle} />}
            </View>
            <Text style={styles.radioText}>Filho</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleCriarConta}
          >
            <Text style={styles.buttonText}>Criar conta</Text>
          </TouchableOpacity>

          {/* Botão para voltar */}
          <TouchableOpacity style={{ marginTop: 15 }} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    width: '100%', maxWidth: 320, borderRadius: 25, padding: 30, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65,
  },
  title: {
    fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 25, textAlign: 'center'
  },
  radioContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%', paddingHorizontal: 10
  },
  outerCircle: {
    height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.primaryGreen,
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  innerCircle: {
    height: 12, width: 12, borderRadius: 6, backgroundColor: colors.primaryGreen
  },
  radioText: {
    fontSize: 16, color: colors.textDark, fontWeight: '500'
  },
  button: {
    backgroundColor: colors.primaryGreen, width: '100%', height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', marginTop: 15
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backText: { color: colors.textGray, fontSize: 14, textDecorationLine: 'underline' }
});