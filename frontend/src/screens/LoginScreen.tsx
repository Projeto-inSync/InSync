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
  Alert,
  ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { API_URL } from '@env';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (login.trim() === '' || password.trim() === '') {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos para entrar no InSync.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: login.trim(),
          senha:password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.detail);
        return; 
      }

      await AsyncStorage.setItem('idPaciente', String(data.user.idPaciente));
      await AsyncStorage.setItem('tipo', data.user.tipo);
      await AsyncStorage.setItem('nome', data.user.nome);

      if (data.user.tipo === 'admin') {
        navigation.navigate('Admin');
        return;
      }

      navigation.navigate('HomeTab');

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Bem-vindo</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail ou Username:</Text>
            <TextInput
              style={styles.input}
              placeholder="insira seu e-mail ou username"
              value={login}
              onChangeText={setLogin}
              // keyboardType="email-address"
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
              secureTextEntry
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 10 }} />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Register')}
          >
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    width: '100%',
    maxWidth: 320,
    borderRadius: 25, 
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
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