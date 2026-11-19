# SERPA Operations Hub · MVP fase 1

Aplicación Next.js + Supabase para los tres socios de SERPA Lab Studio.

## Estado
Código inicial implementado: login con Supabase Auth, dashboard de tareas reales, alta de tareas, cambio de estado, esquema PostgreSQL con RLS y tabla de distribución semanal de horas. **No se ha desplegado ni probado contra el Supabase real.** Gantt, CRM, importación Excel, permisos de colaboradores granulares y otros módulos siguen pendientes.

## Instalación
1. Instala Node.js 20+.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env.local` y sustituye la clave pública. Nunca uses `service_role` ni `secret` en `NEXT_PUBLIC_*`.
4. En Supabase SQL Editor ejecuta `supabase/migrations/001_initial.sql` (en un proyecto nuevo, o revisando previamente conflictos).
5. En Supabase Authentication > Users crea/invita a los socios (no compartir contraseñas).
6. Crea una organización desde SQL Editor y vincula al primer socio como admin usando las instrucciones comentadas al final de la migración. Añade los otros dos socios como `partner` con sus UUID de Auth.
7. Ejecuta `npm run dev` y abre http://localhost:3000.
8. Para Vercel, importa el repositorio y configura las dos variables de entorno públicas.

## Seguridad
La clave pública es apta para frontend; la seguridad depende de RLS. No uses estas tablas sin ejecutar y revisar las políticas. El bootstrap SQL debe ejecutarlo un administrador en el editor de Supabase. Para producción se requiere auditoría de autorización, políticas de actualización más estrictas y pruebas multiusuario.

## Plan de desarrollo siguiente
- Importar el Excel real de 90 días, con previsualización y deduplicación.
- Asignación por socio y carga semanal con alertas >5 horas.
- Gantt, hitos, dependencias y dashboard ampliado.
- CRM y registro de contactos y reuniones.

## Actualización 0.2 — planificación real
El Excel recibido contiene 41 tareas y 12 hitos. Sus datos se conservaron en `data/gantt-source.json`.

1. Configura la clave pública en `.env.local` (el identificador del proyecto **no** es una API key).
2. Ejecuta `001_initial.sql` y crea la organización con el primer administrador.
3. Ejecuta `002_import_gantt.sql` en Supabase SQL Editor. Es idempotente por `source_key`; no sobrescribe modificaciones posteriores.
4. Abre `/gantt` para visualizar las tareas persistidas y filtrar por socio.

Las etiquetas `Socio A/B/C` importadas aún no son UUID de usuarios; asigna las identidades reales antes de automatizar el reparto. Los valores `#VALUE!` de la hoja semanal se excluyeron.
El Gantt 0.2 es **solo lectura**; arrastrar y editar barras, dependencias y CRM siguen pendientes. No hay conexión verificada ni despliegue automático.
Vercel: nombre sugerido `serpabusiness`, sujeto a disponibilidad. Añade las dos variables de `.env.example` en el panel de Vercel.
Actualización de despliegue SERPA Operations Hub v0.6


## Configuración recibida (18/11/2026)
La URL de Supabase y clave **publishable** están configuradas localmente en `.env.local`, excluido del ZIP y Git por seguridad operativa. En Vercel configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` usando los valores facilitados. La URL `serpabusiness.vercel.app` está sujeta a disponibilidad y todavía no está desplegada.
