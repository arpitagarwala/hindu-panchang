/**
 * Vedic Astrology 6-Fold Shadbala Engine
 * Calculates Sthana Bala, Dig Bala, Kala Bala, Cheshta Bala, Naisargika Bala, and Drik Bala.
 */

import { PLANETS } from './constants';
import { ChartCalculationResult, normalizeDeg } from './ephemeris';

export interface ShadbalaComponent {
  sthanaBala: number; // Positional (Virupas)
  digBala: number; // Directional (Virupas)
  kalaBala: number; // Temporal (Virupas)
  cheshtaBala: number; // Motional (Virupas)
  naisargikaBala: number; // Natural (Virupas)
  drikBala: number; // Aspectual (Virupas)
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number;
  percentageRatio: number; // (totalRupas / requiredRupas) * 100
  isStrong: boolean;
  rank: number;
}

export type ShadbalaResult = Record<string, ShadbalaComponent>;

// Classical minimum required Shadbala in Rupas (BPHS)
export const SHADBALA_REQUIREMENTS: Record<string, number> = {
  Sun: 6.5,
  Moon: 6.0,
  Mars: 5.0,
  Mercury: 7.0,
  Jupiter: 6.5,
  Venus: 5.5,
  Saturn: 5.0,
};

// Fixed Naisargika Bala in Virupas (BPHS: 60/7 increments)
export const NAISARGIKA_BALA: Record<string, number> = {
  Sun: 60.0,
  Moon: 51.43,
  Venus: 42.86,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57,
};

/**
 * Computes Dig Bala (Directional Strength)
 * Sun/Mars strong in 10th (South), Ju/Me strong in 1st (East),
 * Sa strong in 7th (West), Mo/Ve strong in 4th (North).
 */
export function computeDigBala(planet: string, house: number, degreeInSign: number): number {
  const powerfulHouseMap: Record<string, number> = {
    Sun: 10,
    Mars: 10,
    Jupiter: 1,
    Mercury: 1,
    Saturn: 7,
    Moon: 4,
    Venus: 4,
  };

  const peakHouse = powerfulHouseMap[planet];
  if (!peakHouse) return 30;

  let houseDiff = Math.abs(house - peakHouse);
  if (houseDiff > 6) houseDiff = 12 - houseDiff;

  // Max 60 Virupas at peak house, decreasing by 10 Virupas per house distance
  const base = 60 - houseDiff * 10;
  return Math.max(0, Math.min(60, base + (15 - degreeInSign) * 0.2));
}

/**
 * Computes Sthana Bala (Positional Strength)
 * Exalted gives 60 Virupas, Debilitated gives 0.
 */
export function computeSthanaBala(planet: string, dignity: string, house: number): number {
  let score = 30;
  switch (dignity) {
    case 'Exalted': score = 60; break;
    case 'Moolatrikona': score = 52.5; break;
    case 'Own Sign': score = 45; break;
    case 'Great Friend': score = 37.5; break;
    case 'Friend': score = 30; break;
    case 'Neutral': score = 22.5; break;
    case 'Enemy': score = 15; break;
    case 'Great Enemy': score = 7.5; break;
    case 'Debilitated': score = 0; break;
    default: score = 30;
  }

  // Kendra / Trikona Boost (Kendra: 1,4,7,10 = 60; Panaphara: 2,5,8,11 = 30; Apoklima: 3,6,9,12 = 15)
  let kendraScore = 15;
  if ([1, 4, 7, 10].includes(house)) kendraScore = 60;
  else if ([2, 5, 8, 11].includes(house)) kendraScore = 30;

  return Math.round(score * 1.5 + kendraScore * 0.5);
}

/**
 * Computes Cheshta Bala (Motional Strength)
 */
export function computeCheshtaBala(planet: string, isRetrograde: boolean, speed: number): number {
  if (planet === 'Sun' || planet === 'Moon') {
    // For Sun/Moon, Cheshta bala is calculated as Ayana bala (default ~40)
    return 45;
  }
  if (isRetrograde) {
    return 60; // Max strength when Vakri
  }
  const absSpeed = Math.abs(speed);
  if (absSpeed < 0.2) return 50; // Stationary
  if (absSpeed > 1.0) return 40; // Fast
  return 30; // Direct normal
}

/**
 * Computes Kala Bala (Temporal Strength)
 */
export function computeKalaBala(planet: string, birthHour: number): number {
  const isNight = birthHour < 6 || birthHour >= 18;
  let score = 35;

  if (isNight) {
    if (['Moon', 'Mars', 'Saturn'].includes(planet)) score = 55;
    if (['Sun', 'Jupiter', 'Venus'].includes(planet)) score = 25;
  } else {
    if (['Sun', 'Jupiter', 'Venus'].includes(planet)) score = 55;
    if (['Moon', 'Mars', 'Saturn'].includes(planet)) score = 25;
  }
  if (planet === 'Mercury') score = 45; // Mercury is strong always

  return score;
}

/**
 * Computes Drik Bala (Aspectual Strength)
 */
export function computeDrikBala(planet: string, house: number): number {
  // Approximate aspect balance based on benefics in Kendras
  let score = 30;
  if ([1, 5, 9].includes(house)) score += 10;
  if ([6, 8, 12].includes(house)) score -= 10;
  return Math.max(5, score);
}

/**
 * Calculates complete Shadbala for all 7 classical planets
 */
export function calculateShadbala(chart: ChartCalculationResult): ShadbalaResult {
  const birthHour = new Date(chart.birthDateTime).getUTCHours() + chart.timezone;
  const result: ShadbalaResult = {};
  const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  for (const pKey of planetList) {
    const pData = chart.planets[pKey];
    if (!pData) continue;

    const sthana = computeSthanaBala(pKey, pData.dignity, pData.house);
    const dig = computeDigBala(pKey, pData.house, pData.degreeInSign);
    const kala = computeKalaBala(pKey, birthHour);
    const cheshta = computeCheshtaBala(pKey, pData.isRetrograde, pData.speed);
    const naisargika = NAISARGIKA_BALA[pKey] || 30;
    const drik = computeDrikBala(pKey, pData.house);

    const totalVirupas = Math.round(sthana + dig + kala + cheshta + naisargika + drik);
    const totalRupas = Math.round((totalVirupas / 60) * 100) / 100;
    const required = SHADBALA_REQUIREMENTS[pKey] || 5.0;
    const ratio = Math.round((totalRupas / required) * 100);

    result[pKey] = {
      sthanaBala: sthana,
      digBala: dig,
      kalaBala: kala,
      cheshtaBala: cheshta,
      naisargikaBala: naisargika,
      drikBala: drik,
      totalVirupas,
      totalRupas,
      requiredRupas: required,
      percentageRatio: ratio,
      isStrong: totalRupas >= required,
      rank: 0,
    };
  }

  // Assign ranks
  const sorted = Object.keys(result).sort((a, b) => result[b].percentageRatio - result[a].percentageRatio);
  sorted.forEach((pKey, idx) => {
    result[pKey].rank = idx + 1;
  });

  return result;
}
