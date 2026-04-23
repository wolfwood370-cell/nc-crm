import { useCrm } from '@/store/useCrm';
import { formatEuro } from '@/types/crm';
import { PrivacyMask } from './PrivacyMask';
import { CalendarRange } from 'lucide-react';

export const MonthlyHistory = () => {
  const { monthlyBreakdown } = useCrm();
  // Mostra in ordine cronologico inverso (più recente in alto)
  const rows = [...monthlyBreakdown].reverse();
  const max = Math.max(1, ...monthlyBreakdown.map(m => m.gross));

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <CalendarRange className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Storico Mensile</p>
            <p className="text-[11px] text-muted-foreground">Lordo e netto dal 1° Gennaio 2026</p>
          </div>
        </div>
      </div>

      {monthlyBreakdown.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">Nessun mese disponibile.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {rows.map(m => {
            const pct = (m.gross / max) * 100;
            const positive = m.net >= 0;
            return (
              <div key={`${m.year}-${m.month}`} className="rounded-xl border border-border bg-secondary/40 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{m.label}</p>
                  <p className="text-xs font-bold text-foreground">
                    <PrivacyMask>{formatEuro(m.gross)}</PrivacyMask>
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-smooth"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className={`mt-1.5 text-[11px] font-semibold ${positive ? 'text-primary' : 'text-destructive'}`}>
                  Netto: <PrivacyMask>{formatEuro(m.net)}</PrivacyMask>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
