/**
 * Vimshottari Dasha Engine
 * Implements recursive proportional subdivision down to 5 levels:
 * Mahadasha -> Antardasha -> Pratyantardasha -> Sookshma -> Prana
 */

import { NAKSHATRAS } from './constants';

export interface DashaPeriodRule {
  planet: string;
  sanskrit: string;
  years: number;
}

export const VIMSHOTTARI_CYCLE: DashaPeriodRule[] = [
  { planet: 'Ketu', sanskrit: 'Ketu', years: 7 },
  { planet: 'Venus', sanskrit: 'Shukra', years: 20 },
  { planet: 'Sun', sanskrit: 'Surya', years: 6 },
  { planet: 'Moon', sanskrit: 'Chandra', years: 10 },
  { planet: 'Mars', sanskrit: 'Mangal', years: 7 },
  { planet: 'Rahu', sanskrit: 'Rahu', years: 18 },
  { planet: 'Jupiter', sanskrit: 'Guru', years: 16 },
  { planet: 'Saturn', sanskrit: 'Shani', years: 19 },
  { planet: 'Mercury', sanskrit: 'Budha', years: 17 },
];

export const TOTAL_VIMSHOTTARI_YEARS = 120;
// Tropical year in days / ms
const DAYS_PER_YEAR = 365.242199;
const MS_PER_DAY = 86400000;
const MS_PER_YEAR = DAYS_PER_YEAR * MS_PER_DAY;

export interface DashaSpan {
  level: number; // 1=MD, 2=AD, 3=PD, 4=SD, 5=PrD
  levelName: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha' | 'Sookshma Dasha' | 'Prana Dasha';
  planet: string;
  startDate: string; // ISO
  endDate: string; // ISO
  durationDays: number;
  subPeriods?: DashaSpan[];
}

export interface CurrentDashaHierarchy {
  mahadasha: {
    planet: string;
    startDate: string;
    endDate: string;
    progressPercent: number;
    daysRemaining: number;
    totalDays: number;
  };
  antardasha: {
    planet: string;
    startDate: string;
    endDate: string;
    progressPercent: number;
    daysRemaining: number;
    totalDays: number;
  };
  pratyantardasha: {
    planet: string;
    startDate: string;
    endDate: string;
    progressPercent: number;
  };
  sookshmaDasha?: {
    planet: string;
    startDate: string;
    endDate: string;
  };
  pranaDasha?: {
    planet: string;
    startDate: string;
    endDate: string;
  };
  path: string; // e.g. "Jupiter / Saturn / Venus"
}

export interface VimshottariResult {
  birthDate: string;
  startingLord: string;
  balanceYears: number;
  balanceDays: number;
  mahadashas: DashaSpan[];
  currentDasha: CurrentDashaHierarchy;
}

/**
 * Returns the index (0-8) in VIMSHOTTARI_CYCLE for a given planet name
 */
export function getPlanetCycleIndex(planet: string): number {
  return VIMSHOTTARI_CYCLE.findIndex((p) => p.planet.toLowerCase() === planet.toLowerCase());
}

/**
 * Computes the starting dasha lord and balance at birth
 */
export function getBirthDashaBalance(moonSiderealLon: number) {
  const nakArc = 360 / 27; // 13° 20' = 13.333333°
  const nakIndex = Math.floor(((moonSiderealLon % 360) + 360) % 360 / nakArc);
  const nakDef = NAKSHATRAS[nakIndex];
  const degInNak = ((moonSiderealLon % 360) + 360) % 360 - nakIndex * nakArc;
  const fractionElapsed = degInNak / nakArc; // 0 to 1
  const fractionRemaining = 1 - fractionElapsed;

  const startingLord = nakDef.lord;
  const cycleIndex = getPlanetCycleIndex(startingLord);
  const totalYears = VIMSHOTTARI_CYCLE[cycleIndex].years;
  const balanceYears = totalYears * fractionRemaining;
  const balanceDays = balanceYears * DAYS_PER_YEAR;

  return {
    nakshatraName: nakDef.name,
    startingLord,
    cycleIndex,
    totalYears,
    fractionElapsed,
    fractionRemaining,
    balanceYears,
    balanceDays,
  };
}

