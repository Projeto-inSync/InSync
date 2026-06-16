import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import { useLogin } from "./useLogin";

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function LoginScreen({ navigation }: Props) {
  const { login, setLogin, password, setPassword, loading, handleLogin } =
    useLogin(
      () => navigation.navigate("Admin"),
      () => navigation.navigate("HomeTab"),
    );
    const isWeb = Platform.OS === "web";

  const content = (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bem-vindo</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-mail ou Username:</Text>
          <TextInput
            style={styles.input}
            placeholder="insira seu e-mail ou username"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Senha:</Text>
          <TextInput
            style={styles.input}
            placeholder="insira sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 10 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.forgotContainer} onPress={() => navigation.navigate("RecuperarSenha")}>
          <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>
            Não tem uma conta?{" "}
            <Text style={styles.linkTextBold}>Crie uma!</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isWeb) {
    return <View style={styles.backgroundWeb}>{content}</View>;
  }

  return (
    <ImageBackground
      source={require("../../assets/background_bamboo.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Bem-vindo</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail ou Username:</Text>
            <TextInput
              style={styles.input}
              placeholder="insira seu e-mail ou username"
              value={login}
              onChangeText={setLogin}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha:</Text>
            <TextInput
              style={styles.input}
              placeholder="insira sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 10 }} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.forgotContainer} onPress={() => navigation.navigate("RecuperarSenha")}>
            <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>
              Não tem uma conta?{" "}
              <Text style={styles.linkTextBold}>Crie uma!</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}