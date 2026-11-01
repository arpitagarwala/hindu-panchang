import assert from 'node:assert/strict';
const base=process.env.PANCHANG_TEST_URL||'http://localhost:3000';
let checks=0;
for(const [query,zone,fragment] of [['Chiplun','Asia/Kolkata','chipl'],['Madhubani','Asia/Kolkata','madhubani'],['Udupi','Asia/Kolkata','udupi'],['Ayodhya','Asia/Kolkata','ayodhya'],['Paris, Texas','America/Chicago','paris'],['Pokhara','Asia/Kathmandu','pokhara'],['Queenstown, New Zealand','Pacific/Auckland','queenstown'],['Sao Jose dos Campos','America/Sao_Paulo','jos']]){
 const response=await fetch(`${base}/api/geocode?q=${encodeURIComponent(query)}`),body=await response.json();
 assert.equal(response.status,200,query);checks++;
 assert.ok(body.results.some(c=>c.timeZone===zone&&c.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').includes(fragment)),`${query}: named city with correct IANA zone`);checks++;
 assert.equal(body.remote,true,`${query}: worldwide provider reached`);checks++;
 console.log(`${query}: ${body.results.length} results; matching IANA zone ${zone}`);
}
for(const [lat,lon,zone] of [[0,0,'Etc/GMT'],[26.799,82.205,'Asia/Kolkata'],[27.717,85.324,'Asia/Kathmandu'],[40.7128,-74.006,'America/New_York'],[-36.8485,174.7633,'Pacific/Auckland']]){
 const response=await fetch(`${base}/api/geocode?lat=${lat}&lon=${lon}`),body=await response.json();assert.equal(response.status,200);checks++;assert.equal(body.timeZone,zone);checks++;
}
for(const path of ['/api/geocode?lat=91&lon=0','/api/geocode?lat=0','/api/geocode?q='+ 'a'.repeat(121)]){assert.equal((await fetch(base+path)).status,400);checks++;}
console.log(`Passed ${checks} worldwide city search and coordinate time-zone checks.`);
