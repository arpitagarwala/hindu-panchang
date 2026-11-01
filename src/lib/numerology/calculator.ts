/**
 * Vedic and Western Numerology Engine
 * Implements Mulank, Bhagyank, Namank, Pythagorean & Chaldean Systems
 * with Birth Chart Cross-Referencing.
 */

import { ChartCalculationResult } from '../astronomy/ephemeris';

export interface NumerologyProfile {
  name: string;
  dob: string; // YYYY-MM-DD
  vedic: {
    mulank: number; // 1-9
    mulankLord: string;
    mulankSanskrit: string;
    bhagyank: number; // 1-9
    bhagyankLord: string;
    bhagyankSanskrit: string;
    namank: number; // 1-9
    namankLord: string;
  };
  western: {
    lifePath: number;
    pythagoreanDestiny: number;
    chaldeanDestiny: number;
    soulUrge: number; // Vowels
    personalityNumber: number; // Consonants
  };
  luckyAttributes: {
    luckyNumbers: number[];
    friendlyNumbers: number[];
    enemyNumbers: number[];
    luckyColors: string[];
    luckyDays: string[];
    gemstone: string;
  };
  readings: {
    mulankMeaning: { en: string; hi: string; hinglish: string };
    bhagyankMeaning: { en: string; hi: string; hinglish: string };
    chartSynthesis?: { en: string; hi: string; hinglish: string; alignmentScore: number };
  };
}

// Planetary Rulers for Numbers 1-9 (Vedic Ank Jyotish)
export const NUMBER_PLANET_MAP: Record<number, { name: string; sanskrit: string; gem: string; colors: string[]; days: string[] }> = {
  1: { name: 'Sun', sanskrit: 'Surya', gem: 'Ruby', colors: ['Gold', 'Orange', 'Red'], days: ['Sunday'] },
  2: { name: 'Moon', sanskrit: 'Chandra', gem: 'Pearl', colors: ['White', 'Silver', 'Cream'], days: ['Monday'] },
  3: { name: 'Jupiter', sanskrit: 'Guru', gem: 'Yellow Sapphire', colors: ['Yellow', 'Saffron'], days: ['Thursday'] },
  4: { name: 'Rahu', sanskrit: 'Rahu', gem: 'Hessonite', colors: ['Smoky Blue', 'Grey'], days: ['Saturday', 'Sunday'] },
  5: { name: 'Mercury', sanskrit: 'Budha', gem: 'Emerald', colors: ['Green', 'Emerald'], days: ['Wednesday'] },
  6: { name: 'Venus', sanskrit: 'Shukra', gem: 'Diamond / Opal', colors: ['Pink', 'White', 'Light Blue'], days: ['Friday'] },
  7: { name: 'Ketu', sanskrit: 'Ketu', gem: "Cat's Eye", colors: ['Pastel Green', 'White'], days: ['Tuesday', 'Thursday'] },
  8: { name: 'Saturn', sanskrit: 'Shani', gem: 'Blue Sapphire', colors: ['Dark Blue', 'Black'], days: ['Saturday'] },
  9: { name: 'Mars', sanskrit: 'Mangal', gem: 'Red Coral', colors: ['Deep Red', 'Crimson'], days: ['Tuesday'] },
};

// Chaldean Letter Values (1-8, no 9)
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Pythagorean Letter Values (1-9)
const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/**
 * Reduces any integer or digit sum to a single digit (1-9), preserving master numbers if requested
 */
export function reduceToSingleDigit(num: number): number {
  let current = Math.abs(num);
  while (current > 9) {
    let sum = 0;
    while (current > 0) {
      sum += current % 10;
      current = Math.floor(current / 10);
    }
    current = sum;
  }
  return current === 0 ? 9 : current;
}

import { ensureValidDate } from '../utils/format';

/**
 * Calculates complete Numerology profile
 */
