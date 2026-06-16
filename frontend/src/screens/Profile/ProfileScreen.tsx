import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./styles";
import CustomButton from "../../components/CustomButton";
import { useProfile } from "./useProfile";

export default function ProfileScreen({ navigation }: any) {
  const {
    modalVisible, setModalVisible,
    loading,
    parentName,
    dependents,
    currentUser,
    conquistas,
    conquistasRecentes,
    loadingConquistas,
    tipoLoginOriginal,
    usuarioAtivoTipo,
    editandoFilho, setEditandoFilho,
    novoNome, setNovoNome,
    loadingAcao,
    handleSwitchUser,
    handleEditarFilho,
    handleSalvarNome,
    handleDeletarFilho,
  } = useProfile(navigation);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBackground}>
        <Text style={styles.pageTitle}>Portal da Família</Text>
        <View style={styles.avatarWrapper}>
          <Image source={require("../../assets/happy_panda.png")} style={styles.avatarImage} />
        </View>
      </View>

      <View style={styles.infoBar}>
        <View>
          <Text style={styles.currentUserText}>Usuário atual:</Text>
          <Text style={styles.petName}>{currentUser || `${parentName} (Responsável)`}</Text>
        </View>
        {tipoLoginOriginal !== "filho" && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.switchUser}>Trocar usuário</Text>
          </TouchableOpacity>
        )}
      </View>

      {(tipoLoginOriginal !== "responsavel" || usuarioAtivoTipo === "filho") && (
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
                Nenhuma conquista ainda.{"\n"}Complete missões para ganhar medalhas!
              </Text>
            </View>
          ) : (
            <View style={styles.medalsContainer}>
              {conquistasRecentes.map((conquista) => (
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

      {usuarioAtivoTipo !== "filho" && tipoLoginOriginal !== "filho" && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={24} color={colors.primaryGreen} />
            <Text style={styles.sectionTitle}>Meu Plano</Text>
          </View>
          <View style={styles.planCard}>
            <Text style={styles.planStatus}>Teste gratuito de 15 dias</Text>
            <Text style={styles.planDescription}>
              Aproveite todos os recursos premium! Você pode assinar o{" "}
              <Text style={styles.bold}>Plano InSync: Pai e Filho</Text> ou o{" "}
              <Text style={styles.bold}>Plano Família</Text>.
            </Text>
            <CustomButton
              title="Conhecer Planos"
              onPress={() => navigation.navigate("Payment")}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quem está usando?</Text>
            <TouchableOpacity style={styles.userOption} onPress={() => handleSwitchUser(parentName, true)}>
              <Ionicons name="person-circle" size={40} color={colors.textDark} />
              <Text style={styles.userOptionText}>{parentName} (Responsável)</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryGreen} style={{ marginVertical: 15 }} />
            ) : dependents.length > 0 ? (
              dependents.map((dep) => (
                <View key={`${dep.idpaciente}-${dep.nomefilho}`} style={styles.dependentRow}>
                  <TouchableOpacity
                    style={styles.userOptionFlex}
                    onPress={() => handleSwitchUser(dep.nomefilho, false, dep.idpaciente)}
                  >
                    <Image source={require("../../assets/happy_panda.png")} style={styles.modalAvatar} />
                    <View style={{ marginLeft: 15 }}>
                      <Text style={[styles.userOptionText, { marginLeft: 0 }]}>{dep.nomefilho}</Text>
                      {dep.nomemascote && (
                        <Text style={{ color: colors.textGray, fontSize: 12 }}>Mascote: {dep.nomemascote}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.acoesRow}>
                    <TouchableOpacity
                      onPress={() => { setModalVisible(false); handleEditarFilho(dep); }}
                      style={styles.acaoBotao}
                    >
                      <Ionicons name="pencil-outline" size={20} color={colors.primaryGreen} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletarFilho(dep)} style={styles.acaoBotao}>
                      <Ionicons name="trash-outline" size={20} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum filho adicionado ainda.</Text>
            )}

            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.addUserOption}
              onPress={() => { setModalVisible(false); navigation.navigate("AddDependent"); }}
            >
              <Ionicons name="add-circle-outline" size={30} color={colors.primaryGreen} />
              <Text style={styles.addUserText}>Adicionar filho(a)</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={!!editandoFilho} animationType="fade">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setEditandoFilho(null)}
        >
          <Pressable style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Editar nome do filho</Text>
            <TextInput
              style={styles.editInput}
              value={novoNome}
              onChangeText={setNovoNome}
              autoCapitalize="none"
              placeholder="Novo username"
            />
            {loadingAcao ? (
              <ActivityIndicator color={colors.primaryGreen} style={{ marginTop: 16 }} />
            ) : (
              <View style={styles.editBotoesRow}>
                <TouchableOpacity style={styles.editBotaoCancelar} onPress={() => setEditandoFilho(null)}>
                  <Text style={styles.editBotaoCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBotaoSalvar} onPress={handleSalvarNome}>
                  <Text style={styles.editBotaoSalvarText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}