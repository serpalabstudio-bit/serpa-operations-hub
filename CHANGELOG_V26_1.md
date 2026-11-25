# V26.1 — Bug Fix & UI Refinement
- Favicon blanco sobre negro: unifica PNG, ICO y PWA; referencias versionadas y elimina la convención app/icon.png que podía prevalecer sobre metadata.
- Avatar: RPC set_my_avatar restringida al usuario autenticado, miembro de organización y archivo propio existente; no concede escritura general en profiles.
- Mi perfil: dentro de nav, icono UserRound y estado activo.
- Tags: editor explícito con botón Añadir tag, Enter, eliminación y reutilización. Se persisten al guardar la tarea.
- IA: requiere OPENAI_API_KEY en Vercel Production y redeploy; no se incluye ninguna credencial. OPENAI_MODEL opcional.

Aplicar supabase/migrations/011_avatar_fix.sql después de 010. Desplegar el ZIP completo, eliminando app/icon.png del repositorio si se actualiza por copia. Validar en incógnito; los iconos de PWA instalada pueden requerir reinstalación. No se ha ejecutado SQL ni compilación completa en producción.
