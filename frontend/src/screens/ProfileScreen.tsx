import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';

export default function ProfileScreen() {
  // Estado para controlar o Pop-up de trocar usuário
  const [modalVisible, setModalVisible] = useState(false);
  // Estado para guardar quem é o usuário atual
  const [currentUser, setCurrentUser] = useState('Joãozinho (Filho)');

  // Função para simular a troca de usuário
  const handleSwitchUser = (name: string) => {
    setCurrentUser(name);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. Área Superior (Verde) com o Avatar e Título */}
      <View style={styles.headerBackground}>
        <Text style={styles.pageTitle}>Portal da Família</Text>
        <View style={styles.avatarWrapper}>
          <Image 
            source={require('../assets/happy_panda.png')} 
            style={styles.avatarImage} 
          />
        </View>
      </View>

      {/* 2. Barra Escura de Informações do Usuário Atual */}
      <View style={styles.infoBar}>
        <View>
          <Text style={styles.currentUserText}>Usuário atual:</Text>
          <Text style={styles.petName}>{currentUser}</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.switchUser}>Trocar usuário</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Seção de Medalhas (Conquistas) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon" size={24} color={colors.primaryGreen} />
          <Text style={styles.sectionTitle}>Conquistas Recentes</Text>
        </View>
        
        <View style={styles.medalsContainer}>
          <View style={styles.medalItem}>
            <View style={[styles.medalCircle, { backgroundColor: '#FFF9C4' }]}>
              <Ionicons name="restaurant" size={28} color="#FBC02D" />
            </View>
            <Text style={styles.medalText}>1ª Refeição</Text>
          </View>

          <View style={styles.medalItem}>
            <View style={[styles.medalCircle, { backgroundColor: '#E1F5FE' }]}>
              <Ionicons name="flame" size={28} color="#03A9F4" />
            </View>
            <Text style={styles.medalText}>3 Dias Foco</Text>
          </View>

          <View style={styles.medalItem}>
            <View style={[styles.medalCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="star" size={28} color={colors.primaryGreen} />
            </View>
            <Text style={styles.medalText}>Panda Feliz</Text>
          </View>
        </View>
      </View>

      {/* 4. Seção do Plano e Benefícios */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="card" size={24} color={colors.primaryGreen} />
          <Text style={styles.sectionTitle}>Meu Plano</Text>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planStatus}>Teste gratuito de 15 dias</Text>
          <Text style={styles.planDescription}>
            Aproveite todos os recursos premium! Você pode assinar o <Text style={styles.bold}>Plano InSync: Pai e Filho</Text> ou o <Text style={styles.bold}>Plano Família</Text> (para múltiplos filhos).
          </Text>

          <Text style={styles.benefitsTitle}>Vantagens Premium:</Text>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primaryGreen} />
            <Text style={styles.benefitText}>Controle total da saúde e glicemia</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primaryGreen} />
            <Text style={styles.benefitText}>Acesso ilimitado à Câmera IA</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primaryGreen} />
            <Text style={styles.benefitText}>Acesso aos Gráficos Históricos</Text>
          </View>

          <CustomButton 
            title="Conhecer Planos" 
            onPress={() => alert('Abrir tela de pagamentos em breve!')} 
            style={{ marginTop: 20 }}
          />
        </View>
      </View>

      {/* Espaçamento no final da tela */}
      <View style={{ height: 40 }} />

      {/* --------------------------------------------------- */}
      {/* MODAL: Pop-up de Trocar Usuário */}
      {/* --------------------------------------------------- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)} // Fecha se clicar fora
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quem está usando?</Text>

            {/* Opção: Responsável */}
            <TouchableOpacity style={styles.userOption} onPress={() => handleSwitchUser('Carlos (Responsável)')}>
              <Ionicons name="person-circle" size={40} color={colors.textDark} />
              <Text style={styles.userOptionText}>Carlos (Responsável)</Text>
            </TouchableOpacity>

            {/* Opção: Filho 1 */}
            <TouchableOpacity style={styles.userOption} onPress={() => handleSwitchUser('Joãozinho (Filho)')}>
              <Image source={require('../assets/happy_panda.png')} style={styles.modalAvatar} />
              <Text style={styles.userOptionText}>Joãozinho</Text>
            </TouchableOpacity>

            {/* Opção: Filho 2 */}
            <TouchableOpacity style={styles.userOption} onPress={() => handleSwitchUser('Mariazinha (Filha)')}>
              <Image source={require('../assets/happy_panda.png')} style={styles.modalAvatar} />
              <Text style={styles.userOptionText}>Mariazinha</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Opção: Adicionar Mais */}
            <TouchableOpacity style={styles.addUserOption} onPress={() => {
              setModalVisible(false);
              alert('Navegar para a tela de adicionar dependente!');
            }}>
              <Ionicons name="add-circle-outline" size={30} color={colors.primaryGreen} />
              <Text style={styles.addUserText}>Adicionar filho(a)</Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F9F4' },
  headerBackground: { backgroundColor: colors.primaryGreen, alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  avatarWrapper: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, overflow: 'hidden' },
  avatarImage: { width: 90, height: 90, resizeMode: 'contain' },
  infoBar: { backgroundColor: '#2E7D32', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  currentUserText: { color: '#E8F5E9', fontSize: 12, marginBottom: 2 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  switchUser: { fontSize: 14, color: '#FFFFFF', textDecorationLine: 'underline' },
  section: { paddingHorizontal: 20, paddingTop: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginLeft: 10 },
  medalsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  medalItem: { alignItems: 'center', width: '30%' },
  medalCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2 },
  medalText: { fontSize: 12, fontWeight: '600', color: colors.textDark, textAlign: 'center' },
  planCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  planStatus: { fontSize: 18, fontWeight: 'bold', color: '#FFA000', marginBottom: 10 },
  planDescription: { fontSize: 14, color: colors.textGray, marginBottom: 15, lineHeight: 20 },
  bold: { fontWeight: 'bold', color: colors.textDark },
  benefitsTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  benefitText: { fontSize: 14, color: colors.textDark, marginLeft: 8 },
  
  // Estilos do Modal (Pop-up)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginBottom: 20, textAlign: 'center' },
  userOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  modalAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0' },
  userOptionText: { fontSize: 18, color: colors.textDark, marginLeft: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  addUserOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, justifyContent: 'center' },
  addUserText: { fontSize: 16, color: colors.primaryGreen, fontWeight: 'bold', marginLeft: 10 }
});