import { useMemo, useState } from 'react';
import { useCrm } from '@/store/useCrm';
import {
  LEAD_SOURCES, LeadSource, Transaction,
  formatEuro, leadSourceLabel,
} from '@/types/crm';
import { PrivacyMask } from './PrivacyMask';
import { TransactionsSheet } from './TransactionsSheet';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePrivacyMode } from '@/store/usePrivacyMode';

const SLICE_COLORS = ['#4edea3', '#adc6ff', '#10b981', '#6ffbbe', '#0566d9'];

interface SourceRow {
  source: LeadSource;
  label: string;
  value: number;
  color: string;
  txs: Transaction[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
}

export const RevenueBySource = () => {
  const { clients, transactions } = useCrm();
  const { privacyMode } = usePrivacyMode();
  const [drill, setDrill] = useState<LeadSource | null>(null);

  const rows = useMemo<SourceRow[]>(() => {
    const clientSource = new Map<string, LeadSource>();
    clients.forEach(c => clientSource.set(c.id, c.lead_source));

    const acc: Record<LeadSource, { value: number; txs: Transaction[] }> = {
      'Gym-provided': { value: 0, txs: [] },
      'Gym Floor': { value: 0, txs: [] },
      'Referral': { value: 0, txs: [] },
      'Social Media': { value: 0, txs: [] },
      'Other': { value: 0, txs: [] },
    };

    for (const t of transactions) {
      if (t.status !== 'Saldato') continue;
      const src = clientSource.get(t.client_id);
      if (!src) continue;
      acc[src].value += t.amount;
      acc[src].txs.push(t);
    }

    return LEAD_SOURCES.map((src, i) => ({
      source: src,
      label: leadSourceLabel[src],
      value: acc[src].value,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      txs: acc[src].txs,
    }));
  }, [clients, transactions]);

  const grandTotal = rows.reduce((s, r) => s + r.value, 0);
  const visibleRows = rows.filter(r => r.value > 0);
  const drillRow = drill ? rows.find(r => r.source === drill) : null;

  const totalLabel = grandTotal >= 1000
    ? `${(grandTotal / 1000).toFixed(grandTotal >= 10000 ? 0 : 1)}k`
    : `${Math.round(grandTotal)}`;

  const PieTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload?.length) return null;
    const { value, name } = payload[0];
    return (
      <div className="bg-[#242c27]/80 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-body-sm text-[#bbcabf] mb-1">{name}</p>
        <p className="text-sm font-semibold text-[#4edea3] tabular-nums">
          {privacyMode ? '••••' : formatEuro(value)}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-[#1a211d]/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden h-full">
      <h3 className="font-semibold text-lg text-[#dde4dd] w-full text-left mb-6">Valore per Fonte</h3>

      {grandTotal === 0 ? (
        <div className="w-full flex-1 flex items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center">
          <p className="text-sm text-[#bbcabf]">Nessun incasso registrato.</p>
        </div>
      ) : (
        <>
          <div className="relative w-48 h-48 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleRows}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="none"
                  onClick={(d) => {
                    const r = d as unknown as SourceRow;
                    if (r?.source) setDrill(r.source);
                  }}
                  cursor="pointer"
                >
                  {visibleRows.map(r => (
                    <Cell key={r.source} fill={r.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs uppercase tracking-wider text-[#bbcabf]">Totale</span>
              <span className="text-2xl font-semibold text-[#dde4dd] tabular-nums">
                <PrivacyMask>{totalLabel}</PrivacyMask>
              </span>
            </div>
          </div>

          <div className="w-full space-y-3 mt-6">
            {visibleRows.map(r => {
              const pct = grandTotal > 0 ? (r.value / grandTotal) * 100 : 0;
              return (
                <button
                  key={r.source}
                  type="button"
                  onClick={() => setDrill(r.source)}
                  className="w-full flex items-center justify-between text-sm rounded-md px-1 py-0.5 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-[#bbcabf] truncate">{r.label}</span>
                  </div>
                  <span className="text-[#dde4dd] tabular-nums font-medium">{pct.toFixed(0)}%</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <TransactionsSheet
        open={drill !== null}
        onOpenChange={(v) => { if (!v) setDrill(null); }}
        title={drillRow ? `Incassi · ${drillRow.label}` : 'Incassi'}
        description={drillRow ? `${drillRow.txs.length} transazion${drillRow.txs.length === 1 ? 'e' : 'i'} da questa fonte` : ''}
        transactions={drillRow?.txs ?? []}
      />
    </div>
  );
};
