import React from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import { useHome } from "./useHome";

const { width: screenWidth } = Dimensions.get("window");

export default function HomeScreen({ route, navigation }: any) {
  const {
    isEating,
    petName,
    petStatus,
    conquistaModal,
    scaleAnim,
    wobbleAnim,
    pandaScale,
    playPandaSound,
    fecharConquista,
  } = useHome(route, navigation);

  return (
    <ImageBackground source={require("../../assets/background_bamboo.png")} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.healthCard}>
          <Text style={styles.petName}>{petName}</Text>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Carboidrato</Text>
              <Text style={styles.barValue}>{petStatus.carboidrato}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: (petStatus.carboidrato / 100) * (screenWidth - 80), backgroundColor: colors.lightGreen }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Glicemia</Text>
              <Text style={styles.barValue}>{petStatus.glicemia}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: (petStatus.glicemia / 100) * (screenWidth - 80), backgroundColor: "#FFA000" }]} />
            </View>
          </View>

          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Proteína</Text>
              <Text style={styles.barValue}>{petStatus.proteina}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: (petStatus.proteina / 100) * (screenWidth - 80), backgroundColor: "#E53935" }]} />
            </View>
          </View>
        </View>

        <View style={styles.petContainer}>
          <Animated.View style={{ transform: [{ scale: pandaScale }, { translateX: wobbleAnim }] }}>
            <TouchableOpacity activeOpacity={0.8} onPress={playPandaSound}>
              <Image
                source={
                  isEating
                    ? require("../../assets/eating_panda.png")
                    : petStatus.glicemia > 40
                      ? require("../../assets/sad_panda.png")
                      : require("../../assets/happy_panda.png")
                }
                style={styles.pandaImage}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <Modal transparent visible={!!conquistaModal} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.modalTitulo}>Conquista Desbloqueada!</Text>
            {conquistaModal && (
              <>
                <View style={[styles.iconCircle, { backgroundColor: conquistaModal.cor_fundo }]}>
                  <Ionicons name={conquistaModal.icone as any} size={48} color={conquistaModal.cor_icone} />
                </View>
                <Text style={styles.modalNome}>{conquistaModal.nome}</Text>
                <Text style={styles.modalDescricao}>
                  Parabéns! Você desbloqueou uma nova conquista. Continue assim!
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.modalBotao} onPress={fecharConquista}>
              <Text style={styles.modalBotaoTexto}>Continuar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </ImageBackground>
  );
}