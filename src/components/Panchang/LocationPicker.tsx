'use client';
import { useEffect, useState } from 'react';
import { Check, ChevronRight, Info, LoaderCircle, LocateFixed, MapPin, Search } from 'lucide-react';
import { CITIES_DATABASE, type CityInfo } from '@/lib/geo/cities';
import { zoneFor } from './data';
import { detectDeviceLocation } from '@/lib/geo/device-location';
import s from './PanchangApp.module.css';

type SearchResult={results:CityInfo[];source:string;warning?:string;remote?:boolean};
export default function LocationPicker({current,onSelect}:{current:CityInfo;onSelect:(city:CityInfo)=>void}) {
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
    setResults(query.trim().length<2?CITIES_DATABASE.slice(0,18):CITIES_DATABASE.filter(c=>`${c.name} ${c.state} ${c.country} ${c.aliases?.join(' ')}`.toLowerCase().includes(query.toLowerCase())));
    setBusy(query.trim().length>=2);
    const timer=setTimeout(async()=>{
      setBusy(true);setWarning('');
      try{const response=await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`,{signal:controller.signal});if(!response.ok)throw new Error('Search unavailable');const body=await response.json() as SearchResult;setResults(body.results);setSource(body.source);setWarning(body.warning||'');}
      catch(err){if(!controller.signal.aborted){setResults(CITIES_DATABASE.filter(c=>`${c.name} ${c.state} ${c.country} ${c.aliases?.join(' ')}`.toLowerCase().includes(query.toLowerCase())));setSource('Offline directory');setWarning('Worldwide search is unavailable. Try again, use GPS, or enter coordinates below.');}}
      finally{if(!controller.signal.aborted)setBusy(false);}
    },query.length>=2?320:0);
    return()=>{clearTimeout(timer);controller.abort();};
  },[query]);
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
  return <><p className={s.dialogDescription}>Search cities, towns, villages or postal codes worldwide. Add a state or country after a comma to narrow your search.</p><div className={s.searchField}><Search size={18}/><input autoFocus aria-label="Search city" placeholder="Try Ayodhya, Udupi, Paris, Texas…" value={query} onChange={e=>setQuery(e.target.value)}/>{busy?<LoaderCircle size={17} className={s.spinner}/>:null}</div><div className={s.locationMethods}><button className={s.geoButton} onClick={useGPS} disabled={gps}><LocateFixed size={17}/>{gps?'Locating…':'Use my current location'}</button><button className={s.textButton} onClick={()=>setManual(v=>!v)} aria-expanded={manual}>Enter coordinates</button></div>
    {warning?<p className={s.geoError} role="status"><Info size={14}/>{warning}</p>:null}
    {manual?<form onSubmit={submitCoordinates} className={s.coordinateForm}><label>Location name<input value={label} onChange={e=>setLabel(e.target.value)} maxLength={80}/></label><div><label>Latitude<input aria-label="Latitude" inputMode="decimal" type="number" min="-90" max="90" step="any" value={lat} onChange={e=>setLat(e.target.value)} required placeholder="28.6139"/></label><label>Longitude<input aria-label="Longitude" inputMode="decimal" type="number" min="-180" max="180" step="any" value={lon} onChange={e=>setLon(e.target.value)} required placeholder="77.2090"/></label></div><label>Time zone <span>(optional; detected from coordinates)</span><input aria-label="Custom time zone" placeholder="e.g. Asia/Kolkata" value={timeZone} onChange={e=>setTimeZone(e.target.value)}/></label><button className={s.primaryButton} type="submit" disabled={gps}>Use these coordinates <Check size={15}/></button></form>:null}
    {!query&&recent.length?<div className={s.recentLocations}><span className={s.eyebrow}>RECENT LOCATIONS</span><div>{recent.map(c=><button key={`${c.latitude}-${c.longitude}`} onClick={()=>select(c)}><MapPin size={12}/>{c.name}</button>)}</div></div>:null}
    <div className={s.searchStatus} role="status">{busy?'Searching worldwide…':`${results.length} ${query?'matching places':'popular places'}`}<span>{source}</span></div>
    <div className={s.cityList} aria-busy={busy}>{results.map(city=><button key={`${city.id||city.name}-${city.latitude}-${city.longitude}`} onClick={()=>select(city)}><MapPin size={16}/><span><strong>{city.name}</strong><small>{city.state?`${city.state}, `:''}{city.country}</small><small>{zoneFor(city)} · {city.latitude.toFixed(3)}°, {city.longitude.toFixed(3)}°</small></span>{Math.abs(current.latitude-city.latitude)<0.001&&Math.abs(current.longitude-city.longitude)<0.001?<Check size={17}/>:<ChevronRight size={15}/>}</button>)}{!results.length&&!busy?<p>No matching place yet. Try a different spelling, add the country, use GPS, or enter coordinates for any location.</p>:null}</div><p className={s.locationAttribution}>Worldwide place names: <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noreferrer">GeoNames via Open-Meteo</a>. Time zones include daylight-saving changes. Search needs an internet connection.</p></>;
}
