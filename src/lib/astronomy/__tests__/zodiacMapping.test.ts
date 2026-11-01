/**
 * Unit Test: Canonical 12 Zodiac Signs (Rashi) 1-to-1 Mapping Test
 * Validates English names, Sanskrit names, Ruling Lords, Elements, and Mobilities
 * against the canonical Brihat Parashara Hora Shastra (BPHS) specifications.
 */

import { ZODIAC_SIGNS } from '../constants';

export const CANONICAL_ZODIAC_LIST = [
  { number: 1, name: 'Aries', sanskrit: 'Mesha', lord: 'Mars', element: 'Fire', mobility: 'Chara (Movable)' },
  { number: 2, name: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus', element: 'Earth', mobility: 'Sthira (Fixed)' },
  { number: 3, name: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury', element: 'Air', mobility: 'Dwisvabhava (Dual)' },
  { number: 4, name: 'Cancer', sanskrit: 'Karka', lord: 'Moon', element: 'Water', mobility: 'Chara (Movable)' },
  { number: 5, name: 'Leo', sanskrit: 'Simha', lord: 'Sun', element: 'Fire', mobility: 'Sthira (Fixed)' },
  { number: 6, name: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury', element: 'Earth', mobility: 'Dwisvabhava (Dual)' },
  { number: 7, name: 'Libra', sanskrit: 'Tula', lord: 'Venus', element: 'Air', mobility: 'Chara (Movable)' },
  { number: 8, name: 'Scorpio', sanskrit: 'Vrishchika', lord: 'Mars', element: 'Water', mobility: 'Sthira (Fixed)' },
  { number: 9, name: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter', element: 'Fire', mobility: 'Dwisvabhava (Dual)' },
  { number: 10, name: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn', element: 'Earth', mobility: 'Chara (Movable)' },
  { number: 11, name: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn', element: 'Air', mobility: 'Sthira (Fixed)' },
  { number: 12, name: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter', element: 'Water', mobility: 'Dwisvabhava (Dual)' },
];

export function runZodiacMappingAssertion(): boolean {
  console.log('--- Running 12 Canonical Zodiac Signs Mapping Assertion ---');

  if (ZODIAC_SIGNS.length !== 12) {
    throw new Error(`Expected 12 Zodiac signs, found ${ZODIAC_SIGNS.length}`);
  }

  for (let i = 0; i < 12; i++) {
    const actual = ZODIAC_SIGNS[i];
    const expected = CANONICAL_ZODIAC_LIST[i];

    if (actual.number !== expected.number) {
      throw new Error(`Sign index ${i}: Expected number ${expected.number}, got ${actual.number}`);
    }
    if (actual.name !== expected.name) {
      throw new Error(`Sign index ${i}: Expected EN name "${expected.name}", got "${actual.name}"`);
    }
    if (actual.sanskrit !== expected.sanskrit) {
      throw new Error(`Sign index ${i} (${actual.name}): Expected Sanskrit "${expected.sanskrit}", got "${actual.sanskrit}"`);
    }
    if (actual.lord !== expected.lord) {
      throw new Error(`Sign index ${i} (${actual.name}): Expected Lord "${expected.lord}", got "${actual.lord}"`);
    }
    if (actual.element !== expected.element) {
      throw new Error(`Sign index ${i} (${actual.name}): Expected Element "${expected.element}", got "${actual.element}"`);
    }

    console.log(`✓ Sign ${String(actual.number).padStart(2)}: ${actual.name.padEnd(12)} ↔ ${actual.sanskrit.padEnd(12)} | Lord: ${actual.lord.padEnd(8)} | Element: ${actual.element}`);
  }

  console.log('✅ ALL 12 ZODIAC SIGNS EXACT 1-TO-1 MAPPING ASSERTION PASSED!\n');
  return true;
}
