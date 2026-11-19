# SERPA v1.2 — Administración configurable

1. Realizar copia de seguridad de Supabase.
2. Ejecutar `supabase/migrations/005_org_settings_v12.sql` en SQL Editor con rol propietario, tras 001 y 004.
3. Subir los archivos del directorio `serpa-operations-hub` al repositorio GitHub existente, sin archivos `.env` secretos.
4. Confirmar que el despliegue se realiza en el proyecto Vercel original.
5. Entrar como administrador en Administración: editar fecha inicial, días y horas por socio; verificar como socio que solo puede consultar.
6. Revisar Dashboard, Gantt y Capacidad. Las tareas existentes no se modifican automáticamente al cambiar el horizonte.

El selector de 7/30 días del Dashboard sigue representando periodos retrospectivos; el nuevo valor del plan aparece como opción adicional. El Gantt muestra el horizonte configurado; las tareas fuera de ese rango no se reprograman.

Nota: no se ha validado contra la base de datos real del usuario.
