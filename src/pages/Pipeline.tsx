import { useCrm } from '@/store/crmStore';
import { PIPELINE_STAGES, stageColorMap } from '@/types/crm';
import { ClientCard } from '@/components/crm/ClientCard';

const Pipeline = () => {
  const { clients } = useCrm();

  return (
    <div className="pt-6 pb-4 animate-fade-in">
      <header className="px-4 mb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sales board</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Pipeline</h1>
      </header>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-4 snap-x snap-mandatory">
        {PIPELINE_STAGES.map(stage => {
          const stageClients = clients.filter(c => c.pipeline_stage === stage);
          const color = stageColorMap[stage];
          return (
            <div key={stage} className="w-[78vw] max-w-[300px] shrink-0 snap-start">
              <div className="rounded-2xl border border-border bg-card/50 p-3 h-full">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(var(--${color}))` }} />
                    <h3 className="text-sm font-semibold">{stage}</h3>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                    {stageClients.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageClients.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center">
                      <p className="text-xs text-muted-foreground">Empty</p>
                    </div>
                  ) : (
                    stageClients.map(c => <ClientCard key={c.id} client={c} compact />)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
