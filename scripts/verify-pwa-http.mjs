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
console.log(`Passed ${checks} deployed PWA metadata, manifest, icon, install-control, service-worker header and offline-reader checks. Native mobile installation still requires a device check.`);
