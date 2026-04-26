ALTER TABLE public.financial_movements DROP CONSTRAINT IF EXISTS financial_movements_source_check;
ALTER TABLE public.financial_movements
  ADD CONSTRAINT financial_movements_source_check
  CHECK (source = ANY (ARRAY['manual','import','migrated','transaction']));

-- Re-trigger backfill
UPDATE public.transactions SET payment_method = payment_method;