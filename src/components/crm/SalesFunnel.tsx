import { useMemo } from 'react';
import { useCrm } from '@/store/useCrm';

interface FunnelStage {
  label: string;
  value: number;
  widthPct: number;
  opacity: number;
  align: 'left' | 'right';
}

export const SalesFunnel = () => {
  const { clients } = useCrm();

  const { stages, drops } = useMemo(() => {
    const total = clients.length;
    const pitchedStages = new Set(['Pitch Presented', 'Closed Won', 'Closed Lost']);
    const pitched = clients.filter(c => pitchedStages.has(c.pipeline_stage)).length;
    const won = clients.filter(c => c.pipeline_stage === 'Closed Won').length;

    const safeTotal = Math.max(total, 1);

    const stages: FunnelStage[] = [
      {
        label: 'Lead Totali',
        value: total,
        widthPct: 100,
        opacity: 1,
        align: 'left',
      },
      {
        label: 'Proposta',
        value: pitched,
        widthPct: Math.max(8, (pitched / safeTotal) * 100),
        opacity: 0.8,
        align: 'right',
      },
      {
        label: 'Clienti',
        value: won,
        widthPct: Math.max(6, (won / safeTotal) * 100),
        opacity: 0.5,
        align: 'right',
      },
    ];

    const dropPitched = total > 0 ? Math.round(((total - pitched) / total) * 100) : 0;
    const dropWon = pitched > 0 ? Math.round(((pitched - won) / pitched) * 100) : 0;
    const drops = [dropPitched, dropWon];

    return { stages, drops };
  }, [clients]);

  const empty = clients.length === 0;

  return (
    <div className="bg-[#1a211d]/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 flex flex-col relative overflow-hidden h-full">
      <h3 className="font-semibold text-lg text-[#dde4dd] mb-6">Analisi di Conversione</h3>

      {empty ? (
        <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center">
          <p className="text-sm text-[#bbcabf]">Aggiungi i tuoi primi lead per vedere il funnel.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 justify-center">
          {stages.map((stage, idx) => {
            const barClass = stage.align === 'left'
              ? 'absolute left-0 h-full rounded-r-lg'
              : 'absolute right-0 h-full rounded-l-lg';
            const innerWrapper = stage.align === 'left'
              ? 'relative z-10 flex justify-between w-full px-4 items-center'
              : 'relative z-10 flex justify-between ml-auto px-4 items-center';
            return (
              <div key={stage.label}>
                <div className="relative w-full h-12 flex items-center">
                  <div
                    className={barClass}
                    style={{ width: `${stage.widthPct}%`, backgroundColor: '#4edea3', opacity: stage.opacity }}
                  />
                  <div
                    className={innerWrapper}
                    style={stage.align === 'right' ? { width: `${stage.widthPct}%` } : undefined}
                  >
                    <span className="text-sm text-[#003824] font-medium truncate">{stage.label}</span>
                    <span className="text-sm text-[#003824] font-bold tabular-nums">{stage.value.toLocaleString('it-IT')}</span>
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <div className="flex justify-end pr-4 -my-2 z-10">
                    <span className="text-xs font-semibold tracking-wider text-[#ffb4ab] bg-[#ffb4ab]/10 px-2 py-1 rounded">
                      -{drops[idx]}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
