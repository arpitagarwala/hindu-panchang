/**
 * Deterministic Daily Vedic Cosmic Resonance Scoring Engine
 * Computes a 0–100 score based on 5 classical Jyotish pillars:
 * 1. Tara Bala (Navatara from Janma Nakshatra): 0–25 pts
 * 2. Chandra Bala (Transit Moon House from Natal Moon): 0–20 pts
 * 3. Major Planetary Gochar (Jupiter & Saturn transits from Natal Moon): 0–20 pts
 * 4. Dasha–Vara Maitri (Weekday Ruler vs Active Dasha Lord): 0–15 pts
 * 5. Panchang Shuddhi (Tithi Class & Active Choghadiya Quality): 0–20 pts
 */

import { ChartCalculationResult, calculateVedicChart } from './ephemeris';
import { PanchangResult } from '@/lib/panchang';
import { ChoghadiyaResult } from './choghadiya';
import { VimshottariResult } from './dasha';

export interface ScorePillarBreakdown {
  id: string;
  name: string;
  nameHi: string;
  nameHinglish: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'neutral' | 'caution';
  detail: string;
  classicalRule: string;
}

export interface DailyVedicScoreResult {
  totalScore: number;
  grade: {
    en: string;
    hi: string;
    hinglish: string;
  };
  vibeSummary: {
    en: string;
    hi: string;
    hinglish: string;
  };
  pillars: ScorePillarBreakdown[];
}

// Classical Planetary Friendship (Natural / Naisargika Maitri)
// Lord -> { friends: [], neutrals: [], enemies: [] }
const PLANETARY_FRIENDSHIPS: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  Sun: {
    friends: ['Moon', 'Mars', 'Jupiter'],
    neutrals: ['Mercury'],
    enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu'],
  },
  Moon: {
    friends: ['Sun', 'Mercury'],
    neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
    enemies: ['Rahu', 'Ketu'],
  },
  Mars: {
    friends: ['Sun', 'Moon', 'Jupiter'],
    neutrals: ['Venus', 'Saturn'],
    enemies: ['Mercury', 'Rahu', 'Ketu'],
  },
  Mercury: {
    friends: ['Sun', 'Venus'],
    neutrals: ['Mars', 'Jupiter', 'Saturn'],
    enemies: ['Moon', 'Rahu', 'Ketu'],
  },
  Jupiter: {
    friends: ['Sun', 'Moon', 'Mars'],
    neutrals: ['Saturn'],
    enemies: ['Mercury', 'Venus', 'Rahu', 'Ketu'],
  },
  Venus: {
    friends: ['Mercury', 'Saturn', 'Rahu', 'Ketu'],
    neutrals: ['Mars', 'Jupiter'],
    enemies: ['Sun', 'Moon'],
  },
  Saturn: {
    friends: ['Mercury', 'Venus', 'Rahu'],
    neutrals: ['Jupiter'],
    enemies: ['Sun', 'Moon', 'Mars', 'Ketu'],
  },
  Rahu: {
    friends: ['Venus', 'Saturn', 'Mercury'],
    neutrals: ['Jupiter'],
    enemies: ['Sun', 'Moon', 'Mars', 'Ketu'],
  },
  Ketu: {
    friends: ['Mars', 'Venus', 'Saturn'],
    neutrals: ['Mercury', 'Jupiter'],
    enemies: ['Sun', 'Moon', 'Rahu'],
  },
};

