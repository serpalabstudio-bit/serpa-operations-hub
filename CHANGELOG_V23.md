# V23.0 — Mobile Notifications (primera entrega)

Base V22. Añade suscripciones por dispositivo, preferencias de asignaciones y vencimientos, Web Push y envío diario mediante Vercel Cron (08:00 UTC, 09:00/10:00 España peninsular). No es envío instantáneo. Reuniones, hitos y aviso al anterior responsable quedan pendientes. Los mensajes no contienen títulos de tareas. La campana existente se conserva.

## Instalación
1. En Supabase SQL Editor ejecutar `supabase/migrations/007_web_push.sql` una sola vez. No elimina datos.
2. Generar claves con `npx web-push generate-vapid-keys` en un entorno de confianza. Configurar en Vercel `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto de contacto real) y `CRON_SECRET` (aleatorio largo). Conservar las claves entre versiones. Mantener `SUPABASE_SERVICE_ROLE_KEY` existente exclusivamente en servidor.
3. Subir código y desplegar. Cron de Vercel se ejecuta en producción; verificar disponibilidad y límites del plan. No publicar secretos en GitHub.
4. Abrir PWA, actualizar, abrir campana y activar avisos. En iOS 16.4+ desde la PWA instalada. Probar con dos usuarios, asignar una tarea a otro usuario, dejarla sin leer y ejecutar el cron autorizado o esperar al horario. Probar vencimientos, desactivación y cierre de sesión.
5. Para prueba manual, invocar GET /api/push/dispatch con Authorization: Bearer <CRON_SECRET> desde un cliente seguro. No compartir el secreto.

## Límites
Sin compilación completa ni prueba real de Supabase/Vercel/dispositivos en este entorno. La consulta usa límites por defecto de Supabase y el diseño está orientado al equipo pequeño; ampliar paginación y cola antes de escalar. Los avisos de asignación no leídos se consultan durante 48 h; deduplicación por dispositivo y evento. La entrega depende del proveedor y del dispositivo. Si un envío falla se reintenta en la siguiente ejecución mientras siga elegible. El cierre de sesión intenta desactivar la suscripción del dispositivo.
