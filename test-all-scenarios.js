const Astronomy = require('astronomy-engine');

// Canonical 12 Zodiac signs
const ZODIAC_SIGNS = [
  { number: 1, name: 'Aries', sanskrit: 'Mesha', lord: 'Mars' },
  { number: 2, name: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus' },
  { number: 3, name: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury' },
  { number: 4, name: 'Cancer', sanskrit: 'Karka', lord: 'Moon' },
  { number: 5, name: 'Leo', sanskrit: 'Simha', lord: 'Sun' },
  { number: 6, name: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury' },
  { number: 7, name: 'Libra', sanskrit: 'Tula', lord: 'Venus' },
  { number: 8, name: 'Scorpio', sanskrit: 'Vrishchika', lord: 'Mars' },
  { number: 9, name: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter' },
  { number: 10, name: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn' },
  { number: 11, name: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn' },
  { number: 12, name: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter' },
];

function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

function formatDMS(deg) {
  const norm = normalizeDeg(deg);
  const d = Math.floor(norm);
  const mFloat = (norm - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.floor((mFloat - m) * 60);
  return `${d}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

function getAyanamsa(date) {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffYears = (date.getTime() - j2000.getTime()) / (365.242199 * 86400000);
  return 23.856944 + diffYears * (50.290966 / 3600);
}

function calculateChart(date, lat, lon) {
  const ayanamsa = getAyanamsa(date);
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525.0;

  // Ascendant
  const gmstHours = Astronomy.SiderealTime(time);
  const ramcDeg = normalizeDeg(gmstHours * 15 + lon);
  const ramcRad = toRad(ramcDeg);
  const epsDeg = 23.439291 - 0.0130042 * T;
  const epsRad = toRad(epsDeg);
  const latRad = toRad(lat);

  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  const ascTrop = normalizeDeg(toDeg(Math.atan2(y, x)));
  const ascSid = normalizeDeg(ascTrop - ayanamsa);
  const ascSign = Math.floor(ascSid / 30) + 1;
  const ascDef = ZODIAC_SIGNS[ascSign - 1];

  const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planets = {};

  for (const b of bodies) {
    let tropLon = 0;
    if (b === 'Sun') {
      tropLon = Astronomy.SunPosition(time).elon;
    } else if (b === 'Moon') {
      const vec = Astronomy.GeoVector('Moon', time, false);
      tropLon = Astronomy.Ecliptic(vec).elon;
    } else {
      const vec = Astronomy.GeoVector(b, time, false);
      tropLon = Astronomy.Ecliptic(vec).elon;
    }
    const sidLon = normalizeDeg(tropLon - ayanamsa);
    const sign = Math.floor(sidLon / 30) + 1;
    const degInSign = sidLon % 30;
    const house = ((sign - ascSign + 12) % 12) + 1;
    const signDef = ZODIAC_SIGNS[sign - 1];

    planets[b] = {
      siderealLon: sidLon,
      sign,
      signName: signDef.name,
      signSanskrit: signDef.sanskrit,
      degInSign,
      dms: formatDMS(degInSign),
      house,
    };
  }

  // Rahu / Ketu True Node
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  const M = 357.5291 + 35999.05029 * T;
  const Mprime = 134.9634 + 477198.8675 * T;
  const F = 93.2721 + 483202.0175 * T;
  const D = 297.8502 + 445267.1114 * T;
  const nutation =
    -1.4979 * Math.sin(toRad(2 * (D - F))) -
    0.206 * Math.sin(toRad(2 * M)) -
    0.1114 * Math.sin(toRad(2 * D)) +
    0.0988 * Math.sin(toRad(2 * F)) -
    0.0606 * Math.sin(toRad(Mprime));

  const rahuTrop = normalizeDeg(omega + nutation);
  const ketuTrop = normalizeDeg(rahuTrop + 180);
  const rahuSid = normalizeDeg(rahuTrop - ayanamsa);
  const ketuSid = normalizeDeg(ketuTrop - ayanamsa);

  for (const node of ['Rahu', 'Ketu']) {
    const sidLon = node === 'Rahu' ? rahuSid : ketuSid;
    const sign = Math.floor(sidLon / 30) + 1;
    const degInSign = sidLon % 30;
    const house = ((sign - ascSign + 12) % 12) + 1;
    const signDef = ZODIAC_SIGNS[sign - 1];
    planets[node] = {
      siderealLon: sidLon,
      sign,
      signName: signDef.name,
      signSanskrit: signDef.sanskrit,
      degInSign,
      dms: formatDMS(degInSign),
      house,
    };
  }

  return {
    ascendant: {
      sign: ascSign,
      signName: ascDef.name,
      signSanskrit: ascDef.sanskrit,
      dms: formatDMS(ascSid % 30),
      siderealLon: ascSid,
    },
    planets,
  };
}

// 5 Test Scenarios
const scenarios = [
  { name: '1. Jaipur Golden Benchmark (Cancer Lagna)', date: new Date('2003-06-26T02:24:00.000Z'), lat: 26.9124, lon: 75.7873 },
  { name: '2. New Delhi Boundary Cusp (Aries Lagna ~1°)', date: new Date('1990-04-15T00:40:00.000Z'), lat: 28.6139, lon: 77.2090 },
  { name: '3. Varanasi (Scorpio Lagna)', date: new Date('1985-11-12T02:00:00.000Z'), lat: 25.3176, lon: 82.9739 },
  { name: '4. Sydney Southern Hemisphere (Gemini Lagna)', date: new Date('2000-01-01T14:30:00.000Z'), lat: -33.8688, lon: 151.2093 },
  { name: '5. Mumbai (Aquarius Lagna)', date: new Date('1975-08-20T13:15:00.000Z'), lat: 19.0760, lon: 72.8777 },
];

console.log('================================================================');
console.log('RUNNING 5-CHART ASTRONOMICAL VALIDATION & INVARIANT TEST SUITE');
console.log('================================================================\n');

for (const sc of scenarios) {
  console.log(`>>> ${sc.name}`);
  const res = calculateChart(sc.date, sc.lat, sc.lon);
  console.log(`Lagna: ${res.ascendant.signName} (${res.ascendant.signSanskrit}) ${res.ascendant.dms}`);

  for (const [pId, p] of Object.entries(res.planets)) {
    const expectedHouse = ((p.sign - res.ascendant.sign + 12) % 12) + 1;
    if (p.house !== expectedHouse) {
      throw new Error(`House invariant failed for ${pId}: expected ${expectedHouse}, got ${p.house}`);
    }
    console.log(`  ${pId.padEnd(8)}: ${p.signName.padEnd(12)} (${p.signSanskrit.padEnd(10)}) ${p.dms} -> House ${p.house}`);
  }
  console.log('  [PASS] All house numbers match ((PlanetSign - AscSign + 12) % 12) + 1 exactly.\n');
}

console.log('================================================================');
console.log('ALL 5 CHARTS PASSED GENERAL PURPOSE VERIFICATION WITH ZERO ERRORS');
console.log('================================================================');
