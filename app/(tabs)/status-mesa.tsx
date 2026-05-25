import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import { useMesas, Mesa } from '../../contexts/MesaContext';
import { Users, Plus, Trash2, X } from 'lucide-react-native';

export default function StatusMesaScreen() {
  const { mesas, adicionarMesa, removerMesa, atualizarMesaStatus } = useMesas();

  // Estados de controle dos Modais
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalDetalheVisible, setModalDetalheVisible] = useState(false);
  const [novaMesaNumero, setNovaMesaNumero] = useState('');
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);

  // Manipulador para salvar a nova mesa
  const handleAddMesa = () => {
    if (!novaMesaNumero.trim()) {
      Alert.alert('Erro', 'Por favor, digite o número ou nome da mesa.');
      return;
    }
    adicionarMesa(novaMesaNumero);
    setNovaMesaNumero('');
    setModalAddVisible(false);
  };

  // Retorna a cor de fundo baseado no status atual da comanda
  const getCorStatus = (status: any) => {
    switch (status) {
      case 'vaga':
        return '#2196F3'; // Azul uniforme
      case 'aguardando':
        return '#FFC107'; // Amarelo de atenção
      case 'preparando':
        return '#FF9F43'; // Laranja (Chef cozinhando)
      case 'atendido':
        return '#4CAF50'; // Verde de sucesso
      default:
        return '#2196F3';
    }
  };

  // Abre o modal detalhado ao tocar em uma mesa
  const handleAbrirDetalhes = (mesa: Mesa) => {
    setMesaSelecionada(mesa);
    setModalDetalheVisible(true);
  };

  // Libera a mesa de volta para o estado azul (vaga)
  const handleLiberarMesa = (id: string) => {
    atualizarMesaStatus(id, 'vaga', undefined, undefined);
    setModalDetalheVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Status das Mesas</Text>

      {/* Grid de Exibição das Mesas */}
      <FlatList
        data={mesas}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.mesaCard, { backgroundColor: getCorStatus(item.status) }]}
            onPress={() => handleAbrirDetalhes(item)}
          >
            <Users color="#fff" size={32} />
            <Text style={styles.mesaNumeroText}>{item.numero}</Text>
            <Text style={styles.mesaStatusText}>
              {item.status === 'vaga' && 'Vaga'}
              {item.status === 'aguardando' && 'Aguardando'}
              {item.status === 'atendido' && 'Atendido'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Botão Flutuante (FAB) "+" no canto inferior direito */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalAddVisible(true)}
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      {/* MODAL 1: ADICIONAR MESA */}
      <Modal visible={modalAddVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Nova Mesa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 04 ou Mesa Executiva"
              value={novaMesaNumero}
              onChangeText={setNovaMesaNumero}
              keyboardType="default"
            />
            <View style={styles.modalButtonsRow}>
              <Button title="Cancelar" color="#888" onPress={() => setModalAddVisible(false)} />
              <Button title="Salvar" color="#FF6B35" onPress={handleAddMesa} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: DETALHES DA MESA (MINI INTERFACE) */}
      <Modal visible={modalDetalheVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{mesaSelecionada?.numero}</Text>
              <TouchableOpacity onPress={() => setModalDetalheVisible(false)}>
                <X color="#333" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.detalheCorpo}>
              <Text style={styles.detalheLabel}>Status Ocupação:</Text>
              <Text style={[styles.detalheValor, { fontWeight: 'bold' }]}>
                {mesaSelecionada?.status === 'vaga' && '🔵 Vazia / Vaga'}
                {mesaSelecionada?.status === 'aguardando' && '🟡 Aguardando Pedido'}
                {mesaSelecionada?.status === 'atendido' && '🟢 Atendido & Consumindo'}
              </Text>

              {mesaSelecionada?.status !== 'vaga' && (
                <>
                  <Text style={styles.detalheLabel}>Cliente na Mesa:</Text>
                  <Text style={styles.detalheValor}>{mesaSelecionada?.cliente || 'Não informado'}</Text>

                  <Text style={styles.detalheLabel}>Itens do Pedido:</Text>
                  <Text style={styles.detalheValor}>{mesaSelecionada?.pedidoAtual || 'Nenhum item adicionado'}</Text>
                </>
              )}
            </View>

            <View style={styles.detalheAcoes}>
              {mesaSelecionada?.status !== 'vaga' && (
                <TouchableOpacity
                  style={styles.btnLiberar}
                  onPress={() => handleLiberarMesa(mesaSelecionada!.id)}
                >
                  <Text style={styles.btnText}>Liberar Mesa (Fechar Conta)</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.btnDeletar}
                onPress={() => {
                  Alert.alert('Excluir', 'Deseja apagar permanentemente esta mesa do layout?', [
                    { text: 'Não' },
                    { text: 'Sim', onPress: () => { removerMesa(mesaSelecionada!.id); setModalDetalheVisible(false); } }
                  ]);
                }}
              >
                <Trash2 color="#fff" size={18} />
                <Text style={styles.btnText}> Excluir Mesa do Sistema</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilizações completas do layout
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 15 },
  gridContainer: { paddingHorizontal: 10, paddingBottom: 100 },
  mesaCard: {
    flex: 1,
    margin: 8,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mesaNumeroText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  mesaStatusText: { color: '#fff', fontSize: 12, opacity: 0.9, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#FF6B35', // Mantém o padrão laranja do seu app
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginVertical: 15, fontSize: 16 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  detalheCorpo: { marginVertical: 15 },
  detalheLabel: { fontSize: 14, color: '#666', marginTop: 10 },
  detalheValor: { fontSize: 16, color: '#111', marginTop: 2 },
  detalheAcoes: { marginTop: 20, gap: 10 },
  btnLiberar: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnDeletar: { backgroundColor: '#D32F2F', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
});