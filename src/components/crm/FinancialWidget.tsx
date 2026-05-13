import { useMemo, useState } from 'react';
import { useCrm } from '@/store/useCrm';
import { Transaction, formatEuro, HISTORY_START_YEAR, HISTORY_START_MONTH } from '@/types/crm';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { PrivacyMask } from './PrivacyMask';
import { TransactionsSheet } from './TransactionsSheet';

type DrillKey = 'monthly' | 'ytd' | null;

export const FinancialWidget = () => {
  const { financialSummary, monthlyBreakdown, transactions } = useCrm();
  const { gross_monthly, net_monthly, gross_ytd, net_ytd } = financialSummary;
  const uscite_monthly = Math.max(0, gross_monthly - net_monthly);

  // Trend: net_monthly vs previous month net
  const trend = useMemo(() => {
    if (!monthlyBreakdown?.length) return null;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const prev = monthlyBreakdown.find(b => {
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      return b.year === py && b.month === pm;
    });
    if (!prev || !prev.net_business) return null;
    const pct = ((net_monthly - prev.net_business) / Math.abs(prev.net_business)) * 100;
    if (!isFinite(pct)) return null;
    return pct;
  }, [monthlyBreakdown, net_monthly]);

  const [drill, setDrill] = useState<DrillKey>(null);

  const monthlyTx = useMemo<Transaction[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return transactions.filter(t => {
      if (t.status !== 'Saldato') return false;
      const d = new Date(t.payment_date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [transactions]);

  const ytdTx = useMemo<Transaction[]>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const ytdStart = new Date(
      Math.max(y, HISTORY_START_YEAR),
      y > HISTORY_START_YEAR ? 0 : HISTORY_START_MONTH,
      1,
    );
    return transactions.filter(t => {
      if (t.status !== 'Saldato') return false;
      const d = new Date(t.payment_date);
      return d.getFullYear() === y && d >= ytdStart;
    });
  }, [transactions]);

  const drillTx = drill === 'monthly' ? monthlyTx : drill === 'ytd' ? ytdTx : [];
  const drillGross = drill === 'monthly' ? gross_monthly : gross_ytd;
  const drillNet = drill === 'monthly' ? net_monthly : net_ytd;
  const drillTitle = drill === 'monthly' ? 'Incassi del Mese Corrente' : 'Incassi dal 1° Gennaio (YTD)';
  const drillDesc = drill
    ? `Lordo ${formatEuro(drillGross)} · Netto ${formatEuro(drillNet)} (dopo 24,9% di tasse)`
    : '';

  const trendPositive = (trend ?? 0) >= 0;

  return (
    <>
      <div className="relative overflow-hidden rounded-[2.5rem] glass-panel bg-surface-container/30 p-8 flex flex-col justify-between min-h-[260px]">
        {/* glowing orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-semibold text-on-surface mb-1">Panoramica Finanziaria</h3>
            <p className="text-sm text-on-surface-variant">Cashflow mensile e saldo netto</p>
          </div>
          <button
            type="button"
            onClick={() => setDrill('monthly')}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/5 transition-colors"
            aria-label="Dettagli"
          >
            <MoreHorizontal className="h-4 w-4 text-on-surface" />
          </button>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 md:gap-8 mt-auto">
          <button
            type="button"
            onClick={() => setDrill('monthly')}
            className="text-left"
          >
            <p className="text-sm text-on-surface-variant mb-2">Saldo Netto</p>
            <p className="text-5xl font-bold tracking-tight text-on-surface tabular-nums">
              <PrivacyMask>{formatEuro(net_monthly)}</PrivacyMask>
            </p>
            {trend !== null && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                    trendPositive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                  }`}
                >
                  {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {trendPositive ? '+' : ''}{trend.toFixed(1)}%
                </span>
                <span className="text-sm text-on-surface-variant">vs mese scorso</span>
              </div>
            )}
          </button>

          <div className="flex-1 flex justify-end gap-6 pb-2">
            <button
              type="button"
              onClick={() => setDrill('monthly')}
              className="text-right group"
            >
              <p className="text-sm text-on-surface-variant mb-1">Entrate</p>
              <p className="text-lg font-semibold text-primary tabular-nums group-hover:opacity-80 transition-opacity">
                <PrivacyMask>+ {formatEuro(gross_monthly)}</PrivacyMask>
              </p>
            </button>
            <button
              type="button"
              onClick={() => setDrill('ytd')}
              className="text-right group"
            >
              <p className="text-sm text-on-surface-variant mb-1">Uscite (Tasse)</p>
              <p className="text-lg font-semibold text-error tabular-nums group-hover:opacity-80 transition-opacity">
                <PrivacyMask>- {formatEuro(uscite_monthly)}</PrivacyMask>
              </p>
            </button>
          </div>
        </div>
      </div>

      <TransactionsSheet
        open={drill !== null}
        onOpenChange={(v) => { if (!v) setDrill(null); }}
        title={drillTitle}
        description={drillDesc}
        transactions={drillTx}
      />
    </>
  );
};
