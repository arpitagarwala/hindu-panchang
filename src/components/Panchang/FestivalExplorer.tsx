'use client';
import { useState } from 'react';
import { CalendarPlus, Search } from 'lucide-react';
import type { Observance } from '@/lib/observance-types';
import { buildObservanceCalendar } from '@/lib/utils/calendar-export';
import { downloadFile } from './data';
import { translator, nameLabel, isHindi } from './locale';
import ObservanceList from './ObservanceList';
import s from './PanchangApp.module.css';
export default function FestivalExplorer({events,month,location,timeZone,hour24,locale,onSelect,loading,error,onNotify,initialKind='all',upcomingFrom}:{events:Observance[];month:string;location:string;timeZone:string;hour24:boolean;locale:string;onSelect:(date:string)=>void;loading:boolean;error:string;onNotify:(text:string)=>void;initialKind?:string;upcomingFrom?:string}) {
  const [query,setQuery]=useState(''), [kind,setKind]=useState(initialKind);
  const t=translator(locale), hi=isHindi(locale);
  const filtered=events.filter(event=>(!upcomingFrom||event.date>=upcomingFrom)&&(kind==='all'||event.kind===kind)&&`${event.name} ${nameLabel(event.name,'hi')} ${event.tradition||''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  function exportCalendar(){try{const localized=filtered.map(event=>({...event,name:nameLabel(event.name,locale)}));downloadFile(`panchang-${month}-${kind}.ics`,buildObservanceCalendar(localized,location,timeZone),'text/calendar;charset=utf-8');onNotify(hi?'कैलेंडर डाउनलोड हो गया।':'Calendar downloaded.');}catch{onNotify(hi?'डाउनलोड नहीं हो सका। फिर प्रयास करें।':'Could not export this selection. Please try again.');}}
  return <><div className={s.festivalTools}><label className={s.festivalSearch}><Search size={18}/><input type="search" aria-label={t('Search festivals and fasting days')} placeholder={t('Search Ekadashi, Diwali, Pradosh…')} value={query} onChange={event=>setQuery(event.target.value)}/></label><label className={s.festivalType}>{t('Show')}<select aria-label={t('Show')} value={kind} onChange={event=>setKind(event.target.value)}>{[['all','All observances'],['festival','Festivals'],['fast','Fasting days'],['lunar','Lunar dates'],['solar','Solar ingresses']].map(([value,label])=><option key={value} value={value}>{t(label)}</option>)}</select></label><button className={s.outlineButton} disabled={!filtered.length} onClick={exportCalendar}><CalendarPlus size={17}/>{t('Add to calendar')}</button></div><p className={s.filterCount} role="status">{filtered.length} {hi?'पर्व और व्रत':'festivals and observances'}</p><ObservanceList items={filtered} title={t('Festivals, fasting & parana')} timeZone={timeZone} hour24={hour24} locale={locale} onSelect={onSelect} loading={loading} error={error||(!filtered.length&&events.length?t('No matches. Try another search or choose All observances.'):'')}/></>;
}
