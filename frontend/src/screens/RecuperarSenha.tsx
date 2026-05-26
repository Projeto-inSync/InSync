// Lembrar de registrar no navigator: <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

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
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { API_URL } from '@env';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Passo 1: solicitar o código por e-mail
  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Erro', data.detail);
        return;
      }
      Alert.alert('Sucesso', 'Se o e-mail estiver cadastrado, você receberá o código.');
      setStep('reset');
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Passo 2: validar código e redefinir senha
  const handleResetPassword = async () => {
    if (!token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          token: token.trim(),
          nova_senha: newPassword.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Erro', data.detail);
        return;
      }
      Alert.alert('Sucesso', 'Senha redefinida com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
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
          <Text style={styles.title}>
            {step === 'email' ? 'Recuperar Senha' : 'Nova Senha'}
          </Text>

          {step === 'email' ? (
            <>
              <Text style={styles.description}>
                Informe seu e-mail cadastrado. Enviaremos um código de verificação válido por 15 minutos.
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Insira o código recebido no e-mail e defina sua nova senha.
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Código de verificação:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  value={token}
                  onChangeText={setToken}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nova senha:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="nova senha"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar nova senha:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="confirme a nova senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 10 }} />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={step === 'email' ? handleRequestReset : handleResetPassword}
            >
              <Text style={styles.buttonText}>
                {step === 'email' ? 'Enviar código' : 'Redefinir senha'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>Voltar ao login</Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  inputContainer: { width: '100%', marginBottom: 15 },
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
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginTop: 20 },
  linkText: { color: colors.primaryGreen, fontSize: 13 },
});