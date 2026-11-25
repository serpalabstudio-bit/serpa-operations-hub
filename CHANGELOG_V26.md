# V26.0 — Team, Tasks & Intelligence
Base V25.1. Apply migration 010 after 009 before deploying. No new npm dependencies.
- Original icon silhouette white on black, including PWA icons.
- Task tags stored as text arrays; comma-separated, trimmed, lowercase and deduplicated. Search and combined owner/type/tag filters; dashboard tag segmentation.
- Own profile photo (JPEG/PNG/WebP up to 2 MB), private Storage bucket, signed URL in header. Existing names preserved.
- Admin can remove another member atomically; tasks become unassigned, historical time allocations and auth account retained. New invitations are partners with 5 h/week and automatically assigned available label (vacant labels can be reused). Capacity is calculated from current members; no automatic reassignment.
- AI: OPENAI_API_KEY required in Vercel Production; OPENAI_MODEL optional, default gpt-4.1-mini; provider errors differentiated. Redeploy after environment changes. API billing separate.
- Validation: TypeScript syntax and service worker syntax only; full build, database migration and live device/API tests pending. Apply migration once; do not rerun policies blindly.
