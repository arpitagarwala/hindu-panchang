import assert from 'node:assert/strict';
import * as swe from 'sweph';
import path from 'node:path';
swe.set_ephe_path(path.resolve('data/ephemeris'));
swe.set_sid_mode(swe.constants.SE_SIDM_LAHIRI,0,0);

const origin = process.env.PANCHANG_TEST_URL || 'http://localhost:3000';
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
async function request(path) { const res = await fetch(`${origin}${path}`); return { status: res.status, data: await res.json() }; }
const normalize = value => (value % 360 + 360) % 360;
function indices(instant) {
  const jd=instant.getTime()/86400000+2440587.5;
  const sun=swe.calc_ut(jd,0,2).data[0],moon=swe.calc_ut(jd,1,2).data[0];
  const siderealSun=swe.calc_ut(jd,0,2|swe.constants.SEFLG_SIDEREAL).data[0];
  const siderealMoon=swe.calc_ut(jd,1,2|swe.constants.SEFLG_SIDEREAL).data[0];
  return {
    tithi: Math.floor(normalize(moon - sun) / 12) + 1,
    nakshatra: Math.floor(normalize(siderealMoon) / (360 / 27)) + 1,
    yoga: Math.floor(normalize(siderealSun + siderealMoon) / (360 / 27)) + 1,
    karana: Math.floor(normalize(moon - sun) / 6),
  };
}
// Verify weekday windows over a whole week, not just one favorable example.
const rahu = [8,2,7,5,6,4,3], yama = [5,4,3,2,1,7,6], gulika = [7,6,5,4,3,2,1];
for (let weekday = 0; weekday < 7; weekday++) {
  const date = `2026-10-${25 + weekday}`;
  const { status, data: p } = await request(`/api/panchang?date=${date}&lat=28.6139&lon=77.209&tz=Asia%2FKolkata`);
  check(status === 200, `${date}: successful daily response`);
  const sunrise = Date.parse(p.sunrise), sunset = Date.parse(p.sunset), eighth = (sunset - sunrise) / 8;
  for (const [field, part] of [['rahuKalam',rahu[weekday]],['yamagandam',yama[weekday]],['gulikaKalam',gulika[weekday]]]) {
    check(Math.abs(Date.parse(p[field].start) - sunrise - (part - 1) * eighth) < 2, `${date}: ${field} start`);
    check(Math.abs(Date.parse(p[field].end) - Date.parse(p[field].start) - eighth) < 2, `${date}: ${field} duration`);
  }
  const expected = indices(new Date(p.sunrise));
  for (const field of ['tithi','nakshatra','yoga']) {
    check(p[field].index === expected[field], `${date}: ${field} sampled at sunrise in sidereal system`);
    const end = Date.parse(p[field].end);
    check(end > sunrise, `${date}: ${field} ends after sunrise`);
    check(indices(new Date(end - 2000))[field] === expected[field] && indices(new Date(end + 2000))[field] !== expected[field], `${date}: ${field} transition brackets a real boundary`);
  }
  check(Date.parse(p.nextSunrise) > sunset, `${date}: next sunrise supports month-end night timings`);
}
for (const [query, zone, date] of [
  ['lat=0&lon=0','Etc/UTC','2026-10-31'],
  ['lat=40.7128&lon=-74.006','America/New_York','2026-11-01'],
  ['lat=-36.8485&lon=174.7633','Pacific/Auckland','2026-10-31'],
  ['lat=27.7172&lon=85.324','Asia/Kathmandu','2026-10-31'],
]) {
  const { status, data } = await request(`/api/panchang?date=${date}&${query}&tz=${encodeURIComponent(zone)}`);
  check(status === 200, `${zone}: successful response`);
  check(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.sunrise)) === date, `${zone}: sunrise belongs to requested local date`);
  if (query === 'lat=0&lon=0') check(data.lat === 0 && data.lon === 0, 'Zero coordinates are preserved');
}
for (const [path, expected] of [
  ['/api/panchang?lat=91',400], ['/api/panchang?lon=nope',400],
  ['/api/panchang?date=2026-02-30',400], ['/api/panchang?date=invalid',400],
  ['/api/panchang?tz=Invalid/Zone',400], ['/api/panchang-month?month=13',400],
  ['/api/panchang-month?year=1800',400],
]) check((await request(path)).status === expected, `Invalid input rejected: ${path}`);
const leap = await request('/api/panchang-month?year=2028&month=2&lat=28.6139&lon=77.209&tz=Asia%2FKolkata');
check(leap.status === 200 && leap.data.length === 29, 'Leap-year month has 29 days');
for (let i=0;i<leap.data.length;i++) check(leap.data[i].tithi.index >= 1 && leap.data[i].tithi.index <= 30, `Leap month day ${i+1} has valid lunar data`);
console.log(`Passed ${checks} API and astronomical regression checks.`);
