import { BreakEvenGauge } from '@/components/crm/BreakEvenGauge';
import { RevenueBySource } from '@/components/crm/RevenueBySource';
import { FinancialWidget } from '@/components/crm/FinancialWidget';
import { MonthlyHistory } from '@/components/crm/MonthlyHistory';
import { SalesFunnel } from '@/components/crm/SalesFunnel';
import { TaskQueue } from '@/components/crm/TaskQueue';
import { useCrm } from '@/store/useCrm';
import { FinancialCardSkeleton, TaskQueueSkeleton } from '@/components/crm/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Filter, HeartPulse, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatEuro } from '@/types/crm';
import { PrivacyMask } from '@/components/crm/PrivacyMask';

// ----------------------------------------------------------------------------
// Local KPI card — Glassmorphic 2.0 style
// ----------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  badge?: { text: string; tone: 'primary' | 'secondary' | 'error' };
  iconTone?: 'primary' | 'secondary' | 'error';
  alert?: boolean;
  progress?: number; // 0..1
  progressHint?: string;
  className?: string;
}

const toneIconWrap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/15 text-secondary-foreground',
  error: 'bg-error/15 text-error',
};

const toneBadge: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/15 text-secondary-foreground',
  error: 'bg-error/20 text-error',
};

const KpiCard = ({
  label,
  value,
  icon,
  badge,
  iconTone = 'primary',
  alert,
  progress,
  progressHint,
  className,
}: KpiCardProps) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-2xl glass-panel p-6 transition-all duration-300 hover:-translate-y-0.5',
      alert ? 'bg-error/5 border-error/20' : 'bg-surface-container/40',
      className,
    )}
  >
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', toneIconWrap[iconTone])}>
        {icon}
      </div>
      {badge && (
        <span
          className={cn(
            'px-2 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1',
            toneBadge[badge.tone],
          )}
        >
          {badge.tone === 'error' && <AlertTriangle className="h-3 w-3" />}
          {badge.text}
        </span>
      )}
    </div>
    <p className={cn('text-sm mb-1 relative z-10', alert ? 'text-error' : 'text-on-surface-variant')}>
      {label}
    </p>
    <p className="text-2xl font-semibold text-on-surface tabular-nums relative z-10">{value}</p>

    {progress !== undefined && (
      <>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
          <div
            className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8)] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
        {progressHint && (
          <p className="absolute bottom-3 right-4 text-[10px] italic text-on-surface-variant z-10">
            {progressHint}
          </p>
        )}
      </>
    )}
  </div>
);

const LivePulse = () => (
  <div className="px-3 py-1 rounded-full bg-error/10 border border-error/20 flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_hsl(var(--error)/0.8)]" />
    <span className="text-[11px] font-semibold uppercase tracking-wider text-error">Live</span>
  </div>
);

// ----------------------------------------------------------------------------
// Dashboard
// ----------------------------------------------------------------------------

const Dashboard = () => {
  const { clients, isLoading, financialSummary, financials } = useCrm();

  const activeCount = clients.filter(
    c => !['Closed Won', 'Closed Lost'].includes(c.pipeline_stage),
  ).length;
  const wonCount = clients.filter(c => c.pipeline_stage === 'Closed Won').length;
  const lostCount = clients.filter(c => c.pipeline_stage === 'Closed Lost').length;
  const churnAlto = clients.filter(
    c => c.pipeline_stage === 'Closed Won' && c.churn_risk === 'Alto',
  ).length;

  const conversionRate = wonCount + lostCount > 0
    ? (wonCount / (wonCount + lostCount)) * 100
    : 0;

  const monthlyTarget = financials?.monthly_target ?? financialSummary.monthly_target ?? 0;
  const currentMonthly = financials?.current_monthly_revenue ?? financialSummary.gross_monthly ?? 0;
  const targetProgress = monthlyTarget > 0 ? Math.min(1, currentMonthly / monthlyTarget) : 0;
  const targetPct = Math.round(targetProgress * 100);

  const today = new Date()
    .toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();

  return (
    <div className="dark px-4 md:px-10 pt-6 pb-10 space-y-6 animate-fade-in">
      {/* Header */}
      <header className="mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-2">
          {today}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
          Centro di Comando
        </h1>
      </header>

      {isLoading ? (
        <>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8"><FinancialCardSkeleton /></div>
            <div className="lg:col-span-4"><FinancialCardSkeleton /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <TaskQueueSkeleton />
        </>
      ) : (
        <>
          {/* ===== Bento Grid ===== */}
          <div className="grid grid-cols-12 gap-6">
            {/* Hero finanziario — col-span-8 */}
            <div className="col-span-12 lg:col-span-8">
              <FinancialWidget />
            </div>

            {/* Coda di Oggi — col-span-4 */}
            <div className="col-span-12 lg:col-span-4 rounded-[2.5rem] glass-panel bg-surface-container/30 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-on-surface">Coda di Oggi</h3>
                <LivePulse />
              </div>
              <div className="flex-1 overflow-y-auto pr-1 max-h-[420px]">
                <TaskQueue />
              </div>
            </div>

            {/* KPI MATRIX */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                label="Performance Pipeline"
                value={activeCount}
                icon={<BarChart3 className="h-5 w-5" />}
                iconTone="secondary"
                badge={activeCount > 0 ? { text: 'attivi', tone: 'secondary' } : undefined}
              />
              <KpiCard
                label="Tasso Conversione"
                value={`${conversionRate.toFixed(1)}%`}
                icon={<Filter className="h-5 w-5" />}
                iconTone="primary"
                badge={
                  conversionRate > 0
                    ? { text: `${wonCount}/${wonCount + lostCount}`, tone: 'primary' }
                    : undefined
                }
              />
              <KpiCard
                label="Salute Clienti"
                value={churnAlto > 0 ? `${churnAlto} Rischio Churn` : 'Stabile'}
                icon={<HeartPulse className="h-5 w-5" />}
                iconTone={churnAlto > 0 ? 'error' : 'primary'}
                alert={churnAlto > 0}
                badge={
                  churnAlto > 0
                    ? { text: 'Alert', tone: 'error' }
                    : { text: 'OK', tone: 'primary' }
                }
              />
              <KpiCard
                label="Obiettivo Mensile"
                value={<PrivacyMask>{formatEuro(monthlyTarget)}</PrivacyMask>}
                icon={<Target className="h-5 w-5" />}
                iconTone="primary"
                badge={{ text: `${targetPct}%`, tone: 'primary' }}
                progress={targetProgress}
                progressHint={
                  targetPct >= 100
                    ? 'Obiettivo raggiunto!'
                    : `Sei al ${targetPct}% del tuo obiettivo`
                }
              />
            </div>

            {/* Bento Insights */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div className="md:col-span-2 rounded-2xl glass-panel bg-surface-container/30 p-6">
                <MonthlyHistory />
              </div>
              <div className="rounded-2xl glass-panel bg-surface-container/30 p-6">
                <RevenueBySource />
              </div>
            </div>

            {/* Secondary insights */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl glass-panel bg-surface-container/30 p-6">
                <BreakEvenGauge />
              </div>
              <div className="rounded-2xl glass-panel bg-surface-container/30 p-6">
                <SalesFunnel />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
