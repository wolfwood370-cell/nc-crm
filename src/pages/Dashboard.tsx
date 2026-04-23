import { FinancialWidget } from '@/components/crm/FinancialWidget';
import { TaskQueue } from '@/components/crm/TaskQueue';
import { useCrm } from '@/store/crmStore';

const Dashboard = () => {
  const { clients } = useCrm();
  const activeCount = clients.filter(c => !['Closed Won', 'Closed Lost'].includes(c.pipeline_stage)).length;
  const wonCount = clients.filter(c => c.pipeline_stage === 'Closed Won').length;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="px-4 pt-6 pb-4 space-y-6 animate-fade-in">
      <header>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{today}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Command Center</h1>
      </header>

      <FinancialWidget />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
          <p className="mt-1 text-3xl font-bold">{activeCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">in pipeline</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Clients</p>
          <p className="mt-1 text-3xl font-bold text-primary">{wonCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">paying</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Today's queue</h2>
        <TaskQueue />
      </section>
    </div>
  );
};

export default Dashboard;
