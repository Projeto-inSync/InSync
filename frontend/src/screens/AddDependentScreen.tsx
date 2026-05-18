import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import CustomButton from "../components/CustomButton";
import { API_URL } from "@env";
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AddDependentScreen({ navigation }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [petName, setPetName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!username.trim() || !password.trim() || !petName.trim()) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha o nome da criança e o nome do mascote.",
      );
      return;
    }

    setLoading(true);

    try {
      const idResponsavel = await AsyncStorage.getItem("idPaciente");
      if (!idResponsavel) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
        return;
      }

      const childResponse = await fetch(`${API_URL}/create-child`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          senha: password.trim(),
          idResponsavel,
        }),
      });

      const childData = await childResponse.json();
      if (!childResponse.ok) {
        Alert.alert("Erro", childData.detail || "Erro ao criar dependente.");
        return;
      }

      const charResponse = await fetch(`${API_URL}/add-character-name`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPaciente: childData.idPaciente,
          nome: petName.trim(),
        }),
      });

      const charData = await charResponse.json();
      if (!charResponse.ok) {
        Alert.alert("Erro", charData.detail || "Filho criado, mas erro ao criar mascote.");
        return;
      }

      Alert.alert(
        "Sucesso!",
        `${username} foi adicionado(a) à sua família InSync!\nSeu mascote "${petName}" está pronto!`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert("Erro de conexão", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color={colors.textDark} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Novo Dependente</Text>
        <Text style={styles.subtitle}>
          Adicione um filho(a) para acompanhar a saúde e se divertir com o novo
          mascote!
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
          <Image
            source={require("../assets/happy_panda.png")}
            style={styles.pandaImage}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primaryGreen}
            style={{ marginTop: 10 }}
          />
        ) : (
          <CustomButton
            title="Adicionar à Família"
            onPress={handleAdd}
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
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
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.textDark,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  pandaImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    opacity: 0.8, // Deixa a imagem levemente transparente para não roubar a atenção do botão
  },
});
