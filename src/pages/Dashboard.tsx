import { useMemo } from 'react';
import { Card, Metric, Text, BadgeDelta, Flex } from '@tremor/react';
import { TaskQueue } from '@/components/crm/TaskQueue';
import { useCrm } from '@/store/useCrm';
import { TaskQueueSkeleton } from '@/components/crm/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { formatEuro } from '@/types/crm';
import { PrivacyMask } from '@/components/crm/PrivacyMask';
import { TrendingUp, BarChart3 } from 'lucide-react';

type DeltaType = 'increase' | 'decrease' | 'unchanged';

interface KpiData {
  title: string;
  value: string;
  deltaLabel: string;
  deltaType: DeltaType;
  privacy?: boolean;
}

const computeDelta = (current: number, previous: number): { label: string; type: DeltaType } => {
  if (previous === 0 && current === 0) return { label: '0%', type: 'unchanged' };
  if (previous === 0) return { label: 'Nuovo', type: current > 0 ? 'increase' : 'unchanged' };
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const rounded = Math.round(pct * 10) / 10;
  if (Math.abs(rounded) < 0.1) return { label: '0%', type: 'unchanged' };
  return {
    label: `${rounded > 0 ? '+' : ''}${rounded}%`,
    type: rounded > 0 ? 'increase' : 'decrease',
  };
};

const Dashboard = () => {
  const { clients, isLoading, financialSummary, monthlyBreakdown } = useCrm();

  const today = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

  const kpis = useMemo<KpiData[]>(() => {
    const lastIdx = monthlyBreakdown.length - 1;
    const current = monthlyBreakdown[lastIdx];
    const previous = lastIdx > 0 ? monthlyBreakdown[lastIdx - 1] : undefined;

    // Monthly Revenue (gross)
    const grossNow = financialSummary.gross_monthly;
    const grossPrev = previous?.gross ?? 0;
    const grossDelta = computeDelta(grossNow, grossPrev);

    // Active leads = pipeline esclusi Won/Lost
    const activeLeads = clients.filter(c => !['Closed Won', 'Closed Lost'].includes(c.pipeline_stage)).length;

    // Sales conversion = Won / (Won + Lost) [tutti gli esiti chiusi]
    const wonAll = clients.filter(c => c.pipeline_stage === 'Closed Won').length;
    const lostAll = clients.filter(c => c.pipeline_stage === 'Closed Lost').length;
    const totalClosed = wonAll + lostAll;
    const conversion = totalClosed > 0 ? (wonAll / totalClosed) * 100 : 0;

    // Personal Savings = free_cash_flow del mese corrente
    const savings = current?.free_cash_flow ?? 0;
    const savingsPrev = previous?.free_cash_flow ?? 0;
    const savingsDelta = computeDelta(savings, savingsPrev);

    return [
      {
        title: 'Fatturato Mensile',
        value: formatEuro(grossNow),
        deltaLabel: grossDelta.label,
        deltaType: grossDelta.type,
        privacy: true,
      },
      {
        title: 'Lead Attivi',
        value: String(activeLeads),
        deltaLabel: `${wonAll} clienti`,
        deltaType: activeLeads > 0 ? 'increase' : 'unchanged',
      },
      {
        title: 'Tasso di Conversione',
        value: `${conversion.toFixed(1)}%`,
        deltaLabel: `${wonAll}/${totalClosed || 0}`,
        deltaType: conversion >= 50 ? 'increase' : conversion > 0 ? 'decrease' : 'unchanged',
      },
      {
        title: 'Risparmio Personale',
        value: formatEuro(savings),
        deltaLabel: savingsDelta.label,
        deltaType: savingsDelta.type,
        privacy: true,
      },
    ];
  }, [clients, financialSummary, monthlyBreakdown]);

  return (
    <div className="px-4 md:px-0 pt-6 pb-4 space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{today}</p>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground">Centro di Comando</h1>
      </header>

      {isLoading ? (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <TaskQueueSkeleton />
          </div>
        </>
      ) : (
        <>
          {/* Bento — Top KPI row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Card
                key={k.title}
                className="!bg-card !border-border !ring-0 shadow-card !rounded-2xl"
                decoration="top"
                decorationColor="emerald"
              >
                <Flex alignItems="start">
                  <Text className="!text-muted-foreground !text-xs !font-semibold !uppercase !tracking-wider">
                    {k.title}
                  </Text>
                  <BadgeDelta
                    deltaType={k.deltaType}
                    isIncreasePositive={true}
                    size="xs"
                  >
                    {k.deltaLabel}
                  </BadgeDelta>
                </Flex>
                <Metric className="!text-foreground mt-2 !text-2xl">
                  {k.privacy ? <PrivacyMask>{k.value}</PrivacyMask> : k.value}
                </Metric>
              </Card>
            ))}
          </div>

          {/* Bento — Strategic Overview (2/3) + Task Queue (1/3) */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="!bg-card !border-border !ring-0 shadow-card !rounded-2xl lg:col-span-2 min-h-[320px]">
              <Flex alignItems="start" justifyContent="between">
                <div>
                  <Text className="!text-muted-foreground !text-xs !font-semibold !uppercase !tracking-wider">
                    Strategic Overview
                  </Text>
                  <Metric className="!text-foreground mt-1 !text-xl">
                    Andamento Performance
                  </Metric>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </Flex>

              <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium text-foreground">Area Chart in arrivo</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  Qui visualizzeremo l'andamento di fatturato, conversioni e cash flow nel tempo.
                </p>
              </div>
            </Card>

            <Card className="!bg-card !border-border !ring-0 shadow-card !rounded-2xl">
              <Text className="!text-muted-foreground !text-xs !font-semibold !uppercase !tracking-wider">
                Coda di Oggi
              </Text>
              <div className="mt-3 max-h-[420px] overflow-y-auto pr-1 -mr-1">
                <TaskQueue />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
