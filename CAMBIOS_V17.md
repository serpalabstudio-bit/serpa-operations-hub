# SERPA Operations Hub v1.7

- Cabecera: usuario activo (nombre y email) y fecha de inicio + duración del plan desde `organization_settings`.
- Administración: edición de nombre y apellidos por miembro; sincroniza metadatos de Supabase Auth y `profiles.display_name`.
- Invitación: nombre, apellidos y correo obligatorios; rol `partner` y capacidad de 5 horas/semana asignados automáticamente.
- Los usuarios existentes pueden necesitar completar nombre y apellidos si anteriormente no estaban registrados.

## Requisitos

Mantener `SUPABASE_SERVICE_ROLE_KEY` en Vercel (solo servidor) y permisos adecuados sobre `organization_members` y `profiles`. No se necesitan tablas nuevas.

## Pruebas recomendadas

Iniciar sesión como administrador; comprobar los tres miembros; editar nombre; invitar a una cuenta de prueba; comprobar rol y 5 horas; modificar el plan y verificar la cabecera. No se ha verificado un despliegue de producción.
