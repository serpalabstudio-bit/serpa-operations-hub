import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

export const runtime='nodejs';
function fail(message:string,status=400){return NextResponse.json({error:message},{status});}
async function authorize(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!publicKey||!secret)throw new Error('Falta la configuración de Supabase para consultar y modificar correos. Comprueba NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y SUPABASE_SERVICE_ROLE_KEY en Vercel.');
 const token=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
 if(!token)throw new Error('Sesión no válida.');
 const auth=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await auth.auth.getUser(token);
 if(error||!user)throw new Error('Sesión caducada.');
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:members,error:memberError}=await admin.from('organization_members').select('organization_id').eq('user_id',user.id).eq('role','admin').limit(1);
 if(memberError)throw new Error('No se pudo comprobar el rol en organization_members: '+memberError.message+'. Comprueba que SUPABASE_SERVICE_ROLE_KEY corresponda al mismo proyecto que NEXT_PUBLIC_SUPABASE_URL.');
 if(!members?.length)throw new Error('La cuenta autenticada no figura como administrador en organization_members. Comprueba el rol de este usuario en Supabase.');
 return {admin,org:members[0].organization_id,url,publicKey};
}
async function emailsForOrg(admin:Awaited<ReturnType<typeof authorize>>['admin'],org:string){
 const {data:members,error}=await admin.from('organization_members').select('user_id').eq('organization_id',org);
 if(error)throw new Error(error.message);
 const ids=new Set((members||[]).map(m=>m.user_id));
 const result:{user_id:string;email:string}[]=[];
 let page=1;
 while(true){
  const {data,error:listError}=await admin.auth.admin.listUsers({page,perPage:200});
  if(listError)throw new Error(listError.message);
  for(const u of data.users)if(ids.has(u.id))result.push({user_id:u.id,email:u.email||''});
  if(data.users.length<200)break;
  page++;
 }
 return result;
}
export async function GET(request:NextRequest){
 try{const {admin,org}=await authorize(request);return NextResponse.json({users:await emailsForOrg(admin,org)});}catch(e){return fail(e instanceof Error?e.message:'Error de consulta',403);}
}
export async function POST(request:NextRequest){
 try{
  const {admin,org,url,publicKey}=await authorize(request);
  const body=await request.json() as {action?:string;userId?:string;email?:string;role?:string};
  const email=String(body.email||'').trim().toLowerCase();
  const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(body.action==='invite'){
   if(!validEmail)return fail('Introduce un correo válido.');
   const role=['admin','partner','collaborator'].includes(body.role||'')?body.role:'partner';
   const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:new URL('/reset-password',request.nextUrl.origin).toString()});
   if(error)return fail(error.message);
   if(!data.user)return fail('No se ha podido crear la invitación.');
   const {error:memberError}=await admin.from('organization_members').insert({organization_id:org,user_id:data.user.id,role,weekly_capacity_hours:5});
   if(memberError)return fail('La invitación se ha enviado, pero no se pudo añadir a la organización: '+memberError.message);
   return NextResponse.json({message:'Invitación enviada. El usuario se ha incorporado al equipo.'});
  }
  if(!body.userId)return fail('Falta el usuario.');
  const {data:membership,error:memberError}=await admin.from('organization_members').select('user_id').eq('organization_id',org).eq('user_id',body.userId).maybeSingle();
  if(memberError||!membership)return fail('El usuario no pertenece a esta organización.',403);
  if(body.action==='change_email'){
   if(!validEmail)return fail('Introduce un correo válido.');
   const {error}=await admin.auth.admin.updateUserById(body.userId,{email});
   if(error)return fail(error.message);
   return NextResponse.json({message:'Correo electrónico actualizado. El usuario deberá utilizar el nuevo correo para acceder.'});
  }
  if(body.action==='reset_password'){
   const users=await emailsForOrg(admin,org);
   const current=users.find(u=>u.user_id===body.userId);
   if(!current?.email)return fail('El usuario no tiene un correo electrónico registrado.');
   const auth=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
   const {error}=await auth.auth.resetPasswordForEmail(current.email,{redirectTo:new URL('/reset-password',request.nextUrl.origin).toString()});
   if(error)return fail(error.message);
   return NextResponse.json({message:'Se ha solicitado el envío del correo para restablecer la contraseña.'});
  }
  return fail('Acción no reconocida.');
 }catch(e){return fail(e instanceof Error?e.message:'Error del servidor',403);}
}
