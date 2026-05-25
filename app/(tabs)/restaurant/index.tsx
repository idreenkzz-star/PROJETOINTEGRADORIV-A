import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useMenu } from '@/contexts/MenuContext';
import { useMesas } from '@/contexts/MesaContext';
import { MenuItem } from '@/types/menu';

export default function RestaurantScreen() {
  const router = useRouter();
  const { menuItems, removeMenuItem, orders } = useMenu();
  const { mesas, atualizarMesaStatus } = useMesas();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    orders.forEach((order: any) => {
      // Busca a mesa associada a este cliente
      const mesaDoCliente = mesas.find((m: any) => m.cliente === order.customerName);

      if (mesaDoCliente) {
        // Criamos uma referência temporária tipada como 'any' para ignorar restrições rígidas de propriedades
        const mesaDados = mesaDoCliente as any;

        // Se o chef aceitou o pedido e está a cozinhar -> Muda para Laranja
        if (order.status === 'preparing' && (mesaDoCliente.status as any) !== 'preparando') {
          atualizarMesaStatus(
            mesaDoCliente.id,
            'preparando' as any,
            mesaDoCliente.cliente || '',
            mesaDados.pedido || mesaDados.pedidoAtual || []
          );
        }
        // Se o chef finalizou o preparo -> Muda para Verde (Pronto / Consumindo)
        else if (order.status === 'completed' && mesaDoCliente.status !== 'atendido') {
          atualizarMesaStatus(
            mesaDoCliente.id,
            'atendido',
            mesaDoCliente.cliente || '',
            mesaDados.pedido || mesaDados.pedidoAtual || []
          );
        }
      }
    });
  }, [orders, mesas]);

  const handleRemoveItem = (id: string) => {
    console.log('🟢 handleRemoveItem chamado com ID:', id);
    console.log('🟢 Tipo do ID:', typeof id);
    
    // Abre o modal de confirmação
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!selectedItem) return;
    
    console.log('🟡 CONFIRMANDO DELETE do item:', selectedItem.id);
    
    // Chama a remoção
    removeMenuItem(selectedItem.id);
    
    // Fecha os modais
    setShowDeleteConfirm(false);
    
    setTimeout(() => {
      console.log('🟡 Fechando modal principal...');
      setSelectedItem(null);
    }, 100);
  };

  const cancelDelete = () => {
    console.log('🟡 DELETE CANCELADO');
    setShowDeleteConfirm(false);
  };

  const pendingOrders = orders.filter((order) => order.status === 'pending');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Cardápio</Text>
      </View>
    
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => setSelectedItem(item)}>
            <Image
              source={{ uri: item.image }}
              style={styles.menuImage}
              resizeMode="cover"
            />
            <View style={styles.menuInfo}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.menuFooter}>
                <Text style={styles.menuPrice}>
                  R$ {item.price.toFixed(2)}
                </Text>
                <Text style={styles.menuCategory}>{item.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/restaurant/add-item')}>
        <Plus size={28} color="#FFF" />
      </TouchableOpacity>

      {/* ⭐ MODAL DE DETALHES DO ITEM - ATENÇÃO NA LINHA VISIBLE ⭐ */}
      <Modal
        visible={selectedItem !== null && !showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}>
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}>
            {selectedItem && (
              <>
                <Image
                  source={{ uri: selectedItem.image }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <Text style={styles.modalName}>{selectedItem.name}</Text>
                <Text style={styles.modalDescription}>
                  {selectedItem.description}
                </Text>
                <Text style={styles.modalPrice}>
                  R$ {selectedItem.price.toFixed(2)}
                </Text>
                <Text style={styles.modalCategory}>
                  {selectedItem.category}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setSelectedItem(null);
                    router.push(`/restaurant/editar-item?id=${selectedItem.id}`);
                  }}
                >
                  <Text style={styles.editButtonText}>Editar Prato</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveItem(selectedItem.id)}>
                  <Trash2 size={20} color="#FFF" />
                  <Text style={styles.deleteButtonText}>
                    Remover do Cardápio
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ⭐ NOVO MODAL DE CONFIRMAÇÃO DE DELETE ⭐ */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Remover Item</Text>
            <Text style={styles.confirmMessage}>
              Tem certeza que deseja remover este item do cardápio?
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmDelete}>
                <Text style={styles.confirmButtonText}>Remover</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  ordersButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  menuInfo: {
    padding: 16,
  },
  menuName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  menuFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
  },
  menuCategory: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#FF6B35',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  modalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginHorizontal: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginHorizontal: 20,
    lineHeight: 22,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
    marginTop: 16,
    marginHorizontal: 20,
  },
  modalCategory: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  editButtonText:{
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // ⭐ ESTILOS DO MODAL DE CONFIRMAÇÃO ⭐
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});