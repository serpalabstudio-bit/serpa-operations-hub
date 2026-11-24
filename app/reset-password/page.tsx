'use client';

import Image from 'next/image';
import {useEffect,useState,useRef} from 'react';
import Link from 'next/link';
import {authFeedback,waitSeconds} from '../../lib/auth-feedback';
import {supabase} from '../../lib/supabase';
export default function ResetPassword(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState('');
 const [ready,setReady]=useState(false); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [done,setDone]=useState(false);
 const [checking,setChecking]=useState(true);const [until,setUntil]=useState(0);const [now,setNow]=useState(0);const remaining=Math.max(0,Math.ceil((until-now)/1000));
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);
 const verification=useRef<Promise<boolean>|null>(null);
 useEffect(()=>{let active=true;async function verify(){
  const url=new URL(window.location.href);const tokenHash=url.searchParams.get('token_hash');const type=url.searchParams.get('type');
  if(tokenHash&&(type==='recovery'||type==='invite')){window.history.replaceState({},'',url.pathname);const {data,error}=await supabase().auth.verifyOtp({token_hash:tokenHash,type});if(error)throw error;if(!data.session)throw new Error('Enlace inválido o caducado.');return true;}
  else if(url.searchParams.has('code')||url.hash||url.searchParams.has('error')||tokenHash){window.history.replaceState({},'',url.pathname);throw new Error('Este enlace antiguo o inválido no se puede utilizar. Solicita uno nuevo.');}
 return false;}
 verification.current??=verify();verification.current.then(value=>{if(active)setReady(value)}).catch(e=>{if(active)setError(authFeedback(e instanceof Error?e.message:'Enlace inválido o caducado.'))}).finally(()=>{if(active)setChecking(false)});return()=>{active=false};},[]);
 async function send(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');try{const {error}=await supabase().auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setNow(Date.now());setUntil(Date.now()+60000);setMessage('Si la cuenta existe, recibirás un enlace. Revisa también la carpeta de spam.')}catch(e){const msg=e instanceof Error?e.message:'No se pudo enviar el correo';const seconds=waitSeconds(msg);if(seconds){setNow(Date.now());setUntil(Date.now()+seconds*1000)}setError(authFeedback(msg))}finally{setBusy(false)}}
 async function update(e:React.FormEvent){e.preventDefault();setError('');if(password.length<8){setError('La contraseña debe tener al menos 8 caracteres.');return}if(password!==confirm){setError('Las contraseñas no coinciden.');return}setBusy(true);try{const {error}=await supabase().auth.updateUser({password});if(error)throw error;setDone(true);setMessage('Contraseña establecida correctamente. Ya puedes iniciar sesión.');await supabase().auth.signOut()}catch(e){setError(e instanceof Error?e.message:'No se pudo actualizar la contraseña')}finally{setBusy(false)}}
 return <div className="login"><div className="panel"><Image className="auth-logo" src="/serpa-logo-original.png" width={156} height={130} alt="SERPA Lab Studio" priority /><p className="eyebrow">OPERATIONS HUB</p><h1>{done?'Contraseña guardada':ready?'Establecer contraseña':'Recuperar acceso'}</h1>{message&&<p role="status">{message}</p>}{error&&<p className="error" role="alert">{error}</p>}{checking?<p>Verificando enlace…</p>:!done&&(ready?<form onSubmit={update} style={{display:'grid',gap:16}}><label>Nueva contraseña<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Repetir contraseña<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button disabled={busy}>{busy?'Guardando…':'Guardar contraseña'}</button></form>:<form onSubmit={send} style={{display:'grid',gap:16}}><p>Introduce el correo de tu cuenta. Te enviaremos un enlace para crear una contraseña.</p><label>Correo electrónico<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button disabled={busy||remaining>0}>{busy?'Enviando…':remaining>0?`Volver a enviar en ${remaining} s`:'Enviar enlace'}</button></form>)}<p style={{marginTop:18}}><Link className="action-link" href="/login">Volver al inicio de sesión</Link></p></div></div>
}
