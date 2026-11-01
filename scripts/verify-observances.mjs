import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.PANCHANG_TEST_URL||'http://localhost:3000';
let count=0;
const check=(condition,message)=>{assert.ok(condition,message);count++;};
const cache=new Map();
async function month(record){const key=JSON.stringify([record.month,record.lat,record.lon,record.tz,record.tradition]);if(cache.has(key))return cache.get(key);const [year,m]=record.month.split('-');const params=new URLSearchParams({year,month:m,lat:String(record.lat),lon:String(record.lon),tz:record.tz,tradition:record.tradition||'smarta'});const response=await fetch(`${base}/api/panchang-month?${params}`);check(response.status===200,`Month API: ${key}`);const result=await response.json();cache.set(key,result);return result;}
const fixtures=JSON.parse(await fs.readFile(new URL('../research/festival-reference-fixtures.json',import.meta.url),'utf8'));
const report=[];
for(const fixture of fixtures.cases){const days=await month(fixture),events=days.flatMap(d=>d.observances||[]);const event=events.find(e=>e.name===fixture.name&&e.date===fixture.date);check(event,`${fixture.city}: ${fixture.name} on ${fixture.date}`);const row={city:fixture.city,name:fixture.name,date:fixture.date,source:fixture.source,checks:[]};
  for(const [field,reference] of Object.entries(fixture)){if(!['paranaStart','paranaEnd','windowStart','windowEnd'].includes(field))continue;const actual=field==='paranaStart'?event.parana?.window?.start:field==='paranaEnd'?event.parana?.window?.end:field==='windowStart'?event.window?.start:event.window?.end;check(actual,`${fixture.name}: ${field} exists`);const delta=Math.abs(Date.parse(actual)-Date.parse(reference))/1000;check(delta<=120,`${fixture.name}: ${field} within 120 seconds, actual delta ${delta}`);row.checks.push({field,actual,reference,deltaSeconds:Math.round(delta*10)/10});}
  if(fixture.paranaDate)check(event.parana.date===fixture.paranaDate,`${fixture.name}: correct parana local date`);report.push(row);
}
// The intercalary month must not be advanced a second time in Purnimanta.
for(const [date,amanta,purnimanta,adhika] of [['2026-05-17','Jyeshtha','Jyeshtha',true],['2026-06-01','Jyeshtha','Jyeshtha',true],['2026-06-16','Jyeshtha','Jyeshtha',false],['2026-07-01','Jyeshtha','Ashadha',false]]){
  const response=await fetch(`${base}/api/panchang?date=${date}`),day=await response.json();check(response.status===200,`${date}: monthly naming API`);check(day.hinduMonth.amanta===amanta&&day.hinduMonth.purnimanta===purnimanta&&day.hinduMonth.isAdhika===adhika,`${date}: Amanta/Purnimanta Adhika naming`);
}
for(const days of cache.values())for(const day of days)for(const event of day.observances||[]){
  check(/^https:\/\/www\.drikpanchang\.com\//.test(event.source),`${event.name}: primary rule reference`);
  check(event.date===day.localDate,`${event.name}: assigned to matching local date`);
  for(const window of [event.window,event.parana?.window].filter(Boolean))check(Date.parse(window.end)>Date.parse(window.start),`${event.name}: never return an inverted time window`);
  if(event.parana?.hariVasaraEnd&&event.parana?.window)check(Date.parse(event.parana.window.start)>=Date.parse(event.parana.hariVasaraEnd),`${event.name}: no parana within Hari Vasara`);
}
const monthEnd=await fetch(`${base}/api/panchang?date=2026-10-31&tz=America%2FNew_York&lat=40.7128&lon=-74.006`);check(monthEnd.status===200,'International month-end day loads');
const polar=await (await fetch(`${base}/api/panchang?date=2026-12-21&tz=Europe%2FOslo&lat=69.6492&lon=18.9553`)).json();check(polar.solarTimesAvailable===false&&polar.sunrise===''&&polar.rahuKalam.start==='', 'Polar night does not fabricate sunrise or ritual windows');
const edge=await(await fetch(`${base}/api/panchang?date=2026-06-30`)).json();check(edge.boundaryWarnings?.length>0,'Sunrise-adjacent tithi boundary is disclosed rather than forced to a reference date');
for(const date of ['1900-01-01','2100-12-31'])check((await fetch(`${base}/api/panchang?date=${date}`)).status===200,`${date}: supported boundary date`);
const onam=await(await fetch(`${base}/api/panchang-month?year=2026&month=8&region=kerala&lat=9.9312&lon=76.2673`)).json();check(onam.flatMap(d=>d.observances).some(e=>e.name==='Onam · Thiruvonam'&&e.date==='2026-08-26'),'Kerala Onam uses Shravana during Madhyahna in Simha');
const pongal=await(await fetch(`${base}/api/panchang-month?year=2027&month=1&region=tamil&lat=13.0827&lon=80.2707`)).json();check(pongal.flatMap(d=>d.observances).some(e=>e.name==='Thai Pongal'&&e.date==='2027-01-15'),'Tamil Pongal after-sunset ingress moves the festival to the following day');
for(const [date,year] of [['2026-10-31',2082],['2026-11-10',2083]]){const d=await(await fetch(`${base}/api/panchang?date=${date}&region=gujarat`)).json();check(d.hinduMonth.samvat===year&&d.hinduMonth.yearConvention==='Kartik',`${date}: Gujarati Kartik-year boundary`);}
await fs.writeFile(new URL('../public/validation/festival-comparison.json',import.meta.url),JSON.stringify({testedAt:new Date().toISOString(),fixtureCount:fixtures.cases.length,checks:count,scope:'Limited published date/parana samples. Calculated entries are not a claim of complete regional/sampradaya certification.',cases:report},null,2)+'\n');
console.log(`Passed ${count} observance, parana, Adhika-month, polar-night and date-boundary checks.`);
