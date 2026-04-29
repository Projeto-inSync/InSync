import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      
      {/* 1. Área Superior (Verde) com o Avatar */}
      <View style={styles.headerBackground}>
        <View style={styles.avatarWrapper}>
          {/* Reutilizando a imagem do nosso Panda */}
          <Image 
            source={require('../assets/happy_panda.png')} 
            style={styles.avatarImage} 
          />
        </View>
      </View>

      {/* 2. Barra Escura de Informações do Usuário */}
      <View style={styles.infoBar}>
        <Text style={styles.petName}>[nome_pet]</Text>
        <TouchableOpacity>
          <Text style={styles.switchUser}>Trocar usuário</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Lista de Opções (Medalhas e Planos) */}
      <View style={styles.optionsContainer}>
        
        {/* Item: Medalhas */}
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionLeft}>
            <Ionicons name="ribbon-outline" size={28} color={colors.textDark} />
            <Text style={styles.optionText}>Medalhas</Text>
          </View>
          <Ionicons name="chevron-forward-circle" size={28} color={colors.primaryGreen} />
        </TouchableOpacity>

        {/* Item: Planos */}
        <TouchableOpacity style={styles.optionItem}>
          <View style={styles.optionLeft}>
            <Ionicons name="star-outline" size={28} color={colors.textDark} />
            <Text style={styles.optionText}>Planos</Text>
          </View>
          <Ionicons name="chevron-forward-circle" size={28} color={colors.primaryGreen} />
        </TouchableOpacity>

      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 30,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70, // Metade da largura/altura para fazer um círculo perfeito
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden', // Evita que a imagem do panda vaze do círculo
  },
  avatarImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
  infoBar: {
    backgroundColor: '#2E7D32', // Um tom de verde um pouco mais escuro para dar contraste
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  switchUser: {
    fontSize: 14,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // Linha cinza bem clarinha separando os itens
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginLeft: 15,
  }
});