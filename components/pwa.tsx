'use client';
import {useEffect,useState} from 'react';
type InstallEvent = Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function Pwa(){
 const [install,setInstall]=useState<InstallEvent|null>(null);
 const [waiting,setWaiting]=useState<ServiceWorker|null>(null);
 const [ios,setIos]=useState(false);
 const [dismiss,setDismiss]=useState(false);
 useEffect(()=>{
  const standalone=window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & {standalone?:boolean}).standalone;
  setIos(!standalone && /iPhone|iPad|iPod/.test(navigator.userAgent));
  const onInstall=(e:Event)=>{e.preventDefault();setInstall(e as InstallEvent);};
  const onInstalled=()=>{setInstall(null);setIos(false);};
  window.addEventListener('beforeinstallprompt',onInstall);window.addEventListener('appinstalled',onInstalled);
  let registration:ServiceWorkerRegistration|undefined;let alive=true;let reload=false;
  const onController=()=>{if(reload)window.location.reload();};
  const onUpdate=()=>{const worker=registration?.installing;if(worker)worker.addEventListener('statechange',()=>{if(alive&&worker.state==='installed'&&navigator.serviceWorker.controller)setWaiting(worker);});};
  const check=()=>{if(document.visibilityState==='visible')void registration?.update().catch(()=>{});};
  const apply=()=>{reload=true;};
  window.addEventListener('serpa-pwa-apply',apply);
  if('serviceWorker' in navigator && process.env.NODE_ENV==='production'){
   navigator.serviceWorker.addEventListener('controllerchange',onController);
   navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(r=>{if(!alive)return;registration=r;if(r.waiting&&navigator.serviceWorker.controller)setWaiting(r.waiting);r.addEventListener('updatefound',onUpdate);void r.update().catch(()=>{});}).catch(console.warn);
   document.addEventListener('visibilitychange',check);
  }
  return()=>{alive=false;window.removeEventListener('beforeinstallprompt',onInstall);window.removeEventListener('appinstalled',onInstalled);window.removeEventListener('serpa-pwa-apply',apply);if('serviceWorker' in navigator)navigator.serviceWorker.removeEventListener('controllerchange',onController);registration?.removeEventListener('updatefound',onUpdate);document.removeEventListener('visibilitychange',check);};
 },[]);
 if(!waiting&&(dismiss||(!install&&!ios)))return null;
 return <div className="pwa-notice" aria-label="Aplicación SERPA" role="status">
 {waiting?<><span>Nueva versión disponible. Guarda tus cambios antes de actualizar.</span><button onClick={()=>{window.dispatchEvent(new Event('serpa-pwa-apply'));waiting.postMessage('SKIP_WAITING');}}>Actualizar</button></>:<><span>{ios?'Instala SERPA HUB desde Safari: Compartir → Añadir a pantalla de inicio.':'Instala SERPA HUB en tu dispositivo.'}</span>{install&&<button onClick={async()=>{await install.prompt();await install.userChoice;setInstall(null);}}>Instalar</button>}<button aria-label="Cerrar aviso" onClick={()=>setDismiss(true)}>×</button></>}
 </div>;
}
