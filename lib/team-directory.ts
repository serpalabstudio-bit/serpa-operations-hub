import type {SupabaseClient} from '@supabase/supabase-js';
export type TeamMember={user_id:string;role:string;weekly_capacity_hours:number;display_name:string;partner_label:string|null};
export async function loadTeam(client:SupabaseClient,org:string):Promise<TeamMember[]> {
 const {data,error}=await client.rpc('team_directory',{p_org:org});
 if(error)throw new Error('No se pudo cargar el directorio de socios: '+error.message);
 return ((data||[]) as TeamMember[]).map(m=>({...m,display_name:[m.partner_label,m.display_name?.trim()||'Nombre sin configurar'].filter(Boolean).join(' — ')}));
}
