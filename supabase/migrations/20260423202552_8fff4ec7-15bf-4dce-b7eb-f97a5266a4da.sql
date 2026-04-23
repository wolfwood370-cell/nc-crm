
-- Helper: ritorna true se l'utente corrente è nella whitelist
CREATE OR REPLACE FUNCTION public.is_allowed_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.allowed_emails ae
    JOIN auth.users u ON lower(u.email) = lower(ae.email)
    WHERE u.id = auth.uid()
  );
$$;

-- CLIENTS
DROP POLICY IF EXISTS "Authenticated full access clients" ON public.clients;
CREATE POLICY "Allowed user can read clients" ON public.clients
  FOR SELECT TO authenticated USING (public.is_allowed_user());
CREATE POLICY "Allowed user can insert clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (public.is_allowed_user()) WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can delete clients" ON public.clients
  FOR DELETE TO authenticated USING (public.is_allowed_user());

-- TRANSACTIONS
DROP POLICY IF EXISTS "Authenticated full access transactions" ON public.transactions;
CREATE POLICY "Allowed user can read transactions" ON public.transactions
  FOR SELECT TO authenticated USING (public.is_allowed_user());
CREATE POLICY "Allowed user can insert transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can update transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (public.is_allowed_user()) WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can delete transactions" ON public.transactions
  FOR DELETE TO authenticated USING (public.is_allowed_user());

-- ROI METRICS
DROP POLICY IF EXISTS "Authenticated full access roi" ON public.roi_metrics;
CREATE POLICY "Allowed user can read roi" ON public.roi_metrics
  FOR SELECT TO authenticated USING (public.is_allowed_user());
CREATE POLICY "Allowed user can insert roi" ON public.roi_metrics
  FOR INSERT TO authenticated WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can update roi" ON public.roi_metrics
  FOR UPDATE TO authenticated USING (public.is_allowed_user()) WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can delete roi" ON public.roi_metrics
  FOR DELETE TO authenticated USING (public.is_allowed_user());

-- SERVICES
DROP POLICY IF EXISTS "Authenticated full access services" ON public.services;
CREATE POLICY "Allowed user can read services" ON public.services
  FOR SELECT TO authenticated USING (public.is_allowed_user());
CREATE POLICY "Allowed user can insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can update services" ON public.services
  FOR UPDATE TO authenticated USING (public.is_allowed_user()) WITH CHECK (public.is_allowed_user());
CREATE POLICY "Allowed user can delete services" ON public.services
  FOR DELETE TO authenticated USING (public.is_allowed_user());

-- ALLOWED_EMAILS: limita la lettura agli utenti autorizzati
DROP POLICY IF EXISTS "Authenticated can view allowed emails" ON public.allowed_emails;
CREATE POLICY "Allowed user can view allowed emails" ON public.allowed_emails
  FOR SELECT TO authenticated USING (public.is_allowed_user());

-- REALTIME: blocca la sottoscrizione ai canali a chi non è autorizzato
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allowed user can receive realtime" ON realtime.messages;
CREATE POLICY "Allowed user can receive realtime" ON realtime.messages
  FOR SELECT TO authenticated USING (public.is_allowed_user());

DROP POLICY IF EXISTS "Allowed user can send realtime" ON realtime.messages;
CREATE POLICY "Allowed user can send realtime" ON realtime.messages
  FOR INSERT TO authenticated WITH CHECK (public.is_allowed_user());
