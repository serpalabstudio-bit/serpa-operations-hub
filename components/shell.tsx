'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {supabase} from '../lib/supabase';
export default function Shell({children}:{children:React.ReactNode}){const router=useRouter();return <div className="shell"><aside><div className="brand">SERPA <span>LAB STUDIO</span></div><p className="eyebrow">OPERATIONS HUB</p><nav><Link href="/dashboard">▦ &nbsp; Dashboard</Link><Link href="/tasks">☑ &nbsp; Mis tareas</Link><Link href="/gantt">▤ &nbsp; Gantt</Link></nav><p className="aside-note">MVP · Fase 1<br/>Los demás módulos se incorporarán progresivamente.</p><button className="logout" onClick={async()=>{await supabase().auth.signOut();router.push('/login')}}>Cerrar sesión</button></aside><main><header><strong>Centro de operaciones</strong><span>Plan comercial · 90 días</span></header><div className="content">{children}</div></main></div>}
