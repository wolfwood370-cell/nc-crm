-- Add advanced recurrence to financial_movements
ALTER TABLE public.financial_movements
  ADD COLUMN IF NOT EXISTS recurrence_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS recurrence_value integer;

-- Validation trigger for recurrence_type
CREATE OR REPLACE FUNCTION public.validate_movement_recurrence()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.recurrence_type NOT IN ('none','weekly','fixed_day') THEN
    RAISE EXCEPTION 'Invalid recurrence_type: %', NEW.recurrence_type;
  END IF;
  IF NEW.recurrence_type = 'fixed_day' THEN
    IF NEW.recurrence_value IS NULL OR NEW.recurrence_value < 1 OR NEW.recurrence_value > 31 THEN
      RAISE EXCEPTION 'recurrence_value must be 1-31 for fixed_day';
    END IF;
  ELSIF NEW.recurrence_type = 'weekly' THEN
    IF NEW.recurrence_value IS NULL OR NEW.recurrence_value < 1 THEN
      RAISE EXCEPTION 'recurrence_value (weeks) must be >= 1 for weekly';
    END IF;
  END IF;
  -- keep is_recurring boolean in sync
  NEW.is_recurring := (NEW.recurrence_type <> 'none');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_movement_recurrence_trigger ON public.financial_movements;
CREATE TRIGGER validate_movement_recurrence_trigger
BEFORE INSERT OR UPDATE ON public.financial_movements
FOR EACH ROW EXECUTE FUNCTION public.validate_movement_recurrence();

-- Backfill existing rows where is_recurring=true → fixed_day on day-of-month from date
UPDATE public.financial_movements
SET recurrence_type = 'fixed_day',
    recurrence_value = EXTRACT(DAY FROM date)::int
WHERE is_recurring = true AND recurrence_type = 'none';

-- Allow source = 'transaction' (already added previously) — ensure it's there
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'financial_movements_source_check'
  ) THEN
    ALTER TABLE public.financial_movements DROP CONSTRAINT financial_movements_source_check;
  END IF;
END$$;
ALTER TABLE public.financial_movements
  ADD CONSTRAINT financial_movements_source_check
  CHECK (source = ANY (ARRAY['manual','import','migrated','transaction']));