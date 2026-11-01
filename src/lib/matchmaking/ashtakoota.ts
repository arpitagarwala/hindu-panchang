/**
 * Vedic 36-Guna Ashtakoota Matchmaking Engine (Kundali Milan)
 * Implements classical Parashari rules for all 8 Kootas:
 * Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), Nadi (8).
 */

import { NAKSHATRAS, ZODIAC_SIGNS, PLANETS } from '../astronomy/constants';

export interface KootaScore {
  name: string;
  sanskrit: string;
  pointsObtained: number;
  maxPoints: number;
  status: 'Excellent' | 'Good' | 'Average' | 'Dosha / Low';
  description: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export interface MatchmakingResult {
  totalScore: number; // 0-36
  maxScore: number; // 36
  percentage: number;
  verdict: 'Highly Auspicious Match' | 'Good Match' | 'Average / Remedy Needed' | 'Incompatible / High Dosha';
  verdictDescription: {
    en: string;
    hi: string;
    hinglish: string;
  };
  kootas: {
    varna: KootaScore;
    vashya: KootaScore;
    tara: KootaScore;
    yoni: KootaScore;
    grahaMaitri: KootaScore;
    gana: KootaScore;
    bhakoot: KootaScore;
    nadi: KootaScore;
  };
  doshaChecks: {
    nadiDosha: boolean;
    bhakootDosha: boolean;
    ganaDosha: boolean;
  };
}

export interface PartnerDetails {
  name: string;
  moonSign: number; // 1-12
  nakshatra: number; // 1-27
  pada: number; // 1-4
}

// Varna Ranking: Brahmin (4) > Kshatriya (3) > Vaishya (2) > Shudra (1)
const VARNA_POINTS: Record<string, number> = {
  Brahmin: 4,
  Kshatriya: 3,
  Vaishya: 2,
  Shudra: 1,
};

// Gana Compatibility Matrix
const GANA_SCORES: Record<string, Record<string, number>> = {
  Deva: { Deva: 6, Manushya: 5, Rakshasa: 1 },
  Manushya: { Deva: 5, Manushya: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 1, Manushya: 0, Rakshasa: 6 },
};

// Yoni Compatibility Matrix (14 Yonis -> 0 to 4 points)
const YONI_SCORES: Record<string, Record<string, number>> = {
  Horse: { Horse: 4, Elephant: 2, Sheep: 2, Serpent: 2, Dog: 2, Cat: 2, Rat: 2, Cow: 2, Buffalo: 0, Tiger: 1, Deer: 3, Monkey: 2, Mongoose: 2, Lion: 1 },
  Elephant: { Horse: 2, Elephant: 4, Sheep: 3, Serpent: 3, Dog: 2, Cat: 2, Rat: 2, Cow: 2, Buffalo: 3, Tiger: 1, Deer: 2, Monkey: 3, Mongoose: 2, Lion: 0 },
  Sheep: { Horse: 2, Elephant: 3, Sheep: 4, Serpent: 2, Dog: 1, Cat: 2, Rat: 1, Cow: 3, Buffalo: 3, Tiger: 1, Deer: 2, Monkey: 0, Mongoose: 2, Lion: 1 },
  Serpent: { Horse: 2, Elephant: 3, Sheep: 2, Serpent: 4, Dog: 2, Cat: 1, Rat: 1, Cow: 1, Buffalo: 1, Tiger: 2, Deer: 2, Monkey: 2, Mongoose: 0, Lion: 2 },
  Dog: { Horse: 2, Elephant: 2, Sheep: 1, Serpent: 2, Dog: 4, Cat: 2, Rat: 1, Cow: 1, Buffalo: 2, Tiger: 1, Deer: 0, Monkey: 2, Mongoose: 1, Lion: 1 },
  Cat: { Horse: 2, Elephant: 2, Sheep: 2, Serpent: 1, Dog: 2, Cat: 4, Rat: 0, Cow: 2, Buffalo: 2, Tiger: 1, Deer: 3, Monkey: 2, Mongoose: 2, Lion: 1 },
  Rat: { Horse: 2, Elephant: 2, Sheep: 1, Serpent: 1, Dog: 1, Cat: 0, Rat: 4, Cow: 2, Buffalo: 2, Tiger: 2, Deer: 2, Monkey: 2, Mongoose: 2, Lion: 1 },
  Cow: { Horse: 2, Elephant: 2, Sheep: 3, Serpent: 1, Dog: 1, Cat: 2, Rat: 2, Cow: 4, Buffalo: 3, Tiger: 0, Deer: 3, Monkey: 2, Mongoose: 2, Lion: 1 },
  Buffalo: { Horse: 0, Elephant: 3, Sheep: 3, Serpent: 1, Dog: 2, Cat: 2, Rat: 2, Cow: 3, Buffalo: 4, Tiger: 0, Deer: 2, Monkey: 2, Mongoose: 2, Lion: 1 },
  Tiger: { Horse: 1, Elephant: 1, Sheep: 1, Serpent: 2, Dog: 1, Cat: 1, Rat: 2, Cow: 0, Buffalo: 0, Tiger: 4, Deer: 1, Monkey: 1, Mongoose: 1, Lion: 1 },
  Deer: { Horse: 3, Elephant: 2, Sheep: 2, Serpent: 2, Dog: 0, Cat: 3, Rat: 2, Cow: 3, Buffalo: 2, Tiger: 1, Deer: 4, Monkey: 2, Mongoose: 2, Lion: 1 },
  Monkey: { Horse: 2, Elephant: 3, Sheep: 0, Serpent: 2, Dog: 2, Cat: 2, Rat: 2, Cow: 2, Buffalo: 2, Tiger: 1, Deer: 2, Monkey: 4, Mongoose: 2, Lion: 2 },
  Mongoose: { Horse: 2, Elephant: 2, Sheep: 2, Serpent: 0, Dog: 1, Cat: 2, Rat: 2, Cow: 2, Buffalo: 2, Tiger: 1, Deer: 2, Monkey: 2, Mongoose: 4, Lion: 2 },
  Lion: { Horse: 1, Elephant: 0, Sheep: 1, Serpent: 2, Dog: 1, Cat: 1, Rat: 1, Cow: 1, Buffalo: 1, Tiger: 1, Deer: 1, Monkey: 2, Mongoose: 2, Lion: 4 },
};

/**
 * Calculates full Ashtakoota 36 Guna Milan between Groom (or Person 1) and Bride (or Person 2)
 */
export function calculateAshtakoota(person1: PartnerDetails, person2: PartnerDetails): MatchmakingResult {
  const nak1 = NAKSHATRAS[person1.nakshatra - 1];
  const nak2 = NAKSHATRAS[person2.nakshatra - 1];

  const moonSign1 = ZODIAC_SIGNS[person1.moonSign - 1];
  const moonSign2 = ZODIAC_SIGNS[person2.moonSign - 1];

  // 1. Varna Koota (1 Point)
  const vScore1 = VARNA_POINTS[nak1.varna] || 1;
  const vScore2 = VARNA_POINTS[nak2.varna] || 1;
  const varnaPoints = vScore1 >= vScore2 ? 1 : 0;
  const varna: KootaScore = {
    name: 'Varna (Work & Spiritual Duty)',
    sanskrit: 'वर्ण कूट',
    pointsObtained: varnaPoints,
    maxPoints: 1,
    status: varnaPoints === 1 ? 'Excellent' : 'Average',
    description: {
      en: varnaPoints === 1 ? 'Harmonious mutual ego and spiritual alignment.' : 'Minor differences in work mindset.',
      hi: varnaPoints === 1 ? 'उत्तम वैचारिक व आध्यात्मिक सामंजस्य।' : 'कार्यशैली में सामान्य भिन्नता।',
      hinglish: varnaPoints === 1 ? 'Ego harmony aur mental mindset aligned hai.' : 'Work approach me thoda difference ho sakta hai.',
    },
  };

  // 2. Vashya Koota (2 Points)
  let vashyaPoints = 1;
  if (nak1.vashya === nak2.vashya) vashyaPoints = 2;
  else if (nak1.vashya === 'Manava' && nak2.vashya === 'Chatushpada') vashyaPoints = 1;
  else if (nak1.vashya === 'Jalachara' && nak2.vashya === 'Keeta') vashyaPoints = 0;
  const vashya: KootaScore = {
    name: 'Vashya (Mutual Attraction & Control)',
    sanskrit: 'वश्य कूट',
    pointsObtained: vashyaPoints,
    maxPoints: 2,
    status: vashyaPoints === 2 ? 'Excellent' : vashyaPoints === 1 ? 'Good' : 'Average',
    description: {
      en: `Score of ${vashyaPoints}/2. Indicates dynamic attraction and mutual respect.`,
      hi: `वश्य स्कोर ${vashyaPoints}/2। परस्पर आकर्षण और सम्मान का स्तर।`,
      hinglish: `${vashyaPoints}/2 points. Mutual chemistry aur bonding achhi hai.`,
    },
  };

  // 3. Tara Koota (3 Points - Birth Star Destiny)
  const count1 = ((person2.nakshatra - person1.nakshatra + 27) % 27) + 1;
  const count2 = ((person1.nakshatra - person2.nakshatra + 27) % 27) + 1;
  const tara1 = count1 % 9;
  const tara2 = count2 % 9;
  // Auspicious taras: 3 (Vipat), 5 (Pratyak), 7 (Naidhana) are inauspicious; others auspicious
  const isAuspiciousTara = (t: number) => ![3, 5, 7, 0].includes(t);
  let taraPoints = 0;
  if (isAuspiciousTara(tara1) && isAuspiciousTara(tara2)) taraPoints = 3;
  else if (isAuspiciousTara(tara1) || isAuspiciousTara(tara2)) taraPoints = 1.5;

  const tara: KootaScore = {
    name: 'Tara (Health & Longevity Destiny)',
    sanskrit: 'तारा कूट',
    pointsObtained: taraPoints,
    maxPoints: 3,
    status: taraPoints === 3 ? 'Excellent' : taraPoints > 0 ? 'Good' : 'Dosha / Low',
    description: {
      en: taraPoints >= 2 ? 'Strong auspicious planetary destiny protection.' : 'Moderate destiny support.',
      hi: taraPoints >= 2 ? 'उत्तम स्वास्थ्य एवं दीर्घायु का सुरक्षात्मक प्रभाव।' : 'मध्यम भाग्य समर्थन।',
      hinglish: taraPoints >= 2 ? 'Health aur fortune me protective energy rahegi.' : 'Regular well-being care helpful rahegi.',
    },
  };

  // 4. Yoni Koota (4 Points - Physical & Temperament Compatibility)
  const yoni1 = nak1.yoni;
  const yoni2 = nak2.yoni;
  const yoniPoints = YONI_SCORES[yoni1]?.[yoni2] ?? 2;
  const yoni: KootaScore = {
    name: 'Yoni (Intimacy & Temperament)',
    sanskrit: 'योनि कूट',
    pointsObtained: yoniPoints,
    maxPoints: 4,
    status: yoniPoints >= 3 ? 'Excellent' : yoniPoints === 2 ? 'Good' : 'Dosha / Low',
    description: {
      en: `Score ${yoniPoints}/4. Represents physical chemistry, intimacy, and instinctual empathy.`,
      hi: `योनि स्कोर ${yoniPoints}/4। शारीरिक सामंजस्य व प्राकृतिक स्वभाव की अनुकूलता।`,
      hinglish: `${yoniPoints}/4 points. Natural physical compatibility aur understanding.`,
    },
  };

  // 5. Graha Maitri Koota (5 Points - Moon Sign Lords Friendship)
  const lord1 = PLANETS[moonSign1.lord];
  const lord2 = PLANETS[moonSign2.lord];
  let maitriPoints = 1;
  if (moonSign1.lord === moonSign2.lord) {
    maitriPoints = 5;
  } else if (lord1?.friends.includes(moonSign2.lord) && lord2?.friends.includes(moonSign1.lord)) {
    maitriPoints = 5;
  } else if (lord1?.friends.includes(moonSign2.lord) || lord2?.friends.includes(moonSign1.lord)) {
    maitriPoints = 3;
  } else if (lord1?.neutrals.includes(moonSign2.lord) && lord2?.neutrals.includes(moonSign1.lord)) {
    maitriPoints = 3;
  } else if (lord1?.enemies.includes(moonSign2.lord) && lord2?.enemies.includes(moonSign1.lord)) {
    maitriPoints = 0;
  } else {
    maitriPoints = 1;
  }

  const grahaMaitri: KootaScore = {
    name: 'Graha Maitri (Mental Harmony & Friendship)',
    sanskrit: 'ग्रह मैत्री कूट',
    pointsObtained: maitriPoints,
    maxPoints: 5,
    status: maitriPoints >= 4 ? 'Excellent' : maitriPoints >= 3 ? 'Good' : 'Dosha / Low',
    description: {
      en: `Scored ${maitriPoints}/5. Measures intellectual rapport and psychological bonding.`,
      hi: `ग्रह मैत्री ${maitriPoints}/5। मानसिक विचारों का तालमेल व सहज मित्रता।`,
      hinglish: `${maitriPoints}/5 points. Communication aur psychological tuning level.`,
    },
  };

  // 6. Gana Koota (6 Points - Behavioral Nature: Deva / Manushya / Rakshasa)
  const gana1 = nak1.gana;
  const gana2 = nak2.gana;
  const ganaPoints = GANA_SCORES[gana1]?.[gana2] ?? 3;
  const gana: KootaScore = {
    name: 'Gana (Temperament & Behavior)',
    sanskrit: 'गण कूट',
    pointsObtained: ganaPoints,
    maxPoints: 6,
    status: ganaPoints === 6 ? 'Excellent' : ganaPoints >= 4 ? 'Good' : 'Dosha / Low',
    description: {
      en: `Score ${ganaPoints}/6 (${gana1} + ${gana2}). Aligns daily behavioral lifestyle.`,
      hi: `गण स्कोर ${ganaPoints}/6 (${gana1} + ${gana2})। जीवन शैली व दृष्टिकोण का सामंजस्य।`,
      hinglish: `${ganaPoints}/6 points. Daily lifestyle aur behavioral alignment.`,
    },
  };

  // 7. Bhakoot Koota (7 Points - Emotional & Family Prosperity)
  const signDiff = ((person2.moonSign - person1.moonSign + 12) % 12) + 1;
  // Challenging sign positions: 6/8 (Shadashtak), 9/5 (Navapancham), 2/12 (Dwidwadash)
  let bhakootPoints = 7;
  let hasBhakootDosha = false;
  if ([6, 8].includes(signDiff)) {
    // 6/8 Dosha
    hasBhakootDosha = true;
    bhakootPoints = 0;
  } else if ([2, 12].includes(signDiff)) {
    // 2/12 Dosha
    hasBhakootDosha = true;
    bhakootPoints = 0;
  } else if ([9, 5].includes(signDiff)) {
    // 9/5 is auspicious in many traditions unless lords are mutual enemies
    if (maitriPoints === 0) {
      hasBhakootDosha = true;
      bhakootPoints = 0;
    }
  }

  const bhakoot: KootaScore = {
    name: 'Bhakoot (Emotional Depth & Lineage Growth)',
    sanskrit: 'भकूट कूट',
    pointsObtained: bhakootPoints,
    maxPoints: 7,
    status: bhakootPoints === 7 ? 'Excellent' : 'Dosha / Low',
    description: {
      en: bhakootPoints === 7 ? 'Deep emotional bonding and auspicious family fortune.' : 'Bhakoot Dosha detected; mutual patience is advised.',
      hi: bhakootPoints === 7 ? 'गहन भावनात्मक जुड़ाव और सुख-समृद्धि का योग।' : 'भकूट दोष — आपसी समझदारी व धैर्य आवश्यक।',
      hinglish: bhakootPoints === 7 ? 'Super emotional bond aur prosperity alignment.' : 'Bhakoot dosha present hai, transparent conversation zaroori hai.',
    },
  };

  // 8. Nadi Koota (8 Points - Genetic, Spiritual & Progeny Health)
  const nadi1 = nak1.nadi;
  const nadi2 = nak2.nadi;
  const hasNadiDosha = nadi1 === nadi2;
  const nadiPoints = hasNadiDosha ? 0 : 8;

  const nadi: KootaScore = {
    name: 'Nadi (Genetic Energy & Progeny Health)',
    sanskrit: 'नाड़ी कूट',
    pointsObtained: nadiPoints,
    maxPoints: 8,
    status: nadiPoints === 8 ? 'Excellent' : 'Dosha / Low',
    description: {
      en: nadiPoints === 8 ? 'Different nadis (${nadi1} & ${nadi2}) ensure radiant vitality and healthy progeny.' : 'Same Nadi (${nadi1}); Nadi Dosha remedy recommended.',
      hi: nadiPoints === 8 ? 'भिन्न नाड़ियां उत्तम स्वास्थ्य व सुसंतति का वरदान देती हैं।' : 'समान नाड़ी — नाड़ी दोष शांति अनुष्ठान शास्त्रसम्मत है।',
      hinglish: nadiPoints === 8 ? 'Different Nadis (${nadi1} & ${nadi2}) are perfectly compatible.' : 'Same Nadi hone se Nadi Dosha banta hai, remedy recommended hai.',
    },
  };

  const totalScore = varnaPoints + vashyaPoints + taraPoints + yoniPoints + maitriPoints + ganaPoints + bhakootPoints + nadiPoints;
  const percentage = Math.round((totalScore / 36) * 100);

  let verdict: MatchmakingResult['verdict'] = 'Good Match';
  let enVerdict = 'A harmonious union with strong mutual balance.';
  let hiVerdict = 'सुखद वैवाहिक जीवन व पारस्परिक सामंजस्य का श्रेष्ठ योग।';
  let hinglishVerdict = 'Strong bonding aur balanced compatibility match hai.';

  if (totalScore >= 28) {
    verdict = 'Highly Auspicious Match';
    enVerdict = 'Outstanding astronomical compatibility across all life dimensions.';
    hiVerdict = 'अत्युत्तम मिलान — सर्वगुण संपन्न दांपत्य योग।';
    hinglishVerdict = 'Excellent score! Highly supportive aur auspicious match hai.';
  } else if (totalScore < 18 || hasNadiDosha) {
    verdict = 'Average / Remedy Needed';
    enVerdict = 'Moderate alignment; astrological guidance or remedies recommended.';
    hiVerdict = 'मध्यम मिलान — कुछ क्षेत्रों में शांति अनुष्ठान व परामर्श उचित रहेगा।';
    hinglishVerdict = 'Moderate score. Remedies aur proper understanding ke sath proceed karein.';
  }

  return {
    totalScore,
    maxScore: 36,
    percentage,
    verdict,
    verdictDescription: {
      en: enVerdict,
      hi: hiVerdict,
      hinglish: hinglishVerdict,
    },
    kootas: {
      varna,
      vashya,
      tara,
      yoni,
      grahaMaitri,
      gana,
      bhakoot,
      nadi,
    },
    doshaChecks: {
      nadiDosha: hasNadiDosha,
      bhakootDosha: hasBhakootDosha,
      ganaDosha: ganaPoints === 0,
    },
  };
}