// Weekday index (0=Sun .. 6=Sat) to ruling planet
const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Navatara 1-9 Table
const NAVATARA_TABLE: Record<number, { name: string; signification: string; points: number; status: 'excellent' | 'good' | 'neutral' | 'caution' }> = {
  1: { name: 'Janma', signification: 'Self & Body — Moderate / Mixed', points: 12, status: 'neutral' },
  2: { name: 'Sampat', signification: 'Wealth, Inflow & Material Gains', points: 25, status: 'excellent' },
  3: { name: 'Vipat', signification: 'Obstacles & Delays', points: 5, status: 'caution' },
  4: { name: 'Kshema', signification: 'Comfort, Wellbeing & Protection', points: 23, status: 'excellent' },
  5: { name: 'Pratyak', signification: 'Opposition & Conflicts', points: 6, status: 'caution' },
  6: { name: 'Sadhana', signification: 'Achievement & Goal Fulfillment', points: 22, status: 'good' },
  7: { name: 'Naidhana (Vadh)', signification: 'Severe Impediments — High Caution', points: 2, status: 'caution' },
  8: { name: 'Mitra', signification: 'Friendship & Smooth Cooperation', points: 20, status: 'good' },
  9: { name: 'Parama Mitra', signification: 'Supreme Ally & Divine Grace', points: 25, status: 'excellent' },
};

/**
 * Pure, deterministic calculation of Daily Vedic Cosmic Resonance Score (0–100)
 */
