import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createOfflineReading, saveOfflineReading, OFFLINE_KEY, OFFLINE_LIMIT } from '../src/lib/pwa-readings';
import { calculateDaily } from '../src/lib/panchang-server';
import { CALENDAR_DEFAULTS } from '../src/lib/calendar-options';
import { localNoon } from '../src/lib/panchang-query';
import manifest from '../src/app/manifest';

async function main(){
  const config=manifest();assert.equal(config.display,'standalone');assert.equal(config.start_url,'/');assert.equal(config.scope,'/');assert.equal(config.id,'/');
  for(const icon of config.icons||[]){const data=await readFile(`public${icon.src}`);assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(data.readUInt32BE(16),Number(icon.sizes?.split('x')[0]));}
  const context={...CALENDAR_DEFAULTS,date:'2026-11-01',city:'New Delhi',latitude:28.6139,longitude:77.209,timeZone:'Asia/Kolkata',hour24:false};
  const data=calculateDaily(context.latitude,context.longitude,localNoon(context.date,context.timeZone),context.timeZone,CALENDAR_DEFAULTS);
  const reading=createOfflineReading(data,context);assert.equal(reading.date,context.date);assert.match(reading.views.hi.rows[0][1],/सप्तमी/);assert.equal(reading.city.hi,'नई दिल्ली');
  assert.throws(()=>createOfflineReading(data,{...context,date:'2026-11-02'}),/does not match/);
  assert.throws(()=>createOfflineReading(data,{...context,longitude:0}),/does not match/);
  assert.notEqual(createOfflineReading(data,{...context,tradition:'vaishnava'}).key,reading.key);
  const values=new Map<string,string>(),storage={getItem:(key:string)=>values.get(key)||null,setItem:(key:string,value:string)=>{values.set(key,value);}};
  values.set(OFFLINE_KEY,'bad json');saveOfflineReading(reading,storage);saveOfflineReading(reading,storage);assert.equal(JSON.parse(values.get(OFFLINE_KEY)!).length,1);
  for(let index=0;index<25;index++)saveOfflineReading({...reading,key:String(index)},storage);
  assert.equal(JSON.parse(values.get(OFFLINE_KEY)!).length,OFFLINE_LIMIT);
  const handlers:Record<string,(event:any)=>void>={};
  const assets=new Map<string,Response>(), cachesMap=new Map<string,Map<string,Response>>([['other-app',new Map()],['panchang-pwa-old',new Map()]]);
  let offline=false, claims=0;
  const cacheApi={keys:async()=>Array.from(cachesMap.keys()),delete:async(key:string)=>cachesMap.delete(key),open:async(key:string)=>{if(!cachesMap.has(key))cachesMap.set(key,assets);const map=cachesMap.get(key)!;return{addAll:async(urls:string[])=>{for(const url of urls)map.set(url,new Response(`cached:${url}`));},match:async(url:string)=>map.get(url)?.clone()};}};
  const worker=await readFile('public/sw.js','utf8');assert.ok(!worker.includes('__PWA_VERSION__'));
  vm.runInNewContext(worker,{self:{location:{origin:'https://panchang.test'},addEventListener:(type:string,callback:(event:any)=>void)=>{handlers[type]=callback;},skipWaiting:async()=>{},clients:{claim:async()=>{claims++;}}},caches:cacheApi,URL,fetch:async()=>{if(offline)throw new Error('Offline');return new Response('live');}});
  async function lifecycle(name:string){let pending:Promise<unknown>|undefined;handlers[name]({waitUntil:(value:Promise<unknown>)=>{pending=value;}});await pending;}
  await lifecycle('install');await lifecycle('activate');assert.equal(claims,1);assert.ok(cachesMap.has('other-app'));assert.ok(!cachesMap.has('panchang-pwa-old'));
  async function request(path:string,mode='navigate',method='GET'){let response:Promise<Response>|undefined;handlers.fetch({request:{url:new URL(path,'https://panchang.test').href,mode,method},respondWith:(value:Promise<Response>)=>{response=value;}});return response?await response:undefined;}
  assert.equal(await (await request('/?date=2026-11-01'))!.text(),'live');offline=true;
  assert.equal(await (await request('/?date=2026-11-02'))!.text(),'cached:/offline.html');
  assert.equal(await request('/api/panchang?date=2026-11-01'),undefined,'Never intercept or cache API responses');
  assert.equal(await request('/_next/static/chunk.js','cors'),undefined,'Never serve old build chunks');
  assert.equal(await request('https://third-party.test/a'),undefined);
  assert.equal(await request('/','navigate','POST'),undefined);
  assert.equal(await (await request('/pwa/offline.js','cors'))!.text(),'cached:/pwa/offline.js');
  console.log('PWA checks passed: manifest/icons, bilingual saved readings, date/location isolation, deduplication/storage limits, offline navigation, API exclusion and service-worker cache updates.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
