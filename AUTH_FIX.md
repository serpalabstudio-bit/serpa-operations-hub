# SERPA Operations Hub — reparación de acceso

1. Sube los archivos actualizados al repositorio de GitHub y espera a que Vercel muestre **Ready**.
2. En Supabase > Authentication > URL Configuration establece una URL de producción estable como Site URL y añade `https://TU-DOMINIO/**` en Redirect URLs. Añade explícitamente `https://TU-DOMINIO/reset-password` si prefieres rutas exactas.
3. Abre `https://TU-DOMINIO/reset-password` y solicita recuperación para `serpalabstudio@gmail.com`.
4. Abre **el correo más reciente**. El enlace debe volver a `/reset-password`, donde podrás elegir una contraseña nueva.
5. Inicia sesión desde `/login`.

El flujo admite enlaces PKCE con `code`, enlaces `token_hash` de recuperación/invitación y sesiones del flujo implícito. Los enlaces caducados requieren un correo nuevo. No compartas contraseñas ni tokens.

**Importante:** si el correo de invitación original redirige a `/` en lugar de `/reset-password`, utiliza la nueva función de recuperación después del despliegue. Si el proveedor de correo limita el envío, espera o configura SMTP.

Este cambio solo afecta al frontend y no requiere nuevas migraciones SQL.
