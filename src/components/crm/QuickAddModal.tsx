import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCrm } from '@/store/crmStore';
import { LEAD_SOURCES, PIPELINE_STAGES, LeadSource, PipelineStage } from '@/types/crm';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickAddModal = ({ open, onOpenChange }: Props) => {
  const { addClient } = useCrm();
  const [name, setName] = useState('');
  const [source, setSource] = useState<LeadSource>('Gym Floor');
  const [stage, setStage] = useState<PipelineStage>('Lead Acquired');

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Name required');
      return;
    }
    addClient({
      name: name.trim(),
      lead_source: source,
      pipeline_stage: stage,
      root_motivator: '',
      objection_stated: '',
      objection_real: '',
    });
    toast.success(`${name} added to pipeline`);
    setName('');
    setSource('Gym Floor');
    setStage('Lead Acquired');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quick add lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marco Rossi"
              autoFocus
              className="h-12 rounded-xl bg-secondary border-0 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Lead source</Label>
            <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
              <SelectTrigger className="h-12 rounded-xl bg-secondary border-0 text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Stage</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as PipelineStage)}>
              <SelectTrigger className="h-12 rounded-xl bg-secondary border-0 text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} className="w-full h-14 rounded-xl text-base font-semibold gradient-primary text-primary-foreground shadow-glow">
            Save lead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
