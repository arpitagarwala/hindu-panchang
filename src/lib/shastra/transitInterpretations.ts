/**
 * Classical Daily Transit (Gochar) & Panchang Recommendation Engine
 * Evaluates transit effects based on classical texts:
 * - Phaladeepika (Mantreswara), Chapter 26 (Gocharaphala)
 * - Brihat Samhita (Varahamihira), Chapter 104 (Gocharadhyaya)
 * - Muhurta Chintamani & Kalaprakashika (Tithi & Choghadiya Muhurats)
 */

import { ChartCalculationResult } from '@/lib/astronomy/ephemeris';
import { PanchangResult } from '@/lib/panchang';
import { ChoghadiyaResult } from '@/lib/astronomy/choghadiya';
import { DailyPersonalizedHoroscope } from '@/lib/astronomy/transits';
import { VimshottariResult } from '@/lib/astronomy/dasha';
import { LanguageCode } from '@/lib/i18n/translations';
import { calculateDailyVedicScore, ScorePillarBreakdown } from '@/lib/astronomy/dailyScore';

export interface SourcedTransitInsight {
  vibeTitle: string;
  vibeScore: number;
  scoreGrade: string;
  sourceCitation: string;
  isClassicalScripture: boolean;
  recommendationDo: string;
  recommendationAvoid: string;
  pillars: ScorePillarBreakdown[];
  whyReasoning: {
    label: string;
    fact: string;
    classicalRule: string;
  }[];
}

// Classical Tithi Classifications per Muhurta Chintamani
const TITHI_CLASSES: Record<number, { name: string; quality: string; suitable: string; avoid: string }> = {
  0: { name: 'Nanda', quality: 'Joyous / Beginning', suitable: 'Festivals, new clothes, celebrations, auspicious initiatives', avoid: 'Confrontations, debt settlement' },
  1: { name: 'Bhadra', quality: 'Stable / Motion', suitable: 'Travel, vehicles, partnerships, commercial transactions', avoid: 'Stagnant long-term commitments' },
  2: { name: 'Jaya', quality: 'Victorious / Overcoming', suitable: 'Court affairs, sports, competitive tasks, resolving disputes', avoid: 'Submissive compromises' },
  3: { name: 'Rikta', quality: 'Empty / Cleansing', suitable: 'Purification, medicine, decluttering, debt clearing, spiritual discipline', avoid: 'New commercial contracts, marriage, housewarming' },
  4: { name: 'Purna', quality: 'Complete / Fulfilling', suitable: 'All auspicious undertakings, financial investments, coronation, celebrations', avoid: 'Destructive activities' },
  5: { name: 'Nanda', quality: 'Joyous / Beginning', suitable: 'Festivals, new clothes, celebrations, auspicious initiatives', avoid: 'Confrontations' },
  6: { name: 'Bhadra', quality: 'Stable / Motion', suitable: 'Travel, vehicles, partnerships, commercial transactions', avoid: 'Stagnant commitments' },
  7: { name: 'Jaya', quality: 'Victorious / Overcoming', suitable: 'Competitive initiatives, bold ventures, medical procedures', avoid: 'Hesitation' },
  8: { name: 'Rikta', quality: 'Empty / Cleansing', suitable: 'Shedding outdated baggage, detox, overcoming obstacles', avoid: 'Auspicious major beginnings' },
  9: { name: 'Purna', quality: 'Complete / Fulfilling', suitable: 'Wealth acquisitions, celebrations, key agreements', avoid: 'Destructive actions' },
  10: { name: 'Nanda', quality: 'Joyous / Fasting', suitable: 'Ekadashi spiritual penance, charity, philanthropic endeavors', avoid: 'Heavy grain consumption, anger' },
  11: { name: 'Bhadra', quality: 'Stable / Movement', suitable: 'Educational admissions, journeys, spiritual charity', avoid: 'Disputes' },
  12: { name: 'Jaya', quality: 'Victorious / Pradosha', suitable: 'Shiva worship, overcoming persistent blockages', avoid: 'Unethical shortcuts' },
  13: { name: 'Rikta', quality: 'Empty / Fierce', suitable: 'Tantric discipline, overcoming enemies, surgery, debt elimination', avoid: 'Auspicious journeys, marriage' },
  14: { name: 'Purna (Purnima)', quality: 'Full Moon / Abundance', suitable: 'Meditation, Satyanarayan Puja, creative culmination, major prayers', avoid: 'High-temper arguments' },
  15: { name: 'Amavasya', quality: 'New Moon / Pitru Shraddha', suitable: 'Pitru Tarpan, ancestor peace, quiet meditation, resting mind', avoid: 'Commercial inaugurations, speculative bets' },
};

