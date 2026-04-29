import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Bem-vindo à Home!</Text>
      <Text>Aqui vai ficar o nosso Panda 🐼</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9', // Um tom de verde bem clarinho
  },
  texto: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});