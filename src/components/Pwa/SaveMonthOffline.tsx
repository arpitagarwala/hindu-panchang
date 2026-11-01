'use client';
import { useEffect, useRef, useState } from 'react';
import { Download, LoaderCircle, X } from 'lucide-react';
import { downloadOfflineMonth, offlineMonthIdentity, readOfflineMonths, saveOfflineMonth, type MonthContext } from '@/lib/pwa-months';
import s from './Pwa.module.css';

export default function SaveMonthOffline({context,locale}:{context:MonthContext;locale:string}) {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[saved,setSaved]=useState(false);
  const request=useRef<AbortController|null>(null),hi=locale.startsWith('hi');
  const identity=offlineMonthIdentity(context);
  useEffect(()=>{
    request.current?.abort();setBusy(false);setMessage('');
    setSaved(readOfflineMonths(localStorage).some(pack=>pack.key===identity));
    return()=>request.current?.abort();
  },[identity]);
  async function save(){
    request.current?.abort();const controller=new AbortController();request.current=controller;
    setBusy(true);setMessage('');
    const timeout=setTimeout(()=>controller.abort(new Error('timeout')),55000);
    try{
      const pack=await downloadOfflineMonth(context,controller.signal);
      controller.signal.throwIfAborted();saveOfflineMonth(pack,localStorage);setSaved(true);
      setMessage(hi?`${pack.readings.length} दिनों के पर्व और समय सहेज लिए गए हैं।`:`Saved all ${pack.readings.length} days, including festivals and timings.`);
    }catch(error){
      if(controller.signal.aborted){if(controller.signal.reason instanceof Error&&controller.signal.reason.message==='timeout')setMessage(hi?'डाउनलोड में अधिक समय लगा। फिर प्रयास करें।':'Download timed out. Try again.');}
      else setMessage(hi?'महीना सहेजा नहीं जा सका। इंटरनेट और खाली स्टोरेज जाँचकर फिर प्रयास करें।':error instanceof DOMException&&error.name==='QuotaExceededError'?'Device storage is full. Remove an offline month and try again.':'Could not save the complete month. Check your connection and free storage, then try again.');
    }finally{clearTimeout(timeout);if(request.current===controller)setBusy(false);}
  }
  return <div className={s.monthSave}><div><button className={s.monthButton} disabled={busy||!context.month} onClick={save}>{busy?<LoaderCircle size={17}/>:<Download size={17}/>}<span>{busy?(hi?'पूरा महीना डाउनलोड हो रहा है…':'Downloading the full month…'):saved?(hi?'सहेजा हुआ महीना अपडेट करें':'Refresh saved month'):(hi?'पूरा महीना ऑफलाइन सहेजें':'Save month offline')}</span></button>{busy?<button aria-label={hi?'डाउनलोड रद्द करें':'Cancel month download'} onClick={()=>{request.current?.abort();setBusy(false);setMessage(hi?'डाउनलोड रद्द हुआ। पहले से सहेजे महीने सुरक्षित हैं।':'Download cancelled. Previously saved months are unchanged.');}}><X size={18}/></button>:null}<a href="/offline.html">{hi?'सहेजे हुए महीने खोलें':'Open saved months'}</a></div><p>{hi?'इस उपकरण पर ३ पूरे महीने रख सकते हैं। चौथा सहेजने पर सबसे पुराना हटेगा।':'Keep 3 complete months on this device. Saving a fourth replaces the oldest.'}</p>{message?<p role="status">{message}</p>:null}</div>;
}
