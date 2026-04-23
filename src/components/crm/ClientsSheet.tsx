import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Client } from '@/types/crm';
import { Link } from 'react-router-dom';
import { ChevronRight, Eye, Shield, Heart } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  clients: Client[];
  /** When true, show objection_real and root_motivator inline (used for "Persi"). */
  showLossContext?: boolean;
}

export const ClientsSheet = ({ open, onOpenChange, title, description, clients, showLossContext }: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-2">
          {clients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">Nessun cliente in questa categoria.</p>
            </div>
          ) : (
            clients.map(c => (
              <Link
                key={c.id}
                to={`/clients/${c.id}`}
                onClick={() => onOpenChange(false)}
                className="block rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition-smooth"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold">
                    {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.lead_source}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>

                {showLossContext && (c.objection_real || c.root_motivator) && (
                  <div className="mt-3 space-y-2">
                    {c.objection_real && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className="h-3 w-3 text-destructive" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">Obiezione Reale</p>
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{c.objection_real}</p>
                      </div>
                    )}
                    {c.root_motivator && (
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Heart className="h-3 w-3 text-primary" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Motivazione Profonda</p>
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{c.root_motivator}</p>
                      </div>
                    )}
                    {!c.objection_real && c.objection_stated && (
                      <div className="rounded-lg border border-warning/30 bg-warning/5 p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Eye className="h-3 w-3 text-warning" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-warning">Obiezione Dichiarata</p>
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{c.objection_stated}</p>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
