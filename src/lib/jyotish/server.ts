// Native ephemeris initialization is shared with Panchang. Its process-wide
// Lahiri settings are immutable across requests.
import { jd, norm, localInstant } from "../astronomy/swiss-server";
import * as swe from "sweph";
import { PLANETS, ZODIAC_SIGNS, NAKSHATRAS } from "../astronomy/constants";
import type {
  ChartCalculationResult,
  PlanetaryPosition,
} from "../astronomy/ephemeris";
import { formatDMS, computeDignity } from "../astronomy/ephemeris";
import {
  calculateVargaChart,
  calculateVargaSign,
  VARGA_INFO,
  type VargaType,
} from "../astronomy/vargas";
import { calculateVimshottariDasha } from "../astronomy/dasha";
import { calculateDaily } from "../panchang-server";
import { resolveBirthTime, BirthInputError, validDate } from "./birth-time";
import { buildReadings, text } from "./knowledge";
import type { BirthInput, JyotishReport, Transit } from "./types";
const C = swe.constants;
const bodies: Record<string, number> = {
  Sun: C.SE_SUN,
  Moon: C.SE_MOON,
  Mars: C.SE_MARS,
  Mercury: C.SE_MERCURY,
  Jupiter: C.SE_JUPITER,
  Venus: C.SE_VENUS,
  Saturn: C.SE_SATURN,
};
export function validateInput(value: unknown): BirthInput {
  if (!value || typeof value !== "object")
    throw new BirthInputError("Enter birth details. / जन्म विवरण भरें।");
  const v = value as BirthInput;
  for (const key of ["name", "place", "timeZone"] as const)
    if (typeof v[key] !== "string" || v[key].length > 120)
      throw new BirthInputError(
        "Use a name, place and time zone under 120 characters.",
      );
  if (!v.place.trim() || !v.timeZone.trim())
    throw new BirthInputError(
      "Choose the birth place and time zone. / जन्म स्थान और समय क्षेत्र चुनें।",
    );
  if (
    !validDate(v.date) ||
    v.date < "1900-01-01" ||
    v.date > new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  )
    throw new BirthInputError(
      "Birth date must be between 1900 and today. / जन्म तिथि 1900 से आज के बीच होनी चाहिए।",
    );
  const lastReadingDate = `${Number(v.date.slice(0, 4)) + 119}${v.date.slice(4)}`;
  if (
    !validDate(v.targetDate) ||
    v.targetDate < v.date ||
    v.targetDate > "2398-12-31" ||
    v.targetDate > lastReadingDate
  )
    throw new BirthInputError(
      "Reading date must be from birth through the 119th birthday. / पाठ की तिथि जन्म से 119वें जन्मदिन तक रखें।",
    );
  for (const place of [v, v.residence]) {
    if (
      !place ||
      typeof place.place !== "string" ||
      place.place.length > 120 ||
      !place.place.trim() ||
      typeof place.latitude !== "number" ||
      !Number.isFinite(place.latitude) ||
      Math.abs(place.latitude) > 89.5 ||
      typeof place.longitude !== "number" ||
      !Number.isFinite(place.longitude) ||
      Math.abs(place.longitude) > 180
    )
      throw new BirthInputError(
        "Choose valid place coordinates (latitude −89.5 to 89.5). / सही स्थान चुनें।",
      );
    try {
      if (typeof place.timeZone !== "string" || place.timeZone.length > 100)
        throw 0;
      new Intl.DateTimeFormat("en", { timeZone: place.timeZone }).format();
    } catch {
      throw new BirthInputError(
        "Invalid time zone. / समय क्षेत्र सही नहीं है।",
      );
    }
  }
  if (
    !["reject", "earlier", "later"].includes(v.overlap) ||
    !["mean", "true"].includes(v.node) ||
    !Number.isInteger(v.uncertaintyMinutes) ||
    v.uncertaintyMinutes < 0 ||
    v.uncertaintyMinutes > 120
  )
    throw new BirthInputError(
      "Check time certainty and node settings. / समय की शुद्धता और राहु-केतु सेटिंग जाँचें।",
    );
  resolveBirthTime(v.date, v.time, v.timeZone, v.overlap);
  return {
    name: v.name.trim(),
    place: v.place.trim(),
    date: v.date,
    time: v.time,
    latitude: v.latitude,
    longitude: v.longitude,
    timeZone: v.timeZone,
    overlap: v.overlap,
    uncertaintyMinutes: v.uncertaintyMinutes,
    node: v.node,
    targetDate: v.targetDate,
    residence: { ...v.residence, place: v.residence.place.trim() },
  };
}
export function swissPositions(instant: number, node: "mean" | "true") {
  const positions: Record<
    string,
    { siderealLon: number; tropicalLon: number; speed: number; name: string }
  > = {};
  const ids = {
    ...bodies,
    Rahu: node === "mean" ? C.SE_MEAN_NODE : C.SE_TRUE_NODE,
  };
  for (const [name, body] of Object.entries(ids)) {
    const r = swe.calc_ut(
      jd(instant),
      body,
      C.SEFLG_SWIEPH | C.SEFLG_SIDEREAL | C.SEFLG_SPEED,
    );
    const t = swe.calc_ut(jd(instant), body, C.SEFLG_SWIEPH | C.SEFLG_SPEED);
    if (
      r.flag < 0 ||
      t.flag < 0 ||
      !Number.isFinite(r.data[0]) ||
      !Number.isFinite(r.data[3]) ||
      (name !== "Rahu" &&
        (!(r.flag & C.SEFLG_SWIEPH) || !(t.flag & C.SEFLG_SWIEPH)))
    )
      throw new Error(
        "Swiss Ephemeris could not compute a chart with the required data.",
      );
    positions[name] = {
      siderealLon: norm(r.data[0]),
      tropicalLon: norm(t.data[0]),
      speed: r.data[3],
      name,
    };
  }
  positions.Ketu = {
    ...positions.Rahu,
    siderealLon: norm(positions.Rahu.siderealLon + 180),
    tropicalLon: norm(positions.Rahu.tropicalLon + 180),
    name: "Ketu",
  };
  return positions;
}
export function swissAscendant(instant: number, lat: number, lon: number) {
  const result = swe.houses_ex(jd(instant), C.SEFLG_SIDEREAL, lat, lon, "W");
  const value = result.data.points[0];
  if (result.flag < 0 || !Number.isFinite(value))
    throw new Error("Ascendant unavailable at this latitude and time.");
  return norm(value);
}
export function swissChart(
  instant: number,
  input: BirthInput,
  offsetMinutes: number,
): ChartCalculationResult {
  const asc = swissAscendant(instant, input.latitude, input.longitude),
    ayan = swe.get_ayanamsa_ut(jd(instant));
  const fields = (lon: number) => {
    const sign = Math.floor(lon / 30) + 1,
      s = ZODIAC_SIGNS[sign - 1],
      nak = Math.floor(lon / (360 / 27)),
      n = NAKSHATRAS[nak];
    return {
      sign,
      signName: s.name,
      signSanskrit: s.sanskrit,
      signLord: s.lord,
      degreeInSign: lon % 30,
      dms: formatDMS(lon % 30),
      nakshatra: nak + 1,
      nakshatraName: n.name,
      nakshatraLord: n.lord,
      pada: Math.floor((lon % (360 / 27)) / (360 / 108)) + 1,
    };
  };
  const ascendant = {
      ...fields(asc),
      siderealLon: asc,
      tropicalLon: norm(asc + ayan),
    },
    raw = swissPositions(instant, input.node);
  const planets: Record<string, PlanetaryPosition> = {};
  for (const [id, p] of Object.entries(raw)) {
    const f = fields(p.siderealLon),
      v9 = calculateVargaSign(p.siderealLon, "D9");
    const separation = Math.min(
      norm(p.siderealLon - raw.Sun.siderealLon),
      norm(raw.Sun.siderealLon - p.siderealLon),
    );
    const combustion: Record<string, number> = {
      Moon: 12,
      Mars: 17,
      Mercury: p.speed < 0 ? 12 : 14,
      Jupiter: 11,
      Venus: p.speed < 0 ? 8 : 10,
      Saturn: 15,
    };
    planets[id] = {
      ...p,
      ...f,
      id,
      sanskrit: PLANETS[id].sanskrit,
      glyph: PLANETS[id].glyph,
      navamshaSign: v9,
      navamshaSignName: ZODIAC_SIGNS[v9 - 1].name,
      isRetrograde: p.speed < 0,
      isCombust: id in combustion && separation < combustion[id],
      dignity:
        id === "Rahu" || id === "Ketu"
          ? "Neutral"
          : computeDignity(id, f.sign, f.degreeInSign),
      house: ((f.sign - ascendant.sign + 12) % 12) + 1,
    };
  }
  const houses = Array.from({ length: 12 }, (_, i) => {
    const sign = ((ascendant.sign - 1 + i) % 12) + 1,
      s = ZODIAC_SIGNS[sign - 1];
    return {
      house: i + 1,
      sign,
      signName: s.name,
      signLord: s.lord,
      degree: 0,
      dms: formatDMS(0),
      spanStart: (sign - 1) * 30,
      spanEnd: sign * 30,
      planets: Object.keys(planets).filter((id) => planets[id].house === i + 1),
    };
  });
  const m = planets.Moon,
    n = NAKSHATRAS[m.nakshatra - 1],
    degree = m.siderealLon % (360 / 27);
  return {
    birthDateTime: new Date(instant).toISOString(),
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: offsetMinutes / 60,
    ayanamsaType: "lahiri",
    ayanamsaValue: ayan,
    ayanamsaDms: formatDMS(ayan),
    ascendant,
    planets,
    houses,
    moonNakshatra: {
      number: m.nakshatra,
      name: n.name,
      sanskrit: n.sanskrit,
      lord: n.lord,
      pada: m.pada,
      degreeInNakshatra: degree,
      fractionElapsed: degree / (360 / 27),
    },
    rashiChart: Object.fromEntries(
      ZODIAC_SIGNS.map((s) => [
        s.number,
        Object.keys(planets).filter((id) => planets[id].sign === s.number),
      ]),
    ),
    bhavatBhavam: Object.fromEntries(houses.map((h) => [h.house, h.planets])),
  };
}
const taraNames = [
  text("Janma · birth", "जन्म"),
  text("Sampat · resources", "संपत"),
  text("Vipat · care", "विपत"),
  text("Kshema · ease", "क्षेम"),
  text("Pratyari · obstacles", "प्रत्यरि"),
  text("Sadhaka · practice", "साधक"),
  text("Naidhana · caution", "नैधन"),
  text("Mitra · friendship", "मित्र"),
  text("Parama Mitra · support", "परम मित्र"),
];
const reduceNumber = (value: string): number => {
  let n = [...value.replace(/\D/g, "")].reduce((sum, c) => sum + Number(c), 0);
  while (n > 9) n = [...String(n)].reduce((sum, c) => sum + Number(c), 0);
  return n;
};
export function createJyotishReport(input: BirthInput): JyotishReport {
  const birth = resolveBirthTime(
    input.date,
    input.time,
    input.timeZone,
    input.overlap,
  );
  if (birth.instant > Date.now())
    throw new BirthInputError(
      "Birth time must be in the past. / जन्म समय भविष्य का नहीं हो सकता।",
    );
  const chart = swissChart(birth.instant, input, birth.offsetMinutes),
    vargas = {} as JyotishReport["vargas"];
  for (const code of Object.keys(VARGA_INFO) as VargaType[])
    vargas[code] = calculateVargaChart(
      code,
      chart.ascendant.siderealLon,
      chart.planets,
    );
  const delta = input.uncertaintyMinutes * 60000,
    nearby = delta
      ? [
          swissChart(birth.instant - delta, input, birth.offsetMinutes),
          swissChart(birth.instant + delta, input, birth.offsetMinutes),
        ]
      : [];
  const sensitivity = (Object.keys(vargas) as VargaType[]).map((varga) => ({
    varga,
    changed: nearby.some(
      (c) =>
        calculateVargaSign(c.ascendant.siderealLon, varga) !==
          vargas[varga].ascendantSign ||
        Object.keys(c.planets).some(
          (id) =>
            calculateVargaSign(c.planets[id].siderealLon, varga) !==
            vargas[varga].placements[id].sign,
        ),
    ),
  }));
  const target = localInstant(input.targetDate, 12, input.residence.timeZone),
    dasha = calculateVimshottariDasha(
      new Date(birth.instant),
      chart.planets.Moon.siderealLon,
      new Date(Math.max(target, birth.instant)),
      3,
    );
  const forecast = Array.from({ length: 12 }, (_, i) => {
    const date =
      i === 0
        ? input.targetDate
        : new Date(
            Date.UTC(
              Number(input.targetDate.slice(0, 4)),
              Number(input.targetDate.slice(5, 7)) - 1 + i,
              1,
            ),
          )
            .toISOString()
            .slice(0, 10);
    const instant = localInstant(date, 12, input.residence.timeZone),
      d = calculateVimshottariDasha(
        new Date(birth.instant),
        chart.planets.Moon.siderealLon,
        new Date(Math.max(instant, birth.instant)),
        2,
      ).currentDasha;
    const positions = swissPositions(instant, input.node);
    const transits: Transit[] = ["Jupiter", "Saturn", "Mercury"].map(
      (planet) => {
        const p = positions[planet],
          sign = Math.floor(p.siderealLon / 30) + 1,
          houseFromMoon = ((sign - chart.planets.Moon.sign + 12) % 12) + 1;
        return {
          planet,
          sign,
          houseFromMoon,
          retrograde: p.speed < 0,
          supportive: (planet === "Jupiter"
            ? [2, 5, 7, 9, 11]
            : planet === "Saturn"
              ? [3, 6, 11]
              : [2, 4, 6, 8, 10, 11]
          ).includes(houseFromMoon),
        };
      },
    );
    return {
      date,
      mahadasha: d.mahadasha.planet,
      antardasha: d.antardasha.planet,
      transits,
    };
  });
  const residence = input.residence,
    daily = calculateDaily(
      residence.latitude,
      residence.longitude,
      new Date(target),
      residence.timeZone,
    );
  const tara =
    (((daily.nakshatra.index - chart.moonNakshatra.number + 27) % 27) % 9) + 1;
  const moonSign =
      Math.floor(swissPositions(target, input.node).Moon.siderealLon / 30) + 1,
    chandraHouse = ((moonSign - chart.planets.Moon.sign + 12) % 12) + 1;
  const windows: JyotishReport["day"]["windows"] = [];
  for (const [key, name, kind] of [
    [
      "brahmaMuhurta",
      text("Brahma Muhurta · reflection", "ब्रह्म मुहूर्त · मनन"),
      "support",
    ],
    [
      "abhijitMuhurta",
      text(
        "Abhijit · traditional supportive window",
        "अभिजित · पारंपरिक शुभ समय",
      ),
      "support",
    ],
    ["rahuKalam", text("Rahu Kalam", "राहु काल"), "caution"],
    ["yamagandam", text("Yamaganda", "यमगंड"), "caution"],
    ["gulikaKalam", text("Gulika", "गुलिक काल"), "caution"],
  ] as const) {
    const w = daily[key];
    if (w?.start && w.end)
      windows.push({ name, start: w.start, end: w.end, kind });
  }
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    input,
    birthInstant: new Date(birth.instant).toISOString(),
    offsetMinutes: birth.offsetMinutes,
    chart,
    vargas,
    sensitivity,
    dasha: {
      current: dasha.currentDasha,
      startingLord: dasha.startingLord,
      balanceYears: dasha.balanceYears,
      periods: dasha.mahadashas.map((md) => ({
        planet: md.planet,
        startDate: md.startDate,
        endDate: md.endDate,
        subPeriods: md.subPeriods?.map((ad) => ({
          planet: ad.planet,
          startDate: ad.startDate,
          endDate: ad.endDate,
        })),
      })),
    },
    readings: buildReadings(
      chart,
      dasha.currentDasha.mahadasha.planet,
      dasha.currentDasha.antardasha.planet,
    ),
    forecast,
    day: {
      date: input.targetDate,
      place: residence.place,
      timeZone: residence.timeZone,
      sunrise: daily.sunrise,
      sunset: daily.sunset,
      warnings: daily.boundaryWarnings || [],
      windows,
      tara,
      taraName: taraNames[tara - 1],
      taraSupportive: [2, 4, 6, 8, 9].includes(tara),
      chandraHouse,
      chandraSupportive: [1, 3, 6, 7, 10, 11].includes(chandraHouse),
    },
    numerology: {
      birth: reduceNumber(input.date.slice(8)),
      destiny: reduceNumber(input.date),
    },
  };
}