/**
 * Derives rigorous classical transit insights, deterministic score, and advice
 */
export function getDetailedTransitInsight(
  chart: ChartCalculationResult,
  panchang: PanchangResult,
  choghadiya: ChoghadiyaResult,
  dailyTransits: DailyPersonalizedHoroscope,
  dasha: VimshottariResult,
  language: LanguageCode = 'en'
): SourcedTransitInsight {
  const natalMoonSign = chart.planets.Moon?.sign || 1;
  const natalMoonName = chart.planets.Moon?.signName || 'Aries';
  const tithiIndex = panchang.tithi?.index ?? 0;
  const tithiInfo = TITHI_CLASSES[tithiIndex % 15] || TITHI_CLASSES[0];
  const activeChogh = choghadiya.activeSlot;

  // Compute deterministic score across 5 Jyotish pillars
  const scoreResult = calculateDailyVedicScore(chart, panchang, choghadiya, dasha);
  const score = scoreResult.totalScore;
  const grade = scoreResult.grade[language] || scoreResult.grade.en;
  const vibeTitle = scoreResult.vibeSummary[language] || scoreResult.vibeSummary.en;

  // Classical transit reasoning breakdown
  const whyReasoning = [
    {
      label: 'Natal Moon Reference',
      fact: `Natal Moon in ${natalMoonName} (Sign ${natalMoonSign})`,
      classicalRule: 'Phaladeepika Ch. 26 states all Gochar (transits) must be computed relative to Janma Rashi (Natal Moon sign).',
    },
    {
      label: 'Daily Tithi Limb',
      fact: `${panchang.tithi.name} (${tithiInfo.name} category: ${tithiInfo.quality})`,
      classicalRule: `Muhurta Chintamani classifies ${tithiInfo.name} Tithis as ideal for ${tithiInfo.suitable}.`,
    },
    {
      label: 'Active Choghadiya Muhurat',
      fact: `${activeChogh.type} (${activeChogh.meta.quality}) from ${activeChogh.startFormatted} to ${activeChogh.endFormatted}`,
      classicalRule: `${activeChogh.type} slot governed by ruler ${activeChogh.meta.ruler} brings ${activeChogh.meta.suitableFor.en}.`,
    },
    {
      label: 'Rahu Kaal Period',
      fact: `${new Date(panchang.rahuKalam.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(panchang.rahuKalam.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      classicalRule: 'Kalaprakashika prohibits starting new critical journeys, agreements, or rituals during Rahu Kalam.',
    },
  ];

  let recommendationDo = '';
  let recommendationAvoid = '';

  if (language === 'hi') {
    recommendationDo = `${tithiInfo.name} तिथि व ${activeChogh.type} मुहूर्त अनुसार: ${activeChogh.meta.suitableFor.hi || tithiInfo.suitable}।`;
    recommendationAvoid = `राहु काल व प्रतिकूल समय में: ${tithiInfo.avoid}; बिना सोचे-समझे बड़े जोखिम लेने से बचें।`;
  } else if (language === 'hinglish') {
    recommendationDo = `${tithiInfo.name} Tithi aur ${activeChogh.type} Choghadiya ke mutabiq: ${activeChogh.meta.suitableFor.hinglish || tithiInfo.suitable} execute karein.`;
    recommendationAvoid = `Rahu Kaal timing aur impulsive decisions avoid karein; ${tithiInfo.avoid} se bachein.`;
  } else {
    recommendationDo = `Aligned with ${tithiInfo.name} Tithi and active ${activeChogh.type} Choghadiya: Best suited for ${activeChogh.meta.suitableFor.en}.`;
    recommendationAvoid = `During Rahu Kalam and unfavorable intervals: Avoid ${tithiInfo.avoid}; refrain from speculative impulsiveness.`;
  }

  return {
    vibeTitle,
    vibeScore: score,
    scoreGrade: grade,
    sourceCitation: 'Phaladeepika Ch. 26 (Gocharaphala) & Muhurta Chintamani',
    isClassicalScripture: true,
    recommendationDo,
    recommendationAvoid,
    pillars: scoreResult.pillars,
    whyReasoning,
  };
}
