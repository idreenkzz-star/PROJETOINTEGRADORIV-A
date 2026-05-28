import React, { createContext, useContext, useState, ReactNode } from 'react';

//  Definição do Tipo de Dados de uma Mesa
export type MesaStatus = 'vaga' | 'aguardando' | 'preparando' | 'pronto' | 'atendido';

export interface Mesa {
  id: string;
  numero: string;
  status: MesaStatus;
  cliente?: string;
  pedidoAtual?: string;
  pedidoId?: string;
  pessoas?: number;
}

export interface MesaUpdate {
  status: MesaStatus;
  cliente?: string;
  pedidoAtual?: string;
  pedidoId?: string;
  pessoas?: number;
}

function criarMesasPadrao() {
  return Array.from({ length: 12 }, (_, index) => {
    const numero = String(index + 1).padStart(2, '0');

    return {
      id: numero,
      numero: `Mesa ${numero}`,
      status: 'vaga' as MesaStatus,
    };
  });
}

// Definição de tudo que o contexto vai exportar para as telas usarem
interface MesaContextType {
  mesas: Mesa[];
  adicionarMesa: (numero: string) => void;
  removerMesa: (id: string) => void;
  atualizarMesaStatus: (id: string, updates: MesaUpdate) => void;
}

const MesaContext = createContext<MesaContextType | undefined>(undefined);

export function MesaProvider({ children }: { children: ReactNode }) {
  // Lista inicial simulada para vermos o layout funcionando imediatamente
  const [mesas, setMesas] = useState<Mesa[]>(() => criarMesasPadrao());

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
  const atualizarMesaStatus = (id: string, updates: MesaUpdate) => {
    setMesas((prev) =>
      prev.map((mesa) => {
        if (mesa.id !== id) {
          return mesa;
        }

        if (updates.status === 'vaga') {
          return {
            ...mesa,
            status: 'vaga',
            cliente: undefined,
            pedidoAtual: undefined,
            pedidoId: undefined,
            pessoas: undefined,
          };
        }

        return {
          ...mesa,
          status: updates.status,
          cliente: updates.cliente ?? mesa.cliente,
          pedidoAtual: updates.pedidoAtual ?? mesa.pedidoAtual,
          pedidoId: updates.pedidoId ?? mesa.pedidoId,
          pessoas: updates.pessoas ?? mesa.pessoas,
        };
      })
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
