import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCrm } from '@/store/useCrm';
import { Transaction, formatEuro } from '@/types/crm';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  transactions: Transaction[];
}

export const TransactionsSheet = ({ open, onOpenChange, title, description, transactions }: Props) => {
  const { clients } = useCrm();
  const total = transactions.reduce((s, t) => s + t.amount, 0);

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Totale</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{formatEuro(total)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{sorted.length} transazion{sorted.length === 1 ? 'e' : 'i'}</p>
        </div>

        <div className="mt-4 space-y-2">
          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">Nessuna transazione in questa categoria.</p>
            </div>
          ) : (
            sorted.map(t => {
              const client = clients.find(c => c.id === t.client_id);
              const isPaid = t.status === 'Saldato';
              const date = new Date(isPaid ? t.payment_date : t.due_date);
              return (
                <Link
                  key={t.id}
                  to={`/clients/${t.client_id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-smooth"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isPaid ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning'}`}>
                    {isPaid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{client?.name ?? 'Cliente rimosso'}</p>
                      <p className="font-bold text-sm text-foreground shrink-0">{formatEuro(t.amount)}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="mx-1.5">·</span>
                      {t.payment_type}
                      <span className="mx-1.5">·</span>
                      {t.payment_method}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
