'use client';
import { useEffect, useState } from 'react';
import { Check, ChevronRight, Info, LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';
import { CITIES_DATABASE, type CityInfo } from '@/lib/geo/cities';
import { zoneFor } from './data';
import { translator, nameLabel, isHindi } from './locale';
import { detectDeviceLocation } from '@/lib/geo/device-location';
import s from './PanchangApp.module.css';

type SearchResult={results:CityInfo[];source:string;warning?:string;remote?:boolean};
export default function LocationPicker({current,onSelect,locale='en-IN'}:{current:CityInfo;onSelect:(city:CityInfo)=>void;locale?:string}) {
  const t=translator(locale), hi=isHindi(locale), n=(value:string|undefined)=>nameLabel(value,locale);
  const [query,setQuery]=useState('');
  const [results,setResults]=useState<CityInfo[]>(CITIES_DATABASE.slice(0,18));
  const [busy,setBusy]=useState(false);
  const [source,setSource]=useState('Popular cities');
  const [warning,setWarning]=useState('');
  const [gps,setGps]=useState(false);
  const [manual,setManual]=useState(false);
  const [lat,setLat]=useState('');
  const [lon,setLon]=useState('');
  const [label,setLabel]=useState('My location');
  const [timeZone,setTimeZone]=useState('');
  const [recent,setRecent]=useState<CityInfo[]>([]);
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem('panchang.recent-locations.v1')||'[]');if(Array.isArray(value))setRecent(value.filter(v=>Number.isFinite(v.latitude)&&Number.isFinite(v.longitude)&&typeof v.name==='string').slice(0,6));}catch{/* Recent choices are optional. */}},[]);
  useEffect(()=>{
    const controller=new AbortController();
    setResults(query.trim().length<2?CITIES_DATABASE.slice(0,18):CITIES_DATABASE.filter(c=>`${c.name} ${n(c.name)} ${c.state} ${c.country} ${c.aliases?.join(' ')}`.toLowerCase().includes(query.toLowerCase())));
    setBusy(query.trim().length>=2);
    const timer=setTimeout(async()=>{
      setBusy(true);setWarning('');
      try{const response=await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}&language=${hi?'hi':'en'}`,{signal:controller.signal});if(!response.ok)throw new Error('Search unavailable');const body=await response.json() as SearchResult;setResults(body.results);setSource(body.source);setWarning(body.warning||'');}
      catch(err){if(!controller.signal.aborted){setResults(CITIES_DATABASE.filter(c=>`${c.name} ${n(c.name)} ${c.state} ${c.country} ${c.aliases?.join(' ')}`.toLowerCase().includes(query.toLowerCase())));setSource('Offline directory');setWarning('Worldwide search is unavailable. Try again, use GPS, or enter coordinates below.');}}
      finally{if(!controller.signal.aborted)setBusy(false);}
    },query.length>=2?320:0);
    return()=>{clearTimeout(timer);controller.abort();};
  },[query,locale]);
  function select(city:CityInfo){
    const next=[city,...recent.filter(c=>Math.abs(c.latitude-city.latitude)>0.001||Math.abs(c.longitude-city.longitude)>0.001)].slice(0,6);
    try{localStorage.setItem('panchang.recent-locations.v1',JSON.stringify(next));}catch{/* Selection works without storage. */}
    onSelect(city);
  }
  async function atCoordinates(latitude:number,longitude:number,name:string,zone?:string){
    let resolved=zone?.trim();
    if(!resolved){const response=await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);if(!response.ok)throw new Error('The time zone could not be determined.');resolved=(await response.json()).timeZone;}
    new Intl.DateTimeFormat('en',{timeZone:resolved});
    select({name,country:'',latitude,longitude,timezone:0,timeZone:resolved});
  }
  async function useGPS(){
    setGps(true);setWarning('');
    try { select(await detectDeviceLocation()); }
    catch(error) { setWarning(error instanceof Error ? error.message : 'Please choose a city.'); }
    finally { setGps(false); }
  }
  async function submitCoordinates(event:React.FormEvent){
    event.preventDefault();const latitude=Number(lat),longitude=Number(lon);
    if(!lat.trim()||!lon.trim()||!Number.isFinite(latitude)||Math.abs(latitude)>90||!Number.isFinite(longitude)||Math.abs(longitude)>180){setWarning('Latitude must be −90 to 90, and longitude −180 to 180.');return;}
    setGps(true);setWarning('');try{await atCoordinates(latitude,longitude,label.trim()||'Custom location',timeZone);}catch{setWarning('Check your coordinates and IANA time zone, such as Asia/Kolkata.');}finally{setGps(false);}
  }
  return <><p className={s.dialogDescription}>{t('Search cities, towns, villages or postal codes worldwide. Add a state or country after a comma to narrow your search.')}</p><div className={s.searchField}><Search size={18}/><input autoFocus aria-label={t('Search city')} placeholder={t('Try Ayodhya, Udupi, Paris, Texas…')} value={query} onChange={e=>setQuery(e.target.value)}/>{busy?<LoaderCircle size={17} className={s.spinner}/>:null}</div><div className={s.locationMethods}><button className={s.geoButton} onClick={useGPS} disabled={gps}><LocateFixed size={17}/>{t(gps?'Locating…':'Use my current location')}</button><button className={s.textButton} onClick={()=>setManual(value=>!value)} aria-expanded={manual}>{t('Enter coordinates')}</button></div>
    {warning?<p className={s.geoError} role="status"><Info size={14}/>{hi?'स्थान नहीं मिल सका। दूसरा नाम खोजें, अनुमति दें या अक्षांश-देशांतर भरें।':warning}</p>:null}
    {manual?<form onSubmit={submitCoordinates} className={s.coordinateForm}><label>{t('Location name')}<input value={label} onChange={e=>setLabel(e.target.value)} maxLength={80}/></label><div><label>{t('Latitude')}<input aria-label={t('Latitude')} inputMode="decimal" type="number" min="-90" max="90" step="any" value={lat} onChange={e=>setLat(e.target.value)} required placeholder="28.6139"/></label><label>{t('Longitude')}<input aria-label={t('Longitude')} inputMode="decimal" type="number" min="-180" max="180" step="any" value={lon} onChange={e=>setLon(e.target.value)} required placeholder="77.2090"/></label></div><label>{t('Time zone')}<input aria-label={t('Time zone')} placeholder="Asia/Kolkata" value={timeZone} onChange={e=>setTimeZone(e.target.value)}/></label><button className={s.primaryButton} type="submit" disabled={gps}>{t('Use these coordinates')}<Check size={15}/></button></form>:null}
    {!query&&recent.length?<div className={s.recentLocations}><span className={s.eyebrow}>{t('RECENT LOCATIONS')}</span><div>{recent.map(city=><button key={`${city.latitude}-${city.longitude}`} onClick={()=>select(city)}><MapPin size={12}/>{n(city.name)}</button>)}</div></div>:null}
    <div className={s.searchStatus} role="status">{busy?(hi?'स्थान खोज रहे हैं…':'Searching…'):`${results.length} ${hi?'स्थान':'places'}`}</div>
    <div className={s.cityList} aria-busy={busy}>{results.map(city=><button key={`${city.id||city.name}-${city.latitude}-${city.longitude}`} onClick={()=>select(city)}><MapPin size={16}/><span><strong>{n(city.name)}</strong><small>{city.state?`${n(city.state)}, `:''}{n(city.country)}</small></span>{Math.abs(current.latitude-city.latitude)<0.001&&Math.abs(current.longitude-city.longitude)<0.001?<Check size={17}/>:<ChevronRight size={15}/>}</button>)}{!results.length&&!busy?<p>{t('No matching place yet.')}</p>:null}</div><p className={s.locationAttribution}><a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noreferrer">GeoNames · Open-Meteo</a></p></>;
}
