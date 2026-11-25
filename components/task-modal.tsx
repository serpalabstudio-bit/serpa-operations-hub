'use client';
import {useEffect,useRef} from 'react';
export default function TaskModal({children,onClose,label}:{children:React.ReactNode;onClose:()=>void;label:string}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;if(!dialog)return;const previous=document.activeElement as HTMLElement|null;dialog.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=old;previous?.focus();};},[]);
 return <dialog ref={ref} className="task-modal" aria-label={label} onCancel={e=>{e.preventDefault();onClose();}}>{children}</dialog>;
}
