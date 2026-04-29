import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Aqui avisamos ao TypeScript que essa tela recebe a propriedade 'navigation'
type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Tela de Login (Esqueleto TS)</Text>
      
      <Button 
        title="Entrar no InSync" 
        onPress={() => navigation.navigate('Home')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  texto: {
    fontSize: 20,
    marginBottom: 20,
  }
});