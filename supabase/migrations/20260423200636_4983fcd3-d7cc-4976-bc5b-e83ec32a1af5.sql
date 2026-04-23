-- Tabella delle email autorizzate
CREATE TABLE public.allowed_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view allowed emails"
ON public.allowed_emails
FOR SELECT
TO authenticated
USING (true);

INSERT INTO public.allowed_emails (email) VALUES ('nctrainingsystems@gmail.com');

-- Trigger che blocca signup di email non autorizzate
CREATE OR REPLACE FUNCTION public.enforce_allowed_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.allowed_emails WHERE lower(email) = lower(NEW.email)
  ) THEN
    RAISE EXCEPTION 'Email non autorizzata ad accedere a questa piattaforma';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_allowed_email_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.enforce_allowed_email();

-- Restringe l'accesso ai dati ai soli utenti autenticati
DROP POLICY IF EXISTS "Open access clients" ON public.clients;
CREATE POLICY "Authenticated full access clients"
ON public.clients FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Open access transactions" ON public.transactions;
CREATE POLICY "Authenticated full access transactions"
ON public.transactions FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Open access services" ON public.services;
CREATE POLICY "Authenticated full access services"
ON public.services FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Open access roi" ON public.roi_metrics;
CREATE POLICY "Authenticated full access roi"
ON public.roi_metrics FOR ALL
TO authenticated
USING (true) WITH CHECK (true);