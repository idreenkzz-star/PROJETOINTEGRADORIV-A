import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useMenu } from '@/contexts/MenuContext';
import { Mesa, MesaStatus, useMesas } from '@/contexts/MesaContext';
import {
  Clock3,
  ChefHat,
  CircleDashed,
  CheckCircle2,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';
import type { Order, OrderItem } from '@/types/menu';

const STATUS_CONFIG: Record<
  MesaStatus,
  { label: string; color: string; accent: string; icon: typeof Clock3 }
> = {
  vaga: {
    label: 'Vaga',
    color: '#9CA3AF',
    accent: '#6B7280',
    icon: CircleDashed,
  },
  aguardando: {
    label: 'Aguardando',
    color: '#F59E0B',
    accent: '#D97706',
    icon: Clock3,
  },
  preparando: {
    label: 'Preparando',
    color: '#FB923C',
    accent: '#EA580C',
    icon: ChefHat,
  },
  pronto: {
    label: 'Pronto',
    color: '#3B82F6',
    accent: '#2563EB',
    icon: CheckCircle2,
  },
  atendido: {
    label: 'Atendido',
    color: '#22C55E',
    accent: '#16A34A',
    icon: CheckCircle2,
  },
};

function getMesaNumeroCurto(numero: string) {
  return numero.replace(/^Mesa\s*/i, '').trim() || numero;
}

function formatarPedido(items: OrderItem[]) {
  return items
    .map((item) => `${item.quantity}x ${item.menuItem.name}`)
    .join(', ');
}

function getPedidoDaMesa(mesa: Mesa, orders: Order[]) {
  if (mesa.pedidoId) {
    return orders.find((order) => order.id === mesa.pedidoId);
  }

  if (!mesa.cliente) {
    return undefined;
  }

  return orders.find(
    (order) => order.customerName?.toLowerCase() === mesa.cliente?.toLowerCase()
  );
}

export default function StatusMesaScreen() {
  const { mesas, adicionarMesa, removerMesa, atualizarMesaStatus } = useMesas();
  const { orders } = useMenu();

  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalDetalheVisible, setModalDetalheVisible] = useState(false);
  const [novaMesaNumero, setNovaMesaNumero] = useState('');
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [pessoasDraft, setPessoasDraft] = useState('1');
  const [statusDraft, setStatusDraft] = useState<MesaStatus>('vaga');

  const mesasComPedido = useMemo(
    () =>
      mesas.map((mesa) => ({
        ...mesa,
        pedido: getPedidoDaMesa(mesa, orders),
      })),
    [mesas, orders]
  );

  const resumo = useMemo(() => {
    const total = mesas.length;
    const vagas = mesas.filter((mesa) => mesa.status === 'vaga').length;
    const ocupadas = total - vagas;
    const aguardando = mesas.filter((mesa) => mesa.status === 'aguardando').length;
    const preparando = mesas.filter((mesa) => mesa.status === 'preparando').length;
    return { total, vagas, ocupadas, aguardando, preparando };
  }, [mesas]);

  const handleAddMesa = () => {
    if (!novaMesaNumero.trim()) {
      Alert.alert('Erro', 'Por favor, digite o número ou nome da mesa.');
      return;
    }

    adicionarMesa(novaMesaNumero.trim());
    setNovaMesaNumero('');
    setModalAddVisible(false);
  };

  const handleAbrirDetalhes = (mesa: Mesa) => {
    setMesaSelecionada(mesa);
    setPessoasDraft(String(mesa.pessoas ?? 1));
    setStatusDraft(mesa.status);
    setModalDetalheVisible(true);
  };

  useEffect(() => {
    if (!mesaSelecionada) {
      return;
    }

    setPessoasDraft(String(mesaSelecionada.pessoas ?? 1));
    setStatusDraft(mesaSelecionada.status);
  }, [mesaSelecionada]);

  const handleSalvarDetalhes = () => {
    if (!mesaSelecionada) {
      return;
    }

    const pessoas = Number.parseInt(pessoasDraft, 10);
    const pessoasSeguras = Number.isFinite(pessoas) && pessoas > 0 ? pessoas : undefined;

    atualizarMesaStatus(mesaSelecionada.id, {
      status: statusDraft,
      cliente: mesaSelecionada.cliente,
      pedidoAtual: mesaSelecionada.pedidoAtual,
      pedidoId: mesaSelecionada.pedidoId,
      pessoas: pessoasSeguras,
    });

    setMesaSelecionada((current) =>
      current
        ? statusDraft === 'vaga'
          ? {
              ...current,
              status: statusDraft,
              cliente: undefined,
              pedidoAtual: undefined,
              pedidoId: undefined,
              pessoas: undefined,
            }
          : { ...current, status: statusDraft, pessoas: pessoasSeguras }
        : current
    );

    setModalDetalheVisible(false);
  };

  const handleLiberarMesa = () => {
    if (!mesaSelecionada) {
      return;
    }

    atualizarMesaStatus(mesaSelecionada.id, { status: 'vaga' });
    setMesaSelecionada(null);
    setModalDetalheVisible(false);
  };

  const renderPedidoTexto = (mesa: Mesa, pedido?: Order) => {
    if (pedido) {
      return formatarPedido(pedido.items);
    }

    return mesa.pedidoAtual || 'Nenhum pedido vinculado.';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Painel operacional</Text>
        <Text style={styles.headerTitle}>Mesas</Text>
        <Text style={styles.headerSubtitle}>
          Toque em uma mesa para ver o pedido, a quantidade de pessoas e o status atual.
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{resumo.total}</Text>
          <Text style={styles.summaryLabel}>Mesas</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{resumo.vagas}</Text>
          <Text style={styles.summaryLabel}>Livres</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{resumo.ocupadas}</Text>
          <Text style={styles.summaryLabel}>Ativas</Text>
        </View>
      </View>

      <FlatList
        data={mesasComPedido}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <CircleDashed size={44} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhuma mesa cadastrada</Text>
            <Text style={styles.emptySubtitle}>
              Use o botão de adicionar para montar o layout do salão.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusConfig = STATUS_CONFIG[item.status];
          const StatusIcon = statusConfig.icon;
          const peopleLabel = item.pessoas ? `${item.pessoas} pessoas` : 'Sem info';

          return (
            <TouchableOpacity
              style={[
                styles.mesaCircle,
                {
                  backgroundColor: statusConfig.color,
                  borderColor: statusConfig.accent,
                },
              ]}
              activeOpacity={0.9}
              onPress={() => handleAbrirDetalhes(item)}
            >
              <View style={styles.mesaCircleInner}>
                <View style={styles.mesaTopRow}>
                  <View style={styles.mesaStatusChip}>
                    <StatusIcon size={10} color="#fff" />
                    <Text style={styles.mesaStatusChipText}>{statusConfig.label}</Text>
                  </View>
                </View>

                <Users color="#fff" size={14} />
                <Text style={styles.mesaNumero}>{getMesaNumeroCurto(item.numero)}</Text>
                <Text style={styles.mesaInfo}>{peopleLabel}</Text>
                <Text style={styles.mesaCliente} numberOfLines={1}>
                  {item.cliente || 'Sem cliente'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalAddVisible(true)}
      >
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <Modal visible={modalAddVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adicionar nova mesa</Text>
            <Text style={styles.modalText}>
              Digite o número ou nome que você quer usar no layout.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 04 ou Mesa Jardim"
              value={novaMesaNumero}
              onChangeText={setNovaMesaNumero}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setModalAddVisible(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryButton]}
                onPress={handleAddMesa}
              >
                <Text style={styles.primaryButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalDetalheVisible} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.modalTitle}>{mesaSelecionada?.numero}</Text>
                <Text style={styles.modalText}>
                  {mesaSelecionada?.cliente || 'Sem cliente associado'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalDetalheVisible(false)}>
                <X color="#1F2937" size={24} />
              </TouchableOpacity>
            </View>

            {mesaSelecionada && (
              <>
                <View
                  style={[
                    styles.statusBanner,
                    { backgroundColor: STATUS_CONFIG[mesaSelecionada.status].color },
                  ]}
                >
                  <Text style={styles.statusBannerText}>
                    {STATUS_CONFIG[mesaSelecionada.status].label}
                  </Text>
                </View>

                <View style={styles.detailGrid}>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>Pessoas</Text>
                    <View style={styles.peopleEditor}>
                      <TouchableOpacity
                        style={styles.peopleStep}
                        onPress={() =>
                          setPessoasDraft((current) => {
                            const value = Number.parseInt(current || '1', 10);
                            return String(Math.max(1, value - 1));
                          })
                        }
                      >
                        <Text style={styles.peopleStepText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.peopleInput}
                        value={pessoasDraft}
                        onChangeText={setPessoasDraft}
                        keyboardType="number-pad"
                        placeholder="1"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        style={styles.peopleStep}
                        onPress={() =>
                          setPessoasDraft((current) => {
                            const value = Number.parseInt(current || '1', 10);
                            return String(value + 1);
                          })
                        }
                      >
                        <Text style={styles.peopleStepText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={styles.statusPicker}>
                      {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                        const isSelected = statusDraft === status;
                        return (
                          <TouchableOpacity
                            key={status}
                            style={[
                              styles.statusPickerItem,
                              {
                                backgroundColor: isSelected ? config.color : '#fff',
                                borderColor: config.color,
                              },
                            ]}
                            onPress={() => setStatusDraft(status as MesaStatus)}
                          >
                            <Text
                              style={[
                                styles.statusPickerText,
                                { color: isSelected ? '#fff' : config.color },
                              ]}
                            >
                              {config.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={styles.pedidoBox}>
                  <Text style={styles.sectionTitle}>Pedido</Text>
                  <Text style={styles.pedidoText}>
                    {renderPedidoTexto(
                      mesaSelecionada,
                      getPedidoDaMesa(mesaSelecionada, orders)
                    )}
                  </Text>

                  {getPedidoDaMesa(mesaSelecionada, orders) && (
                    <View style={styles.itemsList}>
                      {getPedidoDaMesa(mesaSelecionada, orders)?.items.map((item) => (
                        <View key={`${item.menuItem.id}-${item.quantity}`} style={styles.itemRow}>
                          <Text style={styles.itemName}>
                            {item.quantity}x {item.menuItem.name}
                          </Text>
                          <Text style={styles.itemPrice}>
                            R$ {(item.menuItem.price * item.quantity).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.quickActions}>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const isActive = statusDraft === status;
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusAction,
                          {
                            borderColor: config.color,
                            backgroundColor: isActive ? config.color : '#fff',
                          },
                        ]}
                        onPress={() => setStatusDraft(status as MesaStatus)}
                      >
                        <Text
                          style={[
                            styles.statusActionText,
                            { color: isActive ? '#fff' : config.color },
                          ]}
                        >
                          {config.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSalvarDetalhes}
                  >
                    <CheckCircle2 size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Salvar alterações</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.releaseButton]}
                    onPress={handleLiberarMesa}
                  >
                    <CircleDashed size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Liberar mesa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        'Excluir mesa',
                        'Deseja apagar permanentemente esta mesa do layout?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Excluir',
                            style: 'destructive',
                            onPress: () => {
                              if (!mesaSelecionada) {
                                return;
                              }

                              removerMesa(mesaSelecionada.id);
                              setMesaSelecionada(null);
                              setModalDetalheVisible(false);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Trash2 size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Excluir mesa</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  kicker: {
    color: '#FFE7DB',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: 340,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: -18,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 120,
  },
  columnWrapper: {
    gap: 8,
  },
  mesaCircle: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 4,
    marginBottom: 8,
    maxWidth: 300,
    maxHeight: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  mesaCircleInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  mesaTopRow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  mesaStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  mesaStatusChipText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '700',
  },
  mesaNumero: {
    marginTop: 8,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  mesaInfo: {
    marginTop: 6,
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  mesaCliente: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 8,
    maxWidth: '90%',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 260,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  modalText: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },
  input: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statusBanner: {
    marginTop: 18,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusBannerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  detailBlock: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  peopleEditor: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  peopleStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  peopleStepText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
  },
  peopleInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusPicker: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPickerItem: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPickerText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pedidoBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#9A3412',
  },
  pedidoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#7C2D12',
    lineHeight: 20,
  },
  itemsList: {
    marginTop: 12,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#431407',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C2410C',
  },
  quickActions: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusAction: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailActions: {
    marginTop: 18,
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  releaseButton: {
    backgroundColor: '#3B82F6',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
