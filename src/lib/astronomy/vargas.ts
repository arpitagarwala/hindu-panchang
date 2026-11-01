/**
 * Vedic Astrology Divisional Charts (Vargas / Shodashavargas) Engine
 * Implements exact classical algorithms according to Brihat Parashara Hora Shastra (BPHS).
 */

import { ZODIAC_SIGNS, PLANETS } from './constants';
import { normalizeDeg } from './ephemeris';

export type VargaType =
  | 'D1'  // Rashi
  | 'D2'  // Hora (Wealth)
  | 'D3'  // Drekkana (Siblings / Courage)
  | 'D4'  // Chaturthamsha (Fortune / Assets)
  | 'D7'  // Saptamsha (Children / Progeny)
  | 'D9'  // Navamsha (Spouse / Dharma / Destiny)
  | 'D10' // Dashamsha (Career / Profession)
  | 'D12' // Dwadashamsha (Parents / Lineage)
  | 'D16' // Shodashamsha (Vehicles / Happiness)
  | 'D20' // Vimshamsha (Spiritual pursuits)
  | 'D24' // Chaturvimshamsha (Learning / Intellect)
  | 'D27' // Saptavimshamsha (Strengths & Weaknesses)
  | 'D30' // Trimshamsha (Misfortunes / Evils)
  | 'D60'; // Shashtiamsha (Past Karma / Micro-level)

export interface VargaMeta {
  code: VargaType;
  division: number;
  name: string;
  sanskrit: string;
  signification: string;
}

export const VARGA_INFO: Record<VargaType, VargaMeta> = {
  D1: { code: 'D1', division: 1, name: 'Rashi', sanskrit: 'Rāśi', signification: 'Physical self, overall life blueprint' },
  D2: { code: 'D2', division: 2, name: 'Hora', sanskrit: 'Horā', signification: 'Wealth, financial capacity, liquid assets' },
  D3: { code: 'D3', division: 3, name: 'Drekkana', sanskrit: 'Drekkāṇa', signification: 'Siblings, courage, motivation, energy' },
  D4: { code: 'D4', division: 4, name: 'Chaturthamsha', sanskrit: 'Caturthāṁśa', signification: 'Fixed assets, home, conveyances, fortune' },
  D7: { code: 'D7', division: 7, name: 'Saptamsha', sanskrit: 'Saptāṁśa', signification: 'Children, progeny, lineage, creative output' },
  D9: { code: 'D9', division: 9, name: 'Navamsha', sanskrit: 'Navāṁśa', signification: 'Dharma, marriage, spouse, inner potential' },
  D10: { code: 'D10', division: 10, name: 'Dashamsha', sanskrit: 'Daśāṁśa', signification: 'Career, profession, reputation, power' },
  D12: { code: 'D12', division: 12, name: 'Dwadashamsha', sanskrit: 'Dvādaśāṁśa', signification: 'Parents, heritage, past ancestral karma' },
  D16: { code: 'D16', division: 16, name: 'Shodashamsha', sanskrit: 'Ṣoḍaśāṁśa', signification: 'Conveyances, comforts, inner happiness' },
  D20: { code: 'D20', division: 20, name: 'Vimshamsha', sanskrit: 'Viṁśāṁśa', signification: 'Spiritual progress, bhakti, meditation' },
  D24: { code: 'D24', division: 24, name: 'Chaturvimshamsha', sanskrit: 'Caturviṁśāṁśa', signification: 'Higher education, scholarship, skills' },
  D27: { code: 'D27', division: 27, name: 'Saptavimshamsha', sanskrit: 'Saptaviṁśāṁśa', signification: 'Inherent strength, vulnerabilities' },
  D30: { code: 'D30', division: 30, name: 'Trimshamsha', sanskrit: 'Trimśāṁśa', signification: 'Overcoming obstacles, health, misfortunes' },
  D60: { code: 'D60', division: 60, name: 'Shashtiamsha', sanskrit: 'Ṣaṣṭyāṁśa', signification: 'Past-life karma, subtle destiny' },
};

