# V21.1 — BuildFix
- Reformateado app/admin/page.tsx con el impresor AST de TypeScript; validación de correo extraída del JSX conservando la expresión original.
- El archivo original era idéntico en V20.1 y V21.0 y no presentaba errores de análisis sintáctico con TypeScript. La causa exacta del error SWC de Vercel no está confirmada.
- Sin cambios SQL, autenticación ni diseño móvil.
- Validación: análisis sintáctico de todos los TS/TSX sin diagnósticos. Compilación Next.js y pruebas en Vercel pendientes.
- Desplegar en Preview antes de producción; conservar variables de entorno.