export function calculateNumerology(
  name: string,
  dob: Date,
  natalChart?: ChartCalculationResult
): NumerologyProfile {
  const d = ensureValidDate(dob);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  // 1. Vedic Mulank (Day of birth reduced)
  const mulank = reduceToSingleDigit(day);
  const mulankInfo = NUMBER_PLANET_MAP[mulank];

  // 2. Vedic Bhagyank (Full DOB sum reduced)
  const fullDateSum = day + month + year;
  const bhagyank = reduceToSingleDigit(fullDateSum);
  const bhagyankInfo = NUMBER_PLANET_MAP[bhagyank];

  // 3. Name numbers
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');

  let chaldeanSum = 0;
  let pythagoreanSum = 0;
  let vowelSum = 0;
  let consonantSum = 0;

  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName[i];
    const chalVal = CHALDEAN_MAP[char] || 0;
    const pythVal = PYTHAGOREAN_MAP[char] || 0;

    chaldeanSum += chalVal;
    pythagoreanSum += pythVal;

    if (VOWELS.has(char)) {
      vowelSum += pythVal;
    } else {
      consonantSum += pythVal;
    }
  }

  const namank = reduceToSingleDigit(chaldeanSum > 0 ? chaldeanSum : 1);
  const namankInfo = NUMBER_PLANET_MAP[namank];

  const lifePath = bhagyank;
  const pythagoreanDestiny = reduceToSingleDigit(pythagoreanSum > 0 ? pythagoreanSum : 1);
  const chaldeanDestiny = reduceToSingleDigit(chaldeanSum > 0 ? chaldeanSum : 1);
  const soulUrge = reduceToSingleDigit(vowelSum > 0 ? vowelSum : 1);
  const personalityNumber = reduceToSingleDigit(consonantSum > 0 ? consonantSum : 1);

  // Friendly & Lucky Numbers
  const friendlyMap: Record<number, number[]> = {
    1: [1, 2, 3, 5, 9],
    2: [1, 2, 4, 7],
    3: [1, 2, 3, 5, 9],
    4: [1, 2, 6, 7, 8],
    5: [1, 5, 6],
    6: [5, 6, 8],
    7: [1, 2, 4, 7],
    8: [3, 5, 6, 7, 8],
    9: [1, 2, 3, 9],
  };

  const luckyNumbers = Array.from(new Set([mulank, bhagyank, namank]));
  const friendlyNumbers = friendlyMap[mulank] || [1, 5];
  const enemyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    (n) => !friendlyNumbers.includes(n) && !luckyNumbers.includes(n)
  );

  // 4. Mulank & Bhagyank Meanings
  const mulankTexts: Record<number, { en: string; hi: string; hinglish: string }> = {
    1: {
      en: 'Ruled by the Sun. Natural pioneer, visionary leader with immense willpower and independence.',
      hi: 'सूर्य द्वारा शासित। जन्मजात नेतृत्वकर्ता, स्वाभिमानी, ऊर्जावान और दृढ़ संकल्पी व्यक्तित्व।',
      hinglish: 'Sun ka influence hai. Natural leader, bold mindset aur independent nature.',
    },
    2: {
      en: 'Ruled by the Moon. Deeply intuitive, diplomatic, artistic, empathetic, and peace-loving.',
      hi: 'चन्द्र द्वारा शासित। संवेदनशील, कलाप्रेमी, शांतिप्रिय और असाधारण अंतर्ज्ञान से युक्त।',
      hinglish: 'Moon-ruled. High emotional intelligence, intuitive mind aur caring creative nature.',
    },
    3: {
      en: 'Ruled by Jupiter. Wisdom seeker, expansive teacher, optimistic, expressive, and philosophical.',
      hi: 'गुरु द्वारा शासित। ज्ञानवान, आशावादी, कुशल वक्ता और उच्च नैतिक आदर्शों के धनी।',
      hinglish: 'Jupiter ka bless hai. Wise, positive mindset, great advisory skills aur broad vision.',
    },
    4: {
      en: 'Ruled by Rahu. Unconventional thinker, breakthrough innovator, analytical and boundary-pushing.',
      hi: 'राहु द्वारा शासित। लीक से हटकर सोचने वाले, तकनीकी विचारक, व्यावहारिक और क्रांतिकारी।',
      hinglish: 'Rahu-ruled. Out-of-the-box thinker, tech-savvy aur innovative problem solver.',
    },
    5: {
      en: 'Ruled by Mercury. Fast-paced communicator, versatile commercial intellect, adaptable and witty.',
      hi: 'बुध द्वारा शासित। बहुमुखी प्रतिभा, त्वरित निर्णय क्षमता, तीव्र वाणी और व्यावसायिक बुद्धि।',
      hinglish: 'Mercury-ruled. Multi-talented, adaptable, quick communicator aur business smart.',
    },
    6: {
      en: 'Ruled by Venus. Refined aesthetics, harmony creator, magnetic charm, protective and nurturing.',
      hi: 'शुक्र द्वारा शासित। सौंदर्यबोध, प्रेम, पारिवारिक समर्पण, आकर्षण और कलात्मक अभिरुचि।',
      hinglish: 'Venus ka charm hai. Luxurious aesthetic taste, sweet nature aur strong relationship builder.',
    },
    7: {
      en: 'Ruled by Ketu. Deep researcher, mystical seeker, introspective, analytical and highly perceptive.',
      hi: 'केतु द्वारा शासित। अनुसंधानपरक, आध्यात्मिक अन्वेषक, दार्शनिक और गूढ़ रहस्यों के ज्ञाता।',
      hinglish: 'Ketu-ruled. Deep analytical thinker, spiritual inclination aur sharp hidden perception.',
    },
    8: {
      en: 'Ruled by Saturn. Master of material discipline, patient builder, unshakeable stamina and justice.',
      hi: 'शनि द्वारा शासित। कर्मठ, न्यायप्रिय, दृढ़ परिश्रमी और दीर्घकालिक निर्माण में कुशल।',
      hinglish: 'Saturn-ruled. High endurance, practical builder mindset aur disciplined execution.',
    },
    9: {
      en: 'Ruled by Mars. Fearless warrior energy, humanitarian crusader, fiery passion and protective valor.',
      hi: 'मंगल द्वारा शासित। पराक्रमी, साहसी, समाज सुधारक और अदम्य उत्साह से ओतप्रोत।',
      hinglish: 'Mars-ruled. Energetic warrior spirit, quick action taker aur loyal protector.',
    },
  };

  // 5. Cross-Reference with Birth Chart
  let chartSynthesis: NumerologyProfile['readings']['chartSynthesis'] | undefined = undefined;
  if (natalChart) {
    const rulingPlanetName = mulankInfo.name;
    const natalPlanet = natalChart.planets[rulingPlanetName];

    if (natalPlanet) {
      const isExalted = natalPlanet.dignity === 'Exalted' || natalPlanet.dignity === 'Own Sign';
      const isFriendly = natalPlanet.dignity === 'Friend' || natalPlanet.dignity === 'Moolatrikona';
      const score = isExalted ? 95 : isFriendly ? 80 : natalPlanet.dignity === 'Debilitated' ? 45 : 65;

      chartSynthesis = {
        alignmentScore: score,
        en: `Your Mulank Lord ${rulingPlanetName} is placed in House ${natalPlanet.house} (${natalPlanet.signName}) with '${natalPlanet.dignity}' dignity. This synthesizes your core numeric vibration with tangible natal power.`,
        hi: `आपके मूलांक स्वामी ${mulankInfo.sanskrit} कुंडली के ${natalPlanet.house}वें भाव (${natalPlanet.signName}) में '${natalPlanet.dignity}' अवस्था में विराजमान हैं। यह संख्यात्मक ऊर्जा को वास्तविक जीवन में सुदृढ़ करता है।`,
        hinglish: `Aapka Mulank Lord ${rulingPlanetName} kundali ke ${natalPlanet.house}th house me '${natalPlanet.dignity}' position me hai. Numeric drive aur chart strength me strong alignment hai.`,
      };
    }
  }

  return {
    name,
    dob: dob.toISOString().split('T')[0],
    vedic: {
      mulank,
      mulankLord: mulankInfo.name,
      mulankSanskrit: mulankInfo.sanskrit,
      bhagyank,
      bhagyankLord: bhagyankInfo.name,
      bhagyankSanskrit: bhagyankInfo.sanskrit,
      namank,
      namankLord: namankInfo.name,
    },
    western: {
      lifePath,
      pythagoreanDestiny,
      chaldeanDestiny,
      soulUrge,
      personalityNumber,
    },
    luckyAttributes: {
      luckyNumbers,
      friendlyNumbers,
      enemyNumbers,
      luckyColors: mulankInfo.colors,
      luckyDays: mulankInfo.days,
      gemstone: mulankInfo.gem,
    },
    readings: {
      mulankMeaning: mulankTexts[mulank] || mulankTexts[1],
      bhagyankMeaning: mulankTexts[bhagyank] || mulankTexts[1],
      chartSynthesis,
    },
  };
}
