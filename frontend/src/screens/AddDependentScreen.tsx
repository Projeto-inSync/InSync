import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AddDependentScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [petName, setPetName] = useState('');

  const handleAdd = () => {
    if (name.trim() === '' || petName.trim() === '') {
      Alert.alert('Atenção', 'Por favor, preencha o nome da criança e o nome do mascote.');
      return;
    }
    
    // Alerta de sucesso e volta para a tela de Perfil
    Alert.alert(
      'Sucesso!', 
      `${name} foi adicionado(a) à sua família InSync!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={colors.textDark} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Novo Dependente</Text>
        <Text style={styles.subtitle}>
          Adicione um filho(a) para acompanhar a saúde e se divertir com o novo mascote!
        </Text>
      </View>

      <View style={styles.formContainer}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da criança:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Maria" 
            value={name} 
            onChangeText={setName} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Mascote (Panda):</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Pipo" 
            value={petName} 
            onChangeText={setPetName} 
          />
        </View>

        {/* Ilustração para deixar a tela amigável */}
        <View style={styles.imageContainer}>
           <Image 
             source={require('../assets/happy_panda.png')} 
             style={styles.pandaImage} 
           />
        </View>

        <CustomButton 
          title="Adicionar à Família" 
          onPress={handleAdd} 
          style={{marginTop: 10}} 
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textGray,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.textDark,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pandaImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    opacity: 0.8, // Deixa a imagem levemente transparente para não roubar a atenção do botão
  }
});