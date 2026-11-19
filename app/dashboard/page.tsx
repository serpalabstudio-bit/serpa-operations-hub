'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {AlertTriangle,ArrowUpRight,CalendarDays,CheckCircle2,Clock3,ListTodo,Plus,Target,Users} from 'lucide-react';
import Shell from '../../components/shell';
import {iso,STATUSES,useWorkspace} from '../../lib/workspace';

type EventRow={id:string;event_date:string;title:string};
const addDays=(date:Date,days:number)=>{const d=new Date(date);d.setDate(d.getDate()+days);return d;};
const fmt=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'});
export default function Dashboard(){
 const w=useWorkspace();const [period,setPeriod]=useState(90);const [owner,setOwner]=useState('all');const [events,setEvents]=useState<EventRow[]>([]);const [eventsError,setEventsError]=useState('');
 const today=iso(new Date());const monday=addDays(new Date(),-((new Date().getDay()+6)%7));const weekStart=iso(monday);const weekEnd=iso(addDays(monday,6));
 useEffect(()=>{if(!w.org)return;let cancelled=false;(async()=>{const {data,error}=await w.client.from('team_events').select('id,event_date,title').eq('organization_id',w.org).gte('event_date',weekStart).lte('event_date',weekEnd).order('event_date');if(cancelled)return;if(error){setEventsError('No se pudieron consultar los eventos de la agenda.');setEvents([]);}else{setEventsError('');setEvents((data||[]) as EventRow[]);}})();return()=>{cancelled=true};},[w.client,w.org,weekStart,weekEnd]);
 const from=iso(addDays(new Date(),-(period-1)));
 // El filtro temporal aplica a la fecha de creación. Las tareas activas previas siguen visibles en las alertas globales.
 const filtered=useMemo(()=>w.tasks.filter(t=>(owner==='all'||t.assigned_to===owner)&&t.created_at.slice(0,10)>=from&&t.created_at.slice(0,10)<=today),[w.tasks,owner,from,today]);
 const allOwned=useMemo(()=>w.tasks.filter(t=>owner==='all'||t.assigned_to===owner),[w.tasks,owner]);
 const counts=Object.fromEntries(STATUSES.map(s=>[s.value,filtered.filter(t=>t.status===s.value).length]));
 const done=counts.done||0;const total=filtered.length;const progress=total?Math.round(done/total*100):0;
 const overdue=allOwned.filter(t=>t.status!=='done'&&t.due_date&&t.due_date<today);
 const blocked=allOwned.filter(t=>t.status==='blocked');
 const unassigned=allOwned.filter(t=>t.status!=='done'&&!t.assigned_to);
 const weekTasks=allOwned.filter(t=>t.status!=='done'&&t.due_date&&t.due_date>=weekStart&&t.due_date<=weekEnd);
 // Capacidad semanal: se estiman las horas de tareas abiertas que vencen esta semana.
 const capacity=w.members.filter(m=>owner==='all'||m.user_id===owner).map(m=>({id:m.user_id,name:m.display_name,available:Number(m.weekly_capacity_hours)||0,assigned:weekTasks.filter(t=>t.assigned_to===m.user_id).reduce((s,t)=>s+Number(t.estimated_hours||0),0)}));
 const totalCapacity=capacity.reduce((s,m)=>s+m.available,0);const assignedHours=capacity.reduce((s,m)=>s+m.assigned,0);
 const weekly=Array.from({length:Math.ceil(period/7)},(_,i)=>{const end=addDays(new Date(),-(i*7));const start=addDays(end,-6);const a=iso(start),b=iso(end);return {label:fmt(a),count:filtered.filter(t=>t.status==='done'&&t.updated_at?.slice(0,10)>=a&&t.updated_at?.slice(0,10)<=b).length};}).reverse();
 const maxWeekly=Math.max(1,...weekly.map(x=>x.count));
 return <Shell><div className="executive-dashboard">
  <div className="executive-header"><div><p className="eyebrow">SERPA LAB STUDIO · OPERACIONES</p><h1>Centro de control</h1><p className="muted">Estado operativo del equipo · {new Date().toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</p></div><Link className="executive-cta" href="/tasks"><Plus size={17}/> Nueva tarea</Link></div>
  <div className="executive-filters"><label>Período <select value={period} onChange={e=>setPeriod(Number(e.target.value))}><option value={7}>Últimos 7 días</option><option value={30}>Últimos 30 días</option><option value={90}>Últimos 90 días</option></select></label><label>Responsable <select value={owner} onChange={e=>setOwner(e.target.value)}><option value="all">Todo el equipo</option>{w.members.map(m=><option value={m.user_id} key={m.user_id}>{m.display_name}</option>)}</select></label><span className="muted">Las métricas del período se basan en la creación de tareas</span></div>
  {w.error&&<p className="error" role="alert">{w.error}</p>}{w.loading?<p role="status" className="panel">Cargando indicadores…</p>:<>
  <div className="executive-kpis">{[
   {label:'Tareas del período',value:total,icon:<ListTodo size={20}/>,href:'/tasks'},
   {label:'En curso',value:counts.in_progress||0,icon:<Clock3 size={20}/>,href:'/kanban'},
   {label:'Completadas',value:done,icon:<CheckCircle2 size={20}/>,href:'/tasks'},
   {label:'Bloqueadas',value:counts.blocked||0,icon:<AlertTriangle size={20}/>,href:'/kanban'},
   {label:'Avance por tareas',value:`${progress}%`,icon:<Target size={20}/>,href:'/gantt'},
   {label:'Vencidas (total)',value:overdue.length,icon:<CalendarDays size={20}/>,href:'/tasks'},
   {label:'Horas asignadas / capacidad',value:`${assignedHours.toFixed(1)} / ${totalCapacity.toFixed(1)} h`,icon:<Users size={20}/>,href:'/capacity'}
  ].map(k=><Link href={k.href} className="executive-kpi" key={k.label}><div className="executive-kpi-head"><span>{k.label}</span>{k.icon}</div><strong>{k.value}</strong><ArrowUpRight className="executive-arrow" size={15}/></Link>)}</div>
  <div className="executive-section-head"><div><h2>Rendimiento operativo</h2><p className="muted">Visualizaciones conectadas a las tareas de Supabase</p></div></div>
  <div className="executive-grid">
   <section className="panel executive-chart"><h3>Distribución por estado</h3><p className="muted">{total} tareas creadas en el período</p><div className="executive-donut-layout"><div className="executive-donut" role="img" aria-label={STATUSES.map(s=>`${s.label}: ${counts[s.value]||0}`).join(', ')} style={{background:total?`conic-gradient(${STATUSES.map((s,i)=>`${s.color} ${STATUSES.slice(0,i).reduce((sum,p)=>sum+(counts[p.value]||0),0)/total*100}% ${STATUSES.slice(0,i+1).reduce((sum,p)=>sum+(counts[p.value]||0),0)/total*100}%`).join(',')})`:'#e7ece8'}}><div><strong>{total}</strong><span>tareas</span></div></div><div className="executive-legend">{STATUSES.map(s=><div key={s.value}><i style={{background:s.color}}/>{s.label}<strong>{counts[s.value]||0}</strong></div>)}</div></div></section>
   <section className="panel executive-chart"><h3>Evolución de completadas</h3><p className="muted">Aproximación según última modificación; no equivale a fecha histórica de cierre</p><div className="executive-bars" role="img" aria-label={weekly.map(x=>`${x.label}: ${x.count}`).join(', ')}>{weekly.map((x,i)=><div className="executive-bar-col" key={i} title={`${x.label}: ${x.count}`}><span>{x.count||''}</span><div style={{height:`${Math.max(3,x.count/maxWeekly*100)}%`}}/><small>{weekly.length<=5||i%Math.ceil(weekly.length/5)===0?x.label:''}</small></div>)}</div></section>
   <section className="panel executive-chart"><div className="executive-title-row"><h3>Carga semanal por socio</h3><Link href="/capacity">Ver capacidad <ArrowUpRight size={14}/></Link></div><p className="muted">Horas estimadas de tareas abiertas que vencen esta semana</p>{capacity.length?capacity.map(m=><div className="executive-person" key={m.id}><div><strong>{m.name}</strong><span>{m.assigned.toFixed(1)} / {m.available.toFixed(1)} h</span></div><div className="executive-capacity-track"><div style={{width:`${Math.min(100,m.available?m.assigned/m.available*100:m.assigned?100:0)}%`,background:m.assigned>m.available?'#dc7135':'#315a43'}}/></div>{m.assigned>m.available&&<small className="executive-warning">Sobrecarga: +{(m.assigned-m.available).toFixed(1)} h</small>}</div>):<p className="muted">No hay socios disponibles para este filtro.</p>}</section>
   <section className="panel executive-chart"><h3>Progreso del período</h3><p className="muted">Tareas completadas respecto al total creado en el período (no mide hitos)</p><div className="executive-progress-value">{progress}<span>%</span></div><div className="executive-capacity-track"><div style={{width:`${progress}%`,background:'#315a43'}}/></div><p className="muted">{done} de {total} tareas completadas</p><Link className="executive-text-link" href="/gantt">Consultar Gantt <ArrowUpRight size={15}/></Link></section>
  </div>
  <div className="executive-bottom"><section className="panel"><div className="executive-title-row"><h2>Requieren atención</h2><Link href="/tasks">Ver tareas <ArrowUpRight size={14}/></Link></div><div className="executive-alerts"><div><span>Vencidas</span><strong>{overdue.length}</strong></div><div><span>Bloqueadas</span><strong>{blocked.length}</strong></div><div><span>Sin responsable</span><strong>{unassigned.length}</strong></div><div><span>Socios sobrecargados</span><strong>{capacity.filter(m=>m.assigned>m.available).length}</strong></div></div>{!overdue.length&&!blocked.length&&!unassigned.length&&!capacity.some(m=>m.assigned>m.available)&&<p className="muted">No hay alertas detectadas.</p>}</section><section className="panel"><div className="executive-title-row"><h2>Esta semana</h2><Link href="/agenda">Abrir agenda <ArrowUpRight size={14}/></Link></div><div className="executive-week"><div><strong>{weekTasks.length}</strong><span>Tareas con vencimiento</span></div><div><strong>{assignedHours.toFixed(1)} h</strong><span>Asignadas a socios</span></div><div><strong>{events.length}</strong><span>Eventos de agenda</span></div></div>{eventsError&&<p className="muted" role="status">{eventsError}</p>}<p className="muted">Semana del {fmt(weekStart)} al {fmt(weekEnd)}</p></section></div>
  </>}
 </div></Shell>;
}
