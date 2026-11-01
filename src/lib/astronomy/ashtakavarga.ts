/**
 * Vedic Astrology Ashtakavarga Engine (BAV & SAV)
 * Implements classical Parashari rules for 337 total Rekhas/Bindus across 12 Rashis.
 */

import { ChartCalculationResult } from './ephemeris';

export interface AshtakavargaResult {
  bav: Record<string, number[]>; // Planet -> 12 signs bindu count (index 0 = Aries, 11 = Pisces)
  sav: number[]; // 12 signs sum of bindus
  savByHouse: number[]; // 12 houses bindu count (index 0 = 1st house, 11 = 12th house)
  totalBindus: number; // 337
  favorableHouses: number[]; // Houses with >= 28 points
  weakHouses: number[]; // Houses with < 25 points
}

// Classical Parashari Bindu contribution rules:
// Planet contributing points to houses counted from natal positions of Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Ascendant
const ASHTAKAVARGA_RULES: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Asc: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Asc: [3, 6, 10, 11],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Asc: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Asc: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Asc: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Asc: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Asc: [1, 3, 4, 6, 10, 11],
  },
};

/**
 * Computes complete Ashtakavarga tables (BAV for 7 planets and overall SAV)
 */
export function calculateAshtakavarga(chart: ChartCalculationResult): AshtakavargaResult {
  const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const planetSigns: Record<string, number> = {};

  planetList.forEach((p) => {
    planetSigns[p] = chart.planets[p].sign; // 1-12
  });
  planetSigns.Asc = chart.ascendant.sign; // 1-12

  const bav: Record<string, number[]> = {};
  const sav = new Array(12).fill(0);

  for (const mainPlanet of planetList) {
    bav[mainPlanet] = new Array(12).fill(0);
    const ruleSet = ASHTAKAVARGA_RULES[mainPlanet];

    for (const [fromBody, goodHouses] of Object.entries(ruleSet)) {
      const fromSign = planetSigns[fromBody];
      if (!fromSign) continue;

      for (const h of goodHouses) {
        const targetSignIndex = (fromSign - 1 + (h - 1)) % 12; // 0-11
        bav[mainPlanet][targetSignIndex] += 1;
        sav[targetSignIndex] += 1;
      }
    }
  }

  // Convert SAV by signs into SAV by houses relative to Ascendant
  const ascSign = chart.ascendant.sign;
  const savByHouse = new Array(12).fill(0);
  const favorableHouses: number[] = [];
  const weakHouses: number[] = [];

  for (let h = 1; h <= 12; h++) {
    const signIndex = (ascSign - 1 + (h - 1)) % 12;
    const score = sav[signIndex];
    savByHouse[h - 1] = score;

    if (score >= 28) favorableHouses.push(h);
    if (score < 25) weakHouses.push(h);
  }

  const totalBindus = sav.reduce((acc, curr) => acc + curr, 0);

  return {
    bav,
    sav,
    savByHouse,
    totalBindus,
    favorableHouses,
    weakHouses,
  };
}
