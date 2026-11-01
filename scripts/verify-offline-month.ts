import assert from 'node:assert/strict';
import { createOfflineMonth, monthDates, saveOfflineMonth, readOfflineMonths, downloadOfflineMonth, OFFLINE_MONTH_KEY } from '../src/lib/pwa-months';
import { saveOfflineReading, OFFLINE_KEY } from '../src/lib/pwa-readings';
import { calculateDaily } from '../src/lib/panchang-server';
import { calculateObservances } from '../src/lib/festivals/engine';
import { localNoon } from '../src/lib/panchang-query';
import { CALENDAR_DEFAULTS } from '../src/lib/calendar-options';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
async function main(){
  assert.equal(monthDates('2028-02').length,29);assert.equal(monthDates('2027-02').length,28);assert.equal(monthDates('2026-12').length,31);
  for(const month of ['2026-00','2026-13','2026-2','1899-12','2101-01'])assert.throws(()=>monthDates(month));
  const context={...CALENDAR_DEFAULTS,month:'2026-12',city:'New Delhi',latitude:28.6139,longitude:77.209,timeZone:'Asia/Kolkata',hour24:false};
  const dates=monthDates(context.month),events=calculateObservances(dates[0],dates.at(-1)!,context.latitude,context.longitude,context.timeZone,context);
  const days=dates.map(date=>({...calculateDaily(context.latitude,context.longitude,localNoon(date,context.timeZone),context.timeZone,context),observances:events.filter(event=>event.date===date)}));
  const pack=createOfflineMonth(days,context);assert.equal(pack.readings.length,31);assert.equal(pack.readings.at(-1)!.date,'2026-12-31');
  assert.equal(pack.readings[0].views.en.schedule!.length,16,'Day and night Choghadiya included');
  assert.ok(pack.readings.some(day=>day.views.hi.events.length));
  assert.match(pack.readings[0].views.en.rows.find(row=>row[0]==='Nakshatra')![1],/Until/);
  assert.throws(()=>createOfflineMonth(days.slice(0,30),context),/incomplete/);
  assert.throws(()=>createOfflineMonth([...days].reverse(),context),/does not match/);
  assert.throws(()=>createOfflineMonth(days,{...context,longitude:0}),/does not match/);
  assert.throws(()=>createOfflineMonth(days.map(day=>({...day,nakshatra:{...day.nakshatra,end:undefined}})),context),/transitions/);
  const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>{values.set(key,value);}};
  saveOfflineMonth(pack,storage);saveOfflineMonth(pack,storage);assert.equal(readOfflineMonths(storage).length,1);
  for(let i=0;i<25;i++)saveOfflineReading({...pack.readings[0],key:`recent-${i}`},storage);
  assert.equal(JSON.parse(values.get(OFFLINE_KEY)!).length,20);assert.equal(readOfflineMonths(storage)[0].readings.length,31,'Recent saves cannot evict month days');
  const prior=values.get(OFFLINE_MONTH_KEY);
  assert.throws(()=>saveOfflineMonth(pack,{...storage,setItem:()=>{throw new DOMException('Full','QuotaExceededError');}}),/Full/);
  assert.equal(values.get(OFFLINE_MONTH_KEY),prior,'Quota failure leaves prior pack intact');
  for(let i=1;i<4;i++)saveOfflineMonth({...pack,key:`location-${i}`},storage);
  assert.equal(readOfflineMonths(storage).length,3);assert.equal(readOfflineMonths(storage)[0].key,'location-3');
  assert.equal(readOfflineMonths(storage).some(item=>item.key===pack.key),false,'Fourth pack replaces oldest complete pack');
  let calls=0;
  const fetcher:typeof fetch=async(url,init)=>{calls++;const params=new URL(String(url),'https://panchang.test').searchParams;assert.equal(params.get('detailed'),'1');assert.equal(params.get('months'),context.monthConvention);assert.equal(init?.cache,'no-store');return Response.json(days);};
  const downloaded=await downloadOfflineMonth(context,new AbortController().signal,fetcher);assert.equal(downloaded.readings.length,31);assert.equal(calls,1,'Whole month uses one request');
  const aborted=new AbortController();aborted.abort();await assert.rejects(()=>downloadOfflineMonth(context,aborted.signal,fetcher),{name:'AbortError'});assert.equal(calls,1);
  await assert.rejects(()=>downloadOfflineMonth(context,new AbortController().signal,async()=>new Response('',{status:503})),/could not be downloaded/);
  await assert.rejects(()=>downloadOfflineMonth(context,new AbortController().signal,async()=>Response.json(days.slice(0,2))),/incomplete/);
  // Exercise the actual offline reader without a browser/network dependency.
  class Element {
    textContent='';children:Element[]=[];listeners:Record<string,()=>void>={};value='';hidden=false;className='';type='';
    constructor(public tag='div'){}
    append(...nodes:Element[]){this.children.push(...nodes);}
    replaceChildren(...nodes:Element[]){this.children=nodes;this.value=nodes[0]?.value||'';}
    addEventListener(type:string,callback:()=>void){this.listeners[type]=callback;}
    scrollIntoView(){}
  }
  const elements=Object.fromEntries(['language','title','notice','choose','readings','reading','reconnect','clear','owner','months','choose-month','pack-info','remove-month','month-festivals'].map(id=>[id,new Element()]));
  const store=new Map([[OFFLINE_MONTH_KEY,JSON.stringify([pack])],['panchang.preferences.v1',JSON.stringify({language:'hi'})],['panchang.saved.v1','bookmarks']]);
  let confirmed=false;
  vm.runInNewContext(await readFile('public/pwa/offline.js','utf8'),{document:{getElementById:(id:string)=>elements[id],createElement:(tag:string)=>new Element(tag),documentElement:{}},localStorage:{getItem:(key:string)=>store.get(key)||null,setItem:(key:string,value:string)=>store.set(key,value),removeItem:(key:string)=>store.delete(key)},location:{href:'https://panchang.test/offline.html'},URL,Date,confirm:()=>confirmed});
  assert.equal(elements.readings.children.length,31,'Reader offers every downloaded day without a prior individual visit');
  assert.ok(elements['month-festivals'].children.length>1,'Offline month shows its festival list');
  elements.readings.value=pack.readings[30].key;elements.readings.listeners.change();assert.equal(elements.reading.children[0].textContent,pack.readings[30].views.hi.heading);
  elements.language.listeners.click();assert.equal(elements.reading.children[0].textContent,pack.readings[30].views.en.heading,'Language switch preserves selected day');
  elements['remove-month'].listeners.click();assert.equal(JSON.parse(store.get(OFFLINE_MONTH_KEY)!).length,1,'Cancelled deletion keeps month');
  confirmed=true;elements['remove-month'].listeners.click();assert.equal(JSON.parse(store.get(OFFLINE_MONTH_KEY)!).length,0);assert.equal(store.get('panchang.saved.v1'),'bookmarks','Month deletion keeps bookmarks');
  console.log('Offline month checks passed: complete 31-day packs, leap years, full transitions, festival/parana and Choghadiya data, cancellation/failure handling, atomic storage, three-pack limits and isolation from recent readings.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
