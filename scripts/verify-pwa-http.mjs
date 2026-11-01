import assert from 'node:assert/strict';
const base=process.env.PANCHANG_TEST_URL||'http://localhost:3000';
let checks=0;
function check(condition,message){assert.ok(condition,message);checks++;}
async function get(path){const response=await fetch(new URL(path,base));check(response.status===200,`${path} serves successfully`);return response;}
const home=await (await get('/')).text();
check(home.includes('rel="manifest"')&&home.includes('/manifest.webmanifest'),'Manifest linked from initial HTML');
check(home.includes('apple-touch-icon')&&home.includes('mobile-web-app-capable')&&home.includes('apple-mobile-web-app-title'),'Apple install metadata');
check(home.includes('Install app'),'Install control is discoverable');
const manifestResponse=await get('/manifest.webmanifest');
check(manifestResponse.headers.get('content-type')?.includes('manifest+json')||manifestResponse.headers.get('content-type')?.includes('json'),'Manifest has JSON content type');
const manifest=await manifestResponse.json();
check(manifest.display==='standalone'&&manifest.scope==='/'&&manifest.start_url==='/'&&manifest.id==='/','Stable identity and standalone launch');
for(const icon of manifest.icons){const response=await get(icon.src);check(response.headers.get('content-type')?.includes('image/png'),'PNG content type');const image=Buffer.from(await response.arrayBuffer());check(image.readUInt32BE(16)===Number(icon.sizes.split('x')[0]),'Icon dimensions match manifest');}
const worker=await get('/sw.js');
check(worker.headers.get('content-type')?.includes('javascript'),'Service worker is JavaScript');
check(worker.headers.get('service-worker-allowed')==='/','Service worker can control root');
check(worker.headers.get('cache-control')?.includes('max-age=0'),'Service worker updates are revalidated');
check(!(await worker.text()).includes('__PWA_VERSION__'),'Offline content revision generated');
const offlineResponse=await get('/offline.html');
check(offlineResponse.headers.get('x-robots-tag')?.includes('noindex'),'Offline page excluded from search');
const offline=await offlineResponse.text();
check(offline.includes('/pwa/offline.js')&&offline.includes('Clear offline readings'),'Standalone saved-reading fallback included');
await get('/pwa/offline.js');await get('/pwa/apple-touch-icon.png');
const offlineScript=await (await get('/pwa/offline.js')).text();
check(offlineScript.includes('panchang.offline-months.v1')&&offline.includes('id="months"'),'Offline reader supports full month collections');
for(const [year,month,count] of [[2026,12,31],[2028,2,29]]){
  const query=new URLSearchParams({year:String(year),month:String(month),lat:'28.6139',lon:'77.209',tz:'Asia/Kolkata',detailed:'1'});
  const response=await get(`/api/panchang-month?${query}`),days=await response.json();
  check(response.headers.get('cache-control')?.includes('no-store'),'Explicit downloads use fresh data');
  check(days.length===count,'Every day in the month is downloaded');
  check(days.every(day=>day.tithi.start&&day.tithi.end&&day.nakshatra.end&&day.yoga.end&&day.karana.end),'Full transitions available for every day');
  check(days.some(day=>day.observances?.length),'Festival data is bundled with the month');
  const date=`${year}-${String(month).padStart(2,'0')}-01`;
  const daily=await (await get(`/api/panchang?date=${date}&lat=28.6139&lon=77.209&tz=Asia%2FKolkata`)).json();
  check(days[0].tithi.end===daily.tithi.end&&days[0].nakshatra.end===daily.nakshatra.end&&days[0].rahuKalam.start===daily.rahuKalam.start,'Offline download agrees with the daily endpoint');
}
console.log(`Passed ${checks} deployed PWA metadata, manifest, icon, install-control, service-worker header and offline-reader checks. Native mobile installation still requires a device check.`);
