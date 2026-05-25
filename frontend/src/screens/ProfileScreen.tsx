// mostra user atual, conquistas recentes

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';
import { API_URL } from '@env';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Conquista = {
  idConquista: number;
  nome: string;
  descricao: string;
  icone: string;
  cor_fundo: string;
  cor_icone: string;
  desbloqueada_em: string;
}

export default function ProfileScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState('Responsável');
  const [dependents, setDependents] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState('');
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [loadingConquistas, setLoadingConquistas] = useState(false);
  const [tipoLoginOriginal, setTipoLoginOriginal] = useState('');
  const [usuarioAtivoTipo, setUsuarioAtivoTipo] = useState('');

  const fetchConquistas = async (idParaBuscar?: string) => { // ✅ aceita parâmetro
    try {
      setLoadingConquistas(true);
      let id = idParaBuscar;
      if (!id) {
        let idAtivo = await AsyncStorage.getItem('idAtivo');
        if (!idAtivo) idAtivo = await AsyncStorage.getItem('idPaciente');
        id = idAtivo || undefined;
      }
      if (!id) return;
      const response = await fetch(`${API_URL}/conquistas/${id}`);
      if (response.ok) {
        const data = await response.json();
        setConquistas(data);
      }
    } catch (error) {
      console.log('Erro ao buscar conquistas:', error);
    } finally {
      setLoadingConquistas(false);
    }
  };

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const idResponsavel = await AsyncStorage.getItem("idPaciente");
      const nomeResponsavel = await AsyncStorage.getItem("nome");
      const ativoTipo = await AsyncStorage.getItem('usuarioAtivoTipo');
      const idAtivo = await AsyncStorage.getItem('idAtivo');
      const tipoOriginal = await AsyncStorage.getItem('tipoLoginOriginal');

      setTipoLoginOriginal(tipoOriginal || '');
      if (ativoTipo) setUsuarioAtivoTipo(ativoTipo);

      if (idResponsavel) {
        await AsyncStorage.setItem('idResponsavel', idResponsavel);
        if (!idAtivo) await AsyncStorage.setItem('idAtivo', idResponsavel);
      }

      if (nomeResponsavel) setParentName(nomeResponsavel);

      let deps: any[] = [];
      if (idResponsavel) {
        const response = await fetch(`${API_URL}/dependents/${idResponsavel}`);
        const data = await response.json();
        if (response.ok) {
          deps = data;
          setDependents(data);
        }
      }

      if (ativoTipo === 'filho' && idAtivo && idAtivo !== idResponsavel) {
        const filhoAtivo = deps.find(
          (d: any) => String(d.idpaciente) === String(idAtivo)
        );
        setCurrentUser(filhoAtivo ? filhoAtivo.nomefilho : 'Filho');
      } else {
        const sufixo = tipoOriginal === 'responsavel' ? ' (Responsável)' : '';
        setCurrentUser(`${nomeResponsavel}${sufixo}`);
      }

      // ✅ ADICIONAR: chama fetchConquistas com o id correto já resolvido
      const idFinal = (ativoTipo === 'filho' && idAtivo && idAtivo !== idResponsavel)
        ? idAtivo
        : idResponsavel;
      await fetchConquistas(idFinal || undefined);

    } catch (error) {
      console.log("Erro ao buscar dependentes:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ALTERAR: remove o fetchConquistas separado, já é chamado dentro do fetchFamilyData
  useFocusEffect(
    useCallback(() => {
      fetchFamilyData();
    }, [])
  );

  const handleSwitchUser = async (name: string, isParent: boolean, idFilho?: number) => {
    setModalVisible(false);

    if (isParent) {
      const idResponsavel = await AsyncStorage.getItem('idResponsavel');
      if (idResponsavel) {
        await AsyncStorage.setItem('idAtivo', idResponsavel);
        await AsyncStorage.setItem('usuarioAtivoTipo', 'responsavel');
        await AsyncStorage.setItem('tipo', 'responsavel');
        navigation.reset({ index: 0, routes: [{ name: 'HomeTab' }]});
      }
    } else {
      if (idFilho) {
        await AsyncStorage.setItem('idAtivo', String(idFilho));
        await AsyncStorage.setItem('usuarioAtivoTipo', 'filho');
        await AsyncStorage.setItem('tipo', 'filho');
        navigation.reset({ index: 0, routes: [{ name: 'HomeTab' }]});
      }
    }
  };

  const conquistasRecentes = conquistas.slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.headerBackground}>
        <Text style={styles.pageTitle}>Portal da Família</Text>
        <View style={styles.avatarWrapper}>
          <Image source={require('../assets/happy_panda.png')} style={styles.avatarImage} />
        </View>
      </View>

      <View style={styles.infoBar}>
        <View>
          <Text style={styles.currentUserText}>Usuário atual:</Text>
          <Text style={styles.petName}>{currentUser || `${parentName} (Responsável)`}</Text>
        </View>
        {tipoLoginOriginal !== 'filho' && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.switchUser}>Trocar usuário</Text>
          </TouchableOpacity>
        )}
      </View>

      {(tipoLoginOriginal !== 'responsavel' || usuarioAtivoTipo === 'filho') && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon" size={24} color={colors.primaryGreen} />
            <Text style={styles.sectionTitle}>Conquistas Recentes</Text>
          </View>

          {loadingConquistas ? (
            <ActivityIndicator size="small" color={colors.primaryGreen} style={{ marginVertical: 20 }} />
          ) : conquistasRecentes.length === 0 ? (
            <View style={styles.emptyConquistasContainer}>
              <Ionicons name="trophy-outline" size={40} color="#BDBDBD" />
              <Text style={styles.emptyConquistasText}>
                Nenhuma conquista ainda.{'\n'}Complete missões para ganhar medalhas!
              </Text>
            </View>
          ) : (
            <View style={styles.medalsContainer}>
              {conquistasRecentes.map(conquista => (
                <View key={`${conquista.idConquista}-${conquista.nome}`} style={styles.medalItem}>
                  <View style={[styles.medalCircle, { backgroundColor: conquista.cor_fundo }]}>
                    <Ionicons name={conquista.icone as any} size={28} color={conquista.cor_icone} />
                  </View>
                  <Text style={styles.medalText}>{conquista.nome}</Text>
                </View>
              ))}
            </View>
          )}

          {conquistas.length > 3 && (
            <TouchableOpacity style={styles.verTodasButton}>
              <Text style={styles.verTodasText}>Ver todas ({conquistas.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {usuarioAtivoTipo !== 'filho' && tipoLoginOriginal !== 'filho' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={24} color={colors.primaryGreen} />
            <Text style={styles.sectionTitle}>Meu Plano</Text>
          </View>
          <View style={styles.planCard}>
            <Text style={styles.planStatus}>Teste gratuito de 15 dias</Text>
            <Text style={styles.planDescription}>
              Aproveite todos os recursos premium! Você pode assinar o{' '}
              <Text style={styles.bold}>Plano InSync: Pai e Filho</Text> ou o{' '}
              <Text style={styles.bold}>Plano Família</Text>.
            </Text>
            <CustomButton
              title="Conhecer Planos"
              onPress={() => navigation.navigate('Payment')}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quem está usando?</Text>
            <TouchableOpacity
              style={styles.userOption}
              onPress={() => handleSwitchUser(parentName, true)}
            >
              <Ionicons name="person-circle" size={40} color={colors.textDark} />
              <Text style={styles.userOptionText}>{parentName} (Responsável)</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryGreen} style={{ marginVertical: 15 }} />
            ) : dependents.length > 0 ? (
              dependents.map((dep) => (
                <TouchableOpacity
                  key={`${dep.idpaciente}-${dep.nomefilho}`}
                  style={styles.userOption}
                  onPress={() => handleSwitchUser(dep.nomefilho, false, dep.idpaciente)}
                >
                  <Image source={require('../assets/happy_panda.png')} style={styles.modalAvatar} />
                  <View style={{ marginLeft: 15 }}>
                    <Text style={[styles.userOptionText, { marginLeft: 0 }]}>{dep.nomefilho}</Text>
                    {dep.nomemascote && (
                      <Text style={{ color: colors.textGray, fontSize: 12 }}>
                        Mascote: {dep.nomemascote}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum filho adicionado ainda.</Text>
            )}

            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.addUserOption}
              onPress={() => { setModalVisible(false); navigation.navigate('AddDependent'); }}
            >
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
  headerBackground: {
    backgroundColor: colors.primaryGreen, alignItems: 'center',
    paddingTop: 60, paddingBottom: 30
  },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  avatarWrapper: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center', elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 5, overflow: 'hidden'
  },
  avatarImage: { width: 90, height: 90, resizeMode: 'contain' },
  infoBar: {
    backgroundColor: '#2E7D32', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15
  },
  currentUserText: { color: '#E8F5E9', fontSize: 12, marginBottom: 2 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  switchUser: { fontSize: 14, color: '#FFFFFF', textDecorationLine: 'underline' },
  section: { paddingHorizontal: 20, paddingTop: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginLeft: 10 },
  medalsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  medalItem: { alignItems: 'center', width: 80 },
  medalCircle: {
    width: 60, height: 60, borderRadius: 30, justifyContent: 'center',
    alignItems: 'center', marginBottom: 8, elevation: 2
  },
  medalText: { fontSize: 12, fontWeight: '600', color: colors.textDark, textAlign: 'center' },
  emptyConquistasContainer: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  emptyConquistasText: { textAlign: 'center', color: '#BDBDBD', fontSize: 14, lineHeight: 20 },
  verTodasButton: { marginTop: 12, alignItems: 'center' },
  verTodasText: { fontSize: 14, color: colors.primaryGreen, fontWeight: '600', textDecorationLine: 'underline' },
  planCard: {
    backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4
  },
  planStatus: { fontSize: 18, fontWeight: 'bold', color: '#FFA000', marginBottom: 10 },
  planDescription: { fontSize: 14, color: colors.textGray, marginBottom: 15, lineHeight: 20 },
  bold: { fontWeight: 'bold', color: colors.textDark },
  emptyText: { textAlign: 'center', color: colors.textGray, marginVertical: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 25, minHeight: 300
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginBottom: 20, textAlign: 'center' },
  userOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  modalAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0' },
  userOptionText: { fontSize: 18, color: colors.textDark, marginLeft: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  addUserOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, justifyContent: 'center' },
  addUserText: { fontSize: 16, color: colors.primaryGreen, fontWeight: 'bold', marginLeft: 10 },
});