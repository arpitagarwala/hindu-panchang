'use client';
import { ArrowRight, ChevronDown, Clock3, ExternalLink, Flower2, Info, Moon } from 'lucide-react';
import type { Observance } from '@/lib/observance-types';
import { dateLabel, localDay } from './data';
import { translator, nameLabel, isHindi, formatTime } from './locale';
import s from './PanchangApp.module.css';

export default function ObservanceList({items,title,timeZone,hour24,locale,onSelect,onViewAll,loading=false,error='',compact=false}:{items:Observance[];title:string;timeZone:string;hour24:boolean;locale:string;onSelect:(date:string)=>void;onViewAll?:()=>void;loading?:boolean;error?:string;compact?:boolean}) {
  const t=translator(locale), hi=isHindi(locale);
  const time=(value:string)=>formatTime(value,timeZone,hour24,locale);
  const instant=(value:string)=>`${dateLabel(localDay(timeZone,new Date(value)),{day:'numeric',month:'short'},locale)} · ${time(value)}`;
  return <section className={s.panel}><div className={s.panelHeading}><h2><Flower2 size={18}/>{title}</h2>{onViewAll?<button className={s.textButton} onClick={onViewAll}>{t('View all')}<ArrowRight size={14}/></button>:null}</div>
    {items.map(event=><details className={`${s.eventDetails} ${compact?s.compactEvent:''}`} key={event.id}><summary><div className={s.dateTile}><span>{dateLabel(event.date,{month:'short'},locale)}</span><b>{dateLabel(event.date,{day:'numeric'},locale)}</b></div><div className={s.eventSummary}><strong>{nameLabel(event.name,locale)}</strong><small>{dateLabel(event.date,{weekday:'long'},locale)}{event.tradition?` · ${nameLabel(event.tradition,locale)}`:''}</small>
      {event.tithiWindow?<span className={s.eventTithi}>{t('Tithi window')}: {instant(event.tithiWindow.start)} – {instant(event.tithiWindow.end)}</span>:null}
    </div><ChevronDown size={15}/></summary><div className={s.eventBody}>
      {event.window?<div className={s.eventWindow}><Clock3 size={15}/><span>{t(event.kind==='solar'?'Ingress':'Puja window')}<strong>{instant(event.window.start)}{event.kind!=='solar'?` – ${instant(event.window.end)}`:''}</strong></span></div>:null}
      {event.parana?<div className={s.paranaBox}><span className={s.eyebrow}>{t('PARANA · BREAKING THE FAST')}</span><strong>{dateLabel(event.parana.date,{weekday:'short',day:'numeric',month:'short'},locale)}</strong>{event.parana.after?<b>{hi?`${time(event.parana.after)} के बाद`:`After ${time(event.parana.after)}`}</b>:event.parana.window?<b>{time(event.parana.window.start)} – {time(event.parana.window.end)}</b>:<b className={s.reviewText}>{t('No automatic window · needs confirmation')}</b>}{!hi?<p>{event.parana.reason}</p>:null}{event.parana.hariVasaraEnd?<small>{t('Hari Vasara ends')} {instant(event.parana.hariVasaraEnd)}</small>:null}{event.parana.dwadashiEnd?<small>{t('Dwadashi ends')} {instant(event.parana.dwadashiEnd)}</small>:null}</div>:null}
      {event.status==='review-required'||event.parana?.status==='review-required'?<p className={s.eventNote}><Info size={14}/>{hi?'इस पर्व या पारण की तारीख और समय अपनी पारिवारिक या मंदिर की परंपरा से मिलाएँ।':event.notes||'Confirm the date and timing with your family or temple tradition.'}</p>:null}
      <details className={s.ruleDetails}><summary>{t('More details')}</summary><p>{hi?'पर्व की तिथि और पूजा का समय स्थानीय सूर्योदय तथा चुनी हुई परंपरा के अनुसार है। पूरा नियम मूल संदर्भ में पढ़ें।':event.rule}</p>{event.notes&&event.status!=='review-required'?<p>{hi?'स्थानीय परंपरा में अंतर हो सकता है। मूल संदर्भ देखें।':event.notes}</p>:null}<a href={event.source} target="_blank" rel="noreferrer">{t('Rule reference')}<ExternalLink size={12}/></a></details>
      <button className={s.textButton} onClick={()=>onSelect(event.date)}>{t('Open this day')}<ArrowRight size={13}/></button>
    </div></details>)}
    {!items.length?<div className={s.emptyState}><Moon size={25}/><p>{error?(hi?'जानकारी नहीं मिल सकी। फिर प्रयास करें।':error):t(loading?'Calculating observances…':'No listed observances in this period. Browse another month.')}</p></div>:null}
  </section>;
}
