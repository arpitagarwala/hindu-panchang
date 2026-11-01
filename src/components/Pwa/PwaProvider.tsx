'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import s from './Pwa.module.css';

interface InstallPrompt extends Event { prompt:()=>Promise<void>; userChoice:Promise<{outcome:'accepted'|'dismissed'}> }
interface PwaState {installed:boolean;online:boolean;open:(locale:string)=>void}
const PwaContext=createContext<PwaState|null>(null);

export default function PwaProvider({children}:{children:ReactNode}) {
  const [installed,setInstalled]=useState(false),[online,setOnline]=useState(true),[opened,setOpened]=useState(false),[locale,setLocale]=useState('en'),[prompt,setPrompt]=useState<InstallPrompt|null>(null),[isIOS,setIOS]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const dialog=useRef<HTMLDialogElement>(null), hi=locale.startsWith('hi');
  useEffect(()=>{
    const mode=window.matchMedia('(display-mode: standalone)');
    const syncInstalled=()=>setInstalled(mode.matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
    const syncOnline=()=>setOnline(navigator.onLine);
    const before=(event:Event)=>{event.preventDefault();setPrompt(event as InstallPrompt);};
    const complete=()=>{setInstalled(true);setPrompt(null);setOpened(false);};
    syncInstalled();syncOnline();setIOS(/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1));
    mode.addEventListener('change',syncInstalled);window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',complete);window.addEventListener('online',syncOnline);window.addEventListener('offline',syncOnline);
    if('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{/* The online app stays usable if installation/offline support is blocked. */});
    return()=>{mode.removeEventListener('change',syncInstalled);window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',complete);window.removeEventListener('online',syncOnline);window.removeEventListener('offline',syncOnline);};
  },[]);
  useEffect(()=>{if(opened)dialog.current?.showModal();else dialog.current?.close();},[opened]);
  async function install(){
    if(!prompt)return;
    setBusy(true);setMessage('');
    try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='accepted')setOpened(false);else setMessage(hi?'आप बाद में भी ऐप इंस्टॉल कर सकते हैं।':'You can install the app later.');}
    catch{setMessage(hi?'नीचे दिए ब्राउज़र मेनू से ऐप जोड़ें।':'Use your browser’s menu to add the app.');}
    finally{setPrompt(null);setBusy(false);}
  }
  return <PwaContext.Provider value={{installed,online,open:(language)=>{setLocale(language);setMessage('');setOpened(true);}}}>{children}<dialog ref={dialog} className={s.dialog} aria-labelledby="pwa-title" onCancel={()=>setOpened(false)} onClick={event=>{if(event.target===event.currentTarget)setOpened(false);}}><header><Smartphone size={28}/><h2 id="pwa-title">{hi?'पंचांग ऐप इंस्टॉल करें':'Install Panchang'}</h2><button aria-label={hi?'बंद करें':'Close install instructions'} onClick={()=>setOpened(false)}><X size={21}/></button></header><p>{hi?'अपनी होम स्क्रीन से पंचांग खोलें—हर बार वेबसाइट खोजने की ज़रूरत नहीं।':'Open Panchang from your home screen without searching for the website each time.'}</p>
    {prompt?<button className={s.install} disabled={busy} onClick={install}><Download size={18}/>{busy?(hi?'खोल रहे हैं…':'Opening…'):(hi?'अभी इंस्टॉल करें':'Install now')}</button>:null}
    {isIOS?<section><h3>iPhone / iPad</h3><ol><li>{hi?'इस वेबसाइट को Safari में खोलें।':'Open this website in Safari.'}</li><li>{hi?'शेयर बटन चुनें, फिर “Add to Home Screen” चुनें।':'Tap Share, then “Add to Home Screen”.'}</li><li>{hi?'यदि दिखे तो “Open as Web App” चालू रखें, फिर “Add” चुनें।':'If shown, keep “Open as Web App” enabled, then tap Add.'}</li></ol></section>:<section><h3>Android / Chrome / Edge</h3><p>{hi?'“अभी इंस्टॉल करें” बटन चुनें। यदि बटन नहीं दिखता, तो ब्राउज़र मेनू (⋮) में “Install app” या “Add to Home screen” चुनें।':'Use “Install now” above. If it isn’t shown, open your browser menu (⋮) and choose “Install app” or “Add to Home screen”.'}</p><p className={s.note}>{hi?'iPhone पर Safari के शेयर मेनू से “Add to Home Screen” चुनें।':'On iPhone, use Safari’s Share → Add to Home Screen.'}</p></section>}
    <p className={s.note}>{hi?'कैलेंडर से ३ पूरे महीने ऑफलाइन सहेजें। पिछले २० दैनिक पाठ भी रखे जाते हैं। डाउनलोड या अपडेट के लिए इंटरनेट चाहिए।':'Save up to 3 complete months from the calendar for offline festivals and timings. The last 20 daily readings are also kept. Downloading or refreshing needs internet.'}</p><a href="/offline.html">{hi?'सहेजा हुआ पंचांग पढ़ें':'Read saved Panchang'}</a>{message?<p role="status">{message}</p>:null}</dialog></PwaContext.Provider>;
}

export function InstallAppButton({locale='en',className}:{locale?:string;className?:string}) {
  const state=useContext(PwaContext);
  if(!state||state.installed)return null;
  return <button className={className} onClick={()=>state.open(locale)}><Smartphone size={18}/><span>{locale.startsWith('hi')?'ऐप इंस्टॉल करें':'Install app'}</span></button>;
}
export function OfflineNotice({locale='en'}:{locale?:string}) {
  const state=useContext(PwaContext);
  if(!state||state.online)return null;
  return <p className={s.offline} role="status">{locale.startsWith('hi')?'आप ऑफलाइन हैं। ':'You’re offline. '}<a href="/offline.html">{locale.startsWith('hi')?'सहेजा हुआ पंचांग खोलें':'Open saved Panchang'}</a></p>;
}
