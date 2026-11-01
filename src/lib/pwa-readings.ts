import type { PanchangResult } from './panchang';
import type { CalendarOptions } from './calendar-options';
import { nameLabel, translator, formatTime } from '@/components/Panchang/locale';
import { DAY_ORDER, NIGHT_ORDER } from '@/components/Panchang/data';

export const OFFLINE_KEY = 'panchang.offline-readings.v1';
export const OFFLINE_LIMIT = 20;
export type ReadingContext = CalendarOptions & { date: string; city: string; latitude: number; longitude: number; timeZone: string; hour24: boolean };
export type OfflineReading = {
  schema: 1; key: string; date: string; savedAt: string; city: {en:string;hi:string};
  convention: string;
  warnings: {en:string[];hi:string[]};
  views: Record<'en'|'hi', { heading: string; rows: [string,string][]; events: {name:string;details:string[]}[]; schedule?:[string,string][] }>;
};
export function createOfflineReading(data: PanchangResult, context: ReadingContext): OfflineReading {
  const zoneDate=new Intl.DateTimeFormat('en-CA',{timeZone:context.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.date));
  if(zoneDate!==context.date || data.lat!==context.latitude || data.lon!==context.longitude) throw new Error('Offline reading does not match the requested date or location.');
  const view=(language:'en'|'hi')=>{
    const locale=language==='hi'?'hi-IN':'en-IN', t=translator(locale), n=(value:string)=>nameLabel(value,locale);
    const instant=(value?:string)=>value?new Date(value).toLocaleString(locale,{timeZone:context.timeZone,day:'numeric',month:'short',year:'numeric'})+' · '+formatTime(value,context.timeZone,context.hour24,locale):'—';
    const range=(value:{start:string;end:string})=>`${instant(value.start)} – ${instant(value.end)}`;
    const rows:[string,string][]=[
      [n('Tithi'),`${n(data.tithi.paksha)} · ${n(data.tithi.name)}`],
      [t('Tithi begins'),instant(data.tithi.start)], [t('Tithi ends'),instant(data.tithi.end)],
      [n('Nakshatra'),`${n(data.nakshatra.name)} · ${t('Until')} ${instant(data.nakshatra.end)}`],
      [n('Yoga'),`${n(data.yoga.name)} · ${t('Until')} ${instant(data.yoga.end)}`],
      [n('Karana'),`${n(data.karana.name)} · ${t('Until')} ${instant(data.karana.end)}`],
      [n('Vara'),n(data.vara.english)], [t('SUNRISE'),instant(data.sunrise)], [t('SUNSET'),instant(data.sunset)],
      [t('Moonrise'),instant(data.moonrise)], [t('Moonset'),instant(data.moonset)],
      ...[{name:'Brahma Muhurta',value:data.brahmaMuhurta},{name:'Abhijit Muhurta',value:data.abhijitMuhurta},{name:'Rahu Kalam',value:data.rahuKalam},{name:'Yamaganda',value:data.yamagandam},{name:'Gulika Kalam',value:data.gulikaKalam}].map(({name,value})=>[n(name),value.start&&value.end?range(value):'—'] as [string,string]),
    ];
    const events=(data.observances||[]).map(event=>({name:n(event.name),details:[
      ...(event.tithiWindow?[`${t('Tithi window')}: ${range(event.tithiWindow)}`]:[]),
      ...(event.window?[`${t('Puja window')}: ${range(event.window)}`]:[]),
      ...(event.parana?[`${t('PARANA · BREAKING THE FAST')}: ${event.parana.after?instant(event.parana.after)+(language==='hi'?' के बाद':' onwards'):event.parana.window?range(event.parana.window):t('No automatic window · needs confirmation')}`]:[]),
      ...(event.status==='review-required'||event.parana?.status==='review-required'?[t('Regional review needed')]:[]),
    ]}));
    const weekday=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(data.vara.english);
    const schedule:[string,string][]=[];
    if(data.solarTimesAvailable&&weekday>=0){
      for(const night of [false,true]){
        const begin=Date.parse(night?data.sunset:data.sunrise),end=Date.parse(night?data.nextSunrise||'':data.sunset);
        if(!Number.isFinite(begin)||!Number.isFinite(end)||end<=begin)continue;
        (night?NIGHT_ORDER:DAY_ORDER)[weekday].forEach((name,i)=>schedule.push([`${t(night?'Night':'Day')} · ${n(name)}`,`${instant(new Date(begin+(end-begin)*i/8).toISOString())} – ${instant(new Date(begin+(end-begin)*(i+1)/8).toISOString())}`]));
      }
    }
    return {heading:new Date(`${context.date}T12:00:00Z`).toLocaleDateString(locale,{timeZone:'UTC',dateStyle:'full'}),rows,events,schedule};
  };
  const warnings={en:[...(data.boundaryWarnings||[]),...(data.solarTimesAvailable===false?['Sunrise/sunset is unavailable. Solar windows are not available.']:[]),...(data.dataTrust&&data.dataTrust.status!=='local-only'&&data.dataTrust.status!=='matched'?[data.dataTrust.message]:[])],hi:[...(data.boundaryWarnings?.length?['यह तारीख सूर्योदय या परंपरा की सीमा के पास है। स्थानीय पंचांग से पुष्टि करें।']:[]),...(data.solarTimesAvailable===false?['सूर्योदय/सूर्यास्त नहीं है। सूर्य पर आधारित समय उपलब्ध नहीं हैं।']:[]),...(data.dataTrust&&data.dataTrust.status!=='local-only'&&data.dataTrust.status!=='matched'?['स्वतंत्र तुलना की पुष्टि नहीं हुई है। समय और पद्धति की समीक्षा करें।']:[])]};
  return {schema:1,key:[context.date,context.latitude,context.longitude,context.timeZone,context.region,context.monthConvention,context.tradition,context.sunriseConvention].join('|'),date:context.date,savedAt:new Date().toISOString(),city:{en:context.city,hi:nameLabel(context.city,'hi')},convention:[context.timeZone,context.region,context.monthConvention,context.tradition,context.sunriseConvention].join(' · '),warnings,views:{en:view('en'),hi:view('hi')}};
}
export function saveOfflineReading(reading:OfflineReading, storage:Pick<Storage,'getItem'|'setItem'>) {
  let previous:OfflineReading[]=[];
  try {const parsed=JSON.parse(storage.getItem(OFFLINE_KEY)||'[]');if(Array.isArray(parsed))previous=parsed.filter(item=>item?.schema===1&&typeof item.key==='string');}catch{/* Replace corrupt local offline storage only. */}
  storage.setItem(OFFLINE_KEY,JSON.stringify([reading,...previous.filter(item=>item.key!==reading.key)].slice(0,OFFLINE_LIMIT)));
}
