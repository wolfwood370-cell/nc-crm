import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Client, Financials, FIXED_MONTHLY_COST, PipelineStage } from '@/types/crm';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const initialClients: Client[] = [
  {
    id: '1', name: 'Marco Rossi', lead_source: 'Gym Floor', pipeline_stage: 'Trial Active',
    root_motivator: 'Wants to feel confident before his wedding in June',
    objection_stated: 'Too expensive', objection_real: 'Fears he will not stay consistent',
    created_at: daysAgo(12), stage_updated_at: daysAgo(4), monthly_value: 180, phone: '+39 333 123 4567',
  },
  {
    id: '2', name: 'Giulia Bianchi', lead_source: 'PT Pack 99€', pipeline_stage: 'Pitch Presented',
    root_motivator: 'Recover energy after second pregnancy',
    objection_stated: 'Need to talk to husband', objection_real: 'Guilt about spending on herself',
    created_at: daysAgo(20), stage_updated_at: daysAgo(2), monthly_value: 220,
  },
  {
    id: '3', name: 'Luca Ferrari', lead_source: 'Referral', pipeline_stage: 'Closed Won',
    root_motivator: 'Lower back pain ruining his work as a developer',
    objection_stated: '', objection_real: '',
    created_at: daysAgo(45), stage_updated_at: daysAgo(15), monthly_value: 240,
  },
  {
    id: '4', name: 'Sofia Russo', lead_source: 'Social Media', pipeline_stage: 'Nurturing',
    root_motivator: 'Wants to compete in her first bikini fitness show',
    objection_stated: 'No time', objection_real: 'Intimidated by the level required',
    created_at: daysAgo(8), stage_updated_at: daysAgo(3),
  },
  {
    id: '5', name: 'Alessandro Conti', lead_source: 'Gym-provided', pipeline_stage: 'Lead Acquired',
    root_motivator: 'Doctor told him to lose 15kg',
    objection_stated: '', objection_real: '',
    created_at: daysAgo(1), stage_updated_at: daysAgo(1),
  },
  {
    id: '6', name: 'Francesca Greco', lead_source: 'PT Pack 99€', pipeline_stage: 'Closed Won',
    root_motivator: 'Build strength after divorce, reclaim her body',
    objection_stated: '', objection_real: '',
    created_at: daysAgo(60), stage_updated_at: daysAgo(30), monthly_value: 200,
  },
  {
    id: '7', name: 'Davide Marino', lead_source: 'Gym Floor', pipeline_stage: 'Closed Lost',
    root_motivator: 'Bulk up for summer',
    objection_stated: 'Too expensive', objection_real: 'Did not trust the value — wanted free advice',
    created_at: daysAgo(25), stage_updated_at: daysAgo(10),
  },
  {
    id: '8', name: 'Elena Romano', lead_source: 'Referral', pipeline_stage: 'Trial Active',
    root_motivator: 'Manage stress from her startup, sleep better',
    objection_stated: 'Need to see results first', objection_real: 'Burned by previous trainer',
    created_at: daysAgo(6), stage_updated_at: daysAgo(2),
  },
];

interface CrmContextValue {
  clients: Client[];
  financials: Financials;
  addClient: (c: Omit<Client, 'id' | 'created_at' | 'stage_updated_at'>) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  moveClient: (id: string, stage: PipelineStage) => void;
  setMonthlyTarget: (n: number) => void;
}

const CrmContext = createContext<CrmContextValue | null>(null);

export const CrmProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [monthlyTarget, setMonthlyTarget] = useState(1500);

  const current_monthly_revenue = useMemo(
    () => clients.filter(c => c.pipeline_stage === 'Closed Won').reduce((s, c) => s + (c.monthly_value || 0), 0),
    [clients]
  );

  const addClient: CrmContextValue['addClient'] = (c) => {
    const now = new Date().toISOString();
    setClients(prev => [
      { ...c, id: crypto.randomUUID(), created_at: now, stage_updated_at: now },
      ...prev,
    ]);
  };

  const updateClient: CrmContextValue['updateClient'] = (id, patch) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const moveClient: CrmContextValue['moveClient'] = (id, stage) => {
    setClients(prev => prev.map(c =>
      c.id === id ? { ...c, pipeline_stage: stage, stage_updated_at: new Date().toISOString() } : c
    ));
  };

  const value: CrmContextValue = {
    clients,
    financials: {
      fixed_monthly_cost: FIXED_MONTHLY_COST,
      current_monthly_revenue,
      monthly_target: monthlyTarget,
    },
    addClient, updateClient, moveClient, setMonthlyTarget,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
};

export const useCrm = () => {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used within CrmProvider');
  return ctx;
};

export const daysSince = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};
