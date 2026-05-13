import { BreakEvenGauge } from '@/components/crm/BreakEvenGauge';
import { RevenueBySource } from '@/components/crm/RevenueBySource';
import { FinancialWidget } from '@/components/crm/FinancialWidget';
import { MonthlyHistory } from '@/components/crm/MonthlyHistory';
import { SalesFunnel } from '@/components/crm/SalesFunnel';
import { TaskQueue } from '@/components/crm/TaskQueue';
import { useCrm } from '@/store/useCrm';
import { FinancialCardSkeleton, TaskQueueSkeleton } from '@/components/crm/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { EyeOff, Sparkles, BarChart, Filter, HeartPulse, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------------
// Dashboard
// ----------------------------------------------------------------------------

const Dashboard = () => {
  const { clients, isLoading } = useCrm();
  const activeCount = clients.filter(c => !['Closed Won', 'Closed Lost'].includes(c.pipeline_stage)).length;
  const wonCount = clients.filter(c => c.pipeline_stage === 'Closed Won').length;
  const churnAlto = clients.filter(c => c.pipeline_stage === 'Closed Won' && c.churn_risk === 'Alto').length;
  const totalClients = clients.length;

  const today = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="dark px-4 md:px-8 pt-6 pb-10 space-y-6 animate-fade-in bg-background text-on-background min-h-screen">
      <header className="mb-10">
        <h2 className="font-label-pill text-label-pill text-on-surface-variant uppercase tracking-widest mb-2">{today}</h2>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-6">Centro di Comando</h1>
        
        {/* Utility Bar */}
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
            <EyeOff className="text-primary w-[18px] h-[18px]" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">Privacy Mode</span>
            <div className="w-8 h-4 bg-surface-variant rounded-full relative ml-2">
              <div className="w-3 h-3 bg-on-surface rounded-full absolute left-1 top-0.5"></div>
            </div>
          </div>
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 bg-primary/5">
            <Sparkles className="text-primary w-[18px] h-[18px]" />
            <span className="font-body-sm text-body-sm text-primary">AI Attiva</span>
          </div>
        </div>
      </header>

      {isLoading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <FinancialCardSkeleton />
            <FinancialCardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Coda di Oggi
            </h2>
            <TaskQueueSkeleton />
          </section>
        </>
      ) : (
        <div className="bento-grid">
          {/* FINANCIAL INSIGHTS (Hero) - Takes 8 cols */}
          <FinancialWidget />

          {/* OPERATIONAL LIVE HUB - Takes 4 cols */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container/30 rounded-[2.5rem] glass-panel p-[24px] flex flex-col h-full max-h-[400px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Coda di Oggi</h3>
              <div className="px-3 py-1 rounded-full bg-error/10 border border-error/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.8)]"></span>
                <span className="font-label-pill text-label-pill text-error">LIVE</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 kanban-scroll">
              <TaskQueue />
            </div>
          </div>

          {/* KPI MATRIX (4 cards) */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Lead Attivi */}
            <div className="bg-surface-container/40 rounded-2xl glass-panel p-[24px]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary-container">
                  <BarChart className="w-5 h-5" />
                </div>
                <span className="px-2 py-1 rounded-md bg-secondary/10 text-secondary font-label-pill text-label-pill">Attivi</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Lead in Pipeline</p>
              <p className="font-headline-md text-headline-md text-on-surface font-data-tabular">{activeCount}</p>
            </div>

            {/* Card 2: Clienti Attivi */}
            <div className="bg-surface-container/40 rounded-2xl glass-panel p-[24px]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                  <Filter className="w-5 h-5" />
                </div>
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-label-pill text-label-pill">Paganti</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Clienti Attivi</p>
              <p className="font-headline-md text-headline-md text-on-surface font-data-tabular">{wonCount}</p>
            </div>

            {/* Card 3: Churn Alert */}
            <div className={cn("rounded-2xl glass-panel p-[24px] border", churnAlto > 0 ? "bg-error/5 border-error/20" : "bg-surface-container/40 border-border/50")}>
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", churnAlto > 0 ? "bg-error-container/20 text-error" : "bg-primary-container/20 text-primary")}>
                  <HeartPulse className="w-5 h-5" />
                </div>
                {churnAlto > 0 ? (
                  <span className="px-2 py-1 rounded-md bg-error/20 text-error font-label-pill text-label-pill flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Alert
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-label-pill text-label-pill flex items-center gap-1">
                    Stabile
                  </span>
                )}
              </div>
              <p className={cn("font-body-sm text-body-sm mb-1", churnAlto > 0 ? "text-error" : "text-on-surface-variant")}>Salute Clienti</p>
              <p className="font-headline-md text-headline-md text-on-surface font-data-tabular">
                {churnAlto > 0 ? `${churnAlto} Rischio Churn` : "Nessun Rischio"}
              </p>
            </div>

            {/* Card 4: Progress Bar (Totale Clienti su 100) */}
            <div className="bg-surface-container/40 rounded-2xl glass-panel p-[24px] relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <span className="font-data-tabular text-data-tabular text-primary">{Math.min(100, Math.round((totalClients / 100) * 100))}%</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-1 relative z-10">Contatti Totali</p>
              <p className="font-headline-md text-headline-md text-on-surface font-data-tabular relative z-10">{totalClients}</p>
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-variant">
                <div 
                  className="h-full bg-primary shadow-[0_0_10px_rgba(78,222,163,0.8)]" 
                  style={{ width: `${Math.min(100, (totalClients / 100) * 100)}%` }}
                ></div>
              </div>
              <p className="absolute bottom-3 right-4 font-body-sm text-body-sm text-on-surface-variant text-[10px] italic z-10">
                vs Obiettivo 100
              </p>
            </div>
          </div>

          {/* BENTO INSIGHTS - Existing Charts in glassmorphic wrappers */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            {/* Blocco A: Andamento Storico */}
            <div className="md:col-span-2 bg-surface-container/30 rounded-2xl glass-panel p-[24px] flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Andamento Storico</h3>
              <div className="flex-1 w-full h-64">
                <MonthlyHistory />
              </div>
            </div>

            {/* Blocco B: Sorgenti Reddito */}
            <div className="bg-surface-container/30 rounded-2xl glass-panel p-[24px] flex flex-col items-center justify-center relative">
              <h3 className="font-headline-sm text-headline-sm text-on-surface absolute top-6 left-6">Sorgenti</h3>
              <div className="w-full h-64 mt-10">
                <RevenueBySource />
              </div>
            </div>
            
            {/* Break Even & Funnel spanning all cols */}
            <div className="md:col-span-1 bg-surface-container/30 rounded-2xl glass-panel p-[24px]">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Soglia Redditività</h3>
              <div className="w-full h-64">
                <BreakEvenGauge />
              </div>
            </div>

            <div className="md:col-span-2 bg-surface-container/30 rounded-2xl glass-panel p-[24px]">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Pipeline Funnel</h3>
              <div className="w-full h-64">
                <SalesFunnel />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
