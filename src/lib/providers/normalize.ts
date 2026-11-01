import type { ComparablePanchang,Comparison,ProviderReference,ReferenceElement } from './types';
const plain=(name:string)=>name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z]/g,'');
const aliases:Record<string,string>={dwitiya:'dvitiya',tritiya:'tritiya',dwadasi:'dwadashi',dvadashi:'dwadashi',dvadasi:'dwadashi',ekadasi:'ekadashi',chaturdasi:'chaturdashi',sashti:'shashthi',shashti:'shashthi',saptami:'saptami',ashtami:'ashtami',aswini:'ashwini',mrigashira:'mrigashirsha',mrigasira:'mrigashirsha',mrigashirsa:'mrigashirsha',dhanishta:'dhanishtha',dhanishtha:'dhanishtha',shravishta:'dhanishtha',satabhisha:'shatabhisha',purvaphalguni:'purvaphalguni',uttaraphalguni:'uttaraphalguni',purvashada:'purvaashadha',uttarashada:'uttaraashadha',purvabhadra:'purvabhadrapada',uttarabhadra:'uttarabhadrapada',viskambha:'vishkambha',preeti:'priti',ayushmana:'ayushman',sukarman:'sukarma',vanij:'vanija',gara:'garija',garaja:'garija',bav:'bava',vishti:'vishti',bavakarana:'bava',kimstughna:'kinstughna'};
export const canonicalName=(name:string)=>aliases[plain(name)]||plain(name);
function record(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid provider object.');return value as Record<string,unknown>;}
function text(value:unknown):string{if(typeof value!=='string'||!value.trim()||value.length>100)throw new Error('Invalid provider text.');return value.trim();}
function timestamp(value:unknown):string{const input=text(value);if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(input)||!Number.isFinite(Date.parse(input)))throw new Error('Provider timestamps must include an explicit offset.');return new Date(input).toISOString();}
function civilDay(value:string,zone:string){return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));}
function atSunrise(value:unknown,sunrise:string,includePaksha=false):ReferenceElement{
  if(!Array.isArray(value)||value.length<1||value.length>8)throw new Error('Provider element intervals are missing.');
  const intervals=value.map(v=>{const item=record(v),start=timestamp(item.start),end=timestamp(item.end);if(Date.parse(end)<=Date.parse(start)||Date.parse(end)-Date.parse(start)>72*3600000)throw new Error('Invalid provider element interval.');return{name:text(item.name),start,end,...(includePaksha?{paksha:text(item.paksha)}:{})};});
  const sample=Date.parse(sunrise),matches=intervals.filter(v=>Date.parse(v.start)<=sample&&sample<Date.parse(v.end));
  if(matches.length!==1)throw new Error('Provider intervals do not uniquely cover sunrise.');
  return matches[0];
}
export function normalizeProkerala(payload:unknown,input:{date:string;timeZone:string;latitude:number;longitude:number},now=new Date()):ProviderReference{
  const envelope=record(payload);if(envelope.status!=='ok')throw new Error('Provider did not return a successful Panchang.');
  const data=record(envelope.data),sunrise=timestamp(data.sunrise),sunset=timestamp(data.sunset);
  if(civilDay(sunrise,input.timeZone)!==input.date||civilDay(sunset,input.timeZone)!==input.date||Date.parse(sunset)<=Date.parse(sunrise))throw new Error('Provider solar events belong to a different local date.');
  const vara=text(data.vaara),expected=new Date(`${input.date}T12:00:00Z`).toLocaleDateString('en-US',{weekday:'long',timeZone:'UTC'});
  if(vara.toLowerCase()!==expected.toLowerCase())throw new Error('Provider weekday does not match the requested date.');
  return{provider:'Prokerala',date:input.date,timeZone:input.timeZone,latitude:input.latitude,longitude:input.longitude,sunrise,sunset,vara,tithi:atSunrise(data.tithi,sunrise,true),nakshatra:atSunrise(data.nakshatra,sunrise),yoga:atSunrise(data.yoga,sunrise),karana:atSunrise(data.karana,sunrise),fetchedAt:now.toISOString(),expiresAt:new Date(now.getTime()+3600000).toISOString(),sourceUrl:'https://api.prokerala.com/docs/daily-panchang'};
}
export function comparePanchang(local:ComparablePanchang,reference:ProviderReference):Comparison[]{
  const checks:Comparison[]=[];
  for(const field of ['tithi','nakshatra','yoga','karana'] as const){
    const a=local[field],b=reference[field];checks.push({field:`${field}.name`,local:a.name,reference:b.name,matches:canonicalName(a.name)===canonicalName(b.name)});
    const delta=a.end?Math.abs(Date.parse(a.end)-Date.parse(b.end))/1000:Infinity;
    checks.push({field:`${field}.end`,local:a.end||'unavailable',reference:b.end,matches:Number.isFinite(delta)&&delta<=120,...(Number.isFinite(delta)?{deltaSeconds:Math.round(delta*1000)/1000}:{}),toleranceSeconds:120});
  }
  checks.push({field:'tithi.paksha',local:local.tithi.paksha,reference:reference.tithi.paksha||'',matches:canonicalName(local.tithi.paksha)===canonicalName(reference.tithi.paksha||'')});
  checks.push({field:'vara',local:local.vara.english,reference:reference.vara,matches:canonicalName(local.vara.english)===canonicalName(reference.vara)});
  for(const field of ['sunrise','sunset'] as const){const delta=Math.abs(Date.parse(local[field])-Date.parse(reference[field]))/1000;checks.push({field,local:local[field],reference:reference[field],matches:Number.isFinite(delta)&&delta<=90,...(Number.isFinite(delta)?{deltaSeconds:Math.round(delta*1000)/1000}:{}),toleranceSeconds:90});}
  return checks;
}
export function zonedRequestDateTime(instant:Date,timeZone:string):string{
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(instant);
  const n=(type:string)=>parts.find(p=>p.type===type)!.value;
  const utc=Date.UTC(+n('year'),+n('month')-1,+n('day'),+n('hour'),+n('minute'),+n('second'));
  const minutes=Math.round((utc-instant.getTime())/60000),sign=minutes<0?'-':'+';
  return `${n('year')}-${n('month')}-${n('day')}T${n('hour')}:${n('minute')}:${n('second')}${sign}${String(Math.floor(Math.abs(minutes)/60)).padStart(2,'0')}:${String(Math.abs(minutes)%60).padStart(2,'0')}`;
}
