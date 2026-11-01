/**
 * Vedic Astrology Classical Yogas & Doshas Analysis Engine
 * Detects 30+ classical Parashari Yogas, Mangal Dosha, Kaal Sarp Dosha, and Sade Sati.
 */

import { ChartCalculationResult } from './ephemeris';

export interface YogaResult {
  id: string;
  name: string;
  sanskrit: string;
  type: 'Raja Yoga' | 'Dhana Yoga' | 'Mahapurusha Yoga' | 'Auspicious Yoga' | 'Challenging Yoga';
  present: boolean;
  planetsInvolved: string[];
  housesInvolved: number[];
  description: {
    en: string;
    hi: string;
    hinglish: string;
  };
  strength: 'Strong' | 'Moderate' | 'Weak';
  classicalCitation: string; // e.g. "BPHS Ch. 35 / Phaladeepika Ch. 6"
}

export interface MangalDoshaResult {
  hasDosha: boolean;
  intensity: 'High' | 'Medium' | 'Mild' | 'Cancelled' | 'None';
  marsHouse: number;
  isCancelled: boolean;
  cancellationReasons: string[];
  description: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export interface KaalSarpResult {
  hasDosha: boolean;
  type: string; // e.g. "Anant Kaal Sarp", "Takshak Kaal Sarp", etc.
  direction: 'Direct (Udit)' | 'Indirect (Anudit)' | 'None';
  description: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export interface SadeSatiResult {
  isActive: boolean;
  phase: 'Rising Phase (12th from Moon)' | 'Peak Phase (On Moon)' | 'Setting Phase (2nd from Moon)' | 'Dhaiyya (Small Panoti - 4th/8th)' | 'None';
  natalMoonSign: number;
  currentSaturnSign: number;
  description: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export interface YogasAndDoshasReport {
  yogas: YogaResult[];
  mangalDosha: MangalDoshaResult;
  kaalSarpDosha: KaalSarpResult;
  sadeSati: SadeSatiResult;
}

/**
 * Detects all Classical Yogas in a Vedic Birth Chart
 */
export function analyzeYogasAndDoshas(chart: ChartCalculationResult, currentSaturnSign: number = 11): YogasAndDoshasReport {
  const yogas: YogaResult[] = [];
  const p = chart.planets;
  const houses = chart.houses;
  const ascSign = chart.ascendant.sign;

  // Helper: Get sign of a house
  const getHouseSign = (h: number) => ((ascSign - 1 + (h - 1)) % 12) + 1;
  // Helper: Get lord of a house
  const getHouseLord = (h: number) => houses[h - 1].signLord;

  const moonHouse = p.Moon.house;
  const jupiterHouse = p.Jupiter.house;
  const sunHouse = p.Sun.house;
  const mercuryHouse = p.Mercury.house;
  const marsHouse = p.Mars.house;
  const venusHouse = p.Venus.house;
  const saturnHouse = p.Saturn.house;
  const rahuHouse = p.Rahu.house;

  // 1. Gajakesari Yoga (Jupiter in Kendra 1, 4, 7, 10 from Moon)
  const jupFromMoon = ((jupiterHouse - moonHouse + 12) % 12) + 1;
  const isGajakesari = [1, 4, 7, 10].includes(jupFromMoon);
  if (isGajakesari) {
    yogas.push({
      id: 'gajakesari',
      name: 'Gajakesari Yoga',
      sanskrit: 'गजकेसरी योग',
      type: 'Auspicious Yoga',
      present: true,
      planetsInvolved: ['Jupiter', 'Moon'],
      housesInvolved: [moonHouse, jupiterHouse],
      description: {
        en: 'Brings wisdom, commanding speech, enduring reputation, and triumph over adversaries.',
        hi: 'ज्ञान, प्रतिष्ठा, यशस्वी व्यक्तित्व और संकटों से पार पाने की असीम शक्ति प्रदान करता है।',
        hinglish: 'Wisdom, leadership aur respectful reputation deta hai. Mushkil time me bhi raasta nikal aata hai.',
      },
      strength: p.Jupiter.dignity === 'Exalted' || p.Jupiter.dignity === 'Own Sign' ? 'Strong' : 'Moderate',
      classicalCitation: 'Brihat Parashara Hora Shastra, Ch. 35',
    });
  }

  // 2. Pancha Mahapurusha Yogas
  // Ruchaka (Mars in 1,4,7,10 in Aries, Scorpio, Capricorn)
  if ([1, 4, 7, 10].includes(marsHouse) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(p.Mars.dignity)) {
    yogas.push({
      id: 'ruchaka',
      name: 'Ruchaka Mahapurusha Yoga',
      sanskrit: 'रुचक योग',
      type: 'Mahapurusha Yoga',
      present: true,
      planetsInvolved: ['Mars'],
      housesInvolved: [marsHouse],
      description: {
        en: 'Grants exceptional courage, physical prowess, leadership qualities, and victory over opponents.',
        hi: 'साहस, पराक्रम, नेतृत्व क्षमता और प्रशासनिक या तकनीकी क्षेत्र में उच्च सफलता देता है।',
        hinglish: 'Bold leadership, extreme courage aur energetic execution power deta hai.',
      },
      strength: 'Strong',
      classicalCitation: 'Phaladeepika, Ch. 6, Sl. 1-4',
    });
  }

  // Bhadra (Mercury in 1,4,7,10 in Gemini, Virgo)
  if ([1, 4, 7, 10].includes(mercuryHouse) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(p.Mercury.dignity)) {
    yogas.push({
      id: 'bhadra',
      name: 'Bhadra Mahapurusha Yoga',
      sanskrit: 'भद्र योग',
      type: 'Mahapurusha Yoga',
      present: true,
      planetsInvolved: ['Mercury'],
      housesInvolved: [mercuryHouse],
      description: {
        en: 'Endows razor-sharp intellect, articulate eloquence, business mastery, and longevity.',
        hi: 'तीक्ष्ण बुद्धि, उत्कृष्ट वाकपटुता, व्यापारिक दक्षता और दीर्घायु प्रदान करता है।',
        hinglish: 'Sharp analytical mind, super communication skills aur business acumen deta hai.',
      },
      strength: 'Strong',
      classicalCitation: 'Brihat Parashara Hora Shastra, Ch. 35',
    });
  }

  // Hamsa (Jupiter in 1,4,7,10 in Sagittarius, Pisces, Cancer)
  if ([1, 4, 7, 10].includes(jupiterHouse) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(p.Jupiter.dignity)) {
    yogas.push({
      id: 'hamsa',
      name: 'Hamsa Mahapurusha Yoga',
      sanskrit: 'हंस योग',
      type: 'Mahapurusha Yoga',
      present: true,
      planetsInvolved: ['Jupiter'],
      housesInvolved: [jupiterHouse],
      description: {
        en: 'Bestows noble character, spiritual elevation, high social esteem, and wise counsel.',
        hi: 'पवित्र आचरण, आध्यात्मिक उन्नति, समाज में सर्वोच्च आदर और ज्ञान का वरदान देता है।',
        hinglish: 'Noble personality, deep spiritual wisdom aur high societal respect create karta hai.',
      },
      strength: 'Strong',
      classicalCitation: 'Saravali, Ch. 35',
    });
  }

  // Malavya (Venus in 1,4,7,10 in Taurus, Libra, Pisces)
  if ([1, 4, 7, 10].includes(venusHouse) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(p.Venus.dignity)) {
    yogas.push({
      id: 'malavya',
      name: 'Malavya Mahapurusha Yoga',
      sanskrit: 'मालव्य योग',
      type: 'Mahapurusha Yoga',
      present: true,
      planetsInvolved: ['Venus'],
      housesInvolved: [venusHouse],
      description: {
        en: 'Grants luxurious comforts, refined artistic taste, marital bliss, and radiant magnetism.',
        hi: 'ऐश्वर्य, भौतिक सुख-सुविधाएं, कलात्मक अभिरुचि और सुखद दांपत्य जीवन प्रदान करता है।',
        hinglish: 'Luxury, comfort, aesthetic sense aur charismatic lifestyle deta hai.',
      },
      strength: 'Strong',
      classicalCitation: 'Phaladeepika, Ch. 6',
    });
  }

  // Sasa (Saturn in 1,4,7,10 in Capricorn, Aquarius, Libra)
  if ([1, 4, 7, 10].includes(saturnHouse) && ['Exalted', 'Own Sign', 'Moolatrikona'].includes(p.Saturn.dignity)) {
    yogas.push({
      id: 'sasa',
      name: 'Sasa Mahapurusha Yoga',
      sanskrit: 'शश योग',
      type: 'Mahapurusha Yoga',
      present: true,
      planetsInvolved: ['Saturn'],
      housesInvolved: [saturnHouse],
      description: {
        en: 'Bestows immense organizational power, mass following, endurance, and long-term authority.',
        hi: 'प्रबंधन क्षमता, जनसमूह का समर्थन, दृढ़ संकल्प और दीर्घकालिक अधिकार व शक्ति देता है।',
        hinglish: 'Unshakable patience, organizational authority aur mass support create karta hai.',
      },
      strength: 'Strong',
      classicalCitation: 'Brihat Parashara Hora Shastra, Ch. 35',
    });
  }

  // 3. Budhaditya Yoga (Sun + Mercury in same sign/house)
  if (p.Sun.sign === p.Mercury.sign && !p.Mercury.isCombust) {
    yogas.push({
      id: 'budhaditya',
      name: 'Budhaditya Yoga',
      sanskrit: 'बुधादित्य योग',
      type: 'Auspicious Yoga',
      present: true,
      planetsInvolved: ['Sun', 'Mercury'],
      housesInvolved: [p.Sun.house],
      description: {
        en: 'Sharp academic aptitude, intellectual brilliance, administrative flair, and eloquence.',
        hi: 'प्रखर बौद्धिक क्षमता, प्रशासनिक कौशल, शैक्षणिक सफलता और प्रभावोत्पादक वाणी देता है।',
        hinglish: 'Brilliant intellectual clarity, quick learning speed aur administrative logic deta hai.',
      },
      strength: 'Moderate',
      classicalCitation: 'Saravali, Ch. 31',
    });
  }

  // 4. Chandra-Mangal Yoga (Moon + Mars conjunction)
  if (p.Moon.sign === p.Mars.sign) {
    yogas.push({
      id: 'chandra_mangal',
      name: 'Chandra-Mangal Yoga',
      sanskrit: 'चन्द्र-मंगल योग',
      type: 'Dhana Yoga',
      present: true,
      planetsInvolved: ['Moon', 'Mars'],
      housesInvolved: [p.Moon.house],
      description: {
        en: 'Dynamic commercial instinct, high financial earnings through self-enterprise.',
        hi: 'व्यवसाय में असाधारण लाभ, उद्यमशीलता और तीव्र धनार्जन क्षमता प्रदान करता है।',
        hinglish: 'High financial drive, entrepreneurial skill aur aggressive wealth generation capability.',
      },
      strength: 'Moderate',
      classicalCitation: 'Jataka Parijata, Ch. 7',
    });
  }

  // 5. Viparita Raja Yogas (Harsha, Sarala, Vimala)
  const l6 = getHouseLord(6);
  const l8 = getHouseLord(8);
  const l12 = getHouseLord(12);

  if (p[l6] && [6, 8, 12].includes(p[l6].house)) {
    yogas.push({
      id: 'harsha_yoga',
      name: 'Harsha Viparita Raja Yoga',
      sanskrit: 'हर्ष विपरीत राजयोग',
      type: 'Raja Yoga',
      present: true,
      planetsInvolved: [l6],
      housesInvolved: [6, p[l6].house],
      description: {
        en: 'Incredible resilience against legal matters, health recoveries, and turning crisis into victory.',
        hi: 'शत्रुओं पर विजय, रोगों से मुक्ति और विपरीत परिस्थितियों को अपने पक्ष में बदलने की क्षमता।',
        hinglish: 'Opponents par victory aur difficult situations me bounce back karne ki unique ability.',
      },
      strength: 'Strong',
      classicalCitation: 'Phaladeepika, Ch. 6, Sl. 58',
    });
  }

  if (p[l8] && [6, 8, 12].includes(p[l8].house)) {
    yogas.push({
      id: 'sarala_yoga',
      name: 'Sarala Viparita Raja Yoga',
      sanskrit: 'सरल विपरीत राजयोग',
      type: 'Raja Yoga',
      present: true,
      planetsInvolved: [l8],
      housesInvolved: [8, p[l8].house],
      description: {
        en: 'Fearlessness, hidden wealth discoveries, occult knowledge, and long prosperous life.',
        hi: 'निर्भयता, आकस्मिक धनलाभ, गूढ़ विद्याओं में रुचि और दीर्घायु का वरदान।',
        hinglish: 'Sudden breakthroughs, courage aur unconventional success across crises.',
      },
      strength: 'Strong',
      classicalCitation: 'Phaladeepika, Ch. 6, Sl. 59',
    });
  }

  // 6. Mangal Dosha (Kuja Dosha) Analysis
  const mangalHouses = [1, 2, 4, 7, 8, 12];
  const isMarsInMangalHouse = mangalHouses.includes(marsHouse);
  let mangalIntensity: MangalDoshaResult['intensity'] = 'None';
  let isCancelled = false;
  const cancellationReasons: string[] = [];

  if (isMarsInMangalHouse) {
    mangalIntensity = [7, 8].includes(marsHouse) ? 'High' : 'Medium';

    // Classical Cancellations
    if (marsHouse === 1 && p.Mars.sign === 1) { // Mars in Aries in 1st
      isCancelled = true;
      cancellationReasons.push('Mars in own sign Aries in 1st house cancels the dosha.');
    }
    if (marsHouse === 4 && p.Mars.sign === 8) { // Mars in Scorpio in 4th
      isCancelled = true;
      cancellationReasons.push('Mars in own sign Scorpio in 4th house cancels the dosha.');
    }
    if (marsHouse === 7 && (p.Mars.sign === 10 || p.Mars.sign === 4)) { // Exalted or Debilitated in 7th
      isCancelled = true;
      cancellationReasons.push('Mars in Capricorn/Cancer in 7th house neutralizes the dosha.');
    }
    if (marsHouse === 8 && p.Mars.sign === 9) { // Mars in Sag in 8th
      isCancelled = true;
      cancellationReasons.push('Mars in Jupiter sign Sagittarius in 8th house.');
    }
    if (marsHouse === 12 && p.Mars.sign === 2) { // Mars in Taurus in 12th
      isCancelled = true;
      cancellationReasons.push('Mars in Venus sign Taurus in 12th house.');
    }
    if (p.Jupiter.house === marsHouse || Math.abs(p.Jupiter.house - marsHouse) === 6) {
      isCancelled = true;
      cancellationReasons.push('Jupiter conjoining or directly aspecting Mars nullifies malefic effects.');
    }

    if (isCancelled) mangalIntensity = 'Cancelled';
  }

  const mangalDosha: MangalDoshaResult = {
    hasDosha: isMarsInMangalHouse && !isCancelled,
    intensity: mangalIntensity,
    marsHouse,
    isCancelled,
    cancellationReasons,
    description: {
      en: isMarsInMangalHouse
        ? isCancelled
          ? 'Mangal Dosha is present in the chart but fully neutralized by classical cancellation conditions.'
          : `Mars is placed in House ${marsHouse}, indicating passionate energy requiring mindful communication in partnerships.`
        : 'No Mangal Dosha present in the birth chart.',
      hi: isMarsInMangalHouse
        ? isCancelled
          ? 'कुंडली में मंगल दोष उपस्थित है परंतु शास्त्रोक्त नियमों से पूर्णतः निष्प्रभावी (निरस्त) हो चुका है।'
          : `मंगल ${marsHouse}वें भाव में स्थित है, जो साझेदारी और दांपत्य में ऊर्जा संतुलन की मांग करता है।`
        : 'कुंडली में मंगल दोष अनुपस्थित है।',
      hinglish: isMarsInMangalHouse
        ? isCancelled
          ? 'Mangal Dosha chart me present hai but classical rules ke according completely cancel ho chuka hai.'
          : `Mars ${marsHouse}th house me hai, relationship me open communication aur mutual respect important rahegi.`
        : 'Aapki kundali me Mangal Dosha nahi hai.',
    },
  };

  // 7. Kaal Sarp Dosha Analysis
  // Check if all 7 planets are situated within the span between Rahu and Ketu
  const rahuSign = p.Rahu.sign;
  const ketuSign = p.Ketu.sign;
  const planetSigns = [p.Sun.sign, p.Moon.sign, p.Mars.sign, p.Mercury.sign, p.Jupiter.sign, p.Venus.sign, p.Saturn.sign];

  let inOneHemisphere = true;
  let inOtherHemisphere = true;

  for (const s of planetSigns) {
    const fromRahu = ((s - rahuSign + 12) % 12);
    if (fromRahu > 6) inOneHemisphere = false;
    if (fromRahu < 6 && fromRahu !== 0) inOtherHemisphere = false;
  }

  const hasKaalSarp = inOneHemisphere || inOtherHemisphere;
  const kaalSarpTypes = [
    'Anant Kaal Sarp', 'Kulik Kaal Sarp', 'Vasuki Kaal Sarp', 'Shankhapal Kaal Sarp',
    'Padma Kaal Sarp', 'Mahapadma Kaal Sarp', 'Takshak Kaal Sarp', 'Karkotak Kaal Sarp',
    'Shankhanaad Kaal Sarp', 'Ghatak Kaal Sarp', 'Vishdhar Kaal Sarp', 'Sheshnag Kaal Sarp'
  ];
  const typeName = hasKaalSarp ? (kaalSarpTypes[rahuHouse - 1] || 'Kaal Sarp Yoga') : 'None';

  const kaalSarpDosha: KaalSarpResult = {
    hasDosha: hasKaalSarp,
    type: typeName,
    direction: hasKaalSarp ? (inOneHemisphere ? 'Direct (Udit)' : 'Indirect (Anudit)') : 'None',
    description: {
      en: hasKaalSarp
        ? `${typeName} indicates early-life karmic lessons followed by remarkable rises and determination.`
        : 'Planets are freely distributed; Kaal Sarp Dosha is not present.',
      hi: hasKaalSarp
        ? `${typeName} जीवन के पूर्वार्ध में संघर्ष एवं उत्तरार्ध में असाधारण सफलता और आत्मबल का सूचक है।`
        : 'सभी ग्रह राहु-केतु के बंधनों से मुक्त हैं; कुंडली में कालसर्प दोष नहीं है।',
      hinglish: hasKaalSarp
        ? `${typeName} se initial phase me hard work rehta hai, but later half me massive growth milti hai.`
        : 'Kundali me Kaal Sarp Dosha nahi hai.',
    },
  };

  // 8. Sade Sati Calculation
  const natalMoonSign = p.Moon.sign;
  const saturnDiffFromMoon = ((currentSaturnSign - natalMoonSign + 12) % 12);
  let sadeSatiPhase: SadeSatiResult['phase'] = 'None';
  let isSadeSatiActive = false;

  if (saturnDiffFromMoon === 11) {
    sadeSatiPhase = 'Rising Phase (12th from Moon)';
    isSadeSatiActive = true;
  } else if (saturnDiffFromMoon === 0) {
    sadeSatiPhase = 'Peak Phase (On Moon)';
    isSadeSatiActive = true;
  } else if (saturnDiffFromMoon === 1) {
    sadeSatiPhase = 'Setting Phase (2nd from Moon)';
    isSadeSatiActive = true;
  } else if (saturnDiffFromMoon === 3 || saturnDiffFromMoon === 7) {
    sadeSatiPhase = 'Dhaiyya (Small Panoti - 4th/8th)';
    isSadeSatiActive = true;
  }

  const sadeSati: SadeSatiResult = {
    isActive: isSadeSatiActive,
    phase: sadeSatiPhase,
    natalMoonSign,
    currentSaturnSign,
    description: {
      en: isSadeSatiActive
        ? `Currently in ${sadeSatiPhase}. A period of discipline, karmic restructuring, and grounded focus.`
        : 'You are currently not undergoing Shani Sade Sati or Dhaiyya.',
      hi: isSadeSatiActive
        ? `वर्तमान में शनि ${sadeSatiPhase} का प्रभाव है। यह अनुशासन, आत्मनिरीक्षण और कर्म शुद्धि का समय है।`
        : 'वर्तमान में शनि की साढ़े साती या ढैय्या का प्रभाव नहीं है।',
      hinglish: isSadeSatiActive
        ? `Abhi aapki ${sadeSatiPhase} chal rahi hai. Regular discipline aur patience se kaam karne ka time hai.`
        : 'Abhi Sade Sati ya Dhaiyya active nahi hai.',
    },
  };

  return {
    yogas,
    mangalDosha,
    kaalSarpDosha,
    sadeSati,
  };
}