/**
 * Recursive proportional subdivision algorithm
 */
export function generateSubPeriods(
  parentPlanet: string,
  startTimeMs: number,
  totalDurationMs: number,
  depth: number,
  maxDepth: number = 3
): DashaSpan[] {
  if (depth > maxDepth) return [];

  const parentIndex = getPlanetCycleIndex(parentPlanet);
  const levelNames: DashaSpan['levelName'][] = [
    'Mahadasha',
    'Mahadasha',
    'Antardasha',
    'Pratyantardasha',
    'Sookshma Dasha',
    'Prana Dasha',
  ];

  const subPeriods: DashaSpan[] = [];
  let currentStart = startTimeMs;

  for (let i = 0; i < 9; i++) {
    const pIndex = (parentIndex + i) % 9;
    const rule = VIMSHOTTARI_CYCLE[pIndex];
    const subFraction = rule.years / TOTAL_VIMSHOTTARI_YEARS;
    const subDurationMs = totalDurationMs * subFraction;
    const currentEnd = currentStart + subDurationMs;

    const span: DashaSpan = {
      level: depth,
      levelName: levelNames[depth],
      planet: rule.planet,
      startDate: new Date(currentStart).toISOString(),
      endDate: new Date(currentEnd).toISOString(),
      durationDays: subDurationMs / MS_PER_DAY,
    };

    if (depth < maxDepth) {
      span.subPeriods = generateSubPeriods(rule.planet, currentStart, subDurationMs, depth + 1, maxDepth);
    }

    subPeriods.push(span);
    currentStart = currentEnd;
  }

  return subPeriods;
}

/**
 * Computes full Vimshottari Dasha timeline from birth
 */
import { ensureValidDate } from '../utils/format';

