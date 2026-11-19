# SERPA Operations Hub v1.5 — Administración UX

- Correo electrónico actual visible como valor editable del campo, cuando la API administrativa lo devuelve.
- Botón «Guardar email» activo únicamente cuando se cambia por una dirección válida.
- Reorganización en tarjetas por miembro: identidad, correo y recuperación, horas semanales y permisos.
- Acciones alineadas con sus respectivos campos, diseño adaptable a móvil.
- No requiere migraciones SQL adicionales.

**Si aparece «Correo no disponible»**, comprobar la respuesta de `/api/admin/users`, que el usuario es administrador y que `SUPABASE_SERVICE_ROLE_KEY` está configurada en el servidor de Vercel. No se inventan direcciones ni se usan datos de prueba.
