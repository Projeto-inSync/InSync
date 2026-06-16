import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import CustomButton from "../../components/CustomButton";
import { styles } from "./styles";
import { useAddDependent } from "./useAddDependent";

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AddDependentScreen({ navigation }: Props) {
  const {
    username, setUsername,
    password, setPassword,
    petName, setPetName,
    loading, handleAdd,
  } = useAddDependent(() => navigation.goBack());

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
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
          <Text style={styles.label}>Username (usado no login):</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: mariinha123"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha do filho(a):</Text>
          <TextInput
            style={styles.input}
            placeholder="Crie uma senha simples"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
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

        <View style={styles.imageContainer}>
          <Image source={require("../../assets/happy_panda.png")} style={styles.pandaImage} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 10 }} />
        ) : (
          <CustomButton title="Adicionar à Família" onPress={handleAdd} style={{ marginTop: 10 }} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}