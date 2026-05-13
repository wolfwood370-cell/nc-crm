import { useMemo } from 'react';
import { useCrm } from '@/store/useCrm';
import { Filter } from 'lucide-react';

export const SalesFunnel = () => {
  const { clients } = useCrm();

  const stats = useMemo(() => {
    const total = clients.length;
    // "Pitched" = cliente che ha visto la proposta (in Pitch o oltre)
    const pitchedStages = new Set(['Pitch Presented', 'Closed Won', 'Closed Lost']);
    const pitched = clients.filter(c => pitchedStages.has(c.pipeline_stage)).length;
    const won = clients.filter(c => c.pipeline_stage === 'Closed Won').length;
    const winRate = total > 0 ? (won / total) * 100 : 0;
    const closeRate = pitched > 0 ? (won / pitched) * 100 : 0;
    return { total, pitched, won, winRate, closeRate };
  }, [clients]);

  const pct = (n: number, base: number) => (base > 0 ? Math.max(4, (n / base) * 100) : 0);
  const pitchedWidth = pct(stats.pitched, stats.total);
  const wonWidth = pct(stats.won, stats.total);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Analisi di Conversione</p>
            <p className="text-[11px] text-muted-foreground">Tasso di conversione globale</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary leading-none">{stats.winRate.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Win Rate</p>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">Aggiungi i tuoi primi lead per vedere il funnel.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {/* Total Leads */}
            <div>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">Lead Totali</span>
                <span className="font-bold text-foreground tabular-nums">{stats.total}</span>
              </div>
              <div className="h-8 w-full rounded-lg bg-secondary/60 flex items-center px-3">
                <div className="h-full w-full rounded-lg gradient-primary opacity-90" />
              </div>
            </div>

            {/* Pitched */}
            <div>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">Proposta Presentata</span>
                <span className="font-bold text-foreground tabular-nums">
                  {stats.pitched} <span className="text-muted-foreground font-normal">({stats.total > 0 ? ((stats.pitched / stats.total) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
              <div className="h-8 w-full rounded-lg bg-secondary/60 overflow-hidden">
                <div
                  className="h-full rounded-lg transition-smooth"
                  style={{ width: `${pitchedWidth}%`, background: 'hsl(43 96% 56%)' }}
                />
              </div>
            </div>

            {/* Won */}
            <div>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">Cliente Acquisito</span>
                <span className="font-bold text-primary tabular-nums">
                  {stats.won} <span className="text-muted-foreground font-normal">({stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(0) : 0}%)</span>
                </span>
              </div>
              <div className="h-8 w-full rounded-lg bg-secondary/60 overflow-hidden">
                <div
                  className="h-full rounded-lg transition-smooth"
                  style={{ width: `${wonWidth}%`, background: 'hsl(160 84% 39%)' }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Close Rate</p>
              <p className="mt-1 text-xl font-bold text-foreground">{stats.closeRate.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">su lead in pitch</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
              <p className="mt-1 text-xl font-bold text-primary">{stats.winRate.toFixed(1)}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">su tutti i lead</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
