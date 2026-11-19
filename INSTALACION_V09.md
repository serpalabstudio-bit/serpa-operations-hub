# SERPA Operations Hub v0.9 — Instalación

1. Guardar copia del repositorio y, antes de SQL, hacer backup de Supabase.
2. Ejecutar **supabase/migrations/004_operations_v09.sql** en SQL Editor del proyecto Supabase correcto, con un usuario propietario. No volver a ejecutar 001/002.
3. Subir al repositorio GitHub ORIGINAL el contenido de esta carpeta (no la carpeta contenedora). No subir .env ni secretos.
4. Confirmar que el despliegue ocurre en el proyecto Vercel ORIGINAL y revisar sus variables de entorno.
5. Validar con el administrador y con cada socio: Kanban, tareas, comentarios, checklist, agenda, capacidad, Gantt y permisos.

## Nuevas páginas
- `/kanban`: arrastrar tarjetas o cambiar estado desde selector.
- `/capacity`: carga estimada por socio/semana. El administrador puede modificar la capacidad semanal.
- `/gantt`: escala dinámica, color por estado, progreso, fecha actual, filtros y dependencias (sin replanificación automática).
- `/agenda`: eventos de equipo y tareas con vencimiento. Sin sincronización externa.
- `/admin`: roles y registro de auditoría para administradores.
- `/tasks`: comentarios y checklist en el detalle.

## Alcance y limitaciones
- La planificación de capacidad es una aproximación a partir de horas estimadas; no son partes de horas reales.
- Las dependencias se guardan, se muestran y se comprueba ausencia de ciclos desde el cliente; para garantías ante escrituras concurrentes conviene validación adicional en servidor.
- El registro de auditoría comienza con la ejecución de 004, no recupera cambios históricos.
- No se han implementado adjuntos, edición enriquecida, invitaciones desde la app, hitos específicos ni sincronización con Google Calendar.
- No se han probado los permisos en vuestra instancia real de Supabase ni un build de producción (entorno sin dependencias npm instaladas).
- Si el usuario es miembro de varias organizaciones, esta versión toma la primera; se recomienda selector de organización en futura iteración.
