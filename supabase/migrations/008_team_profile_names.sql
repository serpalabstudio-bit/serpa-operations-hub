-- Allow reading profile names only among members of the same organization.
-- Existing self-read and self-update policies remain unchanged.
begin;
drop policy if exists "profile shared organization read" on public.profiles;
create policy "profile shared organization read" on public.profiles
for select to authenticated using (
 exists (select 1 from public.organization_members m
 where m.user_id = profiles.id and public.is_org_member(m.organization_id))
);
commit;
