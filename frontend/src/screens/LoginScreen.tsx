import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function LoginScreen({ navigation }: Props) {
  // Estados para guardar o que o usuário digita
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    // ImageBackground coloca a imagem cobrindo a tela toda
    <ImageBackground 
      source={require('../assets/background_bamboo.png')}
      style={styles.background}
    >
      {/* KeyboardAvoidingView evita que o teclado cubra os campos de digitação no celular */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        
        {/* O "Card" Branco Central */}
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail:</Text>
            <TextInput 
              style={styles.input}
              placeholder="insira seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha:</Text>
            <TextInput 
              style={styles.input}
              placeholder="insira sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry // Esconde a senha com pontinhos
            />
          </View>

          {/* Botão de Entrar (Usamos TouchableOpacity para ter o efeito de clique) */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          {/* Link para criar conta */}
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={styles.linkText}>
              Não tem uma conta? <Text style={styles.linkTextBold}>Crie uma!</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    // Sombra para o card (Android e iOS)
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 25,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: colors.primaryGreen,
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: colors.textDark,
    fontSize: 13,
  },
  linkTextBold: {
    fontWeight: 'bold',
    color: colors.primaryGreen,
  }
});