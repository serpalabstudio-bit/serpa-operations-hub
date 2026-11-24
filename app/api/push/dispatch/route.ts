import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import webpush from 'web-push';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return new NextResponse(null,{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY, pub=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv=process.env.VAPID_PRIVATE_KEY, subject=process.env.VAPID_SUBJECT;
 if(!url||!key||!pub||!priv||!subject)return NextResponse.json({error:'Configuración push incompleta'},{status:503});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 webpush.setVapidDetails(subject,pub,priv);
 const since=new Date(Date.now()-48*3600000).toISOString();
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const tomorrow=new Date(Date.parse(today+'T12:00:00Z')+86400000).toISOString().slice(0,10);
 const [subs,notices,tasks,members]=await Promise.all([
 db.from('push_subscriptions').select('*'),db.from('task_notifications').select('id,recipient_id,organization_id').gte('created_at',since).is('read_at',null),
 db.from('tasks').select('id,assigned_to,organization_id,due_date').neq('status','done').lte('due_date',tomorrow).not('assigned_to','is',null),db.from('organization_members').select('user_id,organization_id')]);
 if(subs.error||notices.error||tasks.error||members.error)return NextResponse.json({error:'Error consultando avisos'},{status:500});
 let sent=0,failed=0;
 for(const s of subs.data||[]){
 const allowed=new Set((members.data||[]).filter(m=>m.user_id===s.user_id).map(m=>m.organization_id));
 const events:{key:string;body:string}[]=[];
 if(s.assignments)for(const n of notices.data||[])if(n.recipient_id===s.user_id&&allowed.has(n.organization_id))events.push({key:'assignment:'+n.id,body:'Tienes una nueva asignación pendiente.'});
 if(s.reminders)for(const t of tasks.data||[])if(t.assigned_to===s.user_id&&allowed.has(t.organization_id))events.push({key:`due:${t.id}:${t.due_date}:${t.due_date<today?'late':t.due_date===today?'today':'soon'}`,body:t.due_date<today?'Tienes una tarea vencida.':'Tienes una tarea próxima a vencer.'});
 for(const e of events){
 const claim=await db.from('push_deliveries').insert({endpoint:s.endpoint,event_key:e.key});
 if(claim.error){if(claim.error.code!=='23505')failed++;continue;}
 try{const sub=s.subscription as webpush.PushSubscription;const target=new URL(sub.endpoint);if(sub.endpoint!==s.endpoint||target.protocol!=='https:'||!['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com','wns.windows.com'].some(h=>target.hostname===h||target.hostname.endsWith('.'+h)))throw new Error('Endpoint no permitido');await webpush.sendNotification(sub,JSON.stringify({title:'SERPA Operations HUB',body:e.body,url:'/tasks'}),{TTL:3600,timeout:5000});sent++;}
 catch(err){const status=(err as {statusCode?:number}).statusCode;if(status===404||status===410){await db.from('push_subscriptions').delete().eq('endpoint',s.endpoint);break;}await db.from('push_deliveries').delete().eq('endpoint',s.endpoint).eq('event_key',e.key);failed++;}
 }
 }
 return NextResponse.json({sent,failed},{status:failed?502:200});
}
