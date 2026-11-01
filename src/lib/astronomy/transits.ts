/**
 * Vedic Astrology Gochar (Daily Transits) Engine
 * Analyzes live planetary positions against user's natal Moon sign & Ascendant.
 */

import { calculateVedicChart, ChartCalculationResult } from './ephemeris';
import { ZODIAC_SIGNS } from './constants';

export interface TransitEffect {
  planet: string;
  glyph: string;
  currentSign: number;
  currentSignName: string;
  houseFromMoon: number;
  houseFromAsc: number;
  isBenefic: boolean;
  score: number; // 1-10
  headline: {
    en: string;
    hi: string;
    hinglish: string;
  };
  details: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export interface DailyPersonalizedHoroscope {
  date: string;
  overallScore: number; // 0-100
  vibe: 'High Energy & Gains' | 'Creative & Romantic' | 'Focused & Productive' | 'Introspective & Mindful' | 'Challenging & Patient';
  keyThemes: string[];
  transits: TransitEffect[];
  currentDashaSummary: {
    mahadasha: string;
    antardasha: string;
    pratyantardasha: string;
  };
  dailyAdvice: {
    doThis: { en: string; hi: string; hinglish: string };
    avoidThis: { en: string; hi: string; hinglish: string };
  };
}

// Classical Parashari favorable transit houses counted from Moon
const BENEFIC_HOUSES_FROM_MOON: Record<string, number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 11],
  Ketu: [3, 6, 11],
};

/**
 * Computes live transits relative to natal chart
 */
