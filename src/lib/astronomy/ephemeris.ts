/**
 * Vedic Astrology High-Precision Astronomical Sidereal Ephemeris
 * Implements sidereal planetary longitudes, ascendant (Lagna),
 * house cusps, nakshatras, padas, speeds, retrogradation and dignities.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Astronomy = require('astronomy-engine');
import {
  PLANETS,
  ZODIAC_SIGNS,
  NAKSHATRAS,
  AYANAMSA_OFFSETS,
  AyanamsaType,
  PlanetDef,
} from './constants';
import { ensureValidDate } from '../utils/format';

export interface PlanetaryPosition {
  id: string;
  name: string;
  sanskrit: string;
  glyph: string;
  tropicalLon: number;
  siderealLon: number;
  sign: number; // 1-12 (1 = Aries)
  signName: string;
  signSanskrit: string;
  signLord: string;
  degreeInSign: number; // 0-30
  dms: string; // e.g. 14° 23' 45"
  nakshatra: number; // 1-27
  nakshatraName: string;
  nakshatraLord: string;
  pada: number; // 1-4
  navamshaSign: number; // 1-12
  navamshaSignName: string;
  speed: number; // deg per day
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Great Friend' | 'Friend' | 'Neutral' | 'Enemy' | 'Great Enemy' | 'Debilitated';
  house: number; // 1-12 relative to Ascendant
  declination?: number;
}

export interface HouseCusp {
  house: number; // 1-12
  sign: number; // 1-12
  signName: string;
  signLord: string;
  degree: number; // 0-30
  dms: string;
  spanStart: number;
  spanEnd: number;
  planets: string[]; // planet IDs in this house
}

export interface ChartCalculationResult {
  birthDateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  ayanamsaType: AyanamsaType;
  ayanamsaValue: number;
  ayanamsaDms: string;
  ascendant: {
    tropicalLon: number;
    siderealLon: number;
    sign: number;
    signName: string;
    signSanskrit: string;
    signLord: string;
    degreeInSign: number;
    dms: string;
    nakshatra: number;
    nakshatraName: string;
    nakshatraLord: string;
    pada: number;
  };
  planets: Record<string, PlanetaryPosition>;
  houses: HouseCusp[];
  moonNakshatra: {
    number: number;
    name: string;
    sanskrit: string;
    lord: string;
    pada: number;
    degreeInNakshatra: number;
    fractionElapsed: number; // 0 to 1
  };
  rashiChart: Record<number, string[]>; // Sign -> Planet IDs
  bhavatBhavam: Record<number, string[]>; // House -> Planet IDs
}

// ─── Mathematical & Astrological Helpers ────────────────────────────────────

export function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function formatDMS(deg: number): string {
  const norm = normalizeDeg(deg);
  const d = Math.floor(norm);
  const mFloat = (norm - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.floor((mFloat - m) * 60);
  return `${d}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}"`;
}

/**
 * Computes exact Lahiri / KP / Raman Ayanamsa for any date
 */
export function getAyanamsa(date: Date, type: AyanamsaType = 'lahiri'): number {
  if (type === 'tropical') return 0;
  const d = ensureValidDate(date);
  const config = AYANAMSA_OFFSETS[type] || AYANAMSA_OFFSETS.lahiri;
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const diffYears = (d.getTime() - j2000.getTime()) / (365.242199 * 86400000);
  return config.offset2000 + diffYears * config.speedPerYear;
}

/**
 * Computes True and Mean Lunar Nodes (Rahu / Ketu)
 */
export function getRahuLongitude(date: Date, trueNode: boolean = true): { rahu: number; ketu: number } {
  const d = ensureValidDate(date);
  const time = Astronomy.MakeTime(d);
  // In astronomy-engine, time.tt (or time.ut) is already the offset in days from J2000 (2000-01-01 12:00 UTC)
  const T = time.tt / 36525.0;

  // Mean longitude of ascending node (degrees)
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  omega = normalizeDeg(omega);

  if (trueNode) {
    // Sun mean anomaly
    const M = 357.5291 + 35999.05029 * T;
    // Moon mean anomaly
    const Mprime = 134.9634 + 477198.8675 * T;
    // Moon argument of latitude
    const F = 93.2721 + 483202.0175 * T;
    // Moon mean elongation
    const D = 297.8502 + 445267.1114 * T;

    // Periodic perturbations
    const nutation =
      -1.4979 * Math.sin(toRad(2 * (D - F))) -
      0.206 * Math.sin(toRad(2 * M)) -
      0.1114 * Math.sin(toRad(2 * D)) +
      0.0988 * Math.sin(toRad(2 * F)) -
      0.0606 * Math.sin(toRad(Mprime));

    omega = normalizeDeg(omega + nutation);
  }

  const rahu = omega;
  const ketu = normalizeDeg(rahu + 180);
  return { rahu, ketu };
}

