import { useMemo } from 'react';
import { useCrm } from '@/store/useCrm';
import { LEAD_SOURCES, LeadSource, formatEuro, leadSourceLabel, sourceColorMap } from '@/types/crm';
import { PrivacyMask } from './PrivacyMask';

export const RevenueBySource = () => {
  const { clients, transactions } = useCrm();

  const totals = useMemo(() => {
    // Mappa client_id → lead_source per join veloce
    const clientSource = new Map<string, LeadSource>();
    clients.forEach(c => clientSource.set(c.id, c.lead_source));

    const acc: Record<LeadSource, number> = {
      'Gym-provided': 0,
      'PT Pack 99€': 0,
      'Gym Floor': 0,
      'Referral': 0,
      'Social Media': 0,
    };

    for (const t of transactions) {
      if (t.status !== 'Saldato') continue;
      const src = clientSource.get(t.client_id);
      if (!src) continue;
      acc[src] += t.amount;
    }

    return LEAD_SOURCES.map(src => ({ source: src, value: acc[src] }));
  }, [clients, transactions]);

  const max = Math.max(1, ...totals.map(t => t.value));
  const grandTotal = totals.reduce((s, t) => s + t.value, 0);

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valore per Fonte</p>
          <p className="text-[11px] text-muted-foreground">Incassi reali per canale di acquisizione</p>
        </div>
        <p className="text-sm font-bold text-foreground"><PrivacyMask>{formatEuro(grandTotal)}</PrivacyMask></p>
      </div>

      {grandTotal === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Nessun incasso registrato. Registra il primo pagamento per popolare il grafico.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {totals.map(({ source, value }) => {
            const pct = (value / max) * 100;
            const color = sourceColorMap[source];
            return (
              <div key={source}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{leadSourceLabel[source]}</span>
                  <span className="font-semibold text-muted-foreground"><PrivacyMask>{formatEuro(value)}</PrivacyMask></span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-smooth"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: `hsl(var(--${color}))`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
