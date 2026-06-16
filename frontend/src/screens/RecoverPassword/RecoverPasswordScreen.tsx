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
import { useRecoverPassword } from "./useRecoverPassword";

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const {
    step,
    email, setEmail,
    token, setToken,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    loading,
    handleRequestReset,
    handleResetPassword,
  } = useRecoverPassword(navigation);

  const isWeb = Platform.OS === "web";

  const content = (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {step === "email" ? "Recuperar Senha" : "Nova Senha"}
        </Text>

        {step === "email" ? (
          <>
            <Text style={styles.description}>
              Informe seu e-mail cadastrado. Enviaremos um código de
              verificação válido por 15 minutos.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail:</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Insira o código recebido no e-mail e defina sua nova senha.
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código de verificação:</Text>
              <TextInput
                style={styles.input}
                placeholder="000000"
                value={token}
                onChangeText={setToken}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nova senha:</Text>
              <TextInput
                style={styles.input}
                placeholder="nova senha"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar nova senha:</Text>
              <TextInput
                style={styles.input}
                placeholder="confirme a nova senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 10 }} />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={step === "email" ? handleRequestReset : handleResetPassword}
          >
            <Text style={styles.buttonText}>
              {step === "email" ? "Enviar código" : "Redefinir senha"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>Voltar ao login</Text>
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
          <Text style={styles.title}>
            {step === "email" ? "Recuperar Senha" : "Nova Senha"}
          </Text>

          {step === "email" ? (
            <>
              <Text style={styles.description}>
                Informe seu e-mail cadastrado. Enviaremos um código de
                verificação válido por 15 minutos.
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Insira o código recebido no e-mail e defina sua nova senha.
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Código de verificação:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  value={token}
                  onChangeText={setToken}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nova senha:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="nova senha"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar nova senha:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="confirme a nova senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 10 }} />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={step === "email" ? handleRequestReset : handleResetPassword}
            >
              <Text style={styles.buttonText}>
                {step === "email" ? "Enviar código" : "Redefinir senha"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.linkText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}