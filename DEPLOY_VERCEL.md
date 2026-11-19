# SERPA Operations Hub — instalación y despliegue

## 1. Supabase

1. En Authentication → Users, verifica que existen `serpalabstudio@gmail.com`, `info@pacomaldonado.net` y `musikdiggin@gmail.com`. Invita a los que falten. La aplicación actual utiliza acceso con contraseña; los invitados deben completar su alta y establecer una contraseña mediante el flujo de Supabase (puede requerir configurar recuperación/confirmación en Auth).
2. En SQL Editor, ejecuta `supabase/migrations/003_assign_partners.sql` **solo después** de las migraciones 001 y 002 y de la creación de la organización. El script se detiene si falta un usuario o si no encuentra las 41 tareas con responsable conocido.
3. Revisa las dos consultas de verificación al final del script: 3 socios, 41 tareas asignadas. Las 12 filas de hitos permanecen sin cambios.
4. En Authentication → URL Configuration, establece Site URL a la URL final de Vercel y añade `https://serpabusiness.vercel.app/**` a Redirect URLs si ese nombre queda disponible. Añade también `http://localhost:3000/**` para pruebas locales. No presupongas que el subdominio está libre.

## 2. GitHub y Vercel

1. Descomprime el ZIP y sube el contenido de la carpeta `serpa-operations-hub/` a la **raíz** del repositorio privado que conectes a Vercel. No subas `.env.local`.
2. Vercel → Add New → Project → Import Git Repository. Framework: Next.js; Root Directory: `./` si la carpeta interna se ha colocado en la raíz; si no, selecciona `serpa-operations-hub`.
3. En Project Settings → Environment Variables, añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ezcypmrvevuvgvcapbkr.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = clave pública `sb_publishable_...` facilitada anteriormente.
   Aplica las variables a Production y Preview si procede. Nunca añadas una clave secreta a `NEXT_PUBLIC_*`.
4. Pulsa Deploy. Si ya existía un despliegue, realiza Redeploy tras añadir variables. Abre la URL efectiva que muestre Vercel, no una dirección supuesta.
5. Ajusta Supabase Authentication → URL Configuration a la URL efectiva publicada.

## 3. Comprobaciones

- Los tres usuarios pueden iniciar sesión por separado.
- El dashboard, tareas y Gantt cargan registros reales de Supabase.
- Un socio modifica una tarea y otro ve el cambio tras recargar.
- Revisa los logs de Vercel si falla la compilación.

## Limitaciones conocidas del MVP

Gantt de solo lectura; no existe CRM completo, reparto automático semanal ni flujo completo de invitación/reinicio de contraseña dentro de la app. No se ha verificado la compilación ni el despliegue real contra el proyecto remoto. Las políticas RLS permiten edición compartida a los socios; auditar antes de producción con datos sensibles.
