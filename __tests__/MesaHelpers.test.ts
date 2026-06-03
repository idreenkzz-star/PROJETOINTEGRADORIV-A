import { aplicarAtualizacaoMesa, criarMesasPadrao } from '@/contexts/MesaContext';

describe('Mesa helpers', () => {
  it('cria 12 mesas padrão', () => {
    const mesas = criarMesasPadrao();

    expect(mesas).toHaveLength(12);
    expect(mesas[0]).toMatchObject({
      id: '01',
      numero: 'Mesa 01',
      status: 'vaga',
    });
    expect(mesas[11]).toMatchObject({
      id: '12',
      numero: 'Mesa 12',
      status: 'vaga',
    });
  });

  it('aplica status e limpa dados quando libera a mesa', () => {
    const mesa = {
      id: '01',
      numero: 'Mesa 01',
      status: 'aguardando' as const,
      cliente: 'Ana',
      pedidoAtual: '2x Pizza',
      pedidoId: 'order-1',
      pessoas: 4,
    };

    const atualizada = aplicarAtualizacaoMesa(mesa, { status: 'vaga' });

    expect(atualizada).toMatchObject({
      id: '01',
      numero: 'Mesa 01',
      status: 'vaga',
    });
    expect(atualizada.cliente).toBeUndefined();
    expect(atualizada.pedidoAtual).toBeUndefined();
    expect(atualizada.pedidoId).toBeUndefined();
    expect(atualizada.pessoas).toBeUndefined();
  });
});
