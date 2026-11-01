'use client';
import { useState } from 'react';
import { CalendarPlus, Search } from 'lucide-react';
import type { Observance } from '@/lib/observance-types';
import { buildObservanceCalendar } from '@/lib/utils/calendar-export';
import { downloadFile } from './data';
import ObservanceList from './ObservanceList';
import s from './PanchangApp.module.css';

export default function FestivalExplorer({events,month,location,timeZone,hour24,locale,onSelect,loading,error,onNotify}:{events:Observance[];month:string;location:string;timeZone:string;hour24:boolean;locale:string;onSelect:(date:string)=>void;loading:boolean;error:string;onNotify:(text:string)=>void}) {
  const [query,setQuery]=useState('');
  const [kind,setKind]=useState('all');
  const filtered=events.filter(event=>(kind==='all'||event.kind===kind)&&`${event.name} ${event.rule} ${event.tradition||''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  function exportCalendar(){try{const calendar=buildObservanceCalendar(filtered,location,timeZone);downloadFile(`panchang-${month}-${kind}.ics`,calendar,'text/calendar;charset=utf-8');onNotify(`Downloaded ${filtered.length} observances with available parana events`);}catch{onNotify('Could not export this selection. Please try again.');}}
  return <><div className={s.festivalTools}><label className={s.festivalSearch}><Search size={18}/><input type="search" aria-label="Search festivals and fasting days" placeholder="Search Ekadashi, Diwali, Pradosh…" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className={s.festivalType}>Show<select aria-label="Filter observance type" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">All observances</option><option value="festival">Festivals</option><option value="fast">Fasting days</option><option value="lunar">Lunar dates</option><option value="solar">Solar ingresses</option></select></label><button className={s.outlineButton} disabled={!filtered.length} onClick={exportCalendar}><CalendarPlus size={17}/>Add to calendar</button></div><p className={s.filterCount} role="status">{filtered.length} matching observance{filtered.length===1?'':'s'} · Calendar download includes available parana times. Entries needing regional review retain that label.</p><ObservanceList items={filtered} title="Festivals, fasting & parana" timeZone={timeZone} hour24={hour24} locale={locale} onSelect={onSelect} loading={loading} error={error||(!filtered.length&&events.length?'No matches. Try another search or choose All observances.':'')}/></>;
}
