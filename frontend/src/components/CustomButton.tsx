import React from 'react';
import { Text, StyleSheet, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CustomButtonProps extends PressableProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'cancel'; 
  style?: StyleProp<ViewStyle>;
}

export default function CustomButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  disabled, 
  ...rest 
}: CustomButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.buttonBase,
        variant === 'primary' ? styles.primaryBg : styles.cancelBg,
        pressed && !disabled && styles.buttonPressed, 
        style as any
      ]}
    >
      {({ pressed }) => (
        <Text style={[
          styles.textBase,
          variant === 'primary' ? styles.primaryText : styles.cancelText,
          pressed && !disabled && styles.textPressed
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
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    elevation: 0,
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
    color: '#E53935',
  },
  textPressed: {
    opacity: 0.8,
  }
});