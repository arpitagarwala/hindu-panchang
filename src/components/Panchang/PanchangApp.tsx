'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Sun, Moon, Sunrise, Sunset, MapPin, ChevronDown, ChevronLeft, ChevronRight, ArrowUpRight, ArrowRight, CalendarDays, Clock3, BookOpen, Sparkles, Bookmark, Check, X, Globe2, Share2, Download, Info, Menu, CircleHelp, Compass, Flower2, BriefcaseBusiness, Plane, LoaderCircle, Settings2, Printer } from 'lucide-react';
import type { PanchangResult } from '@/lib/panchang';
import type { CityInfo } from '@/lib/geo/cities';
import { DEFAULT, NAV, GLOSSARY, DAY_ORDER, NIGHT_ORDER, zoneFor, localDay, shiftDay, dateLabel, downloadFile, type Preferences, type Section, type SavedDay } from './data';
import SunArtwork from './SunArtwork';
import LunarCalendar from './LunarCalendar';
import { nameLabel, monthNameLabel, translator, formatTime } from './locale';
import { gitaForDate } from './gita';
import { SEO_CITIES } from '@/lib/seo-cities';
import DayOverview from './DayOverview';
import DataSourceCard from './DataSourceCard';
import type { DataTrust } from '@/lib/providers/types';
import FestivalExplorer from './FestivalExplorer';
import LocationPicker from './LocationPicker';
import { detectDeviceLocation } from '@/lib/geo/device-location';
import ObservanceList from './ObservanceList';
import { REGIONS, type Region, type MonthConvention, type Tradition, type SunriseConvention } from '@/lib/calendar-options';
import type { Observance } from '@/lib/observance-types';
import s from './PanchangApp.module.css';

export default function PanchangApp() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT);
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState('');
  const [section, setSection] = useState<Section>('today');
  const [data, setData] = useState<PanchangResult | null>(null);
  const [monthData, setMonthData] = useState<PanchangResult[]>([]);
  const [futureData, setFutureData] = useState<PanchangResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trustError,setTrustError] = useState<DataTrust|undefined>();
  const [monthError, setMonthError] = useState('');
  const [modal, setModal] = useState<'location' | 'settings' | null>(null);
  const [saved, setSaved] = useState<SavedDay[]>([]);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [night, setNight] = useState(false);
  const [purpose, setPurpose] = useState('all');
  const [clock, setClock] = useState(0);
  const [retry, setRetry] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const autoLocation = useRef(false);
  const locationRequest = useRef<AbortController | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => locationRequest.current?.abort(), []);
  const hi = prefs.language === 'hi';
  const tr = (en: string, hindi: string) => hi ? hindi : en;
  const locale = hi ? 'hi-IN' : 'en-IN';
  const t = translator(locale);
  const n = (value: string | undefined) => nameLabel(value, locale);
  const lastToday = useRef('');
  useEffect(() => { document.documentElement.lang = hi ? 'hi' : 'en'; }, [hi]);
  useEffect(() => {
    if (!ready || !clock) return;
    const currentDay = localDay(prefs.timeZone, new Date(clock));
    const previousDay=lastToday.current;
    if (previousDay && previousDay !== currentDay) setDate(day => day === previousDay ? currentDay : day);
    lastToday.current = currentDay;
  }, [ready, clock, prefs.timeZone]);
  const yearMonth = date.slice(0, 7);
  const today = ready ? localDay(prefs.timeZone) : '';
  const isToday = date === today;
  function notify(message: string) { setToast(t(message)); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4000); }
  useEffect(() => {
    let initial = { ...DEFAULT, language: (navigator.language.startsWith('hi') ? 'hi' : 'en') as 'hi' | 'en' };
    let hasSavedLocation = false;
    try {
      const value = JSON.parse(localStorage.getItem('panchang.preferences.v1') || 'null');
      if (value && typeof value.city?.name === 'string' && Number.isFinite(value.city?.latitude) && Number.isFinite(value.city?.longitude)) {
        new Intl.DateTimeFormat('en', { timeZone: value.timeZone }); initial = { ...DEFAULT, ...value };
        hasSavedLocation = true;
      }
      const stored = JSON.parse(localStorage.getItem('panchang.saved.v1') || '[]');
      if (Array.isArray(stored)) setSaved(stored.filter(v => typeof v.date === 'string' && typeof v.title === 'string' && typeof v.city?.name === 'string'));
    } catch { /* Default preferences work without storage. */ }
    setPrefs(initial);
    const url = new URL(window.location.href);
    const requested = url.searchParams.get('date');
    const sharedLanguage=url.searchParams.get('lang');
    if(sharedLanguage==='en'||sharedLanguage==='hi')initial={...initial,language:sharedLanguage};
    const valid = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && Number.isFinite(new Date(requested).getTime()) && new Date(requested).toISOString().slice(0,10)===requested && requested>='1900-01-01' && requested<='2100-12-31';
    const sharedLat = Number(url.searchParams.get('lat')), sharedLon = Number(url.searchParams.get('lon'));
    if (url.searchParams.has('lat') && url.searchParams.has('lon') && Math.abs(sharedLat) <= 90 && Math.abs(sharedLon) <= 180) {
      const zone = url.searchParams.get('tz') || initial.timeZone;
      try { new Intl.DateTimeFormat('en', { timeZone: zone }); initial = { ...initial, timeZone: zone, city: { ...initial.city, name: url.searchParams.get('city') || 'Shared location', state:url.searchParams.get('state')||undefined, country:url.searchParams.get('country')||'', latitude: sharedLat, longitude: sharedLon, timeZone:zone } }; setPrefs(initial); } catch { /* Ignore invalid shared zones. */ }
    }
    const sharedRegion = url.searchParams.get('region');
    if (sharedRegion && REGIONS.some(r=>r.id===sharedRegion)) initial = { ...initial, region:sharedRegion as Region };
    const sharedMonths=url.searchParams.get('months'),sharedTradition=url.searchParams.get('tradition'),sharedSunrise=url.searchParams.get('sunrise');
    if(sharedMonths==='amanta'||sharedMonths==='purnimanta')initial={...initial,monthConvention:sharedMonths};
    if(sharedTradition==='smarta'||sharedTradition==='vaishnava')initial={...initial,tradition:sharedTradition};
    if(sharedSunrise==='edges'||sharedSunrise==='center')initial={...initial,sunriseConvention:sharedSunrise};
    setPrefs(initial);
    autoLocation.current = !url.searchParams.has('lat') && (!hasSavedLocation || initial.followLocation === true);
    setDate(valid ? requested : localDay(initial.timeZone)); setReady(true); setClock(Date.now());
    const timer = setInterval(() => setClock(Date.now()), 60000);
    return () => { clearInterval(timer); if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);
  useEffect(() => {
    if (!ready || !autoLocation.current) return;
    const controller = new AbortController();
    locationRequest.current = controller;
    setLocating(true); setLocationStatus('Finding your location. Allow access in your browser to see local timings.');
    detectDeviceLocation(controller.signal).then(city => {
      if (controller.signal.aborted) return;
      const timeZone = zoneFor(city);
      setPrefs(current => {
        const next = { ...current, city, timeZone, followLocation: true };
        try { localStorage.setItem('panchang.preferences.v1', JSON.stringify(next)); } catch { /* Detection works without storage. */ }
        return next;
      });
      setDate(current => current === localDay(prefs.timeZone) ? localDay(timeZone) : current);
      setLocationStatus('Using your device location. Only this site resolves its time zone; no background tracking.');
    }).catch(error => {
      if (!controller.signal.aborted) setLocationStatus(error instanceof Error ? error.message : 'Choose your city to see local timings.');
    }).finally(() => { if (!controller.signal.aborted) setLocating(false); });
    return () => controller.abort();
    // Run once after stored/shared preferences have been restored.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  async function locateNow() {
    locationRequest.current?.abort();
    const controller = new AbortController(); locationRequest.current = controller;
    setLocating(true); setLocationStatus('Finding your location…');
    try {
      const city = await detectDeviceLocation(controller.signal);
      if (controller.signal.aborted) return;
      const timeZone = zoneFor(city);
      setPrefs(current => {
        const next = { ...current, city, timeZone, followLocation: true };
        try { localStorage.setItem('panchang.preferences.v1', JSON.stringify(next)); } catch { /* Works for this visit. */ }
        return next;
      });
      if (isToday) setDate(localDay(timeZone));
      setLocationStatus('Using your device location. Your preference is saved on this device.');
    } catch (error) { if (!controller.signal.aborted) setLocationStatus(error instanceof Error ? error.message : 'Choose your city instead.'); }
    finally { if (!controller.signal.aborted) setLocating(false); }
  }
  function updatePrefs(patch: Partial<Preferences>) {
    const next = { ...prefs, ...patch }; setPrefs(next);
    if (patch.language) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', patch.language);
        window.history.replaceState(null, '', url);
      }
    }
    try { localStorage.setItem('panchang.preferences.v1', JSON.stringify(next)); } catch { notify('Your browser could not save these preferences.'); }
  }
  useEffect(() => {
    if (!ready || !date) return;
    const controller = new AbortController(); setLoading(true); setError(''); setTrustError(undefined); setData(null);
    const params = new URLSearchParams({ lat: String(prefs.city.latitude), lon: String(prefs.city.longitude), tz: prefs.timeZone, date, region:prefs.region, months:prefs.monthConvention, tradition:prefs.tradition, sunrise:prefs.sunriseConvention });
    fetch(`/api/panchang?${params}`, { signal: controller.signal, cache: 'no-store' }).then(async res => { const result = await res.json(); if (!res.ok) { setTrustError(result.dataTrust); throw new Error(result.error); } return result; }).then(setData).catch(err => { if (err.name !== 'AbortError') setError(err.message || 'Please try again.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ready, date, prefs.city.latitude, prefs.city.longitude, prefs.timeZone, prefs.region, prefs.monthConvention, prefs.tradition, prefs.sunriseConvention, retry]);
  useEffect(() => {
    if (!ready || !yearMonth) return;
    const controller = new AbortController(); setMonthData([]); setFutureData([]); setMonthError('');
    const [year, month] = yearMonth.split('-');
    const params = new URLSearchParams({ lat: String(prefs.city.latitude), lon: String(prefs.city.longitude), tz: prefs.timeZone, year, month, v:'2', region:prefs.region, months:prefs.monthConvention, tradition:prefs.tradition, sunrise:prefs.sunriseConvention });
    fetch(`/api/panchang-month?${params}`, { signal: controller.signal }).then(async res => { const result = await res.json(); if (!res.ok) throw new Error(result.error); return result; }).then(setMonthData).catch(err => { if (err.name !== 'AbortError') setMonthError('The lunar calendar could not load. Please try again.'); });
    const next = new Date(`${yearMonth}-01T12:00:00Z`); next.setUTCMonth(next.getUTCMonth() + 1);
    if (next.getUTCFullYear() <= 2100) {
      const futureParams = new URLSearchParams(params); futureParams.set('year', String(next.getUTCFullYear())); futureParams.set('month', String(next.getUTCMonth() + 1));
      fetch(`/api/panchang-month?${futureParams}`, { signal: controller.signal }).then(async res => { if (!res.ok) return []; return res.json(); }).then(setFutureData).catch(() => { /* The current-month calendar remains usable. */ });
    }
    return () => controller.abort();
  }, [ready, yearMonth, prefs.city.latitude, prefs.city.longitude, prefs.timeZone, prefs.region, prefs.monthConvention, prefs.tradition, prefs.sunriseConvention, retry]);
  useEffect(() => { if (modal) dialogRef.current?.showModal(); else dialogRef.current?.close(); }, [modal]);
  function fmt(iso?: string) { return formatTime(iso, prefs.timeZone, prefs.hour24, locale); }
  function endLabel(iso?: string) { if (!iso) return t('Unavailable'); const day = localDay(prefs.timeZone, new Date(iso)); return `${hi ? `${fmt(iso)} तक` : `Until ${fmt(iso)}`} ${day > date ? ` · ${dateLabel(day, { day: 'numeric', month: 'short' }, locale)}` : ''}`; }
  function navigate(id: Section) { setSection(id); setMobileNav(false); window.scrollTo({top:0,behavior:'auto'}); }
  function saveDay() {
    if (!data) return;
    const exists = saved.some(v => v.date === date && Math.abs(v.city.latitude-prefs.city.latitude)<0.000001 && Math.abs(v.city.longitude-prefs.city.longitude)<0.000001);
    const next = exists ? saved.filter(v => !(v.date === date && Math.abs(v.city.latitude-prefs.city.latitude)<0.000001 && Math.abs(v.city.longitude-prefs.city.longitude)<0.000001)) : [...saved, { date, city: prefs.city, timeZone: prefs.timeZone, title: `${data.tithi.paksha} ${data.tithi.name}`, calendar:{ region:prefs.region, monthConvention:prefs.monthConvention, tradition:prefs.tradition, sunriseConvention:prefs.sunriseConvention } }];
    setSaved(next); try { localStorage.setItem('panchang.saved.v1', JSON.stringify(next)); notify(exists ? 'Day removed from saved days' : 'Day saved on this device'); } catch { notify('Saved for this session. Browser storage is unavailable.'); }
  }
  async function share() {
    const url = new URL(window.location.href); url.search = new URLSearchParams({ date, lang:prefs.language, city: prefs.city.name, state:prefs.city.state||'', country:prefs.city.country, lat: String(prefs.city.latitude), lon: String(prefs.city.longitude), tz: prefs.timeZone, region:prefs.region, months:prefs.monthConvention, tradition:prefs.tradition, sunrise:prefs.sunriseConvention }).toString();
    const summary = `${dateLabel(date, { dateStyle: 'full' },locale)} · ${n(prefs.city.name)}\n${n(data?.tithi.paksha)} ${n(data?.tithi.name)}\n${t('SUNRISE')} ${fmt(data?.sunrise)} · ${t('SUNSET')} ${fmt(data?.sunset)}\n${n('Rahu Kalam')} ${fmt(data?.rahuKalam.start)} – ${fmt(data?.rahuKalam.end)}\n${url}`;
    try { await navigator.clipboard.writeText(summary); notify('Panchang summary copied to clipboard'); } catch { downloadFile(`panchang-${date}.txt`, summary, 'text/plain'); notify('Panchang summary downloaded'); }
  }
  function exportDay() {
    if (!data) return;
    const start = date.replaceAll('-', ''); const end = shiftDay(date, 1).replaceAll('-', '');
    const text = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Panchang//Daily Calendar//EN\r\nBEGIN:VEVENT\r\nUID:${start}-${prefs.city.latitude}-${prefs.city.longitude}@panchang.local\r\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\nSUMMARY:${n(data.tithi.paksha)} ${n(data.tithi.name)}\r\nDESCRIPTION:Sunrise ${fmt(data.sunrise)} / Sunset ${fmt(data.sunset)}. Times for ${prefs.timeZone}.\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
    downloadFile(`panchang-${date}.ics`, text, 'text/calendar'); notify('Calendar file downloaded');
  }
  function selectCity(city: CityInfo) { const timeZone = zoneFor(city); try { new Intl.DateTimeFormat('en', { timeZone }); locationRequest.current?.abort(); setLocating(false); updatePrefs({ city, timeZone, followLocation: city.name === 'Current location' }); if(isToday)setDate(localDay(timeZone)); setLocationStatus(city.name === 'Current location' ? 'Using your device location.' : 'Your selected city is saved. Use Detect my location to switch back.'); setModal(null); } catch { notify('Time zone unavailable. Please enter coordinates and a time zone.'); } }
  const weekday = data ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(data.vara.english) : 0;
  const slots = useMemo(() => {
    if (!data || !data.solarTimesAvailable) return [];
    const rise = Date.parse(data.sunrise), set = Date.parse(data.sunset);
    const begin = night ? set : rise, end = night ? (data.nextSunrise ? Date.parse(data.nextSunrise) : null) : set;
    if (end === null) return [];
    return (night ? NIGHT_ORDER : DAY_ORDER)[weekday].map((name, i) => ({ name, start: new Date(begin + (end - begin) * i / 8).toISOString(), end: new Date(begin + (end - begin) * (i + 1) / 8).toISOString(), good: ['Amrit','Shubh','Labh','Char'].includes(name) }));
  }, [data, night, weekday]);
  const shownSlots = slots.filter(slot => purpose === 'all' || (purpose === 'puja' ? ['Amrit','Shubh'].includes(slot.name) : purpose === 'travel' ? ['Char','Amrit'].includes(slot.name) : ['Labh','Amrit'].includes(slot.name)));
  const monthObservances = monthData.flatMap(p => p.observances || []);
  const upcoming = [...monthObservances, ...futureData.flatMap(p => p.observances || [])].filter(o => o.date >= date).sort((a,b)=>a.date.localeCompare(b.date)).slice(0, 4);
  const isSaved = saved.some(v => v.date === date && Math.abs(v.city.latitude-prefs.city.latitude)<0.000001 && Math.abs(v.city.longitude-prefs.city.longitude)<0.000001);
  function changeMonth(amount: number) { const d = new Date(`${yearMonth}-01T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + amount); const next = d.toISOString().slice(0,10); if(next >= '1900-01-01' && next <= '2100-12-31') setDate(next); }
  function calendarPanel(full = false) { return <LunarCalendar days={monthData} date={date} today={today} locale={locale} full={full} error={monthError} onMonth={changeMonth} onSelect={day=>{setDate(day);if(!full)navigate('today');}}/>; }
  function timingsPanel() {
    if (!data) return null;
    return <section className={s.panel}><div className={s.panelHeading}><h2><Clock3 size={18}/>{t('Make time for what matters')}</h2></div><div className={s.timingGrid}>
      <div className={s.goodTimes}><span className={s.timingCategory}><Sun size={14}/>{t('AUSPICIOUS WINDOWS')}</span>{[{name:'Brahma Muhurta',desc:'For prayer & reflection',range:data.brahmaMuhurta},{name:'Abhijit Muhurta',desc:'For new beginnings',range:data.abhijitMuhurta}].map(({name,desc,range})=><div className={s.timeRow} key={name}><div><strong>{n(name)}</strong><p>{t(desc)}</p></div><b>{fmt(range.start)} – {fmt(range.end)}</b></div>)}</div>
      <div className={s.cautionTimes}><span className={s.timingCategory}><Info size={14}/>{t('TIMES TO BE MINDFUL')}</span>{[{name:'Rahu Kalam',range:data.rahuKalam},{name:'Yamaganda',range:data.yamagandam},{name:'Gulika Kalam',range:data.gulikaKalam}].map(({name,range})=><div className={s.timeRow} key={name}><strong>{n(name)}</strong><b>{fmt(range.start)} – {fmt(range.end)}</b></div>)}</div>
    </div></section>;
  }
  function choghadiyaPanel() {
    return <section className={s.panel}><div className={s.panelHeading}><h2><Compass size={18}/>{t('Choghadiya')}</h2><div className={s.segment}><button aria-pressed={!night} onClick={()=>setNight(false)} className={!night?s.segmentActive:''}><Sun size={13}/>{t('Day')}</button><button aria-pressed={night} onClick={()=>setNight(true)} className={night?s.segmentActive:''}><Moon size={13}/>{t('Night')}</button></div></div>
      <div className={s.purposeRow}><span>{t('I’m planning')}</span>{[{id:'all',name:'My day',icon:Sun},{id:'puja',name:'Puja',icon:Flower2},{id:'travel',name:'Travel',icon:Plane},{id:'business',name:'Work',icon:BriefcaseBusiness}].map(({id,name,icon:Icon})=><button key={id} aria-pressed={purpose===id} className={purpose===id?s.activePurpose:''} onClick={()=>setPurpose(id)}><Icon size={13}/>{t(name)}</button>)}</div>
      <div className={s.slotGrid}>{shownSlots.map((slot,i)=><div key={i} className={`${s.slot} ${slot.good?s.goodSlot:s.badSlot}`}><span><i/>{n(slot.name)}{isToday&&clock>=Date.parse(slot.start)&&clock<Date.parse(slot.end)?<em>{t('NOW')}</em>:null}</span><b>{fmt(slot.start)} – {fmt(slot.end)}</b><small>{t(slot.good?slot.name==='Char'?'Favorable for movement':'Traditionally favorable':'Avoid new beginnings')}{localDay(prefs.timeZone,new Date(slot.end))>date?` · ${dateLabel(localDay(prefs.timeZone,new Date(slot.end)),{day:'numeric',month:'short'},locale)}`:''}</small></div>)}</div>
      {!slots.length?<p className={s.calendarLoading}>{tr('Timings are unavailable for this date.', 'इस तारीख के समय उपलब्ध नहीं हैं।')}</p>:null}
    </section>;
  }
  function observanceList(items: Observance[], full = false, title?:string) { return <ObservanceList items={items} title={title||t('On the horizon')} timeZone={prefs.timeZone} hour24={prefs.hour24} locale={locale} onSelect={day=>{setDate(day);navigate('today');}} onViewAll={full?undefined:()=>setSection('festivals')} loading={!monthData.length} error={monthError} compact={!full}/>; }
  const verse=gitaForDate(date);
  const selectedEvents=monthObservances.filter(event=>event.date===date);
  const regionSelect=<select aria-label={t('Regional tradition')} value={prefs.region} onChange={e=>{const region=e.target.value as Region;updatePrefs({region,monthConvention:REGIONS.find(r=>r.id===region)!.monthConvention});}}>{REGIONS.map(r=><option key={r.id} value={r.id}>{n(r.name)}</option>)}</select>;

  return <div lang={hi?'hi':'en'} className={`${s.app} ${prefs.dark?s.dark:''} ${prefs.large?s.large:''}`}>
    <a className={s.skipLink} href="#main-content">{t('Skip to Panchang')}</a>
    <aside className={`${s.sidebar} ${mobileNav?s.sidebarOpen:''}`} aria-label={tr('Main navigation','मुख्य मेनू')}>
      <a className={s.brand} href="/"><span className={s.brandMark}><Sun size={29} strokeWidth={1.4}/></span><span>{t('Panchang')}<small>{tr('YOUR DAILY COMPANION','आपका दैनिक साथी')}</small></span></a>
      <div className={s.navLabel}>{tr('EXPLORE','देखें')}</div><nav>{NAV.map(({id,title,hindi,icon:Icon})=><button key={id} className={`${s.navItem} ${section===id?s.navActive:''}`} onClick={()=>navigate(id)} aria-current={section===id?'page':undefined}><Icon size={19}/><span>{hi?hindi:title}</span>{id==='saved'&&saved.length?<em>{saved.length}</em>:null}{id===section?<span className={s.navDot}/>:null}</button>)}</nav>
      <div className={s.sidebarDivider}/><a className={s.navItem} href="/jyotish"><Sparkles size={19}/><span>{t('Kundali & Jyotish')}</span><ArrowUpRight size={14}/></a><button className={s.navItem} onClick={()=>setModal('settings')}><Settings2 size={19}/><span>{t('Settings')}</span></button>
    </aside>
    {mobileNav?<button aria-label={t('Close navigation')} className={s.navOverlay} onClick={()=>setMobileNav(false)}/>:null}
    <div className={s.workspace}><header className={s.topbar}><div className={s.breadcrumb}><button className={`${s.iconButton} ${s.mobileMenu}`} aria-label={t('Open navigation')} onClick={()=>setMobileNav(true)}><Menu size={21}/></button><strong>{NAV.find(item=>item.id===section)?.[hi?'hindi':'title']}</strong></div>
      <div className={s.topActions}><button className={s.locationButton} aria-label={t('Change Panchang location')} onClick={()=>setModal('location')}><MapPin size={15}/><span>{n(prefs.city.name)}</span><ChevronDown size={13}/></button><button className={s.languageButton} aria-label={hi?'Switch to English':'हिन्दी में पढ़ें'} onClick={()=>updatePrefs({language:hi?'en':'hi'})}><Globe2 size={15}/>{hi?'English':'हिन्दी'}</button><button className={s.iconButton} aria-label={t('Settings')} onClick={()=>setModal('settings')}><Settings2 size={18}/></button></div>
    </header>
    <main id="main-content" className={s.main}>
      <h1 className={s.quietTitle}>{section==='today'?t('Today’s Hindu Panchang'):NAV.find(item=>item.id===section)?.[hi?'hindi':'title']}</h1>
      <div className={s.toolbar}><div className={s.dayControls}><button className={s.iconButton} aria-label={t('Previous day')} disabled={!date||date<='1900-01-01'} onClick={()=>setDate(shiftDay(date,-1))}><ChevronLeft size={17}/></button><label className={s.dateControl}><CalendarDays size={16}/><input aria-label={t('Select date')} type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e=>{if(e.target.value)setDate(e.target.value);}}/></label><button className={s.iconButton} aria-label={t('Next day')} disabled={!date||date>='2100-12-31'} onClick={()=>setDate(shiftDay(date,1))}><ChevronRight size={17}/></button><button className={`${s.todayButton} ${isToday?s.todaySelected:''}`} onClick={()=>setDate(localDay(prefs.timeZone))}>{t('Today')}</button></div><div className={s.toolbarMeta}><button className={s.iconButton} disabled={!data} aria-label={t('Share Panchang')} onClick={share}><Share2 size={16}/></button><button className={s.iconButton} disabled={!data} aria-label={t('Download calendar event')} onClick={exportDay}><Download size={16}/></button><button className={s.iconButton} disabled={!data} aria-label={t('Print daily Panchang')} onClick={()=>window.print()}><Printer size={17}/></button></div></div>
      {error?<div role="alert" className={s.error}><Info size={20}/><div><strong>{t('We couldn’t calculate this day.')}</strong><p>{hi?'कृपया दूसरी तारीख या स्थान चुनें, अथवा फिर प्रयास करें।':error}</p></div><button className={s.outlineButton} onClick={()=>setRetry(v=>v+1)}>{t('Try again')}</button></div>:null}
      {loading?<div className={s.loading} role="status"><LoaderCircle className={s.spinner} size={27}/><span>{t('Reading the sky for your city…')}</span></div>:null}
      {data&&!loading?<>
        {data.solarTimesAvailable===false?<p className={s.methodNote}>{tr('There is no sunrise or sunset here on this date. Solar timings are unavailable.','इस स्थान पर इस तारीख में सूर्योदय या सूर्यास्त नहीं होता। सूर्य पर आधारित समय उपलब्ध नहीं हैं।')}</p>:null}
        {section==='today'?<>
          <section className={s.hero}><div className={s.heroContent}><div className={s.heroEyebrow}><Sun size={15}/>{t('DAILY PANCHANG')}<span>•</span>{t(isToday?'TODAY':'SELECTED DAY')}</div><h2>{dateLabel(date,{weekday:'long'},locale)}, <span>{dateLabel(date,{day:'numeric',month:'long'},locale)}</span></h2><p className={s.lunarDate}>{data.hinduMonth.isAdhika?`${n('Adhika')} `:''}{monthNameLabel(data.hinduMonth.name,locale)} <span>·</span> {n(data.tithi.paksha)} <span>·</span> {n(data.tithi.name)}</p><div className={s.heroDescription}>{t('Vikram Samvat')} {data.hinduMonth.samvat}</div>
            <dl className={s.tithiTimes}><div><dt>{t('Tithi begins')}</dt><dd>{data.tithi.start?`${dateLabel(localDay(prefs.timeZone,new Date(data.tithi.start)),{day:'numeric',month:'short'},locale)} · ${fmt(data.tithi.start)}`:'—'}</dd></div><div><dt>{t('Tithi ends')}</dt><dd>{data.tithi.end?`${dateLabel(localDay(prefs.timeZone,new Date(data.tithi.end)),{day:'numeric',month:'short'},locale)} · ${fmt(data.tithi.end)}`:'—'}</dd></div></dl>
          </div><SunArtwork/><button className={`${s.heroBookmark} ${isSaved?s.bookmarked:''}`} aria-label={t(isSaved?'Unsave this day':'Save this day')} onClick={saveDay}><Bookmark size={18} fill={isSaved?'currentColor':'none'}/></button></section>
          {data.observances?.length?observanceList(data.observances,true,t('On this day')):null}
          <div className={s.summaryGrid}>{[{label:'SUNRISE',value:fmt(data.sunrise),desc:'A fresh beginning',Icon:Sunrise},{label:'SUNSET',value:fmt(data.sunset),desc:'Time to slow down',Icon:Sunset},{label:'MOON PHASE',value:t(data.tithi.index<=15?'Waxing Moon':'Waning Moon'),desc:`${Math.round((data.moonIllumination||0)*100)}% ${t('illuminated')}`,Icon:Moon},{label:'ABHIJIT MUHURTA',value:`${fmt(data.abhijitMuhurta.start)} – ${fmt(data.abhijitMuhurta.end)}`,desc:'A traditional midday window',Icon:Sparkles}].map(({label,value,desc,Icon})=><div className={s.summaryCard} key={label}><span className={s.summaryIcon}><Icon size={22}/></span><div><small>{t(label)}</small><strong>{value}</strong><p>{t(desc)}</p></div></div>)}</div>
          <div className={s.contentColumns}><div className={s.primaryColumn}>
            <DayOverview data={data} date={date} timeZone={prefs.timeZone} hour24={prefs.hour24} clock={clock} isToday={isToday} locale={locale}/>
            <section className={s.panel}><div className={s.panelHeading}><h2><Flower2 size={18}/>{t('The five elements of today')}</h2><button className={s.textButton} onClick={()=>navigate('learn')}>{t('What do these mean?')}</button></div><div className={s.angaGrid}>{GLOSSARY.map(({name,icon:Icon},i)=>{const item=[data.tithi,data.nakshatra,data.yoga,data.karana,{name:data.vara.sanskrit,end:undefined}][i];return <div key={name} className={s.anga}><div className={s.angaTop}><span>{n(name)}</span><Icon size={16}/></div><h3>{n(item.name)}</h3><p>{i===4?n(data.vara.english):endLabel(item.end)}</p></div>;})}</div></section>
            {timingsPanel()}{!prefs.simple?choghadiyaPanel():null}
            <section className={s.wisdomCard} aria-label={t('A MOMENT OF WISDOM')}><span className={s.wisdomIcon}><BookOpen size={23}/></span><div><span className={s.eyebrow}>{t('A MOMENT OF WISDOM')}</span><h3 lang="sa">{verse.sanskrit}</h3><p>{hi?verse.hi:verse.en}</p><small>{t('Bhagavad Gita')} · {t('Chapter')} {verse.chapter}, {t('Verse')} {verse.verse}</small></div><span className={s.wisdomDecoration}>ॐ</span></section>
          </div><div className={s.secondaryColumn}>{calendarPanel()}{observanceList(upcoming)}</div></div>
        </>:null}
        {section==='calendar'?<>{calendarPanel(true)}<section className={s.selectedDetail}><Moon size={25}/><div><small>{dateLabel(date,{dateStyle:'full'},locale)}</small><h3>{n(data.tithi.paksha)} {n(data.tithi.name)}</h3><p>{n(data.nakshatra.name)} · {endLabel(data.tithi.end)}</p></div><button className={s.primaryButton} onClick={()=>navigate('today')}>{t('View daily Panchang')}<ArrowRight size={15}/></button></section>{selectedEvents.length?observanceList(selectedEvents,true,t('On this day')):null}{observanceList(monthObservances,true,t('Festivals this month'))}</>:null}
        {section==='muhurat'?<>{timingsPanel()}{choghadiyaPanel()}</>:null}
        {section==='festivals'||section==='observances'?<><div className={s.festivalMonthNav}><button className={s.outlineButton} onClick={()=>changeMonth(-1)} disabled={yearMonth<='1900-01'}><ChevronLeft size={15}/>{t('Previous month')}</button><strong>{date?dateLabel(date,{month:'long',year:'numeric'},locale):''}</strong><button className={s.outlineButton} onClick={()=>changeMonth(1)} disabled={yearMonth>='2100-12'}>{t('Next month')}<ChevronRight size={15}/></button></div><FestivalExplorer key={section} initialKind={section==='observances'?'fast':'all'} upcomingFrom={section==='festivals'?date:undefined} events={monthObservances} month={yearMonth} location={prefs.city.name} timeZone={prefs.timeZone} hour24={prefs.hour24} locale={locale} onSelect={day=>{setDate(day);navigate('today');}} loading={!monthData.length} error={monthError} onNotify={notify}/></>:null}
        {section==='saved'?<>{saved.length?<div className={s.savedGrid}>{saved.map(day=><article className={s.savedCard} key={`${day.date}-${day.city.latitude}-${day.city.longitude}`}><span className={s.eyebrow}>{dateLabel(day.date,{dateStyle:'long'},locale)}</span><h3>{n(day.title)}</h3><p>{n(day.city.name)}</p><button className={s.textButton} onClick={()=>{updatePrefs({...day.calendar,city:day.city,timeZone:day.timeZone});setDate(day.date);navigate('today');}}>{t('Open Panchang')}<ArrowRight size={15}/></button><button className={s.removeSaved} aria-label={tr('Remove saved day','सहेजा हुआ दिन हटाएँ')} onClick={()=>{const next=saved.filter(item=>item!==day);setSaved(next);try{localStorage.setItem('panchang.saved.v1',JSON.stringify(next));}catch{/* Session remains usable. */}}}><X size={16}/></button></article>)}</div>:<div className={`${s.panel} ${s.emptyState}`}><Bookmark size={36}/><h3>{t('A little space for meaningful days.')}</h3><p>{t('Use the bookmark in the daily Panchang to save a day here.')}</p></div>}</>:null}
        {section==='learn'?<>
          <section className={`${s.panel} ${s.methodology}`}><h2>{tr('A Hindu Panchang for your place and tradition','आपके स्थान और परंपरा का पंचांग')}</h2><p>{tr('Panchang means five limbs: Tithi, Nakshatra, Yoga, Karana and Vara. Sunrise and the festival calendar depend on your location. Choose your city from the small location button at the top; regional and fasting preferences are in Settings.','पंचांग के पाँच अंग हैं—तिथि, नक्षत्र, योग, करण और वार। सूर्योदय और पर्वों की तारीखें स्थान के अनुसार बदल सकती हैं। ऊपर दिए स्थान बटन से शहर चुनें और सेटिंग्स में अपनी क्षेत्रीय व व्रत की परंपरा चुनें।')}</p></section>
          <div className={s.glossaryGrid}>{GLOSSARY.map(({name,subtitle,text,hindiText,icon:Icon})=><article key={name} className={s.glossaryCard}><span className={s.summaryIcon}><Icon size={23}/></span><h2>{n(name)}</h2><h3>{t(subtitle)}</h3><p>{hi?hindiText:text}</p></article>)}</div>
          <details className={`${s.panel} ${s.methodology}`}><summary>{t('Calculation details')}</summary><h2>{t('How this Panchang is calculated')}</h2><p>{tr('The daily elements use Swiss Ephemeris with official Sun/Moon files and Lahiri ayanamsa. Daily elements are sampled at sunrise. Select upper-edge or geometric-center sunrise, Amanta or Purnimanta months, and Smarta or common Vaishnava rules in Settings. Elevation, terrain and actual weather can affect observed sunrise.','गणना में Swiss Ephemeris के सूर्य-चंद्र आँकड़े और लाहिड़ी अयनांश उपयोग होते हैं। दिन के पाँच अंग सूर्योदय के समय के हैं। सेटिंग्स में सूर्योदय की पद्धति, अमान्त या पूर्णिमान्त महीने और स्मार्त या सामान्य वैष्णव नियम चुन सकते हैं। ऊँचाई, मौसम और क्षितिज से दिखाई देने वाला सूर्योदय बदल सकता है।')}</p><p>{tr('Entries marked for regional review need confirmation from your family or temple tradition. This app does not implement every sampradaya rule or ceremony-specific Muhurta. General favorable windows can overlap caution periods.','स्थानीय पुष्टि के लिए चिह्नित पर्वों को अपनी पारिवारिक या मंदिर की परंपरा से मिलाएँ। हर सम्प्रदाय के सभी नियम और संस्कार-विशेष मुहूर्त इसमें शामिल नहीं हैं। सामान्य शुभ समय में सावधानी का समय भी आ सकता है।')}</p>{data.boundaryWarnings?.map(message=><p key={message}>{hi?'यह तारीख परंपरा या सूर्योदय की सीमा के निकट है। स्थानीय पंचांग से पुष्टि करें।':message}</p>)}<p>{tr('The daily Gita reading rotates through 36 bundled Sanskrit verses, with brief original meanings in English and Hindi. The reading follows the selected date and updates when the local day changes.','दैनिक गीता पाठ में ३६ संस्कृत श्लोक क्रम से बदलते हैं। सरल भावार्थ हिन्दी और अंग्रेज़ी में दिए गए हैं। पाठ चुनी गई तारीख के अनुसार बदलता है और नया दिन होने पर नया श्लोक दिखता है।')}</p><a href="/about">{tr('Sources and validation','स्रोत और जाँच')}</a><a href="https://github.com/arpitagarwala/hindu-panchang">{t('Source code · AGPL')}</a>
          {data.dataTrust||trustError?<DataSourceCard trust={data.dataTrust||trustError} locale={locale} timeZone={prefs.timeZone} hour24={prefs.hour24} onRetry={()=>setRetry(v=>v+1)} onMatchConvention={()=>updatePrefs({sunriseConvention:'center'})}/>:null}</details>
        </>:null}
      </>:null}
      <section className={s.cityDirectory} aria-label={t('Today’s Panchang by city')}><h2>{t('Today’s Panchang by city')}</h2><nav>{SEO_CITIES.map(city=><a key={city.slug} href={`/panchang/${city.slug}`}>{n(city.name)}</a>)}</nav></section>
      <footer className={s.quietFooter}><nav><button onClick={()=>navigate('learn')}>{t('Learn Panchang')}</button><a href="/privacy">{t('Location & privacy')}</a><a href="https://github.com/arpitagarwala/hindu-panchang">{t('Source code · AGPL')}</a></nav><p>{t('Created and owned by')} <strong>{t('Arpit Agarwala')}</strong> · <a href="https://arpitagarwala.com" target="_blank" rel="noreferrer">arpitagarwala.com</a></p></footer>
    </main></div>
    <dialog ref={dialogRef} className={s.dialog} onCancel={()=>setModal(null)} onClick={event=>{if(event.target===event.currentTarget)setModal(null);}} aria-labelledby="dialog-title"><div className={s.dialogHeader}><h2 id="dialog-title">{t(modal==='location'?'Where are you?':'Settings')}</h2><button className={s.iconButton} aria-label={t('Close dialog')} onClick={()=>setModal(null)}><X size={21}/></button></div>
      {modal==='location'?<LocationPicker current={prefs.city} onSelect={selectCity} locale={locale}/>:<>
        <div className={s.settingRow}><strong>{t('Location')}</strong><button className={s.outlineButton} onClick={()=>setModal('location')}>{n(prefs.city.name)}<ChevronDown size={14}/></button></div>
        <div className={s.settingRow}><span><strong>{t('Refresh device location on visits')}</strong><small>{t('Turn off to keep your current coordinates pinned')}</small></span><button role="switch" aria-checked={prefs.followLocation===true} aria-label={t('Refresh device location on visits')} className={`${s.toggle} ${prefs.followLocation?s.toggleOn:''}`} onClick={()=>{if(prefs.followLocation){locationRequest.current?.abort();setLocating(false);updatePrefs({followLocation:false});}else{void locateNow();}}}><span/></button></div>
        <div className={s.settingRow}><strong>{t('Regional tradition')}</strong>{regionSelect}</div>
        <div className={s.settingRow}><strong>{t('Lunar month convention')}</strong><select aria-label={t('Lunar month convention')} value={prefs.monthConvention} onChange={e=>updatePrefs({monthConvention:e.target.value as MonthConvention})}><option value="purnimanta">{n('Purnimanta')}</option><option value="amanta">{n('Amanta')}</option></select></div>
        <div className={s.settingRow}><strong>{t('Ekadashi tradition')}</strong><select aria-label={t('Ekadashi tradition')} value={prefs.tradition} onChange={e=>updatePrefs({tradition:e.target.value as Tradition})}><option value="smarta">{t('Smarta')}</option><option value="vaishnava">{t('Vaishnava · common rules')}</option></select></div>
        <div className={s.settingRow}><strong>{t('Sunrise convention')}</strong><select aria-label={t('Sunrise convention')} value={prefs.sunriseConvention} onChange={e=>updatePrefs({sunriseConvention:e.target.value as SunriseConvention})}><option value="edges">{t('Upper edge · Drik default')}</option><option value="center">{t('Geometric center')}</option></select></div>
        <div className={s.settingRow}><strong>{t('Language')}</strong><select aria-label={t('Language')} value={prefs.language} onChange={e=>updatePrefs({language:e.target.value as 'en'|'hi'})}><option value="en">English</option><option value="hi">हिन्दी</option></select></div>
        {[{key:'simple' as const,title:'Simple reading',desc:'Hide extra details and the Choghadiya grid'},{key:'hour24' as const,title:'24-hour clock',desc:'Display 18:30 instead of 06:30 pm'},{key:'large' as const,title:'Larger text',desc:'A little extra breathing room for reading'},{key:'dark' as const,title:'Evening theme',desc:'A softer, darker view for quiet moments'}].map(({key,title,desc})=><div className={s.settingRow} key={key}><span><strong>{t(title)}</strong><small>{t(desc)}</small></span><button role="switch" aria-checked={prefs[key]} aria-label={t(title)} className={`${s.toggle} ${prefs[key]?s.toggleOn:''}`} onClick={()=>updatePrefs({[key]:!prefs[key]})}><span/></button></div>)}
        <button className={s.primaryButton} onClick={()=>setModal(null)}>{t('All set')}<Check size={16}/></button>
      </>}
    </dialog>
    {toast?<div role="status" className={s.toast}><Check size={17}/>{toast}</div>:null}
  </div>;
}
