-- Ejecutar después de 001 y 004. No modifica tareas ni elimina registros.
CREATE TABLE IF NOT EXISTS public.organization_settings (
 organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
 plan_start_date date NOT NULL DEFAULT DATE '2026-11-23',
 plan_duration_days integer NOT NULL DEFAULT 90 CHECK(plan_duration_days BETWEEN 1 AND 730),
 updated_at timestamptz NOT NULL DEFAULT now(),
 updated_by uuid REFERENCES auth.users(id)
);
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.organization_settings TO authenticated;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organization_settings' AND policyname='settings members read') THEN
  CREATE POLICY "settings members read" ON public.organization_settings FOR SELECT TO authenticated USING(public.is_org_member(organization_id));
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organization_settings' AND policyname='settings admins insert') THEN
  CREATE POLICY "settings admins insert" ON public.organization_settings FOR INSERT TO authenticated WITH CHECK(public.is_org_admin(organization_id) AND updated_by=auth.uid());
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='organization_settings' AND policyname='settings admins update') THEN
  CREATE POLICY "settings admins update" ON public.organization_settings FOR UPDATE TO authenticated USING(public.is_org_admin(organization_id)) WITH CHECK(public.is_org_admin(organization_id) AND updated_by=auth.uid());
 END IF;
END $$;
INSERT INTO public.organization_settings (organization_id)
SELECT id FROM public.organizations ON CONFLICT (organization_id) DO NOTHING;
-- La auditoría de ajustes se registra si la migración 004 está aplicada.
DO $$ BEGIN
 IF to_regclass('public.audit_log') IS NOT NULL THEN
  DROP TRIGGER IF EXISTS serpa_audit ON public.organization_settings;
  CREATE TRIGGER serpa_audit AFTER INSERT OR UPDATE OR DELETE ON public.organization_settings
   FOR EACH ROW EXECUTE FUNCTION public.serpa_audit_trigger();
 END IF;
END $$;
NOTIFY pgrst, 'reload schema';