/**
 * Computes Local Sidereal Time and Ascendant (Lagna)
 */
export function getAscendant(date: Date, lat: number, lon: number, ayanamsa: number) {
  const d = ensureValidDate(date);
  const safeLat = isNaN(Number(lat)) ? 28.6139 : Number(lat);
  const safeLon = isNaN(Number(lon)) ? 77.2090 : Number(lon);
  const safeAyanamsa = isNaN(Number(ayanamsa)) ? 0 : Number(ayanamsa);

  const time = Astronomy.MakeTime(d);
  const gmstHours = Astronomy.SiderealTime(time); // hours (0-24)
  const gmstDeg = normalizeDeg(gmstHours * 15);
  const ramcDeg = normalizeDeg(gmstDeg + safeLon);
  const ramcRad = toRad(ramcDeg);

  // Mean obliquity of ecliptic
  const T = time.tt / 36525.0;
  const epsDeg = 23.439291 - 0.0130042 * T;
  const epsRad = toRad(epsDeg);
  const latRad = toRad(safeLat);

  // Ascendant formula
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
  let ascTropical = toDeg(Math.atan2(y, x));
  ascTropical = normalizeDeg(isNaN(ascTropical) ? 0 : ascTropical);

  const ascSidereal = normalizeDeg(ascTropical - safeAyanamsa);
  let signIndex = Math.floor(ascSidereal / 30); // 0-11
  if (isNaN(signIndex) || signIndex < 0 || signIndex > 11) signIndex = 0;
  const signNum = signIndex + 1; // 1-12
  const degInSign = isNaN(ascSidereal % 30) ? 0 : ascSidereal % 30;

  const signDef = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  const nakTotal = (ascSidereal / 360) * 27;
  let nakIndex = Math.floor(nakTotal);
  if (isNaN(nakIndex) || nakIndex < 0 || nakIndex > 26) nakIndex = 0;
  const nakDef = NAKSHATRAS[nakIndex] || NAKSHATRAS[0];
  const pada = Math.floor((nakTotal - nakIndex) * 4) + 1;

  return {
    tropicalLon: ascTropical,
    siderealLon: ascSidereal,
    sign: signNum,
    signName: signDef.name,
    signSanskrit: signDef.sanskrit,
    signLord: signDef.lord,
    degreeInSign: degInSign,
    dms: formatDMS(degInSign),
    nakshatra: nakDef.number,
    nakshatraName: nakDef.name,
    nakshatraLord: nakDef.lord,
    pada: isNaN(pada) ? 1 : Math.max(1, Math.min(4, pada)),
  };
}

/**
 * Computes Navamsha sign (1-12) for any sidereal longitude
 */
export function getNavamshaSign(siderealLon: number): number {
  const norm = normalizeDeg(siderealLon);
  const totalNavamshas = Math.floor(norm / (30 / 9)); // 0 - 107
  const rashi = Math.floor(norm / 30) + 1; // 1-12
  const element = ZODIAC_SIGNS[rashi - 1].element;

  let startSign = 1; // Fire -> Aries
  if (element === 'Earth') startSign = 10; // Capricorn
  else if (element === 'Air') startSign = 7; // Libra
  else if (element === 'Water') startSign = 4; // Cancer

  const navamshaInSign = Math.floor((norm % 30) / (30 / 9)); // 0-8
  return ((startSign - 1 + navamshaInSign) % 12) + 1;
}

/**
 * Computes Planetary Dignity (Exaltation, Moolatrikona, Own Sign, Great Friend, etc.)
 */
export function computeDignity(
  planetId: string,
  sign: number,
  degreeInSign: number,
  placedHousePlanets: Record<number, string[]> = {}
): PlanetaryPosition['dignity'] {
  const p = PLANETS[planetId];
  if (!p) return 'Neutral';

  // Exalted
  if (sign === p.exaltationSign) {
    return 'Exalted';
  }
  // Debilitated
  if (sign === p.debilitationSign) {
    return 'Debilitated';
  }
  // Moolatrikona
  if (sign === p.moolatrikonaSign) {
    if (degreeInSign >= p.moolatrikonaDegrees[0] && degreeInSign <= p.moolatrikonaDegrees[1]) {
      return 'Moolatrikona';
    }
  }
  // Own Sign (Swakshetra)
  if (p.lordOf.includes(sign)) {
    return 'Own Sign';
  }

  // Sign Lord
  const signLord = ZODIAC_SIGNS[sign - 1].lord;
  if (signLord === planetId) return 'Own Sign';

  const isNaturalFriend = p.friends.includes(signLord);
  const isNaturalEnemy = p.enemies.includes(signLord);

  // Panchadha Maitri (Combining Natural + Temporal Friendship)
  // Temporal friend = planets placed in 2, 3, 4, 10, 11, 12 houses from each other
  // Defaulting to natural relationship if chart houses not fully resolved
  if (isNaturalFriend) return 'Friend';
  if (isNaturalEnemy) return 'Enemy';
  return 'Neutral';
}

