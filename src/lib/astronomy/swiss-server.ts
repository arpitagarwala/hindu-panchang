// Server only. Never import into a client component: the native library has
// process-wide settings, configured once and never mutated per request.
import * as swe from 'sweph';
import * as Astronomy from 'astronomy-engine';
import path from 'node:path';
import { localNoon } from '@/lib/panchang-query';
import type { SunriseConvention } from '@/lib/calendar-options';
import { ensureEphemerisIntegrity } from './ephemeris-integrity';

ensureEphemerisIntegrity();
swe.set_ephe_path(path.join(process.cwd(), 'data', 'ephemeris'));
swe.set_sid_mode(swe.constants.SE_SIDM_LAHIRI, 0, 0);
const C = swe.constants;
export const DAY = 86400000;
export const norm = (value: number) => (value % 360 + 360) % 360;
export const jd = (instant: Date | number) => Number(instant) / DAY + 2440587.5;
export const fromJd = (value: number) => new Date((value - 2440587.5) * DAY);
export const iso = (value: number) => new Date(value).toISOString();
export function civilDate(instant: Date | number, timeZone: string) { return new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(Number(instant))); }
export function shiftDate(date: string, delta: number) { return new Date(Date.parse(`${date}T12:00:00Z`) + delta * DAY).toISOString().slice(0,10); }
export function localInstant(date: string, hour: number, timeZone: string) {
  const target = Date.parse(`${date}T00:00:00Z`) + hour * 3600000;
  let instant = localNoon(date, timeZone).getTime() + (hour - 12) * 3600000;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(new Date(instant));
    const n = (key: string) => Number(parts.find(p=>p.type===key)?.value);
    const wall = Date.UTC(n('year'),n('month')-1,n('day'),n('hour'),n('minute'));
    const delta = target - wall; instant += delta; if (Math.abs(delta) < 1000) break;
  }
  return instant;
}
export function longitude(instant: number, body: number, sidereal = false): number {
  const result = swe.calc_ut(jd(instant), body, C.SEFLG_SWIEPH | (sidereal ? C.SEFLG_SIDEREAL : 0));
  if (result.flag < 0 || !(result.flag & C.SEFLG_SWIEPH)) throw new Error('Swiss Ephemeris data files are unavailable. Calculation stopped rather than using a lower-precision fallback.');
  return norm(result.data[0]);
}
export function lunarElements(instant: number) {
  const sun = longitude(instant, C.SE_SUN), moon = longitude(instant, C.SE_MOON);
  const siderealSun = longitude(instant, C.SE_SUN, true), siderealMoon = longitude(instant, C.SE_MOON, true);
  return { tithi: Math.floor(norm(moon-sun)/12)+1, nakshatra: Math.floor(siderealMoon/(360/27))+1, yoga: Math.floor(norm(siderealSun+siderealMoon)/(360/27))+1, halfTithi: Math.floor(norm(moon-sun)/6), sun, moon, siderealSun, siderealMoon };
}
export function tithiAt(instant: number) { return Math.floor(norm(longitude(instant,C.SE_MOON)-longitude(instant,C.SE_SUN))/12)+1; }
export function boundary(instant: number, read: (time: number) => number, direction: 1 | -1, maxHours = 40) {
  const value = read(instant); let last = instant;
  for(let h=1;h<=maxHours;h++) {
    const next = instant + direction*h*3600000;
    if(read(next)!==value) {
      let lo=Math.min(last,next), hi=Math.max(last,next);
      while(hi-lo>250) { const mid=(lo+hi)/2; if ((read(mid)===value) === (direction===1)) lo=mid; else hi=mid; }
      return Math.round((lo+hi)/2);
    }
    last=next;
  }
  throw new Error('An astronomical boundary could not be located.');
}
export function tithiInterval(instant: number) { return { index:tithiAt(instant), start:boundary(instant,tithiAt,-1), end:boundary(instant,tithiAt,1) }; }
export function riseSet(date: string, lat: number, lon: number, timeZone: string, body: 'sun'|'moon', sunriseConvention: SunriseConvention = 'edges') {
  const start=localInstant(date,0,timeZone), geopos: [number,number,number]=[lon,lat,0];
  const mode=body==='sun' && sunriseConvention==='center' ? C.SE_BIT_DISC_CENTER|C.SE_BIT_NO_REFRACTION : 0;
  const find = (flag: number) => {
    const r=swe.rise_trans(jd(start),body==='sun'?C.SE_SUN:C.SE_MOON,null,C.SEFLG_SWIEPH,flag|mode,geopos,0,15);
    if(r.flag!==0) return undefined;
    const instant=fromJd(r.data).getTime(); return civilDate(instant,timeZone)===date ? instant : undefined;
  };
  return { rise:find(C.SE_CALC_RISE), set:find(C.SE_CALC_SET) };
}
export interface LunarMonth { index:number; name:string; amanta:string; purnimanta:string; isAdhika:boolean; isKshaya:boolean; samvat:number; start:number; end:number }
const MONTHS=['Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada','Ashwin','Kartik','Margashirsha','Paush','Magh','Phalguna'];
const monthCache = new Map<string, Omit<LunarMonth,'name'|'purnimanta'|'samvat'>>();
function refineNewMoon(approx: Date) {
  let lo=approx.getTime()-900000, hi=approx.getTime()+900000;
  const phase=(time:number)=>norm(longitude(time,C.SE_MOON)-longitude(time,C.SE_SUN));
  if(phase(lo)<180 || phase(hi)>180) throw new Error('New moon boundary was not bracketed.');
  while(hi-lo>250){const mid=(lo+hi)/2;if(phase(mid)>180)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}
export function lunarMonth(instant:number, convention:'amanta'|'purnimanta'='amanta'):LunarMonth {
  const approxPrev=Astronomy.SearchMoonPhase(0,new Date(instant+1000),-35)?.date;
  const approxNext=Astronomy.SearchMoonPhase(0,new Date(instant-1000),35)?.date;
  if(!approxPrev||!approxNext)throw new Error('New moons unavailable.');
  const key=approxPrev.toISOString().slice(0,10);
  let base=monthCache.get(key);
  if(base&&(instant<base.start||instant>=base.end))base=undefined;
  if(!base){
    let start=refineNewMoon(approxPrev),end=refineNewMoon(approxNext);
    if(instant<start){end=start;start=refineNewMoon(Astronomy.SearchMoonPhase(0,new Date(start-DAY),-35)!.date);}
    if(instant>=end){start=end;end=refineNewMoon(Astronomy.SearchMoonPhase(0,new Date(end+DAY),35)!.date);}
    const prevSign=Math.floor(longitude(start,C.SE_SUN,true)/30),nextSign=Math.floor(longitude(end,C.SE_SUN,true)/30);
    const index=(prevSign+1)%12, isAdhika=prevSign===nextSign,isKshaya=(nextSign-prevSign+12)%12===2;
    base={index,amanta:MONTHS[index],isAdhika,isKshaya,start,end};
    if(monthCache.size>1000)monthCache.clear(); monthCache.set(key,base);
  }
  const purnimanta=MONTHS[(base.index+(tithiAt(instant)>15&&!base.isAdhika?1:0))%12];
  const civilYear=new Date(instant).getUTCFullYear();
  const samvat=civilYear+((new Date(instant).getUTCMonth()<=3&&base.index>=9)?56:57);
  return {...base,purnimanta,name:convention==='purnimanta'?purnimanta:base.amanta,samvat};
}
export const ephemerisMetadata={engine:'Swiss Ephemeris 2.10.03',ayanamsa:'Lahiri (Swiss Ephemeris)',data:'Official sepl_18.se1 and semo_18.se1, 1800–2399',searchResolutionSeconds:0.25};
export function ascendantSign(instant:number,lat:number,lon:number) {
  const houses=swe.houses_ex(jd(instant),C.SEFLG_SIDEREAL,lat,lon,'W');
  if(houses.flag<0)return undefined;
  return Math.floor(norm(houses.data.points[0])/30);
}
export function moonIllumination(instant:number) { const result=swe.pheno_ut(jd(instant),C.SE_MOON,C.SEFLG_SWIEPH);if(result.flag<0)throw new Error('Moon illumination is unavailable.');return result.data[1]; }