export function calculatePersonalizedDailyTransits(
  natalChart: ChartCalculationResult,
  currentDate: Date = new Date(),
  currentLat: number = 28.6139,
  currentLon: number = 77.2090
): DailyPersonalizedHoroscope {
  // 1. Calculate today's sky
  const transitSky = calculateVedicChart(currentDate, currentLat, currentLon);
  const natalMoonSign = natalChart.planets.Moon.sign;
  const natalAscSign = natalChart.ascendant.sign;

  const transitEffects: TransitEffect[] = [];
  let totalScore = 50;

  const planetKeys = ['Jupiter', 'Saturn', 'Sun', 'Mars', 'Venus', 'Mercury', 'Rahu'];

  for (const pKey of planetKeys) {
    const tPlanet = transitSky.planets[pKey];
    if (!tPlanet) continue;

    const houseFromMoon = ((tPlanet.sign - natalMoonSign + 12) % 12) + 1;
    const houseFromAsc = ((tPlanet.sign - natalAscSign + 12) % 12) + 1;
    const goodHouses = BENEFIC_HOUSES_FROM_MOON[pKey] || [3, 6, 11];
    const isBenefic = goodHouses.includes(houseFromMoon);

    let pScore = isBenefic ? 8 : 4;
    if (pKey === 'Jupiter' && isBenefic) pScore = 10;
    if (pKey === 'Saturn' && [12, 1, 2].includes(houseFromMoon)) pScore = 3; // Sade Sati

    totalScore += isBenefic ? 6 : -4;

    // Interpretations
    let enHeadline = `${pKey} in House ${houseFromMoon} from your Moon`;
    let hiHeadline = `आपकी राशि से ${houseFromMoon}वें भाव में ${pKey}`;
    let hinglishHeadline = `Aapki Moon sign se ${houseFromMoon}th house me ${pKey} transit`;

    let enDetails = `Brings growth, clarity, and constructive momentum in daily affairs.`;
    let hiDetails = `कार्यक्षेत्र में नई संभावनाओं और मनोबल में वृद्धि का संकेत।`;
    let hinglishDetails = `Positive energy rahegi aur pending tasks smoothly progress karenge.`;

    if (pKey === 'Jupiter') {
      if (isBenefic) {
        enHeadline = `Jupiter's Divine Grace in ${houseFromMoon}th House`;
        hiHeadline = `गुरु का शुभ गोचर — ज्ञान और भाग्य वृद्धि`;
        hinglishHeadline = `Jupiter ka powerful blessing transit`;
        enDetails = `Highly supportive for wisdom, wealth decisions, study, and harmonious interactions.`;
        hiDetails = `ज्ञान, वित्तीय निर्णयों, मांगलिक कार्यों और पारिवारिक सामंजस्य के लिए अति उत्तम समय।`;
        hinglishDetails = `Financial decisions aur learning ke liye super favorable time hai.`;
      } else {
        enHeadline = `Jupiter in House ${houseFromMoon} — Inner Reflection`;
        hiHeadline = `गुरु गोचर — संयम व विवेकपूर्ण निर्णय`;
        hinglishHeadline = `Jupiter transit — Patience and careful planning`;
        enDetails = `Focus on disciplined planning, avoiding hasty speculative investments.`;
        hiDetails = `अति-उत्साह में निवेश से बचें; कार्ययोजना को व्यवस्थित रूप से क्रियान्वित करें।`;
        hinglishDetails = `Hasty investment avoid karein, steady research par focus rakhein.`;
      }
    } else if (pKey === 'Saturn') {
      if (isBenefic) {
        enHeadline = `Saturn's Solid Grounding in House ${houseFromMoon}`;
        hiHeadline = `शनि का अनुकूल गोचर — कर्मठता और लाभ`;
        hinglishHeadline = `Saturn supporting long-term stability`;
        enDetails = `Tremendous discipline, ability to overcome longstanding hurdles, and career stability.`;
        hiDetails = `कठिन परिश्रम का दीर्घकालिक फल मिलेगा; पुराने विवाद सुलझेंगे।`;
        hinglishDetails = `Consistency aur hard work ka solid result milega.`;
      } else {
        enHeadline = `Saturn in House ${houseFromMoon} — Patient Discipline`;
        hiHeadline = `शनि का गोचर — धैर्य और निरंतर प्रयास`;
        hinglishHeadline = `Saturn testing patience — Stay grounded`;
        enDetails = `Requires steady patience, avoiding shortcuts, and prioritizing rest and well-being.`;
        hiDetails = `धैर्य बनाए रखें; किसी भी कार्य में जल्दबाजी न करें व स्वास्थ्य का ध्यान रखें।`;
        hinglishDetails = `Shortcuts avoid karein, routine discipline maintain karna zaroori hai.`;
      }
    }

    transitEffects.push({
      planet: pKey,
      glyph: tPlanet.glyph,
      currentSign: tPlanet.sign,
      currentSignName: tPlanet.signName,
      houseFromMoon,
      houseFromAsc,
      isBenefic,
      score: pScore,
      headline: { en: enHeadline, hi: hiHeadline, hinglish: hinglishHeadline },
      details: { en: enDetails, hi: hiDetails, hinglish: hinglishDetails },
    });
  }

  // Constrain total score
  totalScore = Math.max(25, Math.min(95, totalScore));

  let vibe: DailyPersonalizedHoroscope['vibe'] = 'Focused & Productive';
  if (totalScore >= 80) vibe = 'High Energy & Gains';
  else if (totalScore >= 65) vibe = 'Creative & Romantic';
  else if (totalScore <= 40) vibe = 'Introspective & Mindful';

  return {
    date: currentDate.toISOString(),
    overallScore: totalScore,
    vibe,
    keyThemes: ['Career Momentum', 'Mental Clarity', 'Financial Planning', 'Vitality'],
    transits: transitEffects,
    currentDashaSummary: {
      mahadasha: 'Calculated from Natal Moon',
      antardasha: 'Active Sub-period',
      pratyantardasha: 'Daily influence',
    },
    dailyAdvice: {
      doThis: {
        en: 'Channel high-priority initiatives during favorable Choghadiya windows; communicate clearly.',
        hi: 'शुभ चौघड़िया समय में महत्वपूर्ण वार्तालाप व कार्य पूर्ण करें; सकारात्मक दृष्टिकोण रखें।',
        hinglish: 'Important tasks ko Shubh ya Amrit Choghadiya me complete karein, positive communication rakhein.',
      },
      avoidThis: {
        en: 'Avoid impulsive financial commitments during Rahu Kaal; keep interactions calm.',
        hi: 'राहुकाल में त्वरित वित्तीय सौदों या विवादों से बचें।',
        hinglish: 'Rahu Kaal me impulsive purchases ya heated arguments se bachein.',
      },
    },
  };
}
