CREATE OR REPLACE FUNCTION public.sync_transaction_to_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_account uuid;
  client_label text;
  service_label text;
  desc_text text;
  ext_ref text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.financial_movements
     WHERE source = 'transaction' AND external_ref = 'tx:' || OLD.id::text;
    RETURN OLD;
  END IF;

  SELECT id INTO default_account FROM public.bank_accounts
   WHERE type = 'business' ORDER BY sort_order LIMIT 1;
  IF default_account IS NULL THEN
    SELECT id INTO default_account FROM public.bank_accounts ORDER BY sort_order LIMIT 1;
  END IF;
  IF default_account IS NULL THEN
    RAISE LOG 'sync_transaction_to_ledger: no bank account';
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(TRIM(CONCAT_WS(' ', first_name, last_name)), ''), name)
    INTO client_label FROM public.clients WHERE id = NEW.client_id;
  SELECT name INTO service_label FROM public.services WHERE id = NEW.service_id;
  desc_text := COALESCE(client_label, 'Cliente') ||
               CASE WHEN service_label IS NOT NULL THEN ' — ' || service_label ELSE '' END ||
               ' (' || COALESCE(NEW.payment_type, 'Pagamento') || ')';
  ext_ref := 'tx:' || NEW.id::text;

  IF NEW.status = 'Saldato' THEN
    UPDATE public.financial_movements
       SET account_id  = default_account,
           date        = COALESCE(NEW.payment_date, now()),
           description = desc_text,
           amount      = NEW.amount,
           type        = 'credit',
           classification = 'business',
           is_recurring = COALESCE(NEW.recurring_active, false),
           is_reviewed  = true,
           client_id    = NEW.client_id,
           updated_at   = now()
     WHERE source = 'transaction' AND external_ref = ext_ref;
    IF NOT FOUND THEN
      INSERT INTO public.financial_movements (
        account_id, date, description, amount, type, classification,
        is_recurring, is_reviewed, source, external_ref, client_id
      ) VALUES (
        default_account, COALESCE(NEW.payment_date, now()), desc_text, NEW.amount,
        'credit', 'business', COALESCE(NEW.recurring_active, false), true,
        'transaction', ext_ref, NEW.client_id
      );
    END IF;
  ELSE
    DELETE FROM public.financial_movements
     WHERE source = 'transaction' AND external_ref = ext_ref;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'sync_transaction_to_ledger error: % %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_transaction_to_ledger ON public.transactions;
CREATE TRIGGER trg_sync_transaction_to_ledger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.sync_transaction_to_ledger();

-- Backfill: re-trigger sync for all existing transactions via touch update
UPDATE public.transactions SET status = status;