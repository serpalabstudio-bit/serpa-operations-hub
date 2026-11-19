# SERPA Operations Hub v0.8
- Crear tareas con título, descripción, estado, asignación, fechas y horas.
- Editar tareas existentes y consultar todos sus datos.
- Cambiar estado desde el listado; la tarea se mueve a su pestaña al confirmarse el cambio.
- Gantt: colores diferenciados y leyenda para los cuatro estados.
- Fecha de creación visible y preservada como dato de auditoría (no editable desde la interfaz).
- Los nombres de socios proceden de profiles.display_name si están disponibles; de lo contrario se muestra Socio A/B/C según el orden recibido.
- No requiere migraciones nuevas si ya existe el esquema 001_initial.sql.
- Para operaciones INSERT/UPDATE se requieren privilegios SQL y políticas RLS vigentes.
