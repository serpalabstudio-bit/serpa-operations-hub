begin;
-- Narrow RPC: only the caller's own avatar path, no broad table write grants.
create or replace function public.set_my_avatar(p_path text) returns void
language plpgsql security definer set search_path='' as $$
declare uid uuid := auth.uid();
begin
 if uid is null or p_path is distinct from uid::text || '/avatar' then raise exception 'Avatar no autorizado'; end if;
 if not exists(select 1 from public.organization_members where user_id=uid) then raise exception 'Sin acceso a la organización'; end if;
 if not exists(select 1 from storage.objects where bucket_id='team-avatars' and name=p_path) then raise exception 'Archivo no encontrado'; end if;
 insert into public.profiles(id,avatar_path) values(uid,p_path)
 on conflict(id) do update set avatar_path=excluded.avatar_path;
end $$;
revoke all on function public.set_my_avatar(text) from public,anon;
grant execute on function public.set_my_avatar(text) to authenticated;
notify pgrst,'reload schema';
commit;