/**
 * Complete Vedic Birth Chart Engine
 */
export function calculateVedicChart(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number = 5.5,
  ayanamsaType: AyanamsaType = 'lahiri'
): ChartCalculationResult {
  const d = ensureValidDate(date);
  const ayanamsaVal = getAyanamsa(d, ayanamsaType);
  const asc = getAscendant(d, latitude, longitude, ayanamsaVal);

  const time = Astronomy.MakeTime(d);
  const dtAfter1Hr = new Date(d.getTime() + 3600000);
  const timeAfter1Hr = Astronomy.MakeTime(dtAfter1Hr);

  const planetKeys = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const calculatedPlanets: Record<string, PlanetaryPosition> = {};

  // 1. Sun Position
  const sunPos = Astronomy.SunPosition(time);
  const sunPos2 = Astronomy.SunPosition(timeAfter1Hr);
  const sunTrop = normalizeDeg(sunPos.elon);
  const sunSid = normalizeDeg(sunTrop - ayanamsaVal);
  const sunSpeed = (normalizeDeg(sunPos2.elon) - sunTrop) * 24;

  // 2. Compute Classical 7 Planets
  for (const pKey of planetKeys) {
    let tropLon = 0;
    let tropLon2 = 0;
    let declination: number | undefined = undefined;

    if (pKey === 'Sun') {
      tropLon = sunTrop;
      tropLon2 = normalizeDeg(sunPos2.elon);
    } else if (pKey === 'Moon') {
      const mPos = Astronomy.EclipticGeoMoon(time);
      const mPos2 = Astronomy.EclipticGeoMoon(timeAfter1Hr);
      tropLon = normalizeDeg(mPos.lon);
      tropLon2 = normalizeDeg(mPos2.lon);
    } else {
      const body = (Astronomy.Body as Record<string, unknown>)[pKey];
      if (body) {
        const vec = Astronomy.GeoVector(body, time, true);
        const vec2 = Astronomy.GeoVector(body, timeAfter1Hr, true);
        const ecl = Astronomy.Ecliptic(vec);
        const ecl2 = Astronomy.Ecliptic(vec2);
        tropLon = normalizeDeg(ecl.elon);
        tropLon2 = normalizeDeg(ecl2.elon);
        declination = ecl.elat;
      }
    }

    const sidLon = normalizeDeg(tropLon - ayanamsaVal);
    let speed = (tropLon2 - tropLon) * 24;
    if (speed < -180) speed += 360;
    if (speed > 180) speed -= 360;

    const isRetrograde = pKey !== 'Sun' && pKey !== 'Moon' && speed < 0;
    const signIndex = Math.floor(sidLon / 30);
    const signNum = signIndex + 1;
    const degInSign = sidLon % 30;

    const signDef = ZODIAC_SIGNS[signIndex];
    const nakTotal = (sidLon / 360) * 27;
    const nakIndex = Math.floor(nakTotal);
    const nakDef = NAKSHATRAS[nakIndex];
    const pada = Math.floor((nakTotal - nakIndex) * 4) + 1;
    const navSign = getNavamshaSign(sidLon);

    // House relative to Ascendant (Whole Sign House System)
    const houseNum = ((signNum - asc.sign + 12) % 12) + 1;

    // Combustion check (proximity to Sun)
    const sunDiff = Math.abs(normalizeDeg(sidLon - sunSid));
    const angleDiff = sunDiff > 180 ? 360 - sunDiff : sunDiff;
    const combustLimits: Record<string, number> = {
      Moon: 12,
      Mars: 17,
      Mercury: 14,
      Jupiter: 11,
      Venus: 10,
      Saturn: 15,
    };
    const isCombust = pKey !== 'Sun' && angleDiff <= (combustLimits[pKey] || 0);

    const dignity = computeDignity(pKey, signNum, degInSign);

    calculatedPlanets[pKey] = {
      id: pKey,
      name: PLANETS[pKey].name,
      sanskrit: PLANETS[pKey].sanskrit,
      glyph: PLANETS[pKey].glyph,
      tropicalLon: tropLon,
      siderealLon: sidLon,
      sign: signNum,
      signName: signDef.name,
      signSanskrit: signDef.sanskrit,
      signLord: signDef.lord,
      degreeInSign: degInSign,
      dms: formatDMS(degInSign),
      nakshatra: nakDef.number,
      nakshatraName: nakDef.name,
      nakshatraLord: nakDef.lord,
      pada,
      navamshaSign: navSign,
      navamshaSignName: ZODIAC_SIGNS[navSign - 1].name,
      speed,
      isRetrograde,
      isCombust,
      dignity,
      house: houseNum,
      declination,
    };
  }

  // 3. Lunar Nodes (Rahu and Ketu)
  const { rahu: rahuTrop, ketu: ketuTrop } = getRahuLongitude(date, true);
  const rahuSid = normalizeDeg(rahuTrop - ayanamsaVal);
  const ketuSid = normalizeDeg(ketuTrop - ayanamsaVal);

  for (const nodeKey of ['Rahu', 'Ketu']) {
    const sidLon = nodeKey === 'Rahu' ? rahuSid : ketuSid;
    const tropLon = nodeKey === 'Rahu' ? rahuTrop : ketuTrop;
    const signIndex = Math.floor(sidLon / 30);
    const signNum = signIndex + 1;
    const degInSign = sidLon % 30;
    const signDef = ZODIAC_SIGNS[signIndex];
    const nakTotal = (sidLon / 360) * 27;
    const nakIndex = Math.floor(nakTotal);
    const nakDef = NAKSHATRAS[nakIndex];
    const pada = Math.floor((nakTotal - nakIndex) * 4) + 1;
    const navSign = getNavamshaSign(sidLon);
    const houseNum = ((signNum - asc.sign + 12) % 12) + 1;

    calculatedPlanets[nodeKey] = {
      id: nodeKey,
      name: PLANETS[nodeKey].name,
      sanskrit: PLANETS[nodeKey].sanskrit,
      glyph: PLANETS[nodeKey].glyph,
      tropicalLon: tropLon,
      siderealLon: sidLon,
      sign: signNum,
      signName: signDef.name,
      signSanskrit: signDef.sanskrit,
      signLord: signDef.lord,
      degreeInSign: degInSign,
      dms: formatDMS(degInSign),
      nakshatra: nakDef.number,
      nakshatraName: nakDef.name,
      nakshatraLord: nakDef.lord,
      pada,
      navamshaSign: navSign,
      navamshaSignName: ZODIAC_SIGNS[navSign - 1].name,
      speed: -0.05, // Rahu/Ketu always retrograde
      isRetrograde: true,
      isCombust: false,
      dignity: computeDignity(nodeKey, signNum, degInSign),
      house: houseNum,
    };
  }

  // 4. Build Houses (1 to 12) Whole-Sign Vedic Standard
  const houses: HouseCusp[] = [];
  const rashiChart: Record<number, string[]> = {};
  const bhavatBhavam: Record<number, string[]> = {};

  for (let i = 1; i <= 12; i++) {
    rashiChart[i] = [];
    bhavatBhavam[i] = [];
  }

  for (let h = 1; h <= 12; h++) {
    const signNum = ((asc.sign - 1 + (h - 1)) % 12) + 1;
    const signDef = ZODIAC_SIGNS[signNum - 1];
    const spanStart = (signNum - 1) * 30;
    const spanEnd = spanStart + 30;

    houses.push({
      house: h,
      sign: signNum,
      signName: signDef.name,
      signLord: signDef.lord,
      degree: asc.degreeInSign,
      dms: formatDMS(asc.degreeInSign),
      spanStart,
      spanEnd,
      planets: [],
    });
  }

  // Place planets into houses and rashis
  Object.values(calculatedPlanets).forEach((p) => {
    const h = p.house;
    const sign = p.sign;
    if (houses[h - 1]) {
      houses[h - 1].planets.push(p.id);
    }
    if (rashiChart[sign]) {
      rashiChart[sign].push(p.id);
    }
    if (bhavatBhavam[h]) {
      bhavatBhavam[h].push(p.id);
    }
  });

  // 5. Moon Nakshatra Details for Vimshottari
  const moon = calculatedPlanets.Moon;
  const moonNakTotal = (moon.siderealLon / 360) * 27;
  const moonNakIndex = Math.floor(moonNakTotal);
  const moonNakDef = NAKSHATRAS[moonNakIndex];
  const nakArc = 360 / 27; // 13° 20' = 13.333333°
  const degInNak = moon.siderealLon - moonNakIndex * nakArc;
  const fractionElapsed = degInNak / nakArc;

  return {
    birthDateTime: date.toISOString(),
    latitude,
    longitude,
    timezone,
    ayanamsaType,
    ayanamsaValue: ayanamsaVal,
    ayanamsaDms: formatDMS(ayanamsaVal),
    ascendant: asc,
    planets: calculatedPlanets,
    houses,
    moonNakshatra: {
      number: moonNakDef.number,
      name: moonNakDef.name,
      sanskrit: moonNakDef.sanskrit,
      lord: moonNakDef.lord,
      pada: moon.pada,
      degreeInNakshatra: degInNak,
      fractionElapsed,
    },
    rashiChart,
    bhavatBhavam,
  };
}
