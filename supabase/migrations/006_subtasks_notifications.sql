BEGIN;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'task' CHECK(task_type IN ('task','story','bug','research','improvement'));
CREATE INDEX IF NOT EXISTS tasks_parent_idx ON public.tasks(parent_task_id);
CREATE TABLE IF NOT EXISTS public.task_notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE, message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz);
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.task_notifications FROM anon, authenticated;
GRANT SELECT, UPDATE(read_at) ON public.task_notifications TO authenticated;
DROP POLICY IF EXISTS notification_read ON public.task_notifications;
CREATE POLICY notification_read ON public.task_notifications FOR SELECT TO authenticated USING(recipient_id=auth.uid() AND public.is_org_member(organization_id));
DROP POLICY IF EXISTS notification_update ON public.task_notifications;
CREATE POLICY notification_update ON public.task_notifications FOR UPDATE TO authenticated USING(recipient_id=auth.uid() AND public.is_org_member(organization_id)) WITH CHECK(recipient_id=auth.uid() AND public.is_org_member(organization_id));
CREATE OR REPLACE FUNCTION public.serpa_validate_parent() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
IF NEW.parent_task_id IS NOT NULL THEN
 IF NEW.parent_task_id=NEW.id OR NOT EXISTS(SELECT 1 FROM public.tasks p WHERE p.id=NEW.parent_task_id AND p.organization_id=NEW.organization_id AND p.parent_task_id IS NULL) OR EXISTS(SELECT 1 FROM public.tasks c WHERE c.parent_task_id=NEW.id) THEN RAISE EXCEPTION 'La subtarea debe pertenecer a una tarea principal de la misma organización'; END IF;
END IF;
IF TG_OP='UPDATE' THEN IF NEW.organization_id<>OLD.organization_id THEN RAISE EXCEPTION 'No se puede cambiar la organización'; END IF; END IF;
RETURN NEW; END $$;
DROP TRIGGER IF EXISTS serpa_validate_parent ON public.tasks;
CREATE TRIGGER serpa_validate_parent BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.serpa_validate_parent();
CREATE OR REPLACE FUNCTION public.serpa_notify_assignment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN
IF NEW.assigned_to IS NULL OR NEW.assigned_to=auth.uid() THEN RETURN NEW; END IF;
IF TG_OP='UPDATE' THEN IF NEW.assigned_to IS NOT DISTINCT FROM OLD.assigned_to THEN RETURN NEW; END IF; END IF;
IF EXISTS(SELECT 1 FROM public.organization_members m WHERE m.organization_id=NEW.organization_id AND m.user_id=NEW.assigned_to) THEN
INSERT INTO public.task_notifications(organization_id,recipient_id,task_id,message) VALUES(NEW.organization_id,NEW.assigned_to,NEW.id,'Te han asignado: '||NEW.title);
END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.serpa_notify_assignment() FROM PUBLIC;
DROP TRIGGER IF EXISTS serpa_notify_assignment ON public.tasks;
CREATE TRIGGER serpa_notify_assignment AFTER INSERT OR UPDATE OF assigned_to ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.serpa_notify_assignment();
NOTIFY pgrst, 'reload schema';
COMMIT;
