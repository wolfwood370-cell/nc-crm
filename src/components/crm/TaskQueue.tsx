import { useCrm, daysSince } from '@/store/useCrm';
import { AlertTriangle, Clock, Flame, Trophy, Zap, Target, Receipt, AlarmClock, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatEuro } from '@/types/crm';
import { cn } from '@/lib/utils';

type Priority = 'critical' | 'high' | 'medium' | 'low';

interface Task {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  priority: Priority;
  clientId: string;
  action?: 'call' | 'mail';
}

const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

// Glassmorphic 2.0 — left-border accent + subtitle color per priority
const priorityStyles: Record<Priority, { border: string; iconWrap: string; subtitle: string }> = {
  critical: {
    border: 'border-l-error',
    iconWrap: 'bg-error/15 text-error',
    subtitle: 'text-error',
  },
  high: {
    border: 'border-l-primary',
    iconWrap: 'bg-primary/15 text-primary',
    subtitle: 'text-on-surface-variant',
  },
  medium: {
    border: 'border-l-secondary',
    iconWrap: 'bg-secondary/15 text-secondary',
    subtitle: 'text-on-surface-variant',
  },
  low: {
    border: 'border-l-white/10',
    iconWrap: 'bg-white/5 text-on-surface-variant',
    subtitle: 'text-on-surface-variant',
  },
};

export const TaskQueue = () => {
  const { clients, transactions } = useCrm();
  const navigate = useNavigate();

  const tasks: Task[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  transactions.forEach(t => {
    if (t.status !== 'In Attesa') return;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);
    const client = clients.find(c => c.id === t.client_id);
    if (!client) return;

    if (diffDays < 0) {
      tasks.push({
        id: `tx-overdue-${t.id}`,
        icon: <AlertTriangle className="h-4 w-4" />,
        priority: 'critical',
        title: `RATA SCADUTA: ${client.name}`,
        subtitle: `${Math.abs(diffDays)}g di ritardo · ${formatEuro(t.amount)}`,
        clientId: client.id,
        action: 'mail',
      });
    } else if (diffDays <= 3) {
      tasks.push({
        id: `tx-imminent-${t.id}`,
        icon: <AlarmClock className="h-4 w-4" />,
        priority: 'high',
        title: `Incasso tra ${diffDays}g · ${client.name}`,
        subtitle: `Rata da ${formatEuro(t.amount)}`,
        clientId: client.id,
        action: 'call',
      });
    } else if (diffDays === 7) {
      tasks.push({
        id: `tx-7d-${t.id}`,
        icon: <Receipt className="h-4 w-4" />,
        priority: 'medium',
        title: `Tra 7g scade la rata di ${client.name}`,
        subtitle: `Rata da ${formatEuro(t.amount)}`,
        clientId: client.id,
      });
    }
  });

  clients.forEach(c => {
    const stageDays = daysSince(c.stage_updated_at);
    const leadAge = daysSince(c.created_at);
    const sinceContact = c.last_contacted_at ? daysSince(c.last_contacted_at) : null;

    if (c.pipeline_stage === 'Closed Won' && c.churn_risk === 'Alto') {
      tasks.push({
        id: `churn-${c.id}`,
        icon: <AlertTriangle className="h-4 w-4" />,
        priority: 'critical',
        title: `Rischio Abbandono Alto`,
        subtitle: c.name,
        clientId: c.id,
        action: 'call',
      });
    }
    if (
      c.service_sold === 'PT Pack Premium' &&
      c.pipeline_stage !== 'Closed Won' &&
      c.pipeline_stage !== 'Closed Lost' &&
      leadAge >= 14
    ) {
      tasks.push({
        id: `ptpack-${c.id}`,
        icon: <Flame className="h-4 w-4" />,
        priority: 'high',
        title: `Pitch finale - Fine PT Pack`,
        subtitle: `${c.name} · ${leadAge}g dall'acquisizione`,
        clientId: c.id,
        action: 'call',
      });
    }
    if (c.pipeline_stage === 'Nurturing' && sinceContact !== null && [1, 3, 7].includes(sinceContact)) {
      tasks.push({
        id: `nurture-${c.id}-${sinceContact}`,
        icon: <Zap className="h-4 w-4" />,
        priority: 'medium',
        title: `Follow-up strategico`,
        subtitle: `${c.name} · ${sinceContact}g dall'ultimo contatto`,
        clientId: c.id,
        action: 'mail',
      });
    }
    if (c.pipeline_stage === 'Closed Won' && (stageDays === 45 || stageDays === 80)) {
      tasks.push({
        id: `roi-${c.id}-${stageDays}`,
        icon: <Trophy className="h-4 w-4" />,
        priority: 'medium',
        title: `Review Risultati (ROI)`,
        subtitle: `${c.name} · Milestone ${stageDays}g`,
        clientId: c.id,
      });
    }
    if (c.pipeline_stage === 'Pitch Presented' && stageDays >= 2) {
      tasks.push({
        id: `pitch-${c.id}`,
        icon: <Target className="h-4 w-4" />,
        priority: stageDays >= 5 ? 'high' : 'medium',
        title: `Chiudere la Proposta`,
        subtitle: `${c.name} · pitch di ${stageDays}g fa`,
        clientId: c.id,
        action: 'call',
      });
    }
    if (c.pipeline_stage === 'Lead Acquired' && stageDays >= 1) {
      tasks.push({
        id: `qualify-${c.id}`,
        icon: <Clock className="h-4 w-4" />,
        priority: 'low',
        title: `Qualificare il nuovo contatto`,
        subtitle: `${c.name} · in attesa da ${stageDays}g`,
        clientId: c.id,
        action: 'call',
      });
    }
  });

  const sorted = tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl glass-panel bg-black/20 p-6 text-center">
        <p className="text-sm text-on-surface-variant">Nessuna azione richiesta. Pipeline sotto controllo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((t, index) => {
        const s = priorityStyles[t.priority];
        const ActionIcon = t.action === 'mail' ? Mail : Phone;
        return (
          <div
            key={t.id}
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
            className={cn(
              'group p-4 rounded-2xl bg-black/20 border-l-2 glow-border flex items-center justify-between transition-all hover:bg-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500',
              s.border,
            )}
          >
            <button
              type="button"
              onClick={() => navigate(`/clients/${t.clientId}`)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              <div className={cn('w-9 h-9 shrink-0 rounded-lg flex items-center justify-center', s.iconWrap)}>
                {t.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{t.title}</p>
                <p className={cn('text-xs truncate mt-0.5', s.subtitle)}>{t.subtitle}</p>
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {t.action && (
                <button
                  type="button"
                  onClick={() => navigate(`/clients/${t.clientId}`)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary text-on-surface-variant"
                  aria-label={t.action === 'mail' ? 'Email' : 'Chiama'}
                >
                  <ActionIcon className="h-4 w-4" />
                </button>
              )}
              <CheckCircle2 className="h-5 w-5 text-on-surface-variant/30 transition-colors group-hover:text-primary" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
