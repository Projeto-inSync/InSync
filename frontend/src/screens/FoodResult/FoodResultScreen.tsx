import React from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import CustomButton from "../../components/CustomButton";
import { useFoodResult } from "./useFoodResult";
import { ImpactBar } from "./FoodResultComponents";

type RootStackParamList = {
  FoodResultScreen: {
    analysisResult: {
      classification: string;
      status: { carboidrato: number; glicemia: number; proteina: number };
    };
  };
};

interface Props {
  navigation: NativeStackNavigationProp<any, any>;
}

export default function FoodResultScreen({ navigation }: Props) {
  const route = useRoute<RouteProp<RootStackParamList, "FoodResultScreen">>();

  const { analysisResult } = route.params || {
    analysisResult: {
      classification: "Nenhum dado recebido",
      status: { carboidrato: 0, glicemia: 0, proteina: 0 },
    },
  };

  const {
    loading, isReady, ehPrejudicial,
    carboidrato, glicemia, proteina,
    handleFeed, handleCancel,
  } = useFoodResult(
    analysisResult,
    (data) => navigation.navigate("HomeTab", {
      screen: "Home",
      params: { feedPanda: true, novasConquistas: data.novas_conquistas ?? [] },
    }),
    () => navigation.navigate("HomeTab"),
  );

  return (
    <ImageBackground source={require("../../assets/background_bamboo.png")} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="analytics" size={60} color={colors.primaryGreen} />
            <Text style={styles.title}>Resultado da Análise</Text>
          </View>

          <View style={[styles.aiTextContainer, ehPrejudicial && styles.aiTextContainerWarning]}>
            {ehPrejudicial && (
              <View style={styles.warningRow}>
                <Ionicons name="warning" size={16} color="#E53935" />
                <Text style={styles.warningText}>Atenção: este alimento eleva a glicemia!</Text>
              </View>
            )}
            <Text style={styles.aiText}>{analysisResult.classification}</Text>
          </View>

          <Text style={styles.subtitle}>Impacto estimado nos níveis do pet:</Text>

          <ImpactBar label="Carboidrato" delta={carboidrato} color={colors.lightGreen} />
          <ImpactBar
            label="Glicemia"
            delta={glicemia}
            color={ehPrejudicial || glicemia >= 20 ? "#E53935" : "#FFA000"}
            isWarning={ehPrejudicial || glicemia >= 20}
          />
          <ImpactBar label="Proteína" delta={proteina} color="#1565C0" />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primaryGreen} style={{ marginTop: 20 }} />
          ) : (
            <>
              <CustomButton
                title="Confirmar e Alimentar"
                onPress={handleFeed}
                disabled={!isReady}
                style={[styles.btnPrimary, { opacity: isReady ? 1 : 0.5 }] as any}
              />
              <CustomButton
                title="Descartar"
                onPress={handleCancel}
                variant="cancel"
                disabled={!isReady}
                style={[styles.btnCancel, { opacity: isReady ? 1 : 0.5 }] as any}
              />
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}