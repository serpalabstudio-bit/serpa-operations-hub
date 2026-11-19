'use client';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import Shell from '../../components/shell';
import {supabase} from '../../lib/supabase';

type Status='todo'|'in_progress'|'blocked'|'done';
type Task={id:string;title:string;status:Status;due_date:string|null;estimated_hours:number};
const STATUS_OPTIONS:{value:Status;label:string}[]=[
  {value:'todo',label:'Pendientes'},
  {value:'in_progress',label:'En curso'},
  {value:'blocked',label:'Bloqueadas'},
  {value:'done',label:'Completadas'}
];
export default function Tasks(){
  const router=useRouter();
  const [tasks,setTasks]=useState<Task[]>([]);
  const [activeStatus,setActiveStatus]=useState<Status>('todo');
  const [title,setTitle]=useState('');
  const [hours,setHours]=useState('1');
  const [due,setDue]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [updatingId,setUpdatingId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const client=supabase();
  async function refresh(){
    const {data,error}=await client.from('tasks').select('id,title,status,due_date,estimated_hours').order('created_at',{ascending:false});
    if(error)setError(error.message);
    else {setTasks((data||[]) as Task[]);setError('');}
    setLoading(false);
  }
  useEffect(()=>{client.auth.getUser().then(({data})=>{if(!data.user)router.replace('/login');else void refresh()})},[]);
  const counts=useMemo(()=>Object.fromEntries(STATUS_OPTIONS.map(s=>[s.value,tasks.filter(t=>t.status===s.value).length])) as Record<Status,number>,[tasks]);
  const visibleTasks=useMemo(()=>tasks.filter(t=>t.status===activeStatus),[tasks,activeStatus]);
  async function add(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError('');
    try{
      const {data:{user}}=await client.auth.getUser();
      if(!user){router.replace('/login');return;}
      const {data:membership,error:memberError}=await client.from('organization_members').select('organization_id').eq('user_id',user.id).limit(1).single();
      if(memberError||!membership){setError(memberError?.message||'El usuario aún no pertenece a una organización.');return;}
      const {error}=await client.from('tasks').insert({organization_id:membership.organization_id,title,estimated_hours:Number(hours),due_date:due||null,created_by:user.id,status:'todo'});
      if(error)setError(error.message);
      else{setTitle('');setDue('');setActiveStatus('todo');await refresh();}
    }finally{setBusy(false);}
  }
  async function change(t:Task,status:Status){
    if(t.status===status)return;
    setError('');setUpdatingId(t.id);
    const {data,error}=await client.from('tasks').update({status}).eq('id',t.id).select('id,status').single();
    if(error)setError('No se pudo cambiar el estado: '+error.message);
    else if(!data)setError('No se pudo confirmar la actualización. Comprueba los permisos de la tarea.');
    else setTasks(prev=>prev.map(item=>item.id===t.id?{...item,status}:item));
    setUpdatingId(null);
  }
  return <Shell>
    <p className="eyebrow">EJECUCIÓN</p>
    <h1>Mis tareas · Equipo</h1>
    <p className="muted">Organiza el trabajo por estado. Los cambios se guardan en Supabase y las tareas se mueven automáticamente a su pestaña.</p>
    <div className="panel">
      <h2>Nueva tarea</h2>
      <form className="task-form" onSubmit={add}>
        <label>Título<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ej. Preparar demo de automatización"/></label>
        <label>Horas estimadas<input required min="0" step="0.25" type="number" value={hours} onChange={e=>setHours(e.target.value)}/></label>
        <label>Fecha límite<input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label>
        <button disabled={busy}>{busy?'Guardando…':'Guardar tarea'}</button>
      </form>
    </div>
    <div className="panel">
      <h2>Tareas registradas <span className="muted">({tasks.length})</span></h2>
      <div className="task-tabs" role="tablist" aria-label="Filtrar tareas por estado">
        {STATUS_OPTIONS.map(s=><button type="button" role="tab" aria-selected={activeStatus===s.value} className={'task-tab '+(activeStatus===s.value?'task-tab-active':'')} key={s.value} onClick={()=>setActiveStatus(s.value)}>{s.label} <span className="task-count">{counts[s.value]}</span></button>)}
      </div>
      {error&&<p className="error" role="alert">{error}</p>}
      {loading?<p className="muted">Cargando tareas…</p>:visibleTasks.length===0?<p className="muted task-empty">No hay tareas en «{STATUS_OPTIONS.find(s=>s.value===activeStatus)?.label}».</p>:visibleTasks.map(t=><div className="task-row" key={t.id}>
        <div><strong>{t.title}</strong><p className="muted">{t.estimated_hours} h · {t.due_date||'Sin fecha'}</p></div>
        <select aria-label={'Estado de '+t.title} value={t.status} disabled={updatingId===t.id} onChange={e=>void change(t,e.target.value as Status)}>
          {STATUS_OPTIONS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>)}
    </div>
  </Shell>;
}
