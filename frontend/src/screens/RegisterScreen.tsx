import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { registerStyles } from '../theme/registerStyles';
import { API_URL } from '@env';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      Alert.alert('Atenção', 'Preencha todos os campos para continuar.');
      return;
    }

    const emailRegex = /\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('E-mail inválido', 'Por favor, insira um e-mail em formato correto.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.')
      return;
    }

    setLoading(true);

    // chama o backend
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: name,
          email: email,
          senha: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro no cadastro', data.detail || 'Tente novamente.');
        return;
      }

      navigation.replace('HomeTab');

    } catch (error) {
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background_bamboo.png')}
      style={registerStyles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={registerStyles.container}
      >
        <View style={registerStyles.card}>
          <Text style={registerStyles.title}>Comece sua jornada</Text>

          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Nome</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="Insira seu nome"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>E-mail:</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="Insira seu e-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Senha:</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="Insira sua senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[registerStyles.button, loading && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={registerStyles.buttonText}>{loading ? 'Cadastrando' : 'Continuar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={registerStyles.linkContainer}
            onPress={() => navigation.goBack()}
          >
            <Text style={registerStyles.linkText}>
              Já tem uma conta? <Text style={registerStyles.linkTextBold}>Entre aqui!</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}