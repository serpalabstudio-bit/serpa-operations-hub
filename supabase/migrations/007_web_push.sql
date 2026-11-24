BEGIN;
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
 endpoint text PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 subscription jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 assignments boolean NOT NULL DEFAULT true, reminders boolean NOT NULL DEFAULT true
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_subscriptions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
CREATE POLICY push_own ON public.push_subscriptions FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE TABLE IF NOT EXISTS public.push_deliveries (
 endpoint text NOT NULL REFERENCES public.push_subscriptions(endpoint) ON DELETE CASCADE,
 event_key text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(endpoint,event_key)
);
ALTER TABLE public.push_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.push_deliveries FROM anon, authenticated;
GRANT ALL ON public.push_deliveries, public.push_subscriptions TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