export interface VargaPlacement {
  id: string;
  name: string;
  sign: number; // 1-12
  signName: string;
  signLord: string;
  house: number; // 1-12 relative to varga ascendant
}

export interface VargaChartResult {
  varga: VargaType;
  meta: VargaMeta;
  ascendantSign: number;
  ascendantSignName: string;
  placements: Record<string, VargaPlacement>;
  rashiHouses: Record<number, string[]>; // Sign -> Planet IDs
  bhavatHouses: Record<number, string[]>; // House -> Planet IDs
}

/**
 * Calculates the sign (1-12) for a given sidereal longitude in any Varga division
 */
export function calculateVargaSign(siderealLon: number, varga: VargaType): number {
  const norm = normalizeDeg(siderealLon);
  const rashiIndex = Math.floor(norm / 30); // 0-11
  const signNum = rashiIndex + 1; // 1-12
  const degInSign = norm % 30;
  const isOddSign = signNum % 2 !== 0;

  switch (varga) {
    case 'D1': // Rashi
      return signNum;

    case 'D2': { // Hora (Parashari: Odd signs: 0-15° Sun (Leo=5), 15-30° Moon (Cancer=4); Even signs: 0-15° Moon (4), 15-30° Sun (5))
      if (isOddSign) {
        return degInSign < 15 ? 5 : 4;
      } else {
        return degInSign < 15 ? 4 : 5;
      }
    }

    case 'D3': { // Drekkana (1st 10°: 1st, 2nd 10°: 5th, 3rd 10°: 9th from current sign)
      const part = Math.floor(degInSign / 10); // 0, 1, 2
      const offsets = [0, 4, 8];
      return ((signNum - 1 + offsets[part]) % 12) + 1;
    }

    case 'D4': { // Chaturthamsha (Divided by 7.5°. 1st, 4th, 7th, 10th from current sign)
      const part = Math.floor(degInSign / 7.5); // 0, 1, 2, 3
      const offsets = [0, 3, 6, 9];
      return ((signNum - 1 + offsets[part]) % 12) + 1;
    }

    case 'D7': { // Saptamsha (4° 17' 8.57" per division. Odd signs start from same sign; Even signs start from 7th sign)
      const part = Math.floor(degInSign / (30 / 7)); // 0-6
      const start = isOddSign ? signNum : ((signNum - 1 + 6) % 12) + 1;
      return ((start - 1 + part) % 12) + 1;
    }

    case 'D9': { // Navamsha (3° 20' per division. Fire starts Aries, Earth starts Cap, Air starts Lib, Water starts Cancer)
      const part = Math.floor(degInSign / (30 / 9)); // 0-8
      const element = ZODIAC_SIGNS[rashiIndex].element;
      let start = 1;
      if (element === 'Earth') start = 10;
      else if (element === 'Air') start = 7;
      else if (element === 'Water') start = 4;
      return ((start - 1 + part) % 12) + 1;
    }

    case 'D10': { // Dashamsha (3° per division. Odd signs start from same sign; Even signs start from 9th sign)
      const part = Math.floor(degInSign / 3); // 0-9
      const start = isOddSign ? signNum : ((signNum - 1 + 8) % 12) + 1;
      return ((start - 1 + part) % 12) + 1;
    }

    case 'D12': { // Dwadashamsha (2° 30' per division. Starts from the same sign and counts sequentially)
      const part = Math.floor(degInSign / 2.5); // 0-11
      return ((signNum - 1 + part) % 12) + 1;
    }

    case 'D16': { // Shodashamsha (1° 52' 30". Movable starts Aries=1, Fixed starts Leo=5, Dual starts Sag=9)
      const part = Math.floor(degInSign / (30 / 16)); // 0-15
      const mobility = ZODIAC_SIGNS[rashiIndex].mobility;
      let start = 1;
      if (mobility.includes('Fixed')) start = 5;
      else if (mobility.includes('Dual')) start = 9;
      return ((start - 1 + part) % 12) + 1;
    }

    case 'D20': { // Vimshamsha (1° 30". Movable starts Aries=1, Fixed starts Sag=9, Dual starts Leo=5)
      const part = Math.floor(degInSign / 1.5); // 0-19
      const mobility = ZODIAC_SIGNS[rashiIndex].mobility;
      let start = 1;
      if (mobility.includes('Fixed')) start = 9;
      else if (mobility.includes('Dual')) start = 5;
      return ((start - 1 + part) % 12) + 1;
    }

    case 'D24': { // Chaturvimshamsha (1° 15". Odd signs start Leo=5, Even signs start Cancer=4)
      const part = Math.floor(degInSign / 1.25); // 0-23
      const start = isOddSign ? 5 : 4;
      return ((start - 1 + part) % 12) + 1;
    }

    case 'D27': { // Saptavimshamsha / Bhamsha (1° 6' 40". Fire starts Aries=1, Earth starts Cancer=4, Air starts Libra=7, Water starts Cap=10)
      const part = Math.floor(degInSign / (30 / 27)); // 0-26
      const element = ZODIAC_SIGNS[rashiIndex].element;
      let start = 1;
      if (element === 'Earth') start = 4;
      else if (element === 'Air') start = 7;
      else if (element === 'Water') start = 10;
      return ((start - 1 + part) % 12) + 1;
    }

    case 'D30': { // Trimshamsha (Parashari unequal 5-planet rulerships)
      // Odd signs: Mars (0-5°: Aries=1), Saturn (5-10°: Aquarius=11), Jupiter (10-18°: Sag=9), Mercury (18-25°: Gemini=3), Venus (25-30°: Libra=7)
      // Even signs: Venus (0-5°: Taurus=2), Mercury (5-12°: Virgo=6), Jupiter (12-20°: Pisces=12), Saturn (20-25°: Cap=10), Mars (25-30°: Scorpio=8)
      if (isOddSign) {
        if (degInSign < 5) return 1;
        if (degInSign < 10) return 11;
        if (degInSign < 18) return 9;
        if (degInSign < 25) return 3;
        return 7;
      } else {
        if (degInSign < 5) return 2;
        if (degInSign < 12) return 6;
        if (degInSign < 20) return 12;
        if (degInSign < 25) return 10;
        return 8;
      }
    }

    case 'D60': { // Shashtiamsha (0° 30' per division. Starts from the sign itself and counts sequentially)
      const part = Math.floor(degInSign / 0.5); // 0-59
      return ((signNum - 1 + part) % 12) + 1;
    }

    default:
      return signNum;
  }
}

