import { useCrm, daysSince } from '@/store/crmStore';
import { Bell, Clock, Flame, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Task {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: 'warning' | 'primary' | 'destructive' | 'muted';
  clientId?: string;
}

const toneClass = {
  warning: 'bg-warning/10 text-warning',
  primary: 'bg-primary/10 text-primary',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
};

export const TaskQueue = () => {
  const { clients } = useCrm();
  const navigate = useNavigate();

  const tasks: Task[] = [];

  clients.forEach(c => {
    const days = daysSince(c.stage_updated_at);
    if (c.pipeline_stage === 'Pitch Presented' && days >= 2) {
      tasks.push({
        icon: <Flame className="h-4 w-4" />, tone: 'destructive',
        title: `Follow up with ${c.name}`, subtitle: `Pitch presented ${days}d ago`, clientId: c.id,
      });
    }
    if (c.pipeline_stage === 'Trial Active' && days >= 3) {
      tasks.push({
        icon: <UserCheck className="h-4 w-4" />, tone: 'warning',
        title: `${c.name} finishing trial`, subtitle: `Trial active ${days}d — close the deal`, clientId: c.id,
      });
    }
    if (c.pipeline_stage === 'Nurturing' && days >= 3) {
      tasks.push({
        icon: <Bell className="h-4 w-4" />, tone: 'primary',
        title: `Nurture ${c.name}`, subtitle: `${days}d since last touch`, clientId: c.id,
      });
    }
    if (c.pipeline_stage === 'Lead Acquired' && days >= 1) {
      tasks.push({
        icon: <Clock className="h-4 w-4" />, tone: 'muted',
        title: `Qualify ${c.name}`, subtitle: 'New lead waiting', clientId: c.id,
      });
    }
  });

  const sorted = tasks.sort((a, b) => {
    const order = { destructive: 0, warning: 1, primary: 2, muted: 3 };
    return order[a.tone] - order[b.tone];
  });

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">All caught up. Go train.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((t, i) => (
        <button
          key={i}
          onClick={() => t.clientId && navigate(`/clients/${t.clientId}`)}
          className="w-full text-left rounded-2xl border border-border bg-card p-4 transition-smooth active:scale-[0.98] hover:border-primary/40"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass[t.tone]}`}>
              {t.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{t.title}</p>
              <p className="text-xs text-muted-foreground truncate">{t.subtitle}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
