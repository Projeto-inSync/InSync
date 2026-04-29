import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  // Permite escolhermos se o botão é o Principal (Verde) ou Secundário (Vermelho/Cancelar)
  variant?: 'primary' | 'cancel'; 
  style?: ViewStyle; // Permite passarmos margens extras lá da tela
};

export default function CustomButton({ title, onPress, variant = 'primary', style }: CustomButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      // O Pressable é incrível porque ele sabe quando está sendo 'pressed' (pressionado)
      style={({ pressed }) => [
        styles.buttonBase,
        variant === 'primary' ? styles.primaryBg : styles.cancelBg,
        pressed && styles.buttonPressed, // Se pressionado, aplica o efeito de afundar!
        style // Aplica margens se a tela pedir
      ]}
    >
      {({ pressed }) => (
        <Text style={[
          styles.textBase,
          variant === 'primary' ? styles.primaryText : styles.cancelText,
          pressed && styles.textPressed // Se quiser que o texto mude de cor ao apertar, é aqui
        ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Colocamos uma sombrinha para ele parecer 3D antes de ser clicado
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryBg: {
    backgroundColor: colors.primaryGreen,
  },
  cancelBg: {
    backgroundColor: 'transparent', // Fundo transparente
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }], // O segredo do movimento: reduz o tamanho em 5%
    elevation: 0, // Tira a sombra para parecer que afundou na tela
    opacity: 0.9,
  },
  textBase: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryText: {
    color: 'white',
  },
  cancelText: {
    color: '#E53935', // Vermelho para cancelar
  },
  textPressed: {
    opacity: 0.8, // Deixa o texto levemente transparente no clique
  }
});