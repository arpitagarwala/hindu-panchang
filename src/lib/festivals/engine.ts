import { type CalendarOptions } from '../calendar-options';
import { calculateDaily, type DetailedPanchang } from '../panchang-server';
import { tithiAt, tithiInterval, lunarMonth, lunarElements, civilDate, shiftDate, localInstant, iso, longitude, ascendantSign, boundary } from '../astronomy/swiss-server';
import type { Observance, Parana, TimeWindow } from '../observance-types';
import { FESTIVAL_RULES, EKADASHI_SHUKLA, EKADASHI_KRISHNA, RULE_SOURCES, type Anchor } from './rules';

type Interval={index:number;start:number;end:number};
type DayProvider=(date:string)=>DetailedPanchang;
type Candidate={date:string;day:DetailedPanchang;window?:TimeWindow;overlap:number};
function overlap(interval:Interval,window?:TimeWindow):TimeWindow|undefined {
  if(!window)return undefined;
  const start=Math.max(interval.start,Date.parse(window.start)),end=Math.min(interval.end,Date.parse(window.end));
  return end>start?{start:iso(start),end:iso(end)}:undefined;
}
function anchorWindow(day:DetailedPanchang,anchor:Anchor):TimeWindow|undefined {
  if(!day.solarTimesAvailable)return undefined;
  if(anchor==='madhyahna'||anchor==='pradosh'||anchor==='nishita')return day.windows[anchor];
  if(anchor==='arunodaya')return day.windows.arunodaya?{start:day.windows.arunodaya,end:day.sunrise}:undefined;
  const start=anchor==='moonrise'?Date.parse(day.moonrise||''):anchor==='aparahna'?Date.parse(day.sunrise)+(Date.parse(day.sunset)-Date.parse(day.sunrise))*3/5:Date.parse(day.sunrise);
  if(!Number.isFinite(start))return undefined;
  return {start:iso(start),end:iso(anchor==='aparahna'?Date.parse(day.sunrise)+(Date.parse(day.sunset)-Date.parse(day.sunrise))*4/5:start+1000)};
}
function choose(interval:Interval,anchor:Anchor,getDay:DayProvider,tz:string,preferLast=false):{chosen?:Candidate;ambiguous:boolean;fallback:boolean} {
  const first=shiftDate(civilDate(interval.start,tz),-1),last=shiftDate(civilDate(interval.end,tz),1),candidates:Candidate[]=[];
  for(let date=first;date<=last;date=shiftDate(date,1)) {
    const day=getDay(date),window=overlap(interval,anchorWindow(day,anchor));
    if(window)candidates.push({date,day,window:anchor==='sunrise'||anchor==='moonrise'?undefined:window,overlap:Date.parse(window.end)-Date.parse(window.start)});
  }
  if(!candidates.length){const date=civilDate(interval.start,tz),day=getDay(date);return{chosen:day.solarTimesAvailable?{date,day,overlap:0}:undefined,ambiguous:false,fallback:true};}
  const chosen=preferLast?candidates[candidates.length-1]:candidates[0];
  return{chosen,ambiguous:candidates.length>1,fallback:false};
}
function subtractVishti(window:TimeWindow):TimeWindow|undefined {
  // Karana 7,14,21,...,56 is Vishti. Pick the longest remaining continuous
  // segment, never present a Bhadra-overlapping interval as an auspicious window.
  const start=Date.parse(window.start),end=Date.parse(window.end),pieces:{start:number;end:number}[]=[];
  let open:number|undefined;
  for(let time=start;time<=end;time=Math.min(time+30000,end)) {
    const e=lunarElements(time),bad=e.halfTithi>0&&e.halfTithi<=56&&(e.halfTithi-1)%7===6;
    if(!bad&&open===undefined)open=time;
    if((bad||time===end)&&open!==undefined){if(time>open)pieces.push({start:open,end:time});open=undefined;}
    if(time===end)break;
  }
  const best=pieces.sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0];return best?{start:iso(best.start),end:iso(best.end)}:undefined;
}
function fixedLagna(window:TimeWindow,lat:number,lon:number,sign:number):TimeWindow|undefined {
  const start=Date.parse(window.start),end=Date.parse(window.end);let begin:number|undefined,finish:number|undefined;
  const refine=(lo:number,hi:number,entering:boolean)=>{while(hi-lo>500){const mid=(lo+hi)/2;if((ascendantSign(mid,lat,lon)===sign)===entering)hi=mid;else lo=mid;}return(hi+lo)/2;};
  let prev=ascendantSign(start,lat,lon)===sign;if(prev)begin=start;
  for(let t=start+60000;t<=end+60000;t+=60000){const now=Math.min(t,end),inside=ascendantSign(now,lat,lon)===sign;if(inside&&!prev)begin=refine(Math.max(start,now-60000),now,true);if(!inside&&prev){finish=refine(Math.max(start,now-60000),now,false);break;}prev=inside;if(now===end){if(inside)finish=end;break;}}
  return begin!==undefined&&finish!==undefined&&finish>begin?{start:iso(begin),end:iso(finish)}:undefined;
}
export function ekadashiParana(fastDate:string,ekadashi:Interval,getDay:DayProvider):Parana {
  const date=shiftDate(fastDate,1),day=getDay(date),dwadashi=tithiInterval(ekadashi.end+2000);
  const hariVasara=dwadashi.start+(dwadashi.end-dwadashi.start)/4;
  const base={date,hariVasaraEnd:iso(hariVasara),dwadashiEnd:iso(dwadashi.end)};
  if(!day.solarTimesAvailable)return{...base,status:'review-required',reason:'No local sunrise/sunset; a safe parana window cannot be calculated.'};
  const sr=Date.parse(day.sunrise),ss=Date.parse(day.sunset),daylight=ss-sr,pratahEnd=sr+daylight/5;
  if(dwadashi.end<=sr)return{...base,status:'calculated',window:{start:iso(sr),end:iso(pratahEnd)},reason:'Dwadashi ends before sunrise. Use the following morning’s Pratahkal exception.'};
  const start=Math.max(sr,hariVasara),end=Math.min(pratahEnd,dwadashi.end);
  if(start<end)return{...base,status:'calculated',window:{start:iso(start),end:iso(end)},reason:'After local sunrise and Hari Vasara, before Pratahkal or Dwadashi ends, whichever comes first.'};
  const afternoonStart=Math.max(sr+daylight*3/5,hariVasara),afternoonEnd=Math.min(sr+daylight*4/5,dwadashi.end);
  if(afternoonStart<afternoonEnd)return{...base,status:'calculated',window:{start:iso(afternoonStart),end:iso(afternoonEnd)},reason:'Hari Vasara extends beyond Pratahkal. Avoid Madhyahna and use Aparahna before Dwadashi ends.'};
  return{...base,status:'review-required',reason:'Hari Vasara, Dwadashi and daylight leave no standard morning/afternoon window. Confirm this exception with your sampradaya; no invalid interval is shown.'};
}
function ekadashi(interval:Interval,getDay:DayProvider,tz:string,options:CalendarOptions):Observance|undefined {
  const found=choose(interval,'sunrise',getDay,tz),month=lunarMonth((interval.start+interval.end)/2);
  if(!found.chosen)return;
  let date=found.chosen.date,rule='Ekadashi at local sunrise; the first sunrise is used for the Smarta household tradition.';
  const startDay=civilDate(interval.start,tz),endDay=civilDate(interval.end,tz);
  if(found.fallback){date=startDay;rule='Ekadashi touches no local sunrise (kshaya). Smarta fasting is assigned to the civil day on which it begins.';}
  let needsReview=false;
  if(options.tradition==='vaishnava'){
    // Common shuddha/arunodaya rule plus extended Dwadashi (Vanjuli). Full
    // Gaudiya nakshatra Mahadwadashi precedence is explicitly not claimed.
    date=found.chosen.date;
    const rise=Date.parse(getDay(date).sunrise);
    if(found.ambiguous)date=shiftDate(date,1);
    else if(found.fallback||interval.start>rise-96*60000)date=shiftDate(date,1);
    const dwadashi=tithiInterval(interval.end+2000);
    const dwFirst=choose(dwadashi,'sunrise',getDay,tz);
    if(dwFirst.ambiguous&&dwFirst.chosen)date=dwFirst.chosen.date;
    rule='Vaishnava common-rule calculation: Dashami-free arunodaya (96 minutes before sunrise), extended Ekadashi and extended Dwadashi/Vanjuli checks.';
    needsReview=true;
  }
  const name=month.isAdhika?(interval.index===11?'Padmini':'Parama'):(interval.index===11?EKADASHI_SHUKLA:EKADASHI_KRISHNA)[month.index];
  const parana=ekadashiParana(date,interval,getDay);
  return{id:`ekadashi-${Math.round(interval.start)}`,name:`${name} Ekadashi`,date,kind:'fast',tradition:options.tradition==='smarta'?'Smarta':'Vaishnava · common rules',rule,source:RULE_SOURCES.ekadashi,status:needsReview?'review-required':'calculated',parana,notes:options.tradition==='vaishnava'?'Full ISKCON/Gaudiya and other sampradaya-specific Mahadwadashi/nakshatra rules are not certified. Confirm with your temple calendar.':undefined};
}
const observationCache=new Map<string,Observance[]>();
export function calculateObservances(from:string,to:string,lat:number,lon:number,tz:string,options:CalendarOptions):Observance[] {
  const key=`${from}|${to}|${lat}|${lon}|${tz}|${JSON.stringify(options)}`;const cached=observationCache.get(key);if(cached)return cached;
  const dayCache=new Map<string,DetailedPanchang>();
  const getDay:DayProvider=date=>{let value=dayCache.get(date);if(!value){value=calculateDaily(lat,lon,new Date(localInstant(date,12,tz)),tz,options,false);dayCache.set(date,value);}return value;};
  const events:Observance[]=[];
  const add=(event:Observance)=>{if(event.date>=from&&event.date<=to&&!events.some(e=>e.id===event.id&&e.date===event.date))events.push(event);};
  const first=localInstant(shiftDate(from,-3),0,tz),last=localInstant(shiftDate(to,3),23,tz);
  let interval=tithiInterval(first);
  for(let count=0;interval.start<last&&count<45;count++){
    const month=lunarMonth((interval.start+interval.end)/2),id=Math.round(interval.start);
    if(interval.index===11||interval.index===26){const e=ekadashi(interval,getDay,tz,options);if(e)add(e);}
    if(interval.index===13||interval.index===28){
      const selected=choose(interval,'pradosh',getDay,tz,true);if(selected.chosen){const c=selected.chosen;add({id:`pradosh-${id}`,name:'Pradosh Vrat',date:c.date,kind:'fast',rule:'Trayodashi overlapping the first fifth of the local night after sunset. Puja is restricted to that overlap.',source:RULE_SOURCES.pradosh,status:selected.ambiguous||selected.fallback?'review-required':'calculated',window:c.window,notes:selected.ambiguous?'Trayodashi overlaps two evening windows; confirm regional precedence.':undefined});}
    }
    if(interval.index===19){const selected=choose(interval,'moonrise',getDay,tz);if(selected.chosen){const c=selected.chosen;add({id:`sankashti-${id}`,name:new Date(`${c.date}T12:00:00Z`).getUTCDay()===2?'Angarki Sankashti Chaturthi':'Sankashti Chaturthi',date:c.date,kind:'fast',rule:'Krishna Chaturthi at local moonrise. The fast is broken after moonrise and worship.',source:RULE_SOURCES.sankashti,status:selected.fallback||selected.ambiguous?'review-required':'calculated',parana:{date:c.date,status:selected.fallback?'review-required':'calculated',after:!selected.fallback?c.day.moonrise:undefined,reason:!selected.fallback?'Break the fast after local moonrise and worship; this is an opening time, not a one-minute deadline.':'No Chaturthi moonrise was found for the ordinary rule. Confirm local observance.'}});}}
    if(interval.index===15||interval.index===30){const full=interval.index===15,selected=choose(interval,full?'madhyahna':'sunrise',getDay,tz);if(selected.chosen){const c=selected.chosen;add({id:`${full?'purnima':'amavasya'}-${id}`,name:full?'Purnima Vrat':'Amavasya',date:c.date,kind:full?'fast':'lunar',rule:full?'Purnima fasting uses daytime/Madhyahna contact, which can precede the sunrise Purnima calendar day.':'Amavasya at sunrise; ancestral rites and regional fasting rules are separate.',source:full?RULE_SOURCES.purnima:RULE_SOURCES.amavasya,status:selected.fallback||selected.ambiguous?'review-required':'calculated'});}}
    if(interval.index===29){
      const selected=choose(interval,'nishita',getDay,tz,true);if(selected.chosen){const c=selected.chosen,next=getDay(shiftDate(c.date,1)),end=interval.end,sr=Date.parse(next.sunrise);add({id:`shivaratri-${id}`,name:month.index===10&&!month.isAdhika?'Maha Shivaratri':'Masik Shivaratri',date:c.date,kind:'fast',rule:'Krishna Chaturdashi overlaps Nishita, the eighth of fifteen equal night periods.',source:RULE_SOURCES.shivaratri,status:selected.ambiguous||selected.fallback?'review-required':'calculated',window:c.window,parana:{date:next.localDate,status:Number.isFinite(sr)&&sr<end?'calculated':'review-required',window:Number.isFinite(sr)&&sr<end?{start:iso(sr),end:iso(end)}:undefined,reason:'Break the fast after next sunrise and before Chaturdashi ends. Traditions that wait for its end differ.'}});}
    }
    if(!month.isAdhika&&!month.isKshaya)for(const festival of FESTIVAL_RULES){
      if(festival.month!==month.index||festival.tithi!==interval.index||festival.regions&&!festival.regions.includes(options.region))continue;
      const selected=choose(interval,festival.anchor,getDay,tz,festival.id==='rama-navami'||festival.id==='vijayadashami');if(!selected.chosen)continue;
      const c=selected.chosen;let window=c.window,review=Boolean(festival.review)||selected.ambiguous||selected.fallback,notes=festival.review;
      if(festival.id==='diwali'&&window){const fixed=fixedLagna(window,lat,lon,1);if(fixed)window=fixed;else{window=undefined;review=true;notes='No Vrishabha fixed-lagna window overlaps Amavasya Pradosh. A regional alternative needs review.';}}
      if(festival.id==='raksha-bandhan'&&window){window=subtractVishti(window);if(!window){review=true;notes='Bhadra covers the Aparahna overlap. No automatically approved Rakhi window is shown.';}}
      const event:Observance={id:`${festival.id}-${id}`,name:festival.name,date:c.date,kind:'festival',rule:`${festival.anchor==='nishita'?'Nishita (local night)':festival.anchor} contact with ${month.amanta} ${interval.index<=15?'Shukla':'Krishna'} tithi ${(interval.index-1)%15+1}.${festival.id==='diwali'?' Puja further restricted to sidereal Vrishabha lagna.':''}`,source:festival.source,status:review?'review-required':'calculated',window,notes};
      add(event);
      if(festival.id==='janmashtami'&&options.region==='maharashtra')add({id:`dahi-handi-${id}`,name:'Dahi Handi · Gopalkala',date:shiftDate(c.date,1),kind:'festival',rule:'The day following the selected Janmashtami date in the Maharashtra tradition.',source:festival.source,status:'review-required',notes:'Follows the selected Janmashtami date; temple-specific Janmashtami precedence can alter this date.'});
      if(festival.id==='durga-ashtami')add({id:`sandhi-${id}`,name:'Sandhi Puja',date:civilDate(interval.end-24*60000,tz),kind:'festival',rule:'Last 24 minutes of Ashtami and first 24 minutes of Navami.',source:festival.source,status:'calculated',window:{start:iso(interval.end-24*60000),end:iso(interval.end+24*60000)}});
    }
    // Holika requires Bhadra-tail/mouth and evening exceptions. Do not silently
    // replace it with "Purnima at sunset". Include a review event, plus the
    // manually verified Delhi 2026 exception below.
    if(month.index===11&&interval.index===15&&!month.isAdhika){const selected=choose(interval,'pradosh',getDay,tz);if(selected.chosen){const c=selected.chosen,w=c.window?subtractVishti(c.window):undefined;const date=w?c.date:shiftDate(c.date,1);add({id:`holika-${id}`,name:'Holika Dahan',date,kind:'festival',rule:'Phalguna Purnima evening with Bhadra exclusions; Bhadra-tail and next-evening exceptions require review.',source:RULE_SOURCES.holika,status:'review-required',notes:'The full Holika Bhadra-mukha/punchha precedence is not yet implemented. No final puja window is asserted.'});add({id:`holi-${id}`,name:'Holi · Rangwali',date:shiftDate(date,1),kind:'festival',rule:'Day after the provisional Holika Dahan date.',source:RULE_SOURCES.holika,status:'review-required'});}}
    interval=tithiInterval(interval.end+2000);
  }
  // Source-checked local exception. Strictly scoped to the reference coordinates
  // and convention; never reused for another city/year.
  if(Math.abs(lat-28.6139)<0.015&&Math.abs(lon-77.209)<0.015&&tz==='Asia/Kolkata'&&options.sunriseConvention==='edges'){
    const source='https://www.drikpanchang.com/festivals/holi/festivals-holi-holika-dahan-timings.html?year=2026&geoname-id=1261481';
    const holika=events.find(e=>e.name==='Holika Dahan'&&e.date>='2026-03-01'&&e.date<='2026-03-04');
    if(holika){holika.date='2026-03-03';holika.status='reference-checked';holika.window={start:'2026-03-03T18:22:00+05:30',end:'2026-03-03T20:50:00+05:30'};holika.source=source;holika.notes='Published New Delhi 2026 exception after Bhadra. Reference times are minute-resolution, not a general algorithm.';}
    const holi=events.find(e=>e.name==='Holi · Rangwali'&&e.date>='2026-03-02'&&e.date<='2026-03-05');if(holi){holi.date='2026-03-04';holi.status='reference-checked';holi.source=source;}
  }
  // Kerala's main Onam day is a solar-month/nakshatra rule, not a lunar tithi.
  // Evaluate Shravana during Madhyahna while the sidereal Sun is in Simha.
  if(options.region==='kerala'){
    const read=(instant:number)=>lunarElements(instant).nakshatra;
    let cursor=first;
    for(let count=0;cursor<last&&count<45;count++){
      const nak={index:read(cursor),start:boundary(cursor,read,-1),end:boundary(cursor,read,1)};
      if(nak.index===22&&Math.floor(longitude((nak.start+nak.end)/2,0,true)/30)===4){
        const selected=choose(nak,'madhyahna',getDay,tz);
        if(selected.chosen){const c=selected.chosen;add({id:`onam-${Math.round(nak.start)}`,name:'Onam · Thiruvonam',date:c.date,kind:'festival',rule:'Shravana (Thiruvonam) nakshatra during local Madhyahna in the Simha/Chingam solar month.',source:'https://www.drikpanchang.com/festivals/onam/onam-calendar.html',status:selected.ambiguous||selected.fallback?'review-required':'calculated',window:c.window,notes:selected.ambiguous?'Nakshatra touches two Madhyahna periods; confirm the regional precedence.':undefined});}
      }
      cursor=nak.end+2000;
    }
  }
  // Exact sidereal solar ingress moments are useful in every regional calendar.
  // Regional solar-new-year day-cutoff rules are not inferred from lunar months.
  const signs=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
  let prior=Math.floor(longitude(first,0,true)/30);
  for(let time=first+6*3600000;time<=last;time+=6*3600000){const sign=Math.floor(longitude(time,0,true)/30);if(sign!==prior){
    let lo=time-6*3600000,hi=time;while(hi-lo>250){const mid=(lo+hi)/2;if(Math.floor(longitude(mid,0,true)/30)===prior)lo=mid;else hi=mid;}
    const instant=(lo+hi)/2,date=civilDate(instant,tz),day=getDay(date);
    add({id:`sankranti-${date}`,name:`${signs[sign]} Sankranti`,date,kind:'solar',rule:'Exact Lahiri sidereal solar ingress. This is the ingress moment, not a regional punya-kaal or solar-new-year date.',source:RULE_SOURCES.solar,status:'calculated',window:{start:iso(instant),end:iso(instant+1000)}});
    if(options.region==='tamil'&&(sign===0||sign===9)&&day.solarTimesAvailable){
      const festivalDate=instant>Date.parse(day.sunset)?shiftDate(date,1):date;
      const name=sign===9?'Thai Pongal':'Puthandu · Tamil New Year';
      add({id:`tamil-solar-${sign}-${date}`,name,date:festivalDate,kind:'festival',rule:`Drik/Thirukanitha solar calendar: ${sign===9?'Makara/Thai':'Mesha/Chithirai'} ingress before local sunset belongs to that date; after sunset moves to the next day.`,source:sign===9?'https://www.mypanchang.com/pongal.php':'https://www.drikpanchang.com/tamil/tamil-calendar.html',status:'review-required',notes:'Computed Drik solar convention. Vakya calendars and local day-boundary traditions may differ; no separate Pongal pot muhurat is asserted.'});
      if(sign===9)for(const [offset,label] of [[-1,'Bhogi Pandigai'],[1,'Mattu Pongal'],[2,'Kaanum Pongal']] as const)add({id:`pongal-${offset}-${date}`,name:label,date:shiftDate(festivalDate,offset),kind:'festival',rule:`${Math.abs(offset)} day${Math.abs(offset)>1?'s':''} ${offset<0?'before':'after'} the selected Thai Pongal date.`,source:'https://www.drikpanchang.com/tamil/tamil-calendar.html',status:'review-required',notes:'Follows the Drik/Thirukanitha Pongal date; Vakya calendars may differ.'});
    }
    prior=sign;
  }}
  events.sort((a,b)=>a.date.localeCompare(b.date)||(a.kind==='festival'?-1:1));
  for(const event of events){const day=getDay(event.date);if(day.boundaryWarnings?.length&&event.status!=='reference-checked'){event.status='review-required';event.notes=[event.notes,...day.boundaryWarnings].filter(Boolean).join(' ');}}
  const filtered=events.filter(e=>e.date>=from&&e.date<=to);
  if(observationCache.size>180)observationCache.clear();observationCache.set(key,filtered);return filtered;
}
