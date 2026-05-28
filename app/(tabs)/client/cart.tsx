import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Minus, Trash2, CheckCircle } from 'lucide-react-native';
import { useMenu } from '@/contexts/MenuContext';
import { useMesas } from '@/contexts/MesaContext'; // 1. Importa o contexto das mesas
import { OrderItem } from '@/types/menu';

export default function CartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addOrder } = useMenu();
  const { mesas, atualizarMesaStatus } = useMesas(); // 2. Puxa as ferramentas das mesas

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [peopleCount, setPeopleCount] = useState('1');
  const [idMesaSelecionada, setIdMesaSelecionada] = useState<string>(''); // Controla qual mesa foi clicada
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (params.cart && typeof params.cart === 'string') {
      try {
        setCart(JSON.parse(params.cart));
      } catch (error) {
        console.error('Error parsing cart:', error);
      }
    }
  }, [params.cart]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.menuItem.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.menuItem.id !== itemId)
    );
  };

  const handlePlaceOrder = () => {
    if (!customerName.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu nome');
      return;
    }

    if (!idMesaSelecionada) {
      Alert.alert('Atenção', 'Por favor, selecione uma mesa para este pedido');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Atenção', 'Seu carrinho está vazio');
      return;
    }

    const quantidadePessoas = Number.parseInt(peopleCount, 10);

    if (!Number.isFinite(quantidadePessoas) || quantidadePessoas <= 0) {
      Alert.alert('Atenção', 'Informe a quantidade de pessoas para esta mesa');
      return;
    }

    // Cria o resumo dos itens para jogar dentro do modal de status da mesa
    const resumoItens = cart.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ');

    // 3. Modifica o status da mesa para 'aguardando' (AMARELO) no clique
    const orderId = addOrder(cart, customerName.trim());
    atualizarMesaStatus(idMesaSelecionada, {
      status: 'aguardando',
      cliente: customerName.trim(),
      pedidoAtual: resumoItens,
      pedidoId: orderId,
      pessoas: quantidadePessoas,
    });

    // Mantém a sua lógica padrão de persistência de pedidos
    setOrderPlaced(true);

    setTimeout(() => {
      router.replace('/client');
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <CheckCircle size={80} color="#27AE60" />
          <Text style={styles.successTitle}>Pedido Realizado!</Text>
          <Text style={styles.successMessage}>
            Seu pedido foi enviado para o restaurante
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Carrinho</Text>
        <View style={styles.placeholder} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Ver Cardápio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.menuItem.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <Image
                  source={{ uri: item.menuItem.image }}
                  style={styles.cartImage}
                  resizeMode="cover"
                />
                <View style={styles.cartInfo}>
                  <Text style={styles.cartName}>{item.menuItem.name}</Text>
                  <Text style={styles.cartPrice}>
                    R$ {item.menuItem.price.toFixed(2)}
                  </Text>
                  <View style={styles.cartControls}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.menuItem.id, -1)}>
                        <Minus size={16} color="#FF6B35" />
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.menuItem.id, 1)}>
                        <Plus size={16} color="#FF6B35" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeItem(item.menuItem.id)}>
                      <Trash2 size={18} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            {/* NOVO SELETOR GRÁFICO DE MESAS DISPONÍVEIS */}
            <View style={styles.nameInputContainer}>
              <Text style={styles.nameLabel}>Selecione a Mesa:</Text>
              <View style={styles.mesasSelectorRow}>
                {mesas.map((m) => {
                  const isSelected = idMesaSelecionada === m.id;
                  const isOcupada = m.status !== 'vaga';
                  return (
                    <TouchableOpacity
                      key={m.id}
                      disabled={isOcupada}
                      style={[
                        styles.mesaBadge,
                        isSelected && styles.mesaBadgeSelected,
                        isOcupada && styles.mesaBadgeDisabled
                      ]}
                      onPress={() => setIdMesaSelecionada(m.id)}
                    >
                      <Text style={[
                        styles.mesaBadgeText,
                        isSelected && styles.mesaBadgeTextSelected,
                        isOcupada && styles.mesaBadgeTextDisabled
                      ]}>
                        {m.numero.replace('Mesa ', '')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.nameInputContainer}>
              <Text style={styles.nameLabel}>Nome do Cliente:</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Nome de identificação do cliente"
                value={customerName}
                onChangeText={setCustomerName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.nameInputContainer}>
              <Text style={styles.nameLabel}>Quantidade de Pessoas:</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="Ex: 2"
                value={peopleCount}
                onChangeText={setPeopleCount}
                keyboardType="number-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>R$ {cartTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.orderButton}
              onPress={handlePlaceOrder}>
              <Text style={styles.orderButtonText}>Fazer Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  backButton: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 280, // Aumentado um pouco para acomodar o seletor de mesas
  },
  cartCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartImage: {
    width: 90,
    height: 90,
    backgroundColor: '#E0E0E0',
  },
  cartInfo: {
    flex: 1,
    padding: 12,
  },
  cartName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  cartPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  cartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  nameInputContainer: {
    marginBottom: 12,
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mesasSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mesaBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  mesaBadgeSelected: {
    backgroundColor: '#2196F3',
  },
  mesaBadgeDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  mesaBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  mesaBadgeTextSelected: {
    color: '#FFF',
  },
  mesaBadgeTextDisabled: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B35',
  },
  orderButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successContent: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#27AE60',
    marginTop: 24,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
