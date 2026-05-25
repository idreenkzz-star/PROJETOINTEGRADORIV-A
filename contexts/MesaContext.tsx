import React, { createContext, useState, useContext, ReactNode } from 'react';

//  Definição do Tipo de Dados de uma Mesa
export interface Mesa {
  id: string;
  numero: string;
  status: 'vaga' | 'aguardando' | 'preparando' | 'atendido'; // azul, amarelo, laranja e verde.
  cliente?: string;
  pedidoAtual?: string;
}

// Definição de tudo que o contexto vai exportar para as telas usarem
interface MesaContextType {
  mesas: Mesa[];
  adicionarMesa: (numero: string) => void;
  removerMesa: (id: string) => void;
  atualizarMesaStatus: (id: string, status: 'vaga' | 'aguardando' | 'atendido', cliente?: string, pedidoAtual?: string) => void;
}

const MesaContext = createContext<MesaContextType | undefined>(undefined);

export function MesaProvider({ children }: { children: ReactNode }) {
  // Lista inicial simulada para vermos o layout funcionando imediatamente
  const [mesas, setMesas] = useState<Mesa[]>([
    { id: '1', numero: 'Mesa 01', status: 'vaga' },
    { id: '2', numero: 'Mesa 02', status: 'aguardando', cliente: 'Lucas', pedidoAtual: 'Pizza e Refri' },
    { id: '3', numero: 'Mesa 03', status: 'atendido', cliente: 'Douglas', pedidoAtual: 'Hambúrguer' },
  ]);

  // Função para criar uma nova mesa usando o botão "+"
  const adicionarMesa = (numero: string) => {
    const novaMesa: Mesa = {
      id: Date.now().toString(),
      numero: numero.startsWith('Mesa') ? numero : `Mesa ${numero}`,
      status: 'vaga',
    };
    setMesas((prev) => [...prev, novaMesa]);
  };

  // Função para deletar uma mesa do sistema
  const removerMesa = (id: string) => {
    setMesas((prev) => prev.filter((m) => m.id !== id));
  };

  // Função que a aba Order vai disparar para mudar a cor da mesa
  const atualizarMesaStatus = (id: string, status: 'vaga' | 'aguardando' | 'atendido', cliente?: string, pedido?: string) => {
    setMesas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status, cliente, pedidoAtual: pedido } : m))
    );
  };

  return (
    <MesaContext.Provider value={{ mesas, adicionarMesa, removerMesa, atualizarMesaStatus }}>
      {children}
    </MesaContext.Provider>
  );
}

// Hook personalizado para facilitar o uso nas telas
export function useMesas() {
  const context = useContext(MesaContext);
  if (!context) {
    throw new Error('useMesas deve ser usado dentro de um MesaProvider');
  }
  return context;
}