# V21.0 — Mobile Experience
Base: V20.1 BuildFix. Una sola aplicación y las mismas rutas, autenticación y datos.
- Navegación inferior móvil: Inicio, Tareas, Kanban, Agenda y Más (Gantt, Capacidad, Administración, cierre de sesión).
- Cabecera móvil con logo original y notificaciones; formularios táctiles, agenda vertical, tarjetas y desplazamiento local en Kanban/Gantt.
- Escritorio conserva su navegación; no hay migraciones SQL ni cambios de backend.
- CRM no existe como módulo en la base recibida; no se añade en esta fase. PWA instalable, caché y push quedan para fases posteriores.

## Despliegue y validación
Conservar las variables de entorno existentes. Ejecutar `npm install`, `npm run typecheck`, `npm run build`. Desplegar primero en Preview de Vercel. Probar anchos 320, 390, 430, 768 y 1440 px, Safari iOS y Chrome Android: login, recuperación, navegación, edición de tareas, cambio de estado Kanban, agenda, Gantt, administración y cierre de sesión. Confirmar permisos con cada rol y ausencia de desplazamiento horizontal global. No ejecutar migraciones nuevas. Promover a producción solo tras validar. Para revertir, volver al despliegue V20.1.

## SERPA Unified Development
Toda versión futura comparte rutas, componentes y lógica; comprobar escritorio y móvil antes de publicar. No duplicar base de datos. Mantener logo original y permisos existentes.

Validación local: no se pudo instalar dependencias desde caché; compilación y pruebas de navegador pendientes.
