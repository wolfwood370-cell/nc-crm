import { createContext } from 'react';
import { Client, Financials, PipelineStage } from '@/types/crm';

export interface CrmContextValue {
  clients: Client[];
  financials: Financials;
  addClient: (c: Omit<Client, 'id' | 'created_at' | 'stage_updated_at'>) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  moveClient: (id: string, stage: PipelineStage) => void;
  setMonthlyTarget: (n: number) => void;
}

export const CrmContext = createContext<CrmContextValue | null>(null);
