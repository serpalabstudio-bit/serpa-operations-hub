-- SERPA Operations Hub v0.9. Ejecutar una vez en SQL Editor (rol propietario).
-- No borra datos. Mantener RLS activo.
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress_percent integer NOT NULL DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS source_phase text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS source_owner_label text;
CREATE TABLE IF NOT EXISTS public.task_comments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,author_id uuid NOT NULL REFERENCES auth.users(id),body text NOT NULL CHECK(length(trim(body))>0),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.task_checklist(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,title text NOT NULL,completed boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.task_dependencies(organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,depends_on uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,PRIMARY KEY(task_id,depends_on),CHECK(task_id<>depends_on));
CREATE TABLE IF NOT EXISTS public.team_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,title text NOT NULL,event_date date NOT NULL,start_time time,end_time time,assigned_to uuid REFERENCES auth.users(id),created_by uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),CHECK(end_time IS NULL OR start_time IS NULL OR end_time>start_time));
CREATE TABLE IF NOT EXISTS public.audit_log(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,actor_id uuid,entity_type text NOT NULL,entity_id text NOT NULL,action text NOT NULL,old_data jsonb,new_data jsonb,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS comments_task_idx ON public.task_comments(task_id,created_at);
CREATE INDEX IF NOT EXISTS events_org_date_idx ON public.team_events(organization_id,event_date);
CREATE INDEX IF NOT EXISTS audit_org_date_idx ON public.audit_log(organization_id,created_at DESC);
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['task_comments','task_checklist','task_dependencies','team_events','audit_log'] LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);END LOOP;END$$;
-- Conceder solo privilegios necesarios; RLS controla filas.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.tasks TO authenticated;
GRANT SELECT ON public.organization_members,public.profiles TO authenticated;
GRANT UPDATE(weekly_capacity_hours,role) ON public.organization_members TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.task_comments,public.task_checklist,public.task_dependencies,public.team_events TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.audit_log_id_seq TO authenticated;
-- Policies idempotentes.
DO $$BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='task_comments' AND policyname='comments select') THEN CREATE POLICY "comments select" ON public.task_comments FOR SELECT TO authenticated USING(public.is_org_member(organization_id)); END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='task_comments' AND policyname='comments insert') THEN CREATE POLICY "comments insert" ON public.task_comments FOR INSERT TO authenticated WITH CHECK(public.is_org_member(organization_id) AND author_id=auth.uid() AND EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=task_id AND t.organization_id=task_comments.organization_id)); END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='task_checklist' AND policyname='checklist all') THEN CREATE POLICY "checklist all" ON public.task_checklist FOR ALL TO authenticated USING(public.is_org_member(organization_id)) WITH CHECK(public.is_org_member(organization_id) AND EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=task_id AND t.organization_id=task_checklist.organization_id)); END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='task_dependencies' AND policyname='dependencies all') THEN CREATE POLICY "dependencies all" ON public.task_dependencies FOR ALL TO authenticated USING(public.is_org_member(organization_id)) WITH CHECK(public.is_org_member(organization_id) AND EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=task_id AND t.organization_id=task_dependencies.organization_id) AND EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=depends_on AND t.organization_id=task_dependencies.organization_id)); END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='team_events' AND policyname='events all') THEN CREATE POLICY "events all" ON public.team_events FOR ALL TO authenticated USING(public.is_org_member(organization_id)) WITH CHECK(public.is_org_member(organization_id) AND created_by=auth.uid() AND (assigned_to IS NULL OR EXISTS(SELECT 1 FROM public.organization_members m WHERE m.organization_id=team_events.organization_id AND m.user_id=assigned_to))); END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_log' AND policyname='audit admin read') THEN CREATE POLICY "audit admin read" ON public.audit_log FOR SELECT TO authenticated USING(public.is_org_admin(organization_id)); END IF;
END$$;
-- Solo administradores pueden modificar roles/capacidad (política UPDATE ya existente).
-- El trigger registra cambios con privilegios del propietario, no del cliente.
CREATE OR REPLACE FUNCTION public.serpa_audit_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE old_row jsonb;new_row jsonb;org uuid;entity text;BEGIN
 old_row:=CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END;
 new_row:=CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END;
 org:=COALESCE((new_row->>'organization_id')::uuid,(old_row->>'organization_id')::uuid);
 entity:=COALESCE(new_row->>'id',old_row->>'id',new_row->>'user_id',old_row->>'user_id','');
 INSERT INTO public.audit_log(organization_id,actor_id,entity_type,entity_id,action,old_data,new_data)
 VALUES(org,auth.uid(),TG_TABLE_NAME,entity,TG_OP,old_row,new_row);
 RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END$$;
REVOKE ALL ON FUNCTION public.serpa_audit_trigger() FROM PUBLIC;
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['tasks','organization_members','team_events','task_checklist','task_dependencies'] LOOP EXECUTE format('DROP TRIGGER IF EXISTS serpa_audit ON public.%I',t);EXECUTE format('CREATE TRIGGER serpa_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.serpa_audit_trigger()',t);END LOOP;END$$;
