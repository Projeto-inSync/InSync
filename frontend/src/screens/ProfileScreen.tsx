import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Perfil do Panda 🐼</Text>
      <Text>(Vamos construir o visual dela em breve!)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F9F4' },
  text: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 }
});