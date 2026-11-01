'use client';
import { Clock3, Info, Moon, Sunrise, Sunset, Sun, Timer } from 'lucide-react';
import type { PanchangResult } from '@/lib/panchang';
import { dateLabel, localDay } from './data';
import { translator, nameLabel, formatTime, isHindi } from './locale';
import s from './PanchangApp.module.css';

export default function DayOverview({data,date,timeZone,hour24,clock,isToday,locale='en-IN'}:{data:PanchangResult;date:string;timeZone:string;hour24:boolean;clock:number;isToday:boolean;locale?:string}) {
  const t=translator(locale), hi=isHindi(locale);
  const n=(value:string)=>nameLabel(value,locale);
  const time=(instant:string)=>formatTime(instant,timeZone,hour24,locale);
  const datedTime=(instant?:string)=>{if(!instant)return t('No event on this date');const day=localDay(timeZone,new Date(instant));return `${time(instant)}${day!==date?` · ${dateLabel(day,{day:'numeric',month:'short'},locale)}`:''}`;};
  const duration=(ms:number)=>{const minutes=Math.round(ms/60000);return hi?`${Math.floor(minutes/60)} घंटे ${minutes%60} मिनट`:`${Math.floor(minutes/60)}h ${minutes%60}m`;};
  const daylight=data.solarTimesAvailable?Date.parse(data.sunset)-Date.parse(data.sunrise):undefined;
  const night=data.solarTimesAvailable&&data.nextSunrise?Date.parse(data.nextSunrise)-Date.parse(data.sunset):undefined;
  const windows=[{name:'Brahma Muhurta',range:data.brahmaMuhurta,caution:false},{name:'Abhijit Muhurta',range:data.abhijitMuhurta,caution:false},{name:'Rahu Kalam',range:data.rahuKalam,caution:true},{name:'Yamaganda',range:data.yamagandam,caution:true},{name:'Gulika Kalam',range:data.gulikaKalam,caution:true}].filter(w=>w.range.start&&w.range.end).sort((a,b)=>Date.parse(a.range.start)-Date.parse(b.range.start));
  const active=isToday?windows.filter(w=>Date.parse(w.range.start)<=clock&&clock<Date.parse(w.range.end)):[];
  const next=isToday?windows.find(w=>Date.parse(w.range.start)>clock):undefined;
  const nextBoundary=isToday?[{name:'Tithi',end:data.tithi.end},{name:'Nakshatra',end:data.nakshatra.end},{name:'Yoga',end:data.yoga.end},{name:'Karana',end:data.karana.end}].filter(v=>v.end&&Date.parse(v.end)>clock).sort((a,b)=>Date.parse(a.end!)-Date.parse(b.end!))[0]:undefined;
  return <section className={s.panel} aria-label={t('Your day at a glance')}><div className={s.panelHeading}><h2><Sun size={19}/>{t('Your day at a glance')}</h2></div><div className={s.skyGrid}>{[{title:'Moonrise',icon:Moon,value:datedTime(data.moonrise)},{title:'Moonset',icon:Moon,value:datedTime(data.moonset)},{title:'Daylight',icon:Sunrise,value:daylight===undefined?t('Unavailable'):duration(daylight)},{title:'Night length',icon:Sunset,value:night===undefined?t('Unavailable'):duration(night)}].map(({title,icon:Icon,value})=><div className={s.skyMetric} key={title}><Icon size={19}/><span>{t(title)}<strong>{value}</strong></span></div>)}</div>
    {isToday?<div className={s.liveOverview}><span className={s.liveTime}><span className={s.liveDot}/>{clock?time(new Date(clock).toISOString()):'—'}</span><h3>{t(active.some(w=>w.caution)?'A time to be mindful':active.length?'A traditional favorable window is active':'Move through your day with awareness')}</h3><p>{active.length?`${active.map(w=>n(w.name)).join(hi?' और ':' and ')}${hi?' का समय चल रहा है।':' is active.'}`:t('No listed Muhurta or caution window is active right now.')}</p><div className={s.upNext}>{next?<span><Clock3 size={15}/><b>{t('Next:')}</b> {n(next.name)} · {time(next.range.start)}</span>:<span><Clock3 size={15}/>{t('No more listed daily windows today.')}</span>}{nextBoundary?<span><Timer size={15}/><b>{t('Next transition:')}</b> {n(nextBoundary.name)} · {datedTime(nextBoundary.end)}</span>:null}</div></div>:null}
    <details className={s.daySchedule}><summary><Clock3 size={17}/>{t('Daily timing schedule')}<span>{t('Show all windows')}</span></summary><ol>{windows.map(w=>{const isActive=isToday&&Date.parse(w.range.start)<=clock&&clock<Date.parse(w.range.end);return <li key={w.name} className={w.caution?s.scheduleCaution:s.scheduleFavorable}><span className={s.scheduleDot}/><div><strong>{n(w.name)}{isActive?<em>{t('Active now')}</em>:null}</strong><small>{t(w.caution?'Traditional caution period':'Traditional favorable period')}</small></div><time>{datedTime(w.range.start)} – {datedTime(w.range.end)}</time></li>;})}</ol></details></section>;
}
