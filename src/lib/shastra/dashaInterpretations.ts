/**
 * Classical Vedic Astrology Dasha Interpretation Engine
 * Evaluates Mahadasha and Antardasha based on classical scriptures:
 * - Brihat Parashara Hora Shastra (BPHS), Chapters 51–60
 * - Phaladeepika (Mantreswara), Chapter 20
 * - Saravali (Kalyana Varma), Chapter 45
 * - Jataka Parijata, Chapter 18
 */

import { ChartCalculationResult, PlanetaryPosition } from '@/lib/astronomy/ephemeris';
import { VimshottariResult } from '@/lib/astronomy/dasha';
import { LanguageCode } from '@/lib/i18n/translations';

export interface SourcedInterpretation {
  headline: string;
  narrative: string;
  sourceCitation: string;
  isClassicalScripture: boolean;
  whyReasoning: {
    label: string;
    fact: string;
    classicalRule: string;
  }[];
}

// House Categorization according to classical Parashari principles
export function getHouseCategory(house: number): 'kendra' | 'trikona' | 'upachaya' | 'dusthana' | 'maraka' | 'neutral' {
  if ([1, 4, 7, 10].includes(house)) return 'kendra';
  if ([5, 9].includes(house)) return 'trikona';
  if ([3, 6, 11].includes(house)) return 'upachaya';
  if ([8, 12].includes(house)) return 'dusthana';
  if ([2, 7].includes(house)) return 'maraka';
  return 'neutral';
}

// Mutual relationship between MD Lord and AD Lord
export function getMutualRelation(mdHouse: number, adHouse: number): {
  distance: number;
  relationType: 'samabandha' | 'kendra' | 'trikona' | 'shadashtak' | 'dvidwadasa' | 'upachaya';
  descriptionEn: string;
  descriptionHi: string;
  descriptionHinglish: string;
} {
  const diff = ((adHouse - mdHouse + 12) % 12) + 1; // 1 to 12

  if (diff === 1) {
    return {
      distance: 1,
      relationType: 'samabandha',
      descriptionEn: 'Conjoined in the same house (Amplified focus)',
      descriptionHi: 'संबद्ध युति — एक ही भाव में संयुक्त ऊर्जा',
      descriptionHinglish: 'Ek hi house mein conjoined (intense shared energy)',
    };
  }
  if ([4, 7, 10].includes(diff)) {
    return {
      distance: diff,
      relationType: 'kendra',
      descriptionEn: `${diff}th from Mahadasha Lord (Kendra / Action-oriented stability)`,
      descriptionHi: `दशानाथ से ${diff}वें भाव (केंद्र) में स्थित — सक्रिय स्थायित्व`,
      descriptionHinglish: `Mahadasha Lord se ${diff}th Kendra position — strong active foundation`,
    };
  }
  if ([5, 9].includes(diff)) {
    return {
      distance: diff,
      relationType: 'trikona',
      descriptionEn: `${diff}th from Mahadasha Lord (Trikona / Auspicious flow & harmony)`,
      descriptionHi: `दशानाथ से ${diff}वें भाव (त्रिकोण) में स्थित — भाग्य व शुभ फल`,
      descriptionHinglish: `Mahadasha Lord se ${diff}th Trikona position — highly harmonious and lucky`,
    };
  }
  if ([6, 8].includes(diff)) {
    return {
      distance: diff,
      relationType: 'shadashtak',
      descriptionEn: `${diff}th from Mahadasha Lord (Shadashtaka 6/8 / Karmic friction & adjustments)`,
      descriptionHi: `दशानाथ से षडाष्टक (6/8) संबंध — अतिरिक्त सतर्कता व परिश्रम की आवश्यकता`,
      descriptionHinglish: `Mahadasha Lord se Shadashtak 6/8 relation — requires patience and health care`,
    };
  }
  if ([2, 12].includes(diff)) {
    return {
      distance: diff,
      relationType: 'dvidwadasa',
      descriptionEn: `${diff}th from Mahadasha Lord (Dvidwadasa 2/12 / Reallocation of resources)`,
      descriptionHi: `दशानाथ से द्वि-द्वादश (2/12) संबंध — व्यय व संसाधनों का पुनर्गठन`,
      descriptionHinglish: `Mahadasha Lord se 2/12 position — financial planning aur mindful expenses`,
    };
  }

  // 3 or 11
  return {
    distance: diff,
    relationType: 'upachaya',
    descriptionEn: `${diff}th from Mahadasha Lord (Upachaya / Growth through effort)`,
    descriptionHi: `दशानाथ से उपचय (3/11) संबंध — पराक्रम व लाभ वृद्धि`,
    descriptionHinglish: `Mahadasha Lord se Upachaya 3/11 position — progress through self-effort`,
  };
}

