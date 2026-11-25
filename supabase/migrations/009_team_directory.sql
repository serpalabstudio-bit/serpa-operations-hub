begin;
alter table public.organization_members add column if not exists partner_label text;
-- Preserve original mapping from migration 003; never reassign tasks or roles.
update public.organization_members m set partner_label = x.label
from auth.users u, public.organizations o, (values
 ('serpalabstudio@gmail.com','Socio A'),('info@pacomaldonado.net','Socio B'),('musikdiggin@gmail.com','Socio C')) x(email,label)
where m.user_id=u.id and m.organization_id=o.id and o.name='SERPA Lab Studio'
 and lower(u.email)=x.email and m.partner_label is null;
create or replace function public.team_directory(p_org uuid)
returns table(user_id uuid, role text, weekly_capacity_hours numeric, display_name text, partner_label text)
language sql stable security definer set search_path='' as $$
 select m.user_id,m.role,m.weekly_capacity_hours,
 coalesce(nullif(btrim(p.display_name),''),nullif(btrim(concat_ws(' ',u.raw_user_meta_data->>'first_name',u.raw_user_meta_data->>'last_name')),''),nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(btrim(u.raw_user_meta_data->>'name'),'')),m.partner_label
 from public.organization_members m join auth.users u on u.id=m.user_id
 left join public.profiles p on p.id=m.user_id
 where m.organization_id=p_org and public.is_org_member(p_org)
 order by m.partner_label nulls last,m.user_id;
$$;
revoke all on function public.team_directory(uuid) from public, anon;
grant execute on function public.team_directory(uuid) to authenticated;
commit;
-- Administrative verification (SQL Editor only):
select m.user_id,m.partner_label,p.display_name,u.raw_user_meta_data->>'first_name' as first_name,u.raw_user_meta_data->>'last_name' as last_name
from public.organization_members m join public.organizations o on o.id=m.organization_id join auth.users u on u.id=m.user_id left join public.profiles p on p.id=m.user_id where o.name='SERPA Lab Studio' order by m.partner_label;
