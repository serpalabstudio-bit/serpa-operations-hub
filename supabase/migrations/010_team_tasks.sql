begin;
alter table public.tasks add column if not exists tags text[] not null default '{}';
alter table public.profiles add column if not exists avatar_path text;
create index if not exists tasks_tags_gin on public.tasks using gin(tags);
-- Private avatars, readable only by the owner or a teammate.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('team-avatars','team-avatars',false,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy avatar_read on storage.objects for select to authenticated using(bucket_id='team-avatars' and (split_part(name,'/',1)=auth.uid()::text or exists(select 1 from public.organization_members m where m.user_id::text=split_part(name,'/',1) and public.is_org_member(m.organization_id))));
create policy avatar_insert on storage.objects for insert to authenticated with check(bucket_id='team-avatars' and split_part(name,'/',1)=auth.uid()::text);
create policy avatar_update on storage.objects for update to authenticated using(bucket_id='team-avatars' and split_part(name,'/',1)=auth.uid()::text) with check(bucket_id='team-avatars' and split_part(name,'/',1)=auth.uid()::text);
create policy avatar_delete on storage.objects for delete to authenticated using(bucket_id='team-avatars' and split_part(name,'/',1)=auth.uid()::text);
create policy profile_self_insert on public.profiles for insert to authenticated with check(id=auth.uid());
-- Assign permanent labels to new members, without renumbering existing ones.
create or replace function public.assign_partner_label() returns trigger language plpgsql security definer set search_path='' as $$
declare n integer:=1; candidate text;
begin
 perform pg_advisory_xact_lock(hashtextextended(new.organization_id::text,0));
 if new.partner_label is null then
 loop candidate:='Socio '||case when n<=26 then chr(64+n) else n::text end;
 exit when not exists(select 1 from public.organization_members where organization_id=new.organization_id and partner_label=candidate); n:=n+1; end loop;
 new.partner_label:=candidate; end if; return new;
end $$;
drop trigger if exists assign_partner_label on public.organization_members;
create trigger assign_partner_label before insert on public.organization_members for each row execute function public.assign_partner_label();
-- Atomic removal: preserve history and release assigned tasks, never delete auth users.
create or replace function public.remove_team_member(p_org uuid,p_user uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_org::text,0));
 if not public.is_org_admin(p_org) or p_user=auth.uid() then raise exception 'Operación no autorizada'; end if;
 if not exists(select 1 from public.organization_members where organization_id=p_org and user_id=p_user) then raise exception 'Miembro no encontrado'; end if;
 update public.tasks set assigned_to=null where organization_id=p_org and assigned_to=p_user;
 delete from public.organization_members where organization_id=p_org and user_id=p_user;
end $$;
revoke all on function public.remove_team_member(uuid,uuid) from public,anon;
grant execute on function public.remove_team_member(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
