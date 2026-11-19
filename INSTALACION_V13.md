# SERPA Operations Hub v1.3

## Cambios
- Favicon generado a partir del logotipo original transparente: `app/icon.png`, `public/favicon.ico` y `public/favicon.png`.
- En `Mis tareas`, máximo 10 tareas por página dentro de cada pestaña de estado, con botones Anterior/Siguiente y contador.
- Se mantiene el resto de la aplicación v1.2.

## Despliegue
1. Copia de seguridad del repositorio.
2. Descomprime el ZIP y sube los archivos a la raíz del repositorio GitHub original, conservando la estructura.
3. Haz commit y espera el despliegue del proyecto Vercel existente.
4. Comprueba el favicon (puede requerir recargar sin caché) y la paginación en cada pestaña de Mis tareas.

Esta actualización no necesita nuevas migraciones SQL. Para las funcionalidades de v1.2, deben estar aplicadas las migraciones anteriores correspondientes.

## Validación
Los archivos se generaron y se verificó su estructura; no se ha ejecutado `npm run build` en este entorno.
