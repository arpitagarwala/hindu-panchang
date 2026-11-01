'use client';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PanchangResult } from '@/lib/panchang';
import { dateLabel } from './data';
import { nameLabel, translator, isHindi } from './locale';
import s from './PanchangApp.module.css';

export default function LunarCalendar({days,date,today,locale,full=false,error,onMonth,onSelect}:{days:PanchangResult[];date:string;today:string;locale:string;full?:boolean;error?:string;onMonth:(amount:number)=>void;onSelect:(day:string)=>void}) {
  const t=translator(locale), month=date.slice(0,7);
  const first=month?new Date(`${month}-01T12:00:00Z`).getUTCDay():0;
  const week=isHindi(locale)?['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return <section className={`${s.panel} ${s.readableCalendar} ${full?s.fullCalendar:''}`} aria-label={t('Your lunar calendar')}>
    <div className={s.panelHeading}><h2><CalendarDays size={18}/>{t('Your lunar calendar')}</h2></div>
    <div className={s.monthHeading}><button className={s.iconButton} aria-label={t('Previous month')} disabled={month<='1900-01'} onClick={()=>onMonth(-1)}><ChevronLeft size={17}/></button><strong>{date?dateLabel(date,{month:'long',year:'numeric'},locale):'—'}</strong><button className={s.iconButton} aria-label={t('Next month')} disabled={month>='2100-12'} onClick={()=>onMonth(1)}><ChevronRight size={17}/></button></div>
    <div className={s.calendarGrid}>{week.map(day=><span className={s.weekday} key={day}>{day}</span>)}{Array.from({length:first},(_,i)=><span className={s.calendarBlank} key={`empty-${i}`}/>)}
      {days.map((day,i)=>{
        const key=`${month}-${String(i+1).padStart(2,'0')}`;
        const events=day.observances||[];
        const names=events.map(event=>nameLabel(event.name,locale));
        return <button key={key} className={`${s.calendarDay} ${key===date?s.selectedDay:''} ${key===today?s.currentDay:''}`} aria-label={`${dateLabel(key,{dateStyle:'full'},locale)}, ${nameLabel(day.tithi.paksha,locale)} ${nameLabel(day.tithi.name,locale)}${names.length?`, ${names.join(', ')}`:''}`} aria-pressed={key===date} onClick={()=>onSelect(key)}>
          <b>{i+1}<span className={s.calendarWeekday}>{week[(first+i)%7]}</span></b><small className={s.calendarTithi}>{nameLabel(day.tithi.name,locale)}</small>
          {events.map(event=><span key={event.id} className={`${s.calendarFestival} ${event.kind==='fast'?s.calendarFast:''}`}>{nameLabel(event.name,locale)}</span>)}
        </button>;
      })}
    </div>{!days.length?<p className={s.calendarLoading} role="status">{error?t('The lunar calendar could not load. Please try again.'):t('Calculating lunar dates…')}</p>:null}
    <p className={s.calendarLegend}>{t('Select a date for details')}</p>
  </section>;
}
