# Versión 2.0 — recuperación e invitaciones

1. Subir los archivos al repositorio original y comprobar el deploy.
2. Supabase Authentication → URL Configuration: Site URL = https://serpa-operations-hub.vercel.app (sin barra final). Añadir https://serpa-operations-hub.vercel.app/reset-password a Redirect URLs.
3. Authentication → Email Templates → Reset password: sustituir el cuerpo HTML por supabase/email-templates/recovery.html. Guardar.
4. Email Templates → Invite user: sustituir el cuerpo por supabase/email-templates/invite.html. Guardar.
5. Solicitar un correo NUEVO; los enlaces antiguos con code no son compatibles con este flujo. Probar en otro navegador, sin sesión previa, y verificar acceso con la nueva contraseña. Probar invitación con una cuenta de prueba.

No requiere migración SQL adicional respecto a 1.9. Mantener las variables privadas existentes. El token de un solo uso se verifica con verifyOtp; no se habilita el formulario por una sesión previa. No compartir enlaces de recuperación. La cuenta atrás local es orientativa (60 s tras éxito, o el plazo comunicado por Supabase); el servidor sigue aplicando sus límites. Si un filtro de correo consume enlaces de un solo uso, solicitar uno nuevo o revisar el proveedor de correo.
