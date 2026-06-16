import React from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import { useSettings } from "./useSettings";

export default function SettingsScreen({ navigation }: any) {
  const {
    soundEnabled,
    musicEnabled, setMusicEnabled,
    isFilho,
    handleSoundToggle,
    handleLogout,
  } = useSettings();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBackground}>
        <Text style={styles.pageTitle}>Configurações</Text>
      </View>

      <View style={styles.content}>
        {isFilho && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Áudio</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="volume-high" size={22} color={colors.primaryGreen} />
                  </View>
                  <Text style={styles.settingText}>Efeitos Sonoros</Text>
                </View>
                <Switch
                  trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
                  thumbColor={soundEnabled ? colors.primaryGreen : "#FAFAFA"}
                  onValueChange={handleSoundToggle}
                  value={soundEnabled}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="musical-notes" size={22} color={colors.primaryGreen} />
                  </View>
                  <Text style={styles.settingText}>Música de Fundo</Text>
                </View>
                <Switch
                  trackColor={{ false: "#E0E0E0", true: "#A5D6A7" }}
                  thumbColor={musicEnabled ? colors.primaryGreen : "#FAFAFA"}
                  onValueChange={setMusicEnabled}
                  value={musicEnabled}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geral</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => handleLogout(navigation)}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconWrapper, { backgroundColor: "#FFEBEE" }]}>
                  <Ionicons name="log-out-outline" size={22} color="#E53935" />
                </View>
                <Text style={[styles.settingText, { color: "#E53935", fontWeight: "bold" }]}>
                  Sair da Conta
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#E53935" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}