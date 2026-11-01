const Astronomy = require('astronomy-engine');

// Date: 2003-06-26 07:54 IST (02:24 UTC) in Jaipur (lat: 26.9124, lon: 75.7873)
const birthDate = new Date('2003-06-26T02:24:00.000Z');
const lat = 26.9124;
const lon = 75.7873;

const time = Astronomy.MakeTime(birthDate);
// In Astronomy Engine, time.ut is DAYS since 2000-01-01 12:00:00 UTC
const T = time.ut / 36525.0; // Century fraction from J2000
const ayanamsa = 23.85694 + (T * 100) * 0.013969; // Lahiri Ayanamsa: ~23.9056°

console.log('Birth Date:', birthDate.toISOString());
console.log('Days since J2000:', time.ut);
console.log('T:', T);
console.log('Lahiri Ayanamsa:', ayanamsa);

// 1. Ascendant calculation
const gmstHours = Astronomy.SiderealTime(time);
const gmstDeg = ((gmstHours * 15) % 360 + 360) % 360;
const ramcDeg = ((gmstDeg + lon) % 360 + 360) % 360;
const ramcRad = (ramcDeg * Math.PI) / 180;

const epsDeg = 23.439291 - 0.0130042 * T;
const epsRad = (epsDeg * Math.PI) / 180;
const latRad = (lat * Math.PI) / 180;

const y = Math.cos(ramcRad);
const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
const ascTrop = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
const ascSid = ((ascTrop - ayanamsa) % 360 + 360) % 360;
const ascSign = Math.floor(ascSid / 30) + 1;
const ascDegInSign = ascSid % 30;

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

console.log(`\nAscendant (Lagna): Tropical ${ascTrop.toFixed(4)}° | Sidereal ${ascSid.toFixed(4)}° -> ${ZODIAC_SIGNS[ascSign - 1]} (${Math.floor(ascDegInSign)}° ${Math.floor((ascDegInSign % 1) * 60)}' ${((ascDegInSign * 3600) % 60).toFixed(2)}")`);

const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

console.log('\n--- Planetary Positions & Houses (Whole Sign from Lagna) ---');
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
  const sidLon = ((tropLon - ayanamsa) % 360 + 360) % 360;
  const signNum = Math.floor(sidLon / 30) + 1;
  const degInSign = sidLon % 30;
  const house = ((signNum - ascSign + 12) % 12) + 1;

  console.log(`${b.padEnd(8)}: Sidereal ${sidLon.toFixed(4)}° | ${ZODIAC_SIGNS[signNum - 1].padEnd(11)} (deg: ${degInSign.toFixed(2)}°) -> House ${house}`);
}

// Rahu / Ketu (Mean node)
const omegaMean = ((125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000) % 360 + 360) % 360;
const rahuSid = ((omegaMean - ayanamsa) % 360 + 360) % 360;
const ketuSid = ((rahuSid + 180) % 360 + 360) % 360;
const rahuSign = Math.floor(rahuSid / 30) + 1;
const ketuSign = Math.floor(ketuSid / 30) + 1;
console.log(`Rahu    : Sidereal ${rahuSid.toFixed(4)}° | ${ZODIAC_SIGNS[rahuSign - 1].padEnd(11)} (deg: ${(rahuSid % 30).toFixed(2)}°) -> House ${((rahuSign - ascSign + 12) % 12) + 1}`);
console.log(`Ketu    : Sidereal ${ketuSid.toFixed(4)}° | ${ZODIAC_SIGNS[ketuSign - 1].padEnd(11)} (deg: ${(ketuSid % 30).toFixed(2)}°) -> House ${((ketuSign - ascSign + 12) % 12) + 1}`);
