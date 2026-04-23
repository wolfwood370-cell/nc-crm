import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { BottomNav } from '@/components/crm/BottomNav';
import { QuickAddModal } from '@/components/crm/QuickAddModal';

export const AppLayout = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-28">
        <Outlet context={{ openQuickAdd: () => setOpen(true) }} />
      </div>
      <BottomNav onFabClick={() => setOpen(true)} />
      <QuickAddModal open={open} onOpenChange={setOpen} />
    </div>
  );
};
