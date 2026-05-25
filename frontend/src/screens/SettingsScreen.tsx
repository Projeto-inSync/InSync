import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Importamos os gerenciadores de áudio globais
import { toggleBackgroundMusic } from '../utils/MusicPlayer'; 
import { isSoundEnabled, toggleSoundEffects } from '../utils/SoundManager'; // <-- Nova importação

export default function SettingsScreen({ navigation }: any) {
  // O estado inicial agora lê a variável global para manter a consistência
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled);
  const [musicEnabled, setMusicEnabled] = useState(true);

  // Efeito que dispara sempre que a chavinha da música for alternada
  useEffect(() => {
    toggleBackgroundMusic(musicEnabled);
  }, [musicEnabled]);

  // Função que atualiza a tela e a variável global ao mesmo tempo
  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value); // Atualiza o visual da chavinha
    toggleSoundEffects(value); // Desliga/Liga os sons no resto do app
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.headerBackground}>
        <Text style={styles.pageTitle}>Configurações</Text>
      </View>

      <View style={styles.content}>
        
        {/* Seção de Áudio */}
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
                trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                thumbColor={soundEnabled ? colors.primaryGreen : '#FAFAFA'}
                onValueChange={handleSoundToggle} // <-- Alterado para usar a nossa nova função
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
                trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                thumbColor={musicEnabled ? colors.primaryGreen : '#FAFAFA'}
                onValueChange={setMusicEnabled}
                value={musicEnabled}
              />
            </View>
          </View>
        </View>

        {/* Seção Geral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geral</Text>
          <View style={styles.card}>
            
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={() => navigation.navigate('Login')}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconWrapper, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="log-out-outline" size={22} color="#E53935" />
                </View>
                <Text style={[styles.settingText, { color: '#E53935', fontWeight: 'bold' }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F9F4' },
  headerBackground: {
    backgroundColor: colors.primaryGreen,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textGray, marginBottom: 10, marginLeft: 10, textTransform: 'uppercase' },
  card: { backgroundColor: 'white', borderRadius: 20, paddingVertical: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  settingInfo: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingText: { fontSize: 16, color: colors.textDark, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginLeft: 70, marginRight: 20 }
});