-- Add status and due_date columns
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Saldato',
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Backfill due_date for existing rows
UPDATE public.transactions
SET due_date = payment_date
WHERE due_date IS NULL;

-- Make due_date NOT NULL after backfill
ALTER TABLE public.transactions
  ALTER COLUMN due_date SET NOT NULL,
  ALTER COLUMN due_date SET DEFAULT now();

-- Drop existing status constraint if any, then add a fresh one
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_status_check
  CHECK (status IN ('Saldato', 'In Attesa'));

-- Helpful index for radar queries
CREATE INDEX IF NOT EXISTS idx_transactions_status_due_date
  ON public.transactions (status, due_date);