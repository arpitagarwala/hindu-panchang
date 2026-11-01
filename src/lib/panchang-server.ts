import { TITHI_NAMES, NAKSHATRA_NAMES, YOGA_NAMES, KARANA_NAMES, VARA_NAMES_EN, VARA_NAMES_SA, type PanchangResult } from './panchang';
import { type CalendarOptions, CALENDAR_DEFAULTS } from './calendar-options';
import { lunarElements, tithiInterval, lunarMonth, riseSet, civilDate, shiftDate, localInstant, boundary, iso, ephemerisMetadata, moonIllumination } from './astronomy/swiss-server';
import type { TimeWindow } from './observance-types';

export interface DetailedPanchang extends PanchangResult {
  localDate: string;
  tithi: PanchangResult['tithi'] & { start: string; end: string };
  hinduMonth: PanchangResult['hinduMonth'] & { amanta: string; purnimanta: string; index:number; isAdhika:boolean; isKshaya:boolean };
  windows: { madhyahna?: TimeWindow; pradosh?: TimeWindow; nishita?: TimeWindow; arunodaya?: string };
}
const RAHU=[8,2,7,5,6,4,3], YAMA=[5,4,3,2,1,7,6], GULIKA=[7,6,5,4,3,2,1];
const cache=new Map<string,DetailedPanchang>();
const solarCache=new Map<string,ReturnType<typeof riseSet>>();
function solar(date:string,lat:number,lon:number,tz:string,convention:CalendarOptions['sunriseConvention']) {
  const key=`${date}|${lat}|${lon}|${tz}|${convention}`;
  let value=solarCache.get(key); if(!value){value=riseSet(date,lat,lon,tz,'sun',convention);if(solarCache.size>4000)solarCache.clear();solarCache.set(key,value);}return value;
}
export function calculateDaily(lat:number,lon:number,instant:Date,timeZone='Asia/Kolkata',options:CalendarOptions=CALENDAR_DEFAULTS,transitions=true):DetailedPanchang {
  const date=civilDate(instant,timeZone),key=`${date}|${lat}|${lon}|${timeZone}|${options.region}|${options.monthConvention}|${options.sunriseConvention}|${transitions}`;
  const cached=cache.get(key);if(cached)return cached;
  const {rise:sr,set:ss}=solar(date,lat,lon,timeZone,options.sunriseConvention);
  const prev=solar(shiftDate(date,-1),lat,lon,timeZone,options.sunriseConvention);
  const next=solar(shiftDate(date,1),lat,lon,timeZone,options.sunriseConvention);
  const sample=sr??localInstant(date,12,timeZone),e=lunarElements(sample),t=tithiInterval(sample);
  const month=lunarMonth(sample,options.monthConvention);
  const weekday=new Date(`${date}T12:00:00Z`).getUTCDay();
  const isSolar=sr!==undefined&&ss!==undefined;
  const range=(start?:number,end?:number):TimeWindow=>({start:start===undefined?'':iso(start),end:end===undefined?'':iso(end)});
  const fraction=(part:number)=>isSolar?range(sr!+(ss!-sr!)*(part-1)/8,sr!+(ss!-sr!)*part/8):range();
  const night=sr!==undefined&&prev.set!==undefined?sr-prev.set:undefined;
  const nextNight=ss!==undefined&&next.rise!==undefined?next.rise-ss:undefined;
  const daylight=isSolar?ss!-sr!:undefined;
  const mid=isSolar?(sr!+ss!)/2:undefined;
  const moon=riseSet(date,lat,lon,timeZone,'moon');
  const index=(e.tithi-1)%15;
  const karana=e.halfTithi===0?'Kinstughna':e.halfTithi===57?'Shakuni':e.halfTithi===58?'Chatushpada':e.halfTithi===59?'Naga':KARANA_NAMES[(e.halfTithi-1)%7];
  const result:DetailedPanchang={
    date:new Date(localInstant(date,12,timeZone)).toISOString(),localDate:date,
    tithi:{index:e.tithi,name:index===14?(e.tithi===15?'Purnima':'Amavasya'):TITHI_NAMES[index],paksha:e.tithi<=15?'Shukla Paksha':'Krishna Paksha',start:iso(t.start),end:iso(t.end)},
    nakshatra:{index:e.nakshatra,name:NAKSHATRA_NAMES[e.nakshatra-1],...(transitions?{end:iso(boundary(sample,time=>lunarElements(time).nakshatra,1))}:{})},
    yoga:{index:e.yoga,name:YOGA_NAMES[e.yoga-1],...(transitions?{end:iso(boundary(sample,time=>lunarElements(time).yoga,1))}:{})},
    karana:{name:karana,...(transitions?{end:iso(boundary(sample,time=>lunarElements(time).halfTithi,1))}:{})},
    vara:{english:VARA_NAMES_EN[weekday],sanskrit:VARA_NAMES_SA[weekday]},
    hinduMonth:{name:month.name,samvat:month.samvat-(options.region==='gujarat'&&month.index<7?1:0),amanta:month.amanta,purnimanta:month.purnimanta,index:month.index,isAdhika:month.isAdhika,isKshaya:month.isKshaya,convention:options.monthConvention,yearConvention:options.region==='gujarat'?'Kartik':'Chaitra'},
    sunrise:sr===undefined?'':iso(sr),sunset:ss===undefined?'':iso(ss),nextSunrise:next.rise===undefined?undefined:iso(next.rise),solarTimesAvailable:isSolar,
    brahmaMuhurta:night===undefined?range():range(sr!-night*2/15,sr!-night/15),
    abhijitMuhurta:daylight===undefined?range():range(mid!-daylight/30,mid!+daylight/30),
    rahuKalam:fraction(RAHU[weekday]),yamagandam:fraction(YAMA[weekday]),gulikaKalam:fraction(GULIKA[weekday]),
    lat,lon,moonIllumination:moonIllumination(sample),
    moonrise:moon.rise===undefined?undefined:iso(moon.rise),moonset:moon.set===undefined?undefined:iso(moon.set),
    calculation:{...ephemerisMetadata,sunriseConvention:options.sunriseConvention},
    boundaryWarnings:[...(sr!==undefined&&Math.min(Math.abs(t.start-sr),Math.abs(t.end-sr))<120000?['Tithi changes within two minutes of sunrise. Small changes in coordinates, sunrise convention or ephemeris can change the sunrise tithi and observance date.']:[]),...(month.isKshaya?['An omitted lunar month (Kshaya) was detected. Complete month naming and festival precedence require regional review; month-specific festival rules are withheld.']:[])],
    windows:{madhyahna:daylight===undefined?undefined:range(sr!+daylight*2/5,sr!+daylight*3/5),pradosh:nextNight===undefined?undefined:range(ss!,ss!+nextNight/5),nishita:nextNight===undefined?undefined:range(ss!+nextNight*7/15,ss!+nextNight*8/15),arunodaya:sr===undefined?undefined:iso(sr-96*60000)},
  };
  if(cache.size>1500)cache.clear();cache.set(key,result);return result;
}
