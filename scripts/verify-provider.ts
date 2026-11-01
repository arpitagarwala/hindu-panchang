import assert from 'node:assert/strict';
import { ProkeralaClient } from '../src/lib/providers/prokerala';
import { comparePanchang,normalizeProkerala,zonedRequestDateTime } from '../src/lib/providers/normalize';
import type { ComparablePanchang } from '../src/lib/providers/types';
import { checkDaily,sourceConfiguration,VerificationRequired } from '../src/lib/providers/service';
import { CALENDAR_DEFAULTS } from '../src/lib/calendar-options';
async function main(){
let checks=0;const check=(value:unknown,message:string)=>{assert.ok(value,message);checks++;};
const input={date:'2026-11-01',timeZone:'Asia/Kolkata',latitude:28.6139,longitude:77.209,instant:new Date('2026-11-01T06:30:00Z')};
function payload(){const timing=(name:string)=>({name,start:'2026-10-31T12:00:00Z',end:'2026-11-01T12:00:00Z'});return{status:'ok',data:{vaara:'Sunday',sunrise:'2026-11-01T06:36:54+05:30',sunset:'2026-11-01T17:32:15+05:30',tithi:[{...timing('Saptami'),paksha:'Krishna Paksha'}],nakshatra:[timing('Pushya')],yoga:[timing('Sadhya')],karana:[timing('Bava')]}};}
const normalized=normalizeProkerala(payload(),input,new Date('2026-10-31T12:00:00Z'));
check(normalized.sunrise==='2026-11-01T01:06:54.000Z','Offset timestamps normalize to UTC');
check(Date.parse(normalized.expiresAt)-Date.parse(normalized.fetchedAt)===3600000,'Cache expiry is explicit and bounded');
const local:ComparablePanchang={...normalized,vara:{english:'Sunday'},tithi:{...normalized.tithi,paksha:'Krishna Paksha'},solarTimesAvailable:true};
check(comparePanchang(local,normalized).length===12,'All twelve named/temporal checks are present');
check(comparePanchang(local,normalized).every(c=>c.matches),'Equivalent data matches');
check(!comparePanchang({...local,sunrise:'2026-11-01T01:02:58Z'},normalized).find(c=>c.field==='sunrise')!.matches,'Different solar convention is not hidden by tolerance');
check(!comparePanchang({...local,tithi:{name:'Ashtami',paksha:'Krishna Paksha',end:local.tithi.end}},normalized).find(c=>c.field==='tithi.name')!.matches,'Wrong tithi name is rejected');
check(!comparePanchang({...local,yoga:{name:'Sadhya',end:'2026-11-01T12:03:00Z'}},normalized).find(c=>c.field==='yoga.end')!.matches,'Transition outside two-minute limit disagrees');
for(const mutate of [
  (v:ReturnType<typeof payload>)=>{v.status='error';},
  (v:ReturnType<typeof payload>)=>{v.data.sunrise='2026-11-02T06:36:54+05:30';},
  (v:ReturnType<typeof payload>)=>{v.data.sunrise='2026-11-01T06:36:54';},
  (v:ReturnType<typeof payload>)=>{v.data.vaara='Monday';},
  (v:ReturnType<typeof payload>)=>{v.data.tithi=[];},
  (v:ReturnType<typeof payload>)=>{v.data.yoga[0].start=v.data.yoga[0].end;},
  (v:ReturnType<typeof payload>)=>{v.data.nakshatra.push({...v.data.nakshatra[0]});},
]){const v=payload();mutate(v);assert.throws(()=>normalizeProkerala(v,input));checks++;}
check(zonedRequestDateTime(input.instant,'Asia/Kolkata')==='2026-11-01T12:00:00+05:30','Request carries actual IANA-zone offset');
check(zonedRequestDateTime(new Date('2026-07-01T16:00:00Z'),'America/New_York').endsWith('-04:00'),'Summer DST offset is preserved');
check(zonedRequestDateTime(new Date('2026-12-01T17:00:00Z'),'America/New_York').endsWith('-05:00'),'Winter offset is preserved');
check(zonedRequestDateTime(input.instant,'Asia/Kathmandu').endsWith('+05:45'),'Fractional time-zone offsets are preserved');
let now=Date.parse('2026-10-31T12:00:00Z'),tokenCalls=0,dataCalls=0;
const fakeFetch:typeof fetch=async(url,init)=>{
  check(init?.redirect==='error','Provider redirects are rejected');
  if(String(url).endsWith('/token')){tokenCalls++;check(init?.method==='POST'&&String(init.body).includes('grant_type=client_credentials'),'OAuth uses form-encoded client credentials');return Response.json({access_token:'test-token',token_type:'Bearer',expires_in:3600});}
  dataCalls++;const parsed=new URL(String(url));check(parsed.origin==='https://api.prokerala.com'&&parsed.pathname==='/v2/astrology/panchang','Only documented provider endpoint is used');check(parsed.searchParams.get('ayanamsa')==='1','Lahiri selected explicitly');check(!String(url).includes('test-secret'),'No secret in query string');check(new Headers(init?.headers).get('Authorization')==='Bearer test-token','Bearer token stays in server-to-server headers');return Response.json(payload());
};
const client=new ProkeralaClient({clientId:'test-id',clientSecret:'test-secret'},fakeFetch,()=>now);
await Promise.all([client.reference(input),client.reference(input)]);
check(tokenCalls===1&&dataCalls===1,'Concurrent requests share token acquisition and reference fetch');
check((await client.reference(input)).cached&&dataCalls===1,'Repeated requests reuse the fresh reference');
now+=3601000;await client.reference(input);check(tokenCalls===2&&dataCalls===2,'Expired reference and token are fetched again');
let failCalls=0;const bad=new ProkeralaClient({clientId:'x',clientSecret:'x'},async()=>{failCalls++;return new Response('bad gateway',{status:502});},()=>now);
await assert.rejects(()=>bad.reference(input));checks++;
await assert.rejects(()=>bad.reference(input));checks++;
check(failCalls===1,'Brief failure backoff prevents repeated provider hammering');
let authAttempts=0;const retry=new ProkeralaClient({clientId:'x',clientSecret:'x'},async(url)=>{if(String(url).endsWith('/token'))return Response.json({access_token:'test-token',token_type:'Bearer',expires_in:3600});authAttempts++;return authAttempts===1?new Response('',{status:401}):Response.json(payload());});
await retry.reference(input);check(authAttempts===2,'Expired authentication is refreshed once');
let quotaFetches=0;const capped=new ProkeralaClient({clientId:'x',clientSecret:'x',maxRequestsPerDay:1},async url=>{if(String(url).endsWith('/token'))return Response.json({access_token:'test-token',token_type:'Bearer',expires_in:3600});quotaFetches++;return Response.json(payload());});
await capped.reference(input);await assert.rejects(()=>capped.reference({...input,longitude:77.21}));checks++;check(quotaFetches===1,'Configured request budget stops additional data calls');
const invalid=new ProkeralaClient({clientId:'x',clientSecret:'x'},async url=>String(url).endsWith('/token')?Response.json({access_token:'test-token',token_type:'Bearer',expires_in:3600}):Response.json({status:'ok',data:{}}));
await assert.rejects(()=>invalid.reference(input));checks++;
const names=['PANCHANG_DATA_MODE','PROKERALA_CLIENT_ID','PROKERALA_CLIENT_SECRET'];
const saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));
try{
  delete process.env.PROKERALA_CLIENT_ID;delete process.env.PROKERALA_CLIENT_SECRET;
  process.env.PANCHANG_DATA_MODE='verified-only';
  await assert.rejects(()=>checkDaily(local,input,CALENDAR_DEFAULTS),error=>error instanceof VerificationRequired&&error.trust.status==='not-configured');checks++;
  process.env.PANCHANG_DATA_MODE='cross-check';
  check((await checkDaily(local,input,CALENDAR_DEFAULTS)).status==='not-configured','Missing credentials never claim an independent match');
  check(!JSON.stringify(sourceConfiguration()).includes('test-secret'),'Public source configuration contains no credentials');
  process.env.PANCHANG_DATA_MODE='local';
  check((await checkDaily(local,input,CALENDAR_DEFAULTS)).status==='local-only','Explicit local mode avoids the provider');
}finally{for(const name of names){if(saved[name]===undefined)delete process.env[name];else process.env[name]=saved[name];}}
console.log(`Passed ${checks} provider normalization, comparison, OAuth, cache, concurrency, DST and failure-path checks. Network calls in this suite are mocked.`);

}
main().catch(error=>{console.error(error);process.exitCode=1;});
