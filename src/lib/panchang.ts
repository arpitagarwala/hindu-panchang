/**
 * Panchang computation utility (server-side only)
 * Used via Next.js API route to compute panchang data server-side
 * and send it to the client as JSON.
 *
 * Computes: Tithi, Nakshatra, Yoga, Karana, Vara, Paksha,
 *           Sunrise/Sunset, Brahma Muhurta, Abhijit Muhurta,
 *           Rahu Kalam, Yamagandam, Gulika Kalam, Vikram Samvat
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const SunCalc = require('suncalc');
const Astronomy = require('astronomy-engine');

// ─── Data tables ───────────────────────────────────────────────────────────

export const TITHI_NAMES = [
  'Pratipada','Dvitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
];

export const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha',
  'Ardra','Punarvasu','Pushya','Ashlesha','Magha',
  'Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati',
  'Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

export const YOGA_NAMES = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana',
  'Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi',
  'Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata',
  'Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha',
  'Shukla','Brahma','Indra','Vaidhriti',
];

export const KARANA_NAMES = [
  'Bava','Balava','Kaulava','Taitila','Garija',
  'Vanija','Vishti',
];

export const VARA_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const VARA_NAMES_SA = ['Ravivāra','Somavāra','Maṅgalavāra','Budhavāra','Guruvāra','Śukravāra','Śanivāra'];

export const HINDU_MONTHS = [
  'Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada',
  'Ashwin','Kartik','Margashirsha','Paush','Magh','Phalguna',
];

// Rahu Kalam: which 1/8 segment of daylight hours (1-indexed), indexed by weekday (0=Sun)
const RAHU_PART  = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART  = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

import { ensureValidDate } from './utils/format';
import { getAyanamsa } from './astronomy/ephemeris';
import { localNoon } from './panchang-query';
import type { Observance } from './observance-types';
import type { DataTrust } from './providers/types';

// ─── Astronomical helpers ────────────────────────────────────────────────────

function getSunLongitude(date: Date): number {
  const d = ensureValidDate(date);
  const time = Astronomy.MakeTime(d);
  const sunPos = Astronomy.SunPosition(time); // {elon, elat, vec}
  return ((sunPos.elon % 360) + 360) % 360;
}

function getMoonLongitude(date: Date): number {
  const d = ensureValidDate(date);
  const time = Astronomy.MakeTime(d);
  const moonPos = Astronomy.EclipticGeoMoon(time); // {lon, lat, dist}
  return ((moonPos.lon % 360) + 360) % 360;
}

// ─── Panchang element computations ─────────────────────────────────────────

function computeTithi(sunLon: number, moonLon: number) {
  const elongation = ((moonLon - sunLon) + 360) % 360;
  const tithiIndex = Math.floor(elongation / 12); // 0-29
  const paksha = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const adjustedIndex = tithiIndex % 15;
  let name: string;
  if (adjustedIndex === 14) {
    name = tithiIndex < 15 ? 'Purnima' : 'Amavasya';
  } else {
    name = TITHI_NAMES[adjustedIndex] ?? `Tithi ${adjustedIndex + 1}`;
  }
  return { index: tithiIndex + 1, name, paksha };
}

function computeNakshatra(moonLon: number) {
  const index = Math.floor((moonLon / 360) * 27); // 0-26
  return { index: index + 1, name: NAKSHATRA_NAMES[index] ?? `Nakshatra ${index + 1}` };
}

function computeYoga(sunLon: number, moonLon: number) {
  const combined = (sunLon + moonLon) % 360;
  const index = Math.floor((combined / 360) * 27); // 0-26
  return { index: index + 1, name: YOGA_NAMES[index] ?? `Yoga ${index + 1}` };
}

function computeKarana(sunLon: number, moonLon: number) {
  const elongation = ((moonLon - sunLon) + 360) % 360;
  const halfTithi = Math.floor(elongation / 6); // 0-59
  let name: string;
  if (halfTithi === 0) {
    name = 'Kinstughna';
  } else if (halfTithi === 57) { name = 'Shakuni'; }
  else if (halfTithi === 58) { name = 'Chatushpada'; }
  else if (halfTithi === 59) { name = 'Naga'; }
  else { name = KARANA_NAMES[(halfTithi - 1) % 7] ?? 'Bava'; }
  return { name };
}

function computeHinduMonth(sunLon: number, date: Date) {
  const monthIndex = Math.floor(sunLon / 30) % 12;
  const samvatYear = date.getFullYear() + 57;
  return { name: HINDU_MONTHS[monthIndex] ?? 'Chaitra', samvat: samvatYear };
}

// ─── Time helpers ────────────────────────────────────────────────────────────

function addMs(date: Date, ms: number): Date { return new Date(date.getTime() + ms); }

function daytimePart(sunrise: Date, sunset: Date, part: number) {
  const dayMs = sunset.getTime() - sunrise.getTime();
  const segMs = dayMs / 8;
  const start = addMs(sunrise, segMs * (part - 1));
  const end   = addMs(start, segMs);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Main export ─────────────────────────────────────────────────────────────

export interface PanchangResult {
  date: string;
  tithi: { index: number; name: string; paksha: string; end?: string };
  nakshatra: { index: number; name: string; end?: string };
  yoga: { index: number; name: string; end?: string };
  karana: { name: string; end?: string };
  vara: { english: string; sanskrit: string };
  hinduMonth: { name: string; samvat: number; amanta?: string; purnimanta?: string; isAdhika?: boolean; isKshaya?: boolean; convention?: string; index?: number; yearConvention?: string };
  sunrise: string;
  sunset: string;
  brahmaMuhurta: { start: string; end: string };
  abhijitMuhurta: { start: string; end: string };
  rahuKalam: { start: string; end: string };
  yamagandam: { start: string; end: string };
  gulikaKalam: { start: string; end: string };
  lat: number;
  lon: number;
  moonIllumination?: number;
  moonrise?: string;
  moonset?: string;
  solarTimesAvailable?: boolean;
  nextSunrise?: string;
  observances?: Observance[];
  boundaryWarnings?: string[];
  dataTrust?: DataTrust;
  calculation?: { engine: string; ayanamsa: string; sunriseConvention: string; searchResolutionSeconds: number; data: string };
}

// Find the first boundary after sunrise, then refine it to within one second.
function findElementEnd(start: Date, index: (date: Date) => string | number): string | undefined {
  const initial = index(start);
  let lo = start.getTime();
  for (let hour = 1; hour <= 48; hour++) {
    let hi = start.getTime() + hour * 3600000;
    if (index(new Date(hi)) !== initial) {
      while (hi - lo > 1000) {
        const mid = Math.floor((hi + lo) / 2);
        if (index(new Date(mid)) === initial) lo = mid;
        else hi = mid;
      }
      return new Date(hi).toISOString();
    }
    lo = hi;
  }
}

export function computePanchang(lat: number, lon: number, date?: Date, timeZone = 'Asia/Kolkata', transitions = true): PanchangResult {
  const d = ensureValidDate(date);
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const noon = localNoon(localDate, timeZone);
  const sunLon = getSunLongitude(noon);
  // SunCalc 2 selects its solar day from the UTC calendar date, not an instant's
  // local date. Anchor the requested civil date explicitly (important east of UTC).
  const solarDay = new Date(`${localDate}T12:00:00Z`);
  const sunTimes = SunCalc.getTimes(solarDay, lat, lon);
  const sunrise  = sunTimes.sunrise as Date;
  const sunset   = sunTimes.sunset as Date;

  const dayOfWeek = new Date(`${localDate}T12:00:00Z`).getUTCDay();

  // Sunrise must be valid
  const defaultSunrise = addMs(noon, -6 * 3600000);
  const defaultSunset = addMs(noon, 6 * 3600000);

  const sr = (sunrise && !isNaN(sunrise.getTime())) ? sunrise : defaultSunrise;
  const ss = (sunset && !isNaN(sunset.getTime())) ? sunset : defaultSunset;
  const atSunrise = (instant: Date) => {
    const sun = getSunLongitude(instant);
    const moon = getMoonLongitude(instant);
    const ayanamsa = getAyanamsa(instant);
    const siderealSun = (sun - ayanamsa + 360) % 360;
    const siderealMoon = (moon - ayanamsa + 360) % 360;
    return {
      tithi: computeTithi(sun, moon),
      nakshatra: computeNakshatra(siderealMoon),
      yoga: computeYoga(siderealSun, siderealMoon),
      karana: computeKarana(sun, moon),
    };
  };
  const elements = atSunrise(sr);
  if (transitions) {
    Object.assign(elements.tithi, { end: findElementEnd(sr, t => atSunrise(t).tithi.index) });
    Object.assign(elements.nakshatra, { end: findElementEnd(sr, t => atSunrise(t).nakshatra.index) });
    Object.assign(elements.yoga, { end: findElementEnd(sr, t => atSunrise(t).yoga.index) });
    Object.assign(elements.karana, { end: findElementEnd(sr, t => atSunrise(t).karana.name) });
  }
  const localDay = (instant: Date) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
  const moonCandidates = [-1, 0, 1].map(offset => SunCalc.getMoonTimes(addMs(solarDay, offset * 86400000), lat, lon));
  const moonrise = moonCandidates.map(times => times.rise as Date | undefined).find(instant => instant && Number.isFinite(instant.getTime()) && localDay(instant) === localDate);
  const moonset = moonCandidates.map(times => times.set as Date | undefined).find(instant => instant && Number.isFinite(instant.getTime()) && localDay(instant) === localDate);
  const tomorrowSunrise = SunCalc.getTimes(new Date(solarDay.getTime() + 86400000), lat, lon).sunrise;
  // Amanta lunar month: the sidereal solar sign at the next new moon.
  const newMoon = Astronomy.SearchMoonPhase(0, sr, 32)?.date;
  const nextSun = newMoon ? (getSunLongitude(newMoon) - getAyanamsa(newMoon) + 360) % 360 : sunLon;
  const lunarMonth = HINDU_MONTHS[(Math.floor(nextSun / 30) + 1) % 12];

  const solarNoon = addMs(sr, (ss.getTime() - sr.getTime()) / 2);

  const brahmaMuhurta = {
    start: addMs(sr, -96 * 60000).toISOString(),
    end:   addMs(sr, -48 * 60000).toISOString(),
  };

  const abhijitMuhurta = {
    start: addMs(solarNoon, -(ss.getTime() - sr.getTime()) / 30).toISOString(),
    end:   addMs(solarNoon, +(ss.getTime() - sr.getTime()) / 30).toISOString(),
  };

  return {
    date: d.toISOString(),
    ...elements,
    vara: { english: VARA_NAMES_EN[dayOfWeek], sanskrit: VARA_NAMES_SA[dayOfWeek] },
    hinduMonth: { ...computeHinduMonth(sunLon, d), name: lunarMonth },
    sunrise: sr.toISOString(),
    sunset: ss.toISOString(),
    brahmaMuhurta,
    abhijitMuhurta,
    rahuKalam:   daytimePart(sr, ss, RAHU_PART[dayOfWeek]),
    yamagandam:  daytimePart(sr, ss, YAMA_PART[dayOfWeek]),
    gulikaKalam: daytimePart(sr, ss, GULIKA_PART[dayOfWeek]),
    lat,
    lon,
    moonIllumination: SunCalc.getMoonIllumination(sr).fraction,
    moonrise: moonrise?.toISOString(),
    moonset: moonset?.toISOString(),
    solarTimesAvailable: Number.isFinite(sunrise?.getTime()) && Number.isFinite(sunset?.getTime()),
    nextSunrise: Number.isFinite(tomorrowSunrise?.getTime()) ? tomorrowSunrise.toISOString() : undefined,
  };
}
