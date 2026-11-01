import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.PANCHANG_TEST_URL||'http://localhost:3000';
const fixture=JSON.parse(await fs.readFile(new URL('../research/drik-reference-fixtures.json',import.meta.url),'utf8'));
const normalize=name=>({Mrigashira:'Mrigashirsha',Ashwina:'Ashwin',Kartika:'Kartik',Pausha:'Paush',Magha:'Magh'}[name]||name);
const details=[];let checks=0,failures=0;
for(const record of fixture.cases){
  const params=new URLSearchParams({date:record.date,lat:String(record.latitude),lon:String(record.longitude),tz:record.timeZone,months:'amanta'});
  const response=await fetch(`${base}/api/panchang?${params}`);
  assert.equal(response.status,200,`${record.city} ${record.date}: API success`);
  const actual=await response.json();const comparisons=[];
  const compare=(field,received,expected,tolerance)=>{const delta=typeof received==='string'&&typeof expected==='string'&&expected.includes('T')?Math.abs(Date.parse(received)-Date.parse(expected))/1000:undefined;const passed=delta===undefined?normalize(received)===normalize(expected):delta<=tolerance;checks++;if(!passed)failures++;comparisons.push({field,actual:received,reference:expected,deltaSeconds:delta===undefined?undefined:Math.round(delta*10)/10,toleranceSeconds:tolerance,passed});};
  for(const field of ['tithi','nakshatra','yoga','karana']){const ref=record.reference[field];if(ref){compare(`${field}.name`,actual[field].name,ref.name);compare(`${field}.end`,actual[field].end,ref.end,120);}}
  for(const field of ['sunrise','sunset'])compare(field,actual[field],record.reference[field],90);
  for(const field of ['brahmaMuhurta','abhijitMuhurta','rahuKalam','yamagandam','gulikaKalam']){const ref=record.reference[field];if(ref)for(const key of ['start','end'])compare(`${field}.${key}`,actual[field][key],ref[key],120);}
  compare('amantaMonth',actual.hinduMonth.amanta,record.reference.amantaMonth);
  compare('purnimantaMonth',actual.hinduMonth.purnimanta,record.reference.purnimantaMonth);
  compare('vikramSamvat',actual.hinduMonth.samvat,record.reference.vikramSamvat);
  details.push({city:record.city,date:record.date,timeZone:record.timeZone,source:record.datedPermalink,comparisons});
}
const timings=details.flatMap(r=>r.comparisons).filter(r=>r.deltaSeconds!==undefined);
const max=prefix=>Math.max(...timings.filter(r=>prefix.test(r.field)).map(r=>r.deltaSeconds));
const report={testedAt:new Date().toISOString(),engine:'Swiss Ephemeris 2.10.03 with official Sun/Moon files',reference:'Drik Panchang',referenceRetrievedOn:fixture.retrievedOn,caseCount:details.length,cityCount:new Set(details.map(d=>d.city)).size,checks,failures,maxTransitionDeltaSeconds:max(/^(tithi|nakshatra|yoga|karana)\.end$/),maxSolarDeltaSeconds:max(/^(sunrise|sunset)$/),maxWindowDeltaSeconds:max(/^(brahmaMuhurta|abhijitMuhurta|rahuKalam|yamagandam|gulikaKalam)\./),sourcePrecisionSeconds:60,scope:'Manually recorded reference samples across 2025–2027. Not a worldwide accuracy certification. Centroid and rounding differences are included in the tolerances.',conventions:'Lahiri sidereal; upper-edge sunrise with standard refraction; zero elevation; compare Amanta and Purnimanta separately.',details};
await fs.mkdir(new URL('../public/validation/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../public/validation/drik-comparison.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,details:undefined},null,2));
if(failures){console.log(JSON.stringify(details.flatMap(d=>d.comparisons.filter(c=>!c.passed).map(c=>({city:d.city,date:d.date,...c}))),null,2));process.exitCode=1;}