export function calculateDailyVedicScore(
  chart: ChartCalculationResult,
  panchang: PanchangResult,
  choghadiya: ChoghadiyaResult,
  dasha: VimshottariResult,
  date: Date = new Date(),
  lat: number = 28.6139,
  lon: number = 77.2090
): DailyVedicScoreResult {
  // 1. Calculate live sky for transits
  const transitSky = calculateVedicChart(date, lat, lon);

  const natalMoonPos = chart.planets.Moon || { sign: 1, nakshatra: 1, signName: 'Aries', nakshatraName: 'Ashwini' };
  const natalMoonSign = natalMoonPos.sign;
  const natalMoonNak = natalMoonPos.nakshatra; // 1-27

  const transitMoonPos = transitSky.planets.Moon || { sign: 1, nakshatra: 1, signName: 'Aries', nakshatraName: 'Ashwini' };
  const transitMoonSign = transitMoonPos.sign;
  const transitMoonNak = transitMoonPos.nakshatra; // 1-27

  // ──────────────────────────────────────────────────────────
  // PILLAR 1: TARA BALA (Navatara from Janma Nakshatra) — Max 25
  // ──────────────────────────────────────────────────────────
  const rawTaraDiff = ((transitMoonNak - natalMoonNak + 27) % 9) + 1; // 1..9
  const taraInfo = NAVATARA_TABLE[rawTaraDiff] || NAVATARA_TABLE[1];
  const taraScore = taraInfo.points;

  const pillar1: ScorePillarBreakdown = {
    id: 'taraBala',
    name: 'Tara Bala (Lunar Nakshatra)',
    nameHi: 'तारा बल (नक्षत्र अनुकूलता)',
    nameHinglish: 'Tara Bala (Nakshatra Resonance)',
    score: taraScore,
    maxScore: 25,
    status: taraInfo.status,
    detail: `Today's transit Nakshatra (${transitMoonPos.nakshatraName}) is the ${taraInfo.name} Tara relative to your birth Nakshatra (${natalMoonPos.nakshatraName}). ${taraInfo.signification}.`,
    classicalRule: 'Phaladeepika & Muhurta Chintamani: Tara count determines mental ease and productivity of efforts.',
  };

  // ──────────────────────────────────────────────────────────
  // PILLAR 2: CHANDRA BALA (Transit Moon House from Natal Moon) — Max 20
  // ──────────────────────────────────────────────────────────
  const chandraHouse = ((transitMoonSign - natalMoonSign + 12) % 12) + 1; // 1..12
  let chandraScore = 12;
  let chandraStatus: 'excellent' | 'good' | 'neutral' | 'caution' = 'neutral';
  let chandraDetail = '';

  if (chandraHouse === 11) {
    chandraScore = 20;
    chandraStatus = 'excellent';
    chandraDetail = `Transit Moon in 11th House (Labha Chandra) from your Natal Moon in ${natalMoonPos.signName}. Highly auspicious for fulfillment and gains.`;
  } else if ([3, 6, 10].includes(chandraHouse)) {
    chandraScore = 18;
    chandraStatus = 'good';
    chandraDetail = `Transit Moon in ${chandraHouse}th House (Upachaya Chandra) from your Natal Moon. Fosters vitality, courage, and victory in daily tasks.`;
  } else if ([1, 7].includes(chandraHouse)) {
    chandraScore = 15;
    chandraStatus = 'good';
    chandraDetail = `Transit Moon in ${chandraHouse}th House (Kendra Chandra) from your Natal Moon. Enhances personal presence and clarity.`;
  } else if ([2, 5, 9].includes(chandraHouse)) {
    chandraScore = 12;
    chandraStatus = 'neutral';
    chandraDetail = `Transit Moon in ${chandraHouse}th House (Trikona/Dhana) from your Natal Moon. Steady, reflective, and creative energy.`;
  } else if (chandraHouse === 4) {
    chandraScore = 6;
    chandraStatus = 'caution';
    chandraDetail = `Transit Moon in 4th House (Kantaka Chandra) from your Natal Moon. May cause minor emotional restlessness or domestic friction.`;
  } else if (chandraHouse === 12) {
    chandraScore = 4;
    chandraStatus = 'caution';
    chandraDetail = `Transit Moon in 12th House (Vyaya Chandra) from your Natal Moon. Indicates expenditure of energy; ideal for quiet contemplation.`;
  } else {
    // 8th House (Ashtama Chandra)
    chandraScore = 2;
    chandraStatus = 'caution';
    chandraDetail = `Transit Moon in 8th House (Ashtama Chandra) from your Natal Moon. Classical caution indicator; avoid hasty decisions and heavy risks.`;
  }

  const pillar2: ScorePillarBreakdown = {
    id: 'chandraBala',
    name: 'Chandra Bala (Transit Moon)',
    nameHi: 'चन्द्र बल (गोचर चन्द्र स्थिति)',
    nameHinglish: 'Chandra Bala (Transit Moon House)',
    score: chandraScore,
    maxScore: 20,
    status: chandraStatus,
    detail: chandraDetail,
    classicalRule: 'Brihat Samhita Ch. 104 & Phaladeepika Ch. 26: Moon transiting 1, 3, 6, 7, 10, 11 from Janma Rashi yields auspicious results.',
  };

  // ──────────────────────────────────────────────────────────
  // PILLAR 3: MAJOR GOCHAR (Jupiter & Saturn from Natal Moon) — Max 20
  // ──────────────────────────────────────────────────────────
  const tJupiter = transitSky.planets.Jupiter;
  const tSaturn = transitSky.planets.Saturn;

  const jupHouse = tJupiter ? ((tJupiter.sign - natalMoonSign + 12) % 12) + 1 : 5;
  const satHouse = tSaturn ? ((tSaturn.sign - natalMoonSign + 12) % 12) + 1 : 10;

  // Jupiter score (Max 12)
  const isJupBenefic = [2, 5, 7, 9, 11].includes(jupHouse);
  const jupPoints = isJupBenefic ? 12 : 4;

  // Saturn score (Max 8)
  const isSatUpachaya = [3, 6, 11].includes(satHouse);
  const isSadeSati = [12, 1, 2].includes(satHouse);
  const satPoints = isSatUpachaya ? 8 : isSadeSati ? 2 : 5;

  const gocharScore = jupPoints + satPoints;
  const gocharStatus = gocharScore >= 16 ? 'excellent' : gocharScore >= 11 ? 'good' : 'neutral';

  const pillar3: ScorePillarBreakdown = {
    id: 'majorGochar',
    name: 'Major Planetary Gochar',
    nameHi: 'मुख्य ग्रह गोचर (गुरु व शनि)',
    nameHinglish: 'Major Planetary Gochar (Jupiter & Saturn)',
    score: gocharScore,
    maxScore: 20,
    status: gocharStatus,
    detail: `Transit Jupiter is in House ${jupHouse} (${isJupBenefic ? 'Auspicious' : 'Neutral'}) and Saturn is in House ${satHouse} (${isSatUpachaya ? 'Highly Favorable Upachaya' : isSadeSati ? 'Sade Sati phase' : 'Steady'}) from your Natal Moon.`,
    classicalRule: 'Phaladeepika Ch. 26: Jupiter transiting 2, 5, 7, 9, 11 and Saturn in 3, 6, 11 provide peak institutional protection.',
  };

  // ──────────────────────────────────────────────────────────
  // PILLAR 4: DASHA–VARA MAITRI (Weekday Lord vs Dasha Lord) — Max 15
  // ──────────────────────────────────────────────────────────
  const dayIndex = date.getDay(); // 0..6
  const weekdayLord = WEEKDAY_LORDS[dayIndex] || 'Sun';
  const mdPlanet = dasha.currentDasha.mahadasha.planet;

  let maitriScore = 10;
  let maitriStatus: 'excellent' | 'good' | 'neutral' | 'caution' = 'neutral';
  let maitriDetail = '';

  if (weekdayLord === mdPlanet) {
    maitriScore = 15;
    maitriStatus = 'excellent';
    maitriDetail = `Today is ${weekdayLord}'s day, which is your active Mahadasha Lord. Exceptional planetary resonance and alignment today!`;
  } else {
    const friendInfo = PLANETARY_FRIENDSHIPS[mdPlanet];
    if (friendInfo?.friends.includes(weekdayLord)) {
      maitriScore = 13;
      maitriStatus = 'good';
      maitriDetail = `Today is governed by ${weekdayLord}, a natural friend (Mitra) to your Dasha Lord (${mdPlanet}). Strong supportive harmony.`;
    } else if (friendInfo?.neutrals.includes(weekdayLord)) {
      maitriScore = 10;
      maitriStatus = 'neutral';
      maitriDetail = `Today is governed by ${weekdayLord}, neutral (Sama) to your Dasha Lord (${mdPlanet}). Steady balanced energy.`;
    } else {
      maitriScore = 4;
      maitriStatus = 'caution';
      maitriDetail = `Today is governed by ${weekdayLord}, which holds a challenging relationship (Shatru) with your Dasha Lord (${mdPlanet}). Requires mindful patience.`;
    }
  }

  const pillar4: ScorePillarBreakdown = {
    id: 'dashaVaraMaitri',
    name: 'Dasha–Vara Harmony (Maitri)',
    nameHi: 'दशा–वार मैत्री (ग्रह सामंजस्य)',
    nameHinglish: 'Dasha–Vara Harmony (Planetary Synergy)',
    score: maitriScore,
    maxScore: 15,
    status: maitriStatus,
    detail: maitriDetail,
    classicalRule: 'BPHS Naisargika Sambandha: Harmonic alignment between the Vara lord and governing Dasha lord amplifies daily productivity.',
  };

  // ──────────────────────────────────────────────────────────
  // PILLAR 5: PANCHANG SHUDDHI (Tithi Class & Active Choghadiya) — Max 20
  // ──────────────────────────────────────────────────────────
  const tithiIdx = panchang.tithi?.index ?? 0;
  const tithiInPaksha = (tithiIdx % 15) + 1; // 1..15

  // Tithi Score (Max 10)
  let tithiPoints = 8;
  if ([5, 10, 15].includes(tithiInPaksha)) {
    tithiPoints = 10; // Purna
  } else if ([4, 9, 14].includes(tithiInPaksha)) {
    tithiPoints = 3; // Rikta
  } else {
    tithiPoints = 8; // Nanda, Bhadra, Jaya
  }

  // Choghadiya Score (Max 10)
  const choghQuality = choghadiya.activeSlot?.meta?.quality || 'Good';
  let choghPoints = 7;
  if (choghQuality === 'Excellent') {
    choghPoints = 10;
  } else if (choghQuality === 'Good') {
    choghPoints = 9;
  } else if (choghQuality === 'Neutral') {
    choghPoints = 7;
  } else {
    choghPoints = 2;
  }

  const panchangScore = tithiPoints + choghPoints;
  const panchangStatus = panchangScore >= 16 ? 'excellent' : panchangScore >= 12 ? 'good' : 'caution';

  const pillar5: ScorePillarBreakdown = {
    id: 'panchangShuddhi',
    name: 'Panchang & Muhurat Shuddhi',
    nameHi: 'पंचांग व मुहूर्त शुद्धि',
    nameHinglish: 'Panchang & Choghadiya Shuddhi',
    score: panchangScore,
    maxScore: 20,
    status: panchangStatus,
    detail: `Today's Tithi (${panchang.tithi.name}) scores ${tithiPoints}/10 and currently active ${choghadiya.activeSlot.type} Choghadiya (${choghQuality}) adds ${choghPoints}/10.`,
    classicalRule: 'Muhurta Chintamani: Tithi purity and auspicious Choghadiya windows determine optimal execution timing for actions.',
  };

  // ──────────────────────────────────────────────────────────
  // COMPOSITE TOTAL SCORE (0–100)
  // ──────────────────────────────────────────────────────────
  const totalScore = Math.min(100, Math.max(0, taraScore + chandraScore + gocharScore + maitriScore + panchangScore));

  let grade = {
    en: 'Favorable & Steady',
    hi: 'अनुकूल व संतुलित',
    hinglish: 'Favorable & Balanced',
  };

  let vibeSummary = {
    en: 'Constructive momentum across worldly and personal pursuits.',
    hi: 'कार्यक्षेत्र और व्यक्तिगत मामलों में सकारात्मक व संतुलित प्रगति।',
    hinglish: 'Smooth execution aur steady progress ka favorable din hai.',
  };

  if (totalScore >= 80) {
    grade = {
      en: 'Peak Auspicious Alignment',
      hi: 'सर्वोत्तम शुभ संयोग',
      hinglish: 'Peak Auspicious Flow',
    };
    vibeSummary = {
      en: 'Exceptional cosmic harmony. Highly favorable for key initiatives, contracts, and new beginnings.',
      hi: 'अति उत्तम ग्रह स्थिति। महत्वपूर्ण कार्यों, नए अनुबंधों और बड़े निर्णयों के लिए अत्यंत शुभ।',
      hinglish: 'Super positive energy. Big decisions aur auspicious beginnings execute karne ke liye best din.',
    };
  } else if (totalScore >= 65) {
    grade = {
      en: 'Highly Favorable',
      hi: 'अत्यंत अनुकूल',
      hinglish: 'Highly Favorable',
    };
    vibeSummary = {
      en: 'Strong positive flow. Clear path for completing pending tasks and constructive collaboration.',
      hi: 'प्रबल सकारात्मक ऊर्जा। रुके हुए कार्यों को पूरा करने और नए संपर्कों के लिए उत्तम।',
      hinglish: 'Strong momentum rahegi. Pending work aur professional talks smoothly execute hongi.',
    };
  } else if (totalScore >= 50) {
    grade = {
      en: 'Steady & Balanced',
      hi: 'संतुलित व प्रगतिशील',
      hinglish: 'Steady & Grounded',
    };
    vibeSummary = {
      en: 'Steady, reliable energy. Maintain consistent daily routines and avoid rushed shortcuts.',
      hi: 'स्थिर व संतुलित दिन। नियमित दिनचर्या का पालन करें और जल्दबाजी से बचें।',
      hinglish: 'Grounded routine follow karein aur patient progress par focus rakhein.',
    };
  } else {
    grade = {
      en: 'Mindful & Cautious',
      hi: 'संयमित व सतर्क',
      hinglish: 'Cautious & Mindful',
    };
    vibeSummary = {
      en: 'A day for inner reflection, careful speech, avoiding unnecessary disputes, and resting.',
      hi: 'आत्म-चिंतन और संयम का दिन। वाद-विवाद से बचें और स्वास्थ्य का ध्यान रखें।',
      hinglish: 'Impulsive decisions aur conflicts avoid karein; peaceful routine maintain karein.',
    };
  }

  return {
    totalScore,
    grade,
    vibeSummary,
    pillars: [pillar1, pillar2, pillar3, pillar4, pillar5],
  };
}
