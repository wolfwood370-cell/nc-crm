import { useMemo, useState } from 'react';
import { useCrm } from '@/store/useCrm';
import {
  LEAD_SOURCES, LeadSource, Transaction,
  formatEuro, leadSourceLabel,
} from '@/types/crm';
import { PrivacyMask } from './PrivacyMask';
import { TransactionsSheet } from './TransactionsSheet';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { usePrivacyMode } from '@/store/usePrivacyMode';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Timeframe = 'year' | 'all';

// Tech-premium palette: blue / cyan / indigo (extended for 5 sources, all in same family)
const sourcePalette: Record<LeadSource, string> = {
  'Gym-provided': 'hsl(217 91% 60%)',  // blue
  'Gym Floor':    'hsl(190 95% 55%)',  // cyan
  'Referral':     'hsl(243 82% 65%)',  // indigo
  'Social Media': 'hsl(199 89% 50%)',  // sky-blue
  'Other':        'hsl(226 71% 45%)',  // deep blue
};

const MONTH_LABELS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

// Compact EUR formatter — €1.2K, €34K, €1.2M
const compactEUR = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const formatCompact = (n: number) => compactEUR.format(n).replace(/\s/g, '');

interface SourceTotals {
  source: LeadSource;
  label: string;
  value: number;
  color: string;
  txs: Transaction[];
}

interface MonthRow {
  month: string;
  [key: string]: string | number; // dynamic source values
}

export const RevenueBySource = () => {
  const { clients, transactions } = useCrm();
  const { privacyMode } = usePrivacyMode();
  const [drill, setDrill] = useState<LeadSource | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('year');
  const [activeSource, setActiveSource] = useState<LeadSource | null>(null);

  const currentYear = new Date().getFullYear();

  const { totals, chartData } = useMemo(() => {
    const clientSource = new Map<string, LeadSource>();
    clients.forEach(c => clientSource.set(c.id, c.lead_source));

    const totalsAcc: Record<LeadSource, { value: number; txs: Transaction[] }> = {
      'Gym-provided': { value: 0, txs: [] },
      'Gym Floor': { value: 0, txs: [] },
      'Referral': { value: 0, txs: [] },
      'Social Media': { value: 0, txs: [] },
      'Other': { value: 0, txs: [] },
    };

    // Build monthly buckets
    const monthly = new Map<string, Record<LeadSource, number>>();
    const ensureBucket = (key: string) => {
      if (!monthly.has(key)) {
        monthly.set(key, { 'Gym-provided': 0, 'Gym Floor': 0, 'Referral': 0, 'Social Media': 0, 'Other': 0 });
      }
      return monthly.get(key)!;
    };

    for (const t of transactions) {
      if (t.status !== 'Saldato') continue;
      const d = new Date(t.payment_date);
      if (isNaN(d.getTime())) continue;
      if (timeframe === 'year' && d.getFullYear() !== currentYear) continue;
      const src = clientSource.get(t.client_id);
      if (!src) continue;

      totalsAcc[src].value += t.amount;
      totalsAcc[src].txs.push(t);

      const key = timeframe === 'year'
        ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
        : `${d.getFullYear()}`;
      ensureBucket(key)[src] += t.amount;
    }

    let chart: MonthRow[];
    if (timeframe === 'year') {
      chart = MONTH_LABELS.map((label, idx) => {
        const key = `${currentYear}-${String(idx).padStart(2, '0')}`;
        const bucket = monthly.get(key);
        const row: MonthRow = { month: label };
        LEAD_SOURCES.forEach(src => { row[src] = bucket?.[src] ?? 0; });
        return row;
      });
    } else {
      const sortedKeys = Array.from(monthly.keys()).sort();
      chart = sortedKeys.map(key => {
        const bucket = monthly.get(key)!;
        const row: MonthRow = { month: key };
        LEAD_SOURCES.forEach(src => { row[src] = bucket[src]; });
        return row;
      });
      if (chart.length === 0) chart = [{ month: '—', ...Object.fromEntries(LEAD_SOURCES.map(s => [s, 0])) }];
    }

    const totalsList: SourceTotals[] = LEAD_SOURCES.map(src => ({
      source: src,
      label: leadSourceLabel[src],
      value: totalsAcc[src].value,
      color: sourcePalette[src],
      txs: totalsAcc[src].txs,
    }));

    return { totals: totalsList, chartData: chart };
  }, [clients, transactions, timeframe, currentYear]);

  const grandTotal = totals.reduce((s, r) => s + r.value, 0);
  const drillRow = drill ? totals.find(r => r.source === drill) : null;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valore per Fonte</p>
          <p className="text-[11px] text-muted-foreground">
            {timeframe === 'year'
              ? `Incassi mensili ${currentYear} per canale`
              : 'Incassi annui per canale di acquisizione'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Quest'anno</SelectItem>
              <SelectItem value="all">Tutto il tempo</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm font-bold text-foreground tabular-nums">
            <PrivacyMask>{formatEuro(grandTotal)}</PrivacyMask>
          </p>
        </div>
      </div>

      {grandTotal === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            {timeframe === 'year'
              ? `Nessun incasso registrato per il ${currentYear}.`
              : 'Nessun incasso registrato. Registra il primo pagamento per popolare il grafico.'}
          </p>
        </div>
      ) : (
        <>
          {/* Interactive source tabs */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {totals.map(t => {
              const isActive = activeSource === t.source;
              const isDimmed = activeSource !== null && !isActive;
              return (
                <button
                  key={t.source}
                  type="button"
                  disabled={t.value === 0}
                  onClick={() => setActiveSource(isActive ? null : t.source)}
                  onDoubleClick={() => t.value > 0 && setDrill(t.source)}
                  className={cn(
                    'group relative rounded-xl border p-2.5 text-left transition-smooth',
                    'enabled:hover:border-primary/40 enabled:hover:shadow-card',
                    'disabled:opacity-50 disabled:cursor-default',
                    isActive ? 'border-foreground/30 shadow-card bg-secondary/50' : 'border-border bg-card',
                    isDimmed && 'opacity-50',
                  )}
                  style={isActive ? { borderColor: t.color, boxShadow: `0 0 0 1px ${t.color}40, 0 4px 12px -4px ${t.color}40` } : undefined}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                    <span className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wide">{t.label}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    <PrivacyMask>{formatCompact(t.value)}</PrivacyMask>
                  </p>
                </button>
              );
            })}
          </div>

          {/* Stacked Bar Chart — tech-premium */}
          <div className="mt-4 h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(v: number) => v === 0 ? '' : formatCompact(v)}
                  width={48}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    fontSize: 12,
                    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)',
                  }}
                  formatter={(value: number, name: string) => [
                    privacyMode ? '••••' : formatCompact(value),
                    leadSourceLabel[name as LeadSource] ?? name,
                  ]}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                />
                {LEAD_SOURCES.map((src, idx) => (
                  <Bar
                    key={src}
                    dataKey={src}
                    stackId="revenue"
                    fill={sourcePalette[src]}
                    fillOpacity={activeSource === null || activeSource === src ? 1 : 0.2}
                    radius={idx === LEAD_SOURCES.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    cursor="pointer"
                    onClick={() => setDrill(src)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-[10px] text-center text-muted-foreground">
            Clicca una fonte per evidenziarla · doppio click o clicca una barra per il dettaglio transazioni
          </p>
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
