# V22.0 — PWA instalable
Base: V21.1 BuildFix. Sin cambios en Supabase, autenticación ni lógica de negocio.

- Manifest, iconos derivados del icono original, modo standalone y metadatos Apple.
- Service worker: navegación por red, página pública de contingencia sin conexión; no guarda páginas privadas ni respuestas API.
- Aviso de instalación cuando el navegador lo permite; instrucciones para iOS.
- Detección de cambios del service worker y actualización voluntaria para evitar perder formularios. En futuras versiones incrementar la constante CACHE de public/sw.js junto con package.json y la etiqueta visible. Los despliegues web se reciben por red al volver a cargar.
- Sin edición offline, sincronización en segundo plano ni push (fase posterior).

## Despliegue
Subir el paquete al repositorio existente, conservar variables de entorno y desplegar primero en Preview de Vercel por HTTPS. No ejecutar SQL. Probar login, recuperación de contraseña, navegación y cierre de sesión. Android Chrome: menú Instalar aplicación; iOS Safari: Compartir > Añadir a pantalla de inicio. Abrir desde el icono y verificar modo independiente. En modo avión recargar y comprobar la página offline; reconectar y reintentar. Para probar actualizaciones, desplegar otra versión con CACHE incrementada en el mismo origen y verificar aviso y recarga. Preview y producción son orígenes distintos: instalar desde producción tras validar.

## Validación
19 archivos TS/TSX sin errores sintácticos mediante parser TypeScript; JavaScript comprobado con node --check. Compilación Next.js y pruebas físicas pendientes: dependencias npm no disponibles en caché local. No se ha desplegado a producción.