/**
 * Computes deep, chart-specific, classical Vimshottari interpretation
 */
export function getDetailedDashaInterpretation(
  chart: ChartCalculationResult,
  dasha: VimshottariResult,
  language: LanguageCode = 'en'
): SourcedInterpretation {
  const mdPlanet = dasha.currentDasha.mahadasha.planet;
  const adPlanet = dasha.currentDasha.antardasha.planet;

  const mdPos: PlanetaryPosition | undefined = chart.planets[mdPlanet];
  const adPos: PlanetaryPosition | undefined = chart.planets[adPlanet];

  const mdHouse = mdPos?.house || 1;
  const adHouse = adPos?.house || 1;
  const mdSignName = mdPos?.signName || 'Aries';
  const adSignName = adPos?.signName || 'Aries';
  const mdDignity = mdPos?.dignity || 'Neutral';

  const houseCat = getHouseCategory(mdHouse);
  const mutualRel = getMutualRelation(mdHouse, adHouse);

  // Generate chart-tailored narrative based on classical Parashari rules
  let headline = '';
  let narrative = '';
  let citation = 'Brihat Parashara Hora Shastra (BPHS), Chapters 51–60';
  let isClassical = true;

  // Build Reasoning chain for transparency
  const whyReasoning = [
    {
      label: 'Major Period (Mahadasha)',
      fact: `${mdPlanet} placed in House ${mdHouse} (${mdSignName})`,
      classicalRule: `${mdPlanet} in ${houseCat.toUpperCase()} house governs core life focus for this multi-year chapter.`,
    },
    {
      label: 'Sub-Period (Antardasha)',
      fact: `${adPlanet} placed in House ${adHouse} (${adSignName})`,
      classicalRule: `Sub-period activates themes of House ${adHouse} and matters ruled by ${adPlanet}.`,
    },
    {
      label: 'MD–AD Planetary Geometry',
      fact: `${mutualRel.descriptionEn}`,
      classicalRule:
        mutualRel.relationType === 'shadashtak'
          ? '6/8 Shadashtaka position indicates karmic trials, health mindfulness, and conflict resolution.'
          : mutualRel.relationType === 'trikona' || mutualRel.relationType === 'kendra'
          ? 'Angular/Trinal placement yields smooth fruition of efforts, professional standing, and auspicious outcomes.'
          : 'Placement dictates resource allocation and self-driven growth trajectory.',
    },
    {
      label: 'Dignity & Strength',
      fact: `${mdPlanet} is in ${mdDignity} dignity in natal chart`,
      classicalRule:
        mdDignity === 'Exalted' || mdDignity === 'Own Sign' || mdDignity === 'Moolatrikona'
          ? 'Dignified dasha lord delivers pronounced positive results and institutional support.'
          : mdDignity === 'Debilitated'
          ? 'Debilitated lord requires mindful remediation, discipline, and avoidance of haste.'
          : 'Operates with balanced, steady results aligned with house significations.',
    },
  ];

  // Specific Planet Sourced Syntheses
  if (mdPlanet === 'Rahu') {
    citation = 'BPHS Ch. 52, Verses 1–15 & Phaladeepika Ch. 20, Verses 49–52';
    if (houseCat === 'upachaya') {
      if (language === 'hi') {
        headline = `राहु महादशा — उपचय भाव (${mdHouse}वें) में पराक्रम व अभ्युदय`;
        narrative = `आपकी कुंडली के ${mdHouse}वें उपचय भाव (${mdSignName}) में स्थित राहु के प्रभाव से यह समय पुरुषार्थ, प्रतियोगिता में बढ़त और अप्रत्याशित विकास का है। राहु से ${mutualRel.distance}वें भाव में सक्रिय ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) कार्यक्षेत्र में सुनियोजित अनुशासन व सतर्कता की मांग करती है।`;
      } else if (language === 'hinglish') {
        headline = `Rahu Mahadasha — House ${mdHouse} (${mdSignName}) Growth Phase`;
        narrative = `Rahu aapke ${mdHouse}th Upachaya house (${mdSignName}) mein hone se self-driven effort, competitive edge aur rapid progress ka chapter chal raha hai. Rahu se ${mutualRel.distance}th position par active ${adPlanet} ki Antardasha (${mutualRel.descriptionHinglish}) structured discipline demand karti hai.`;
      } else {
        headline = `Rahu Mahadasha in House ${mdHouse} (${mdSignName}) — Upachaya Growth`;
        narrative = `Operating under Rahu posited in your ${mdHouse}th house of growth (${mdSignName}), this chapter emphasizes ambitious initiatives, unconventional breakthroughs, and overcoming competitors. The concurrent sub-period of ${adPlanet} (${mutualRel.descriptionEn}) structures your immediate focus around disciplined execution and long-term consolidation.`;
      }
    } else if (houseCat === 'dusthana') {
      if (language === 'hi') {
        headline = `राहु महादशा — ${mdHouse}वें भाव में आध्यात्मिक अन्वेषण व सतर्कता`;
        narrative = `कुंडली के ${mdHouse}वें भाव में स्थित राहु आत्म-मंथन, विदेश योग और गूढ़ विषयों के अध्ययन को बल देता है। दशानाथ से ${mutualRel.distance}वें भाव में स्थित ${adPlanet} की अंतर्दशा में स्वास्थ्य, वित्तीय नियोजन और व्यर्थ के विवादों से बचाव आवश्यक है।`;
      } else if (language === 'hinglish') {
        headline = `Rahu Mahadasha in House ${mdHouse} — Deep Transformation`;
        narrative = `Rahu ${mdHouse}th house mein hone se deep introspection, spiritual detachment aur distant connections activate hote hain. ${adPlanet} ki Antardasha (${mutualRel.descriptionHinglish}) mein financial planning aur mental peace par dhyan dena recommended hai.`;
      } else {
        headline = `Rahu Mahadasha in House ${mdHouse} (${mdSignName}) — Transformation`;
        narrative = `With Rahu situated in your ${mdHouse}th house (${mdSignName}), this phase accentuates transformative internal shifts, foreign connections, and spiritual introspection. The sub-period of ${adPlanet} (${mutualRel.descriptionEn}) counsels prudent financial management and structured lifestyle routines.`;
      }
    } else {
      if (language === 'hi') {
        headline = `राहु महादशा — ${mdHouse}वें भाव (${mdSignName}) में विस्तार व नेतृत्व`;
        narrative = `${mdHouse}वें भाव (${mdSignName}) में राहु की महादशा जीवन में नई सामाजिक पहचान और महत्वाकांक्षी योजनाओं को जन्म देती है। सक्रिय ${adPlanet} अंतर्दशा (${mutualRel.descriptionHi}) के प्रभाव से संबंधों व निर्णय-प्रक्रिया में विवेकशीलता बनाए रखना श्रेयस्कर है।`;
      } else if (language === 'hinglish') {
        headline = `Rahu Mahadasha in House ${mdHouse} — Ambition & Prominence`;
        narrative = `Rahu aapke ${mdHouse}th house (${mdSignName}) mein hone se social outreach, bold ambitions aur new avenues open karta hai. ${adPlanet} ki Antardasha (${mutualRel.descriptionHinglish}) strategic thinking aur patience demand karti hai.`;
      } else {
        headline = `Rahu Mahadasha in House ${mdHouse} (${mdSignName}) — Expansive Horizon`;
        narrative = `With Rahu placed in your ${mdHouse}th house (${mdSignName}), this period fuels social reach, high aspirations, and new career vistas. The ongoing sub-period of ${adPlanet} (${mutualRel.descriptionEn}) channels these energies into systematic milestones.`;
      }
    }
  } else if (mdPlanet === 'Jupiter') {
    citation = 'BPHS Ch. 53, Verses 1–18 & Phaladeepika Ch. 20, Verses 33–38';
    if (language === 'hi') {
      headline = `गुरु महादशा — ${mdHouse}वें भाव (${mdSignName}) में ज्ञान व समृद्धि`;
      narrative = `देवगुरु बृहस्पति की महादशा ${mdHouse}वें भाव में होने से विवेक, विद्या, धर्म और आर्थिक उन्नति का मार्ग प्रशस्त होता है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) पारिवारिक प्रतिष्ठा और दीर्घकालिक योजनाओं को स्थिरता प्रदान करती है।`;
    } else if (language === 'hinglish') {
      headline = `Jupiter Mahadasha in House ${mdHouse} — Wisdom & Expansion`;
      narrative = `Jupiter ${mdHouse}th house (${mdSignName}) mein hone se financial wisdom, mentors ka guidance aur auspicious events ka chapter chal raha hai. ${adPlanet} ki Antardasha (${mutualRel.descriptionHinglish}) long-term stability build karti hai.`;
    } else {
      headline = `Jupiter Mahadasha in House ${mdHouse} (${mdSignName}) — Wisdom & Prosperity`;
      narrative = `Governed by Jupiter in your ${mdHouse}th house (${mdSignName}), this major chapter fosters higher wisdom, financial expansion, mentorship, and auspicious life developments. The active sub-period of ${adPlanet} (${mutualRel.descriptionEn}) consolidates family harmony and professional respect.`;
    }
  } else if (mdPlanet === 'Saturn') {
    citation = 'BPHS Ch. 54, Verses 1–20 & Saravali Ch. 45, Verses 40–48';
    if (language === 'hi') {
      headline = `शनि महादशा — ${mdHouse}वें भाव (${mdSignName}) में कर्म निष्ठा व स्थायित्व`;
      narrative = `${mdHouse}वें भाव में कर्मकारक शनि की महादशा कठोर परिश्रम, ईमानदारी और स्थायी आधार निर्माण का काल है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) धैर्यपूर्वक किए गए प्रयासों का ठोस परिणाम प्रदान करती है।`;
    } else if (language === 'hinglish') {
      headline = `Saturn Mahadasha in House ${mdHouse} — Discipline & Solid Foundations`;
      narrative = `Saturn aapke ${mdHouse}th house (${mdSignName}) mein hone se perseverance, karmic maturity aur long-lasting foundation create karne ka time hai. ${adPlanet} Antardasha (${mutualRel.descriptionHinglish}) steady results deti hai.`;
    } else {
      headline = `Saturn Mahadasha in House ${mdHouse} (${mdSignName}) — Perseverance & Duty`;
      narrative = `Anchored by Saturn in your ${mdHouse}th house (${mdSignName}), this chapter instills deep patience, structural discipline, and enduring accomplishments earned through diligent labor. The sub-period of ${adPlanet} (${mutualRel.descriptionEn}) tests endurance while laying indestructible foundations.`;
    }
  } else if (mdPlanet === 'Mercury') {
    citation = 'BPHS Ch. 55, Verses 1–16 & Phaladeepika Ch. 20, Verses 25–30';
    if (language === 'hi') {
      headline = `बुध महादशा — ${mdHouse}वें भाव (${mdSignName}) में बौद्धिक व व्यापारिक वृद्धि`;
      narrative = `${mdHouse}वें भाव में बुध की महादशा तीक्ष्ण बुद्धि, संचार कौशल, व्यापारिक विस्तार और नवीन विद्याओं के अर्जन के लिए अनुकूल है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) नए संपर्क सूत्रों से लाभान्वित करती है।`;
    } else if (language === 'hinglish') {
      headline = `Mercury Mahadasha in House ${mdHouse} — Intellect & Commercial Acumen`;
      narrative = `Mercury ${mdHouse}th house (${mdSignName}) mein hone se analytical clarity, commerce growth aur strong networking ka period hai. ${adPlanet} Antardasha (${mutualRel.descriptionHinglish}) strategic communication ko enhance karti hai.`;
    } else {
      headline = `Mercury Mahadasha in House ${mdHouse} (${mdSignName}) — Commerce & Intellect`;
      narrative = `Under Mercury in your ${mdHouse}th house (${mdSignName}), analytical acumen, commercial ventures, and communicative dexterity take center stage. The concurrent sub-period of ${adPlanet} (${mutualRel.descriptionEn}) provides fertile ground for intellectual projects and networking.`;
    }
  } else if (mdPlanet === 'Ketu') {
    citation = 'BPHS Ch. 56, Verses 1–12 & Jataka Parijata Ch. 18';
    if (language === 'hi') {
      headline = `केतु महादशा — ${mdHouse}वें भाव (${mdSignName}) में आत्म-साक्षात्कार व वैराग्य`;
      narrative = `${mdHouse}वें भाव में मोक्षकारक केतु की महादशा आध्यात्मिक जागृति, अंतर्दृष्टि और व्यर्थ के बंधनों से मुक्ति का समय है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) जीवन के वास्तविक उद्देश्यों के प्रति एकाग्रता बढ़ाती है।`;
    } else if (language === 'hinglish') {
      headline = `Ketu Mahadasha in House ${mdHouse} — Spiritual Awakening & Mastery`;
      narrative = `Ketu aapke ${mdHouse}th house (${mdSignName}) mein hone se intuitive clarity, internal research aur spiritual wisdom unlock hoti hai. ${adPlanet} Antardasha (${mutualRel.descriptionHinglish}) deeper focus encourage karti hai.`;
    } else {
      headline = `Ketu Mahadasha in House ${mdHouse} (${mdSignName}) — Spiritual Evolution`;
      narrative = `Influenced by Ketu posited in your ${mdHouse}th house (${mdSignName}), this reflective cycle encourages spiritual detachment, intuitive mastery, and shedding obsolete attachments. The sub-period of ${adPlanet} (${mutualRel.descriptionEn}) fosters deep introspection.`;
    }
  } else if (mdPlanet === 'Venus') {
    citation = 'BPHS Ch. 57, Verses 1–18 & Phaladeepika Ch. 20, Verses 39–44';
    if (language === 'hi') {
      headline = `शुक्र महादशा — ${mdHouse}वें भाव (${mdSignName}) में सुख-सुविधा व कलात्मकता`;
      narrative = `${mdHouse}वें भाव में दैत्यगुरु शुक्र की महादशा भौतिक सुख-साधनों, दांपत्य सामंजस्य, कलात्मक अभिरुचि और ऐश्वर्य की वृद्धि का काल है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) जीवन में सौहार्द और सामाजिक प्रतिष्ठा में वृद्धि करती है।`;
    } else if (language === 'hinglish') {
      headline = `Venus Mahadasha in House ${mdHouse} — Luxury, Comfort & Relationships`;
      narrative = `Venus ${mdHouse}th house (${mdSignName}) mein hone se artistic creativity, relationship harmony aur worldly comforts ka joyful phase hai. ${adPlanet} Antardasha (${mutualRel.descriptionHinglish}) social grace add karti hai.`;
    } else {
      headline = `Venus Mahadasha in House ${mdHouse} (${mdSignName}) — Harmony & Prosperity`;
      narrative = `Positioned in your ${mdHouse}th house (${mdSignName}), Venus ushers in an era of aesthetic refinement, interpersonal harmony, material comforts, and creative fulfillment. The sub-period of ${adPlanet} (${mutualRel.descriptionEn}) enhances collaborative ventures and social prestige.`;
    }
  } else if (mdPlanet === 'Sun') {
    citation = 'BPHS Ch. 58, Verses 1–14 & Saravali Ch. 45, Verses 1–10';
    if (language === 'hi') {
      headline = `सूर्य महादशा — ${mdHouse}वें भाव (${mdSignName}) में आत्मबल व अधिकार`;
      narrative = `${mdHouse}वें भाव में स्थित सूर्य की महादशा मान-सम्मान, नेतृत्व क्षमता, प्रशासनिक कार्यों और आत्म-तेज में वृद्धि करती है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) पद-प्रतिष्ठा को मजबूत बनाती है।`;
    } else if (language === 'hinglish') {
      headline = `Sun Mahadasha in House ${mdHouse} — Authority & Self-Realization`;
      narrative = `Sun aapke ${mdHouse}th house (${mdSignName}) mein hone se career recognition, leadership authority aur vital energy elevate hoti hai. ${adPlanet} Antardasha (${mutualRel.descriptionHinglish}) respect aur status consolidate karti hai.`;
    } else {
      headline = `Sun Mahadasha in House ${mdHouse} (${mdSignName}) — Authority & Vitality`;
      narrative = `With the Sun situated in your ${mdHouse}th house (${mdSignName}), this chapter emphasizes leadership authority, self-realization, and vital executive energy. The ongoing sub-period of ${adPlanet} (${mutualRel.descriptionEn}) strengthens social standing and professional autonomy.`;
    }
  } else if (mdPlanet === 'Moon') {
    citation = 'BPHS Ch. 59, Verses 1–15 & Phaladeepika Ch. 20, Verses 11–18';
    if (language === 'hi') {
      headline = `चन्द्र महादशा — ${mdHouse}वें भाव (${mdSignName}) में मानसिक शांति व जनसंपर्क`;
      narrative = `${mdHouse}वें भाव में स्थित चन्द्रमा की महादशा भावनात्मक संतुलन, जन-कल्याण, यात्राओं और रचनात्मक कल्पनाशीलता का समय है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) मनःस्थिति को सुदृढ़ करती है।`;
    } else if (language === 'hinglish') {
      headline = `Moon Mahadasha in House ${mdHouse} — Emotional Clarity & Intuition`;
      narrative = `Moon ${mdHouse}th house (${mdSignName}) mein hone se mental peace, public goodwill aur creative flow ka phase hai. ${adPlanet} Antardasha (${mutualRel.descriptionHinglish}) emotional grounding support karti hai.`;
    } else {
      headline = `Moon Mahadasha in House ${mdHouse} (${mdSignName}) — Emotional Depth & Intuition`;
      narrative = `Anchored by the Moon in your ${mdHouse}th house (${mdSignName}), this phase cultivates intuitive discernment, public goodwill, and imaginative creativity. The sub-period of ${adPlanet} (${mutualRel.descriptionEn}) harmonizes internal peace with domestic stability.`;
    }
  } else {
    // Mars
    citation = 'BPHS Ch. 60, Verses 1–16 & Saravali Ch. 45, Verses 15–22';
    if (language === 'hi') {
      headline = `मंगल महादशा — ${mdHouse}वें भाव (${mdSignName}) में ऊर्जा व पराक्रम`;
      narrative = `${mdHouse}वें भाव में भौम (मंगल) की महादशा साहस, तकनीकी दक्षता, अचल संपत्ति और साहसिक निर्णयों में गतिशीलता लाती है। ${adPlanet} की अंतर्दशा (${mutualRel.descriptionHi}) ऊर्जा को सकारात्मक दिशा में नियोजित करती है।`;
    } else if (language === 'hinglish') {
      headline = `Mars Mahadasha in House ${mdHouse} — Courage & Dynamic Action`;
      narrative = `Mars aapke ${mdHouse}th house (${mdSignName}) mein hone se high vitality, land/property progress aur bold executive action ka active period hai. ${adPlanet} Antardasha (${mutualRel.descriptionHinglish}) power ko constructivity deti hai.`;
    } else {
      headline = `Mars Mahadasha in House ${mdHouse} (${mdSignName}) — Courage & Initiative`;
      narrative = `Energized by Mars in your ${mdHouse}th house (${mdSignName}), this dynamic cycle stimulates courage, technical prowess, property acquisitions, and resolute executive action. The sub-period of ${adPlanet} (${mutualRel.descriptionEn}) channels high drive into constructive milestones.`;
    }
  }

  return {
    headline,
    narrative,
    sourceCitation: citation,
    isClassicalScripture: isClassical,
    whyReasoning,
  };
}
