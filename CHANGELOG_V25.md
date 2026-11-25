# V25.0 — UX & Usability
Base: V24.0. Mobile shell with separate scrollable main and bottom navigation row; native modal for task details and editing, including subtasks, comments and checklist. Kanban, notifications, Gantt and agenda deep-link to the task modal on the Tasks page. Names use profile display_name; missing names are explicitly marked with a short ID rather than a fabricated partner letter.

## Deployment
1. Back up the current repository and database. Apply `supabase/migrations/008_team_profile_names.sql` in Supabase SQL Editor. It adds a read-only policy for profiles of members of shared organizations; it does not change existing records or update permissions.
2. Deploy this source to Vercel Preview, keeping existing environment variables. Verify build and login. In Administration, fill in missing first and last names if needed.
3. Verify with two different accounts that team names are visible and unrelated organizations remain inaccessible. Test task details, edit, close, comments and checklist, including links from Kanban, Gantt, agenda and notifications. Test long and short pages, rotation, keyboard, and safe areas on iOS and Android. Promote only after validation.

No new dependencies or environment variables. No production changes made here. TypeScript transpilation syntax check and service worker syntax check only; full build, database policy execution and device tests pending.