/**
 * Calculates full Varga Chart for all planets and Ascendant
 */
export function calculateVargaChart(
  varga: VargaType,
  ascendantSiderealLon: number,
  planetSiderealPositions: Record<string, { siderealLon: number; name: string }>
): VargaChartResult {
  const meta = VARGA_INFO[varga];
  const ascSign = calculateVargaSign(ascendantSiderealLon, varga);
  const ascSignDef = ZODIAC_SIGNS[ascSign - 1];

  const placements: Record<string, VargaPlacement> = {};
  const rashiHouses: Record<number, string[]> = {};
  const bhavatHouses: Record<number, string[]> = {};

  for (let i = 1; i <= 12; i++) {
    rashiHouses[i] = [];
    bhavatHouses[i] = [];
  }

  for (const [id, planetData] of Object.entries(planetSiderealPositions)) {
    const vSign = calculateVargaSign(planetData.siderealLon, varga);
    const signDef = ZODIAC_SIGNS[vSign - 1];
    const house = ((vSign - ascSign + 12) % 12) + 1;

    placements[id] = {
      id,
      name: planetData.name,
      sign: vSign,
      signName: signDef.name,
      signLord: signDef.lord,
      house,
    };

    if (rashiHouses[vSign]) rashiHouses[vSign].push(id);
    if (bhavatHouses[house]) bhavatHouses[house].push(id);
  }

  return {
    varga,
    meta,
    ascendantSign: ascSign,
    ascendantSignName: ascSignDef.name,
    placements,
    rashiHouses,
    bhavatHouses,
  };
}
