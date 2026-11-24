# v1.9
1. Copia de seguridad de Supabase. Ejecutar supabase/migrations/006_subtasks_notifications.sql en SQL Editor antes de desplegar.
2. Subir archivos al repositorio original y desplegar Vercel.
3. Crear una subtarea desde detalle, elegir tipo y asignar a otro socio. Entrar como ese socio: la campana se actualiza cada 15 segundos. Pulsar aviso abre detalle y marca leído.
Las subtareas son tareas reales y cuentan en las vistas existentes. Checklist anterior conservado. Un responsable por tarea. Al eliminar la principal las subtareas quedan independientes. Notificaciones internas, no email ni push. No se han probado compilación ni SQL contra producción.
