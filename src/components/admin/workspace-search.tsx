"use client";
import { useAdminLanguage } from "./admin-language";
import {useEffect,useState} from 'react';
import {Search,ChevronRight} from 'lucide-react';
import {Modal,SearchField} from './admin-ui';
import {findWorkspaceResults,type WorkspaceResult} from '@/lib/workspace-search';
import type {AdminView} from './admin-app';
type Item={id:AdminView;label:string};
/** A page, settings area or other target besides the workspace areas. */
export type WorkspaceShortcut=WorkspaceResult&{run:()=>void};
const groupLabels:Record<string,string>={area:'Bereich',page:'Seite',settings:'Einstellung'};
const isMac=()=>typeof navigator!=='undefined'&&/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);

export function WorkspaceSearch({items,onNavigate,shortcuts=[]}:{items:readonly Item[];onNavigate:(view:AdminView)=>unknown;shortcuts?:readonly WorkspaceShortcut[]}){
 const { t: adminText } = useAdminLanguage();
 const[open,setOpen]=useState(false),[query,setQuery]=useState(''),[mac,setMac]=useState(true);
 const all:WorkspaceShortcut[]=[...items.map(item=>({id:'area:'+item.id,label:item.label,group:'area',run:()=>onNavigate(item.id)})),...shortcuts];
 const results=findWorkspaceResults(all,query);
 function choose(result:WorkspaceShortcut){setOpen(false);result.run();}
 useEffect(()=>{
  setMac(isMac());
  const start=()=>{setQuery('');setOpen(true);};
  const key=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setQuery('');setOpen(value=>!value);}};
  window.addEventListener('keydown',key);window.addEventListener('cms:open-search',start);
  return()=>{window.removeEventListener('keydown',key);window.removeEventListener('cms:open-search',start);};
 },[]);
 const shortcut=mac?'⌘ K':adminText('Strg K');
 return <><button type="button" className="cms-workspace-search" onClick={()=>{setQuery('');setOpen(true);}}><Search size={16}/><span>{adminText("Schnell finden")}</span><kbd>{shortcut}</kbd></button>{open&&<Modal title={adminText("Wohin möchten Sie?")} onClose={()=>setOpen(false)}><div className="cms-workspace-search-dialog" onKeyDown={event=>{
  if(event.key==='Enter'&&event.target instanceof HTMLInputElement&&query.trim()&&results[0]){event.preventDefault();choose(results[0]);}
 }}><SearchField value={query} onChange={setQuery} label={adminText("Bereich, Seite oder Einstellung suchen")} placeholder={adminText("Seiten, Medien, E-Mail-Versand …")}/><div className="cms-command-results">{results.map(item=><button key={item.id} type="button" onClick={()=>choose(item)}><span><small>{adminText(groupLabels[item.group]??item.group)}</small>{item.label}</span><ChevronRight size={17}/></button>)}{!results.length&&<p>{adminText("Nichts gefunden. Versuchen Sie zum Beispiel „Startseite“, „Medien“ oder „SMTP“.")}</p>}</div><p className="cms-command-hint">{adminText("{p1} öffnet die Suche · Enter öffnet den ersten Treffer · Esc schließt", {p1:shortcut})}</p></div></Modal>}</>;
}
