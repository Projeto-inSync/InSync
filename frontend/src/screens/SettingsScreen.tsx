import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

type Props = {
  // Como essa tela está dentro de uma Tab que está dentro de um Stack, 
  // ela herda o poder de navegar por tudo!
  navigation: NativeStackNavigationProp<any, any>;
};

export default function SettingsScreen({ navigation }: Props) {
  
  const handleLogout = () => {
    Alert.alert(
      'Sair do InSync',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => {
            // Apaga o histórico e manda o usuário de volta para a estaca zero
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Título */}
      <Text style={styles.title}>Configurações</Text>

      {/* Linha tracejada separadora */}
      <View style={styles.separator} />

      {/* Botão de Sair */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
        <Ionicons name="log-out-outline" size={28} color={colors.textDark} />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 80, // Espaço para não encostar no relógio do celular
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '900', // Fonte bem grossa como no Figma
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
  },
  separator: {
    width: '100%',
    borderBottomWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed', // Faz a linha ficar tracejada
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginRight: 10,
  }
});