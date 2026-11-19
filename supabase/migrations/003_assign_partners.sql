-- SERPA Operations Hub: asignación definitiva, idempotente.
-- Ejecutar desde SQL Editor tras invitar a los tres usuarios en Authentication.
BEGIN;
DO $$
DECLARE
  v_org uuid;
  v_a uuid;
  v_b uuid;
  v_c uuid;
  v_total integer;
  v_unknown integer;
BEGIN
  SELECT id INTO STRICT v_org FROM public.organizations WHERE name='SERPA Lab Studio';
  SELECT id INTO v_a FROM auth.users WHERE lower(email)='serpalabstudio@gmail.com';
  SELECT id INTO v_b FROM auth.users WHERE lower(email)='info@pacomaldonado.net';
  SELECT id INTO v_c FROM auth.users WHERE lower(email)='musikdiggin@gmail.com';
  IF v_a IS NULL OR v_b IS NULL OR v_c IS NULL THEN
    RAISE EXCEPTION 'Faltan usuarios en Authentication: verifica las tres cuentas antes de continuar';
  END IF;
  IF v_a=v_b OR v_a=v_c OR v_b=v_c THEN
    RAISE EXCEPTION 'Los tres socios necesitan cuentas distintas';
  END IF;
  SELECT count(*), count(*) FILTER (WHERE source_owner_label NOT IN ('Socio A','Socio B','Socio C') OR source_owner_label IS NULL)
    INTO v_total,v_unknown
  FROM public.tasks WHERE organization_id=v_org AND source_key ~ '^T[0-9]+$';
  IF v_total<>41 OR v_unknown<>0 THEN
    RAISE EXCEPTION 'Plan inesperado: % tareas, % responsables desconocidos. Revisar antes de asignar',v_total,v_unknown;
  END IF;
  INSERT INTO public.organization_members (organization_id,user_id,role,weekly_capacity_hours)
  VALUES (v_org,v_a,'admin',5),(v_org,v_b,'partner',5),(v_org,v_c,'partner',5)
  ON CONFLICT (organization_id,user_id) DO UPDATE
  SET role=EXCLUDED.role,weekly_capacity_hours=EXCLUDED.weekly_capacity_hours;
  UPDATE public.tasks
  SET assigned_to=CASE source_owner_label WHEN 'Socio A' THEN v_a WHEN 'Socio B' THEN v_b WHEN 'Socio C' THEN v_c END,
      updated_at=now()
  WHERE organization_id=v_org AND source_key ~ '^T[0-9]+$'
    AND assigned_to IS DISTINCT FROM CASE source_owner_label WHEN 'Socio A' THEN v_a WHEN 'Socio B' THEN v_b WHEN 'Socio C' THEN v_c END;
END $$;
COMMIT;
-- Verificación: tres miembros, 41 tareas asignadas y 12 hitos (sin modificar datos)
SELECT u.email, m.role, m.weekly_capacity_hours,
       count(t.id) AS tareas_asignadas
FROM public.organization_members m
JOIN public.organizations o ON o.id=m.organization_id
JOIN auth.users u ON u.id=m.user_id
LEFT JOIN public.tasks t ON t.organization_id=m.organization_id AND t.assigned_to=m.user_id AND t.source_key ~ '^T[0-9]+$'
WHERE o.name='SERPA Lab Studio'
GROUP BY u.email,m.role,m.weekly_capacity_hours ORDER BY u.email;
SELECT count(*) AS tareas_importadas,
       count(*) FILTER (WHERE assigned_to IS NOT NULL) AS tareas_asignadas
FROM public.tasks WHERE source_key ~ '^T[0-9]+$'
  AND organization_id IN (SELECT id FROM public.organizations WHERE name='SERPA Lab Studio');
