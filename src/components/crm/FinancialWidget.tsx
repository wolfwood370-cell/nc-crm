import { useMemo, useState } from 'react';
import { useCrm } from '@/store/useCrm';
import { Transaction, formatEuro, HISTORY_START_YEAR, HISTORY_START_MONTH } from '@/types/crm';
import { ArrowDown, ArrowUp, CalendarRange, TrendingUp, Wallet, MoreHorizontal } from 'lucide-react';
import { PrivacyMask } from './PrivacyMask';
import { TransactionsSheet } from './TransactionsSheet';

interface MetricCardProps {
  label: string;
  sublabel: string;
  value: number;
  variant: 'gross' | 'net';
  icon: React.ReactNode;
  onClick?: () => void;
}

const MetricCard = ({ label, sublabel, value, variant, icon, onClick }: MetricCardProps) => {
  const isNet = variant === 'net';
  const isPositive = value >= 0;

  let valueColor = 'text-foreground';
  let badgeBg = 'bg-secondary';
  let badgeText = 'text-muted-foreground';
  if (isNet) {
    if (isPositive) {
      valueColor = 'text-primary';
      badgeBg = 'bg-primary/12';
      badgeText = 'text-primary';
    } else {
      valueColor = 'text-destructive';
      badgeBg = 'bg-destructive/12';
      badgeText = 'text-destructive';
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full rounded-2xl border p-4 shadow-card hover:border-primary/40 transition-smooth active:scale-[0.99] ${
        isNet
          ? isPositive
            ? 'border-primary/30 bg-primary/5'
            : 'border-destructive/30 bg-destructive/5'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${badgeBg} ${badgeText}`}>
          {icon}
        </div>
        {isNet && (
          <div className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeBg} ${badgeText}`}>
            {isPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {isPositive ? 'Profitto' : 'Sotto'}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold tracking-tight ${valueColor}`}>
          <PrivacyMask>{formatEuro(value)}</PrivacyMask>
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </button>
  );
};

type DrillKey = 'monthly' | 'ytd' | null;

export const FinancialWidget = () => {
  const { financialSummary, transactions } = useCrm();
  const {
    gross_monthly,
    net_monthly,
    gross_ytd,
    net_ytd,
  } = financialSummary;

  const aboveBreakEven = net_monthly >= 0;
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
      1
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

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container/30 rounded-[2.5rem] glass-panel p-[32px] flex flex-col justify-between relative overflow-hidden h-full min-h-[320px]">
      {/* Abstract glowing orb behind */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-8">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Panoramica Finanziaria</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Cashflow mensile e saldo netto</p>
        </div>
        <button 
          onClick={() => setDrill('monthly')}
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-on-surface" />
        </button>
      </div>

      <div className="relative z-10 flex items-end gap-8 mt-auto">
        <div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">Saldo Netto</p>
          <p className="font-display-lg text-display-lg text-on-surface font-data-tabular">
            <PrivacyMask>{formatEuro(net_monthly)}</PrivacyMask>
          </p>
          <div className="flex items-center gap-2 mt-2">
            {aboveBreakEven ? (
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-pill text-label-pill flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> in profitto
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-error/10 text-error font-label-pill text-label-pill flex items-center gap-1">
                <ArrowDown className="w-3.5 h-3.5" /> in perdita
              </span>
            )}
            <span className="font-body-sm text-body-sm text-on-surface-variant">vs tasse</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-end gap-6 pb-2">
          <div className="text-right">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Entrate (Lordo)</p>
            <p className="font-headline-sm text-headline-sm text-primary font-data-tabular">
              + <PrivacyMask>{formatEuro(gross_monthly)}</PrivacyMask>
            </p>
          </div>
          <div className="text-right">
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Uscite (Tasse)</p>
            <p className="font-headline-sm text-headline-sm text-tertiary-container font-data-tabular">
              - <PrivacyMask>{formatEuro(Math.abs(gross_monthly - net_monthly))}</PrivacyMask>
            </p>
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
    </div>
  );
};
