import React from "react";
import { View, Text, Image, Animated } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { useAnalysis } from "./useAnalysis";

type RootStackParamList = {
  Analysis: { imageBase64: string };
};

type Props = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AnalysisScreen({ navigation }: Props) {
  const route = useRoute<RouteProp<RootStackParamList, "Analysis">>();
  const { imageBase64 } = route.params || {};

  const { petName, spin } = useAnalysis(imageBase64, (data) =>
    navigation.replace("FoodResult", { analysisResult: data }),
  );

  return (
    <View style={styles.container}>
      <View style={styles.analysisCard}>
        <Text style={styles.titleText}>
          {petName} está analisando as propriedades do alimento, aguarde um instante.
        </Text>

        <Animated.View style={[styles.syncIcon, { transform: [{ rotate: spin }] }]}>
          <Ionicons name="sync" size={80} color="#A5D6A7" />
        </Animated.View>

        <Image
          source={require("../../assets/thinking_panda.png")}
          style={styles.pandaImage}
        />
      </View>
    </View>
  );
}