import { calcularTotalPedido, criarPedido } from '@/contexts/MenuContext';

describe('Menu helpers', () => {
  it('calcula o total do pedido', () => {
    const total = calcularTotalPedido([
      {
        menuItem: {
          id: '1',
          name: 'Pizza',
          description: 'Pizza teste',
          price: 35,
          category: 'Salgados',
        },
        quantity: 2,
      },
      {
        menuItem: {
          id: '2',
          name: 'Refrigerante',
          description: 'Bebida teste',
          price: 8,
          category: 'Bebidas',
        },
        quantity: 3,
      },
    ]);

    expect(total).toBe(94);
  });

  it('cria um pedido com status pending', () => {
    const pedido = criarPedido(
      [
        {
          menuItem: {
            id: '1',
            name: 'Hamburguer',
            description: 'Teste',
            price: 25,
            category: 'Salgados',
          },
          quantity: 1,
        },
      ],
      'Carlos',
      'order-test-id'
    );

    expect(pedido).toMatchObject({
      id: 'order-test-id',
      status: 'pending',
      customerName: 'Carlos',
      total: 25,
    });
    expect(pedido.createdAt).toBeInstanceOf(Date);
  });
});