export function calculateVimshottariDasha(
  birthDate: Date,
  moonSiderealLon: number,
  targetDate: Date = new Date(),
  maxDepth: number = 3
): VimshottariResult {
  const bDate = ensureValidDate(birthDate);
  const tDate = ensureValidDate(targetDate);
  const balance = getBirthDashaBalance(moonSiderealLon);
  const birthTimeMs = bDate.getTime();

  const mahadashas: DashaSpan[] = [];
  let currentStartMs = birthTimeMs;

  for (let i = 0; i < 9; i++) {
    const cycleIdx = (balance.cycleIndex + i) % 9;
    const rule = VIMSHOTTARI_CYCLE[cycleIdx];

    let fullDurationMs = rule.years * MS_PER_YEAR;
    let actualDurationMs = fullDurationMs;

    if (i === 0) {
      // First dasha is shortened by elapsed fraction
      actualDurationMs = balance.balanceDays * MS_PER_DAY;
    }

    const currentEndMs = currentStartMs + actualDurationMs;

    const mdSpan: DashaSpan = {
      level: 1,
      levelName: 'Mahadasha',
      planet: rule.planet,
      startDate: new Date(currentStartMs).toISOString(),
      endDate: new Date(currentEndMs).toISOString(),
      durationDays: actualDurationMs / MS_PER_DAY,
      subPeriods: [],
    };

    if (maxDepth >= 2) {
      if (i === 0) {
        // For the starting dasha, proportionally generate antardashas spanning the full cycle
        // and keep only those that fall after birth
        const theoreticalStartMs = currentEndMs - fullDurationMs;
        const allADs = generateSubPeriods(rule.planet, theoreticalStartMs, fullDurationMs, 2, maxDepth);
        mdSpan.subPeriods = allADs
          .filter((ad) => new Date(ad.endDate).getTime() > birthTimeMs)
          .map((ad) => {
            const adStart = Math.max(new Date(ad.startDate).getTime(), birthTimeMs);
            return {
              ...ad,
              startDate: new Date(adStart).toISOString(),
              durationDays: (new Date(ad.endDate).getTime() - adStart) / MS_PER_DAY,
            };
          });
      } else {
        mdSpan.subPeriods = generateSubPeriods(rule.planet, currentStartMs, actualDurationMs, 2, maxDepth);
      }
    }

    mahadashas.push(mdSpan);
    currentStartMs = currentEndMs;
  }

  // Find Current Dasha hierarchy for targetDate
  const targetMs = targetDate.getTime();
  const currentMD = mahadashas.find(
    (md) => targetMs >= new Date(md.startDate).getTime() && targetMs < new Date(md.endDate).getTime()
  ) || mahadashas[0];

  const currentAD = currentMD.subPeriods?.find(
    (ad) => targetMs >= new Date(ad.startDate).getTime() && targetMs < new Date(ad.endDate).getTime()
  ) || currentMD.subPeriods?.[0] || {
    planet: currentMD.planet,
    startDate: currentMD.startDate,
    endDate: currentMD.endDate,
    durationDays: currentMD.durationDays,
    level: 2,
    levelName: 'Antardasha' as const,
  };

  const currentPD = currentAD.subPeriods?.find(
    (pd) => targetMs >= new Date(pd.startDate).getTime() && targetMs < new Date(pd.endDate).getTime()
  ) || currentAD.subPeriods?.[0] || {
    planet: currentAD.planet,
    startDate: currentAD.startDate,
    endDate: currentAD.endDate,
    durationDays: currentAD.durationDays,
    level: 3,
    levelName: 'Pratyantardasha' as const,
  };

  // Progress Calculations
  const mdStartMs = new Date(currentMD.startDate).getTime();
  const mdEndMs = new Date(currentMD.endDate).getTime();
  const mdTotalMs = mdEndMs - mdStartMs;
  const mdElapsedMs = Math.min(Math.max(0, targetMs - mdStartMs), mdTotalMs);
  const mdProgress = (mdElapsedMs / mdTotalMs) * 100;
  const mdRemainingDays = Math.max(0, Math.round((mdEndMs - targetMs) / MS_PER_DAY));

  const adStartMs = new Date(currentAD.startDate).getTime();
  const adEndMs = new Date(currentAD.endDate).getTime();
  const adTotalMs = adEndMs - adStartMs;
  const adElapsedMs = Math.min(Math.max(0, targetMs - adStartMs), adTotalMs);
  const adProgress = (adElapsedMs / adTotalMs) * 100;
  const adRemainingDays = Math.max(0, Math.round((adEndMs - targetMs) / MS_PER_DAY));

  const pdStartMs = new Date(currentPD.startDate).getTime();
  const pdEndMs = new Date(currentPD.endDate).getTime();
  const pdTotalMs = pdEndMs - pdStartMs;
  const pdElapsedMs = Math.min(Math.max(0, targetMs - pdStartMs), pdTotalMs);
  const pdProgress = (pdElapsedMs / pdTotalMs) * 100;

  const currentDasha: CurrentDashaHierarchy = {
    mahadasha: {
      planet: currentMD.planet,
      startDate: currentMD.startDate,
      endDate: currentMD.endDate,
      progressPercent: Math.round(mdProgress * 10) / 10,
      daysRemaining: mdRemainingDays,
      totalDays: Math.round(mdTotalMs / MS_PER_DAY),
    },
    antardasha: {
      planet: currentAD.planet,
      startDate: currentAD.startDate,
      endDate: currentAD.endDate,
      progressPercent: Math.round(adProgress * 10) / 10,
      daysRemaining: adRemainingDays,
      totalDays: Math.round(adTotalMs / MS_PER_DAY),
    },
    pratyantardasha: {
      planet: currentPD.planet,
      startDate: currentPD.startDate,
      endDate: currentPD.endDate,
      progressPercent: Math.round(pdProgress * 10) / 10,
    },
    path: `${currentMD.planet} / ${currentAD.planet} / ${currentPD.planet}`,
  };

  return {
    birthDate: birthDate.toISOString(),
    startingLord: balance.startingLord,
    balanceYears: Math.round(balance.balanceYears * 100) / 100,
    balanceDays: Math.round(balance.balanceDays),
    mahadashas,
    currentDasha,
  };
}
