# SERPA Operations Hub v1.4 — Gestión de usuarios

## Qué incorpora
- Administración: consulta del correo asociado a cada miembro.
- Cambio de correo asociado mediante Supabase Auth Admin API.
- Invitación por correo, con alta del usuario en `organization_members`.
- Envío de correo de restablecimiento de contraseña.
- Conserva configuración del plan, horas por socio, roles y auditoría.

## Configuración obligatoria en Vercel
1. En Supabase Dashboard > Project Settings > API Keys, localiza la clave secreta `service_role` (legacy secret) del proyecto. NO utilices la clave pública ni la compartas.
2. En Vercel > proyecto original > Settings > Environment Variables, crea `SUPABASE_SERVICE_ROLE_KEY` con esa clave, solo en el entorno servidor. No antepongas `NEXT_PUBLIC_`.
3. Despliega de nuevo la aplicación.
4. En Supabase > Authentication > URL Configuration, configura Site URL y Allowed Redirect URLs para `https://serpa-operations-hub.vercel.app/reset-password` (y los dominios adicionales que uses).
5. Configura SMTP en Supabase Authentication si necesitas entregabilidad fiable de invitaciones y restablecimientos. Los límites por defecto pueden impedir algunos envíos.

## Seguridad y funcionamiento
- La clave privada se utiliza exclusivamente en la ruta de servidor `/api/admin/users` y nunca se envía al navegador.
- Cada petición valida el token de sesión y comprueba el rol `admin` en `organization_members` antes de consultar o modificar cuentas.
- La lista de correos se limita a miembros de la organización del administrador.
- El cambio de email mediante Admin API es directo, no un flujo de confirmación por el usuario. Confirma la dirección antes de guardarla.
- Si la invitación se envía pero falla el alta en `organization_members`, la pantalla mostrará el error. Corrige la pertenencia antes de reenviar.
- La tabla `organization_settings` y la auditoría requieren las migraciones 004 y 005 de las versiones anteriores; esta versión no modifica el esquema SQL.

## Instalación
Sube todos los archivos del ZIP al repositorio GitHub original, manteniendo la estructura. Configura la variable privada en Vercel y despliega. No subas archivos `.env.local` ni claves privadas a GitHub.
