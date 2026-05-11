import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function ResponsibleRegisterScreen({ navigation }: Props) {
  const [parentName, setParentName] = useState('');

  const handleCreateAccount = () => {
    if (parentName.trim() === '') {
      Alert.alert('Atenção', 'Por favor, preencha o seu nome para continuar.');
      return;
    }
    
    // Sucesso! Por enquanto, vamos mandar o responsável também para a Home
    // No futuro, isso vai para a "Tela Admin / Dashboard" do Responsável
    navigation.navigate('HomeTab');
  };

  return (
    <ImageBackground 
      source={require('../assets/background_bamboo.png')} 
      style={styles.background}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do responsável:</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ex: Carlos, Maria..."
              value={parentName}
              onChangeText={setParentName}
            />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleCreateAccount}
          >
            <Text style={styles.buttonText}>Criar conta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 15 }} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', width: '100%', maxWidth: 320, 
    borderRadius: 25, padding: 30, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65,
  },
  inputContainer: { width: '100%', marginBottom: 20 },
  label: { fontSize: 14, color: colors.textDark, marginBottom: 5, fontWeight: '500' },
  input: {
    width: '100%', height: 45, borderWidth: 1, borderColor: '#E0E0E0', 
    borderRadius: 10, paddingHorizontal: 15, backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: colors.primaryGreen, width: '100%', height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', marginTop: 10
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backText: { color: colors.textGray, fontSize: 14, textDecorationLine: 'underline', textAlign: 'center' }
});