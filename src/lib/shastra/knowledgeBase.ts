/**
 * Classical Shastra Knowledge Base & Remedies Library
 * Sourced from Brihat Parashara Hora Shastra, Phaladeepika, and Saravali.
 */

export interface GrahaRemedy {
  planet: string;
  sanskrit: string;
  mantra: {
    vedic: string;
    beej: string;
    gayatri: string;
    chantCount: number;
  };
  gemstone: {
    name: string;
    hindiName: string;
    metal: string;
    finger: string;
    wearingDay: string;
    caution: string;
  };
  charity: {
    items: string[];
    bestDay: string;
    beneficiary: string;
  };
  fasting: {
    day: string;
    deity: string;
    significance: string;
  };
  lifestyle: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export const GRAHA_REMEDIES: Record<string, GrahaRemedy> = {
  Sun: {
    planet: 'Sun',
    sanskrit: 'Surya',
    mantra: {
      vedic: 'ॐ आकृष्णेन रजसा वर्तमानो निवेशयन्नमृतं मर्त्यं च। हिरण्ययेन सविता रथेना देवो याति भुवनानि पश्यन्॥',
      beej: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
      gayatri: 'ॐ आदित्याय विद्महे मार्तण्डाय धीमहि तन्नः सूर्यः प्रचोदयात्॥',
      chantCount: 7000,
    },
    gemstone: {
      name: 'Ruby',
      hindiName: 'माणिक्य (Manik)',
      metal: 'Gold or Copper',
      finger: 'Ring Finger (Anamika)',
      wearingDay: 'Sunday Morning (Shukla Paksha)',
      caution: 'Avoid wearing if Sun is 6th, 8th, or 12th lord without consultation.',
    },
    charity: {
      items: ['Wheat (Gehun)', 'Jaggery (Gud)', 'Copper vessels', 'Red sandalwood', 'Red cloth'],
      bestDay: 'Sunday',
      beneficiary: 'Needy elders, priests, or orphanages',
    },
    fasting: {
      day: 'Sunday (Ravivar Vrat)',
      deity: 'Lord Surya / Gayatri',
      significance: 'Promotes health, vitality, eyesight, and career elevation.',
    },
    lifestyle: {
      en: 'Wake up before sunrise, offer Arghya (water in a copper vessel) to the Sun, and respect father and mentors.',
      hi: 'सूर्योदय से पूर्व उठें, तांबे के लोटे से सूर्य को अर्घ्य दें एवं पिता व वरिष्ठों का सम्मान करें।',
      hinglish: 'Sunrise se pehle wake up karein, copper pot se Surya Arghya dein aur elders ki respect karein.',
    },
  },
  Moon: {
    planet: 'Moon',
    sanskrit: 'Chandra',
    mantra: {
      vedic: 'ॐ इमं देवा असपत्नꣳ सुवध्वं महते क्षत्राय महते ज्येष्ठ्याय महते जानराज्यायेन्द्रस्येन्द्रियाय।',
      beej: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
      gayatri: 'ॐ क्षीरपुत्राय विद्महे अमृततत्त्वाय धीमहि तन्नो चन्द्रः प्रचोदयात्॥',
      chantCount: 11000,
    },
    gemstone: {
      name: 'Natural Pearl',
      hindiName: 'सच्चा मोती (Moti)',
      metal: 'Silver',
      finger: 'Little Finger (Kanishthika)',
      wearingDay: 'Monday Evening (Shukla Paksha)',
      caution: 'Best suited when Moon is Lagna Lord or in auspicious houses.',
    },
    charity: {
      items: ['Rice (Chawal)', 'Milk / Curd', 'White sweets', 'Silver', 'White flowers / cloth'],
      bestDay: 'Monday',
      beneficiary: 'Mothers, elderly women, or female shelters',
    },
    fasting: {
      day: 'Monday (Somvar Vrat) / Purnima',
      deity: 'Lord Shiva / Chandra Dev',
      significance: 'Brings mental tranquility, emotional stability, and inner peace.',
    },
    lifestyle: {
      en: 'Practice daily mindfulness, drink water from a silver cup, and seek the blessings of your mother daily.',
      hi: 'प्रतिदिन ध्यान करें, चांदी के पात्र से जल पिएं और माता के चरण स्पर्श कर आशीर्वाद लें।',
      hinglish: 'Daily meditation karein, silver glass se paani piyein aur mother ka blessing lein.',
    },
  },
  Mars: {
    planet: 'Mars',
    sanskrit: 'Mangal',
    mantra: {
      vedic: 'ॐ अग्निर्मूर्धा दिवः ककुत्पतिः पृथिव्या अयम्। अपाꣳ रेताꣳसि जिन्वति॥',
      beej: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
      gayatri: 'ॐ अङ्गारकाय विद्महे शक्तिहस्ताय धीमहि तन्नो भौमः प्रचोदयात्॥',
      chantCount: 10000,
    },
    gemstone: {
      name: 'Red Coral',
      hindiName: 'लाल मूंगा (Moonga)',
      metal: 'Copper, Gold or Panchdhatu',
      finger: 'Ring Finger (Anamika)',
      wearingDay: 'Tuesday Morning (Shukla Paksha)',
      caution: 'Do not wear if Mars is natural malefic in sensitive houses without balancing.',
    },
    charity: {
      items: ['Red Lentils (Masoor Dal)', 'Jaggery', 'Red flowers', 'Copper', 'Blood donation'],
      bestDay: 'Tuesday',
      beneficiary: 'Soldiers, laborers, sports persons, or medical patients',
    },
    fasting: {
      day: 'Tuesday (Mangalwar Vrat)',
      deity: 'Lord Hanuman / Kartikeya',
      significance: 'Removes fears, grants courage, clears property disputes and protects health.',
    },
    lifestyle: {
      en: 'Recite Hanuman Chalisa daily, maintain physical fitness through yoga or exercise, and avoid anger.',
      hi: 'प्रतिदिन हनुमान चालीसा का पाठ करें, शारीरिक व्यायाम करें और क्रोध व कटु वाणी पर नियंत्रण रखें।',
      hinglish: 'Hanuman Chalisa regularly recite karein, regular workout karein aur anger control rakhein.',
    },
  },
  Mercury: {
    planet: 'Mercury',
    sanskrit: 'Budha',
    mantra: {
      vedic: 'ॐ उद्बुध्यस्वाग्ने प्रति जागृहि त्वमिष्टापूर्ते सꣳसृजेथामयं च।',
      beej: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
      gayatri: 'ॐ सौम्यरूपाय विद्महे वाणेशाय धीमहि तन्नो सौम्यः प्रचोदयात्॥',
      chantCount: 9000,
    },
    gemstone: {
      name: 'Emerald',
      hindiName: 'पन्ना (Panna)',
      metal: 'Gold or Bronze',
      finger: 'Little Finger (Kanishthika)',
      wearingDay: 'Wednesday Morning (Shukla Paksha)',
      caution: 'Ensure natural unheated emerald with minimal treatment.',
    },
    charity: {
      items: ['Green Moong Dal', 'Green vegetables', 'Books / Stationery', 'Green cloth', 'Educational aid'],
      bestDay: 'Wednesday',
      beneficiary: 'Students, orphan children, or educational institutions',
    },
    fasting: {
      day: 'Wednesday (Budhwar Vrat)',
      deity: 'Lord Vishnu / Goddess Saraswati',
      significance: 'Enhances business acumen, analytical intellect, speech clarity, and memory.',
    },
    lifestyle: {
      en: 'Feed green grass or spinach to cows (Gau Seva), read sacred literature, and nurture house plants (Tulsi).',
      hi: 'गौमाता को हरा चारा या पालक खिलाएं, तुलसी का रोपण व पूजन करें और अध्ययन को दैनिक आदत बनाएं।',
      hinglish: 'Cows ko green grass feed karein, Tulsi plant care karein aur learning habits develop karein.',
    },
  },
  Jupiter: {
    planet: 'Jupiter',
    sanskrit: 'Guru / Brihaspati',
    mantra: {
      vedic: 'ॐ बृहस्पते अति यदर्यो अर्हाद्द्युमद्विभाति क्रतुमज्जनेषु। यद्दीदयच्छवस ऋतप्रजात तदस्मासु द्रविणं धेहि चित्रम्॥',
      beej: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
      gayatri: 'ॐ गुरुदेवाय विद्महे परब्रह्मणे धीमहि तन्नो गुरुः प्रचोदयात्॥',
      chantCount: 19000,
    },
    gemstone: {
      name: 'Yellow Sapphire',
      hindiName: 'पुखराज (Pukhraj)',
      metal: 'Gold or Brass',
      finger: 'Index Finger (Tarjani)',
      wearingDay: 'Thursday Morning (Shukla Paksha)',
      caution: 'Highly auspicious, check weight according to body mass (approx 1 ratti per 10-12 kg).',
    },
    charity: {
      items: ['Chana Dal (Gram)', 'Turmeric (Haldi)', 'Yellow cloth', 'Saffron (Kesar)', 'Religious scriptures'],
      bestDay: 'Thursday',
      beneficiary: 'Teachers, scholars, Vedic Brahmins, or spiritual institutions',
    },
    fasting: {
      day: 'Thursday (Guruvar Vrat)',
      deity: 'Lord Brihaspati / Vishnu / Dattatreya',
      significance: 'Grants marital bliss, children, prosperity, wisdom, and spiritual progress.',
    },
    lifestyle: {
      en: 'Apply a pure saffron/turmeric tilak on forehead, water a Peepal or Banana tree without touching on Thursdays, and respect teachers.',
      hi: 'माथे पर केसर या हल्दी का तिलक लगाएं, केले अथवा पीपल के वृक्ष की सेवा करें और गुरुओं का आदर करें।',
      hinglish: 'Forehead par Kesar/Haldi tilak lagayein, Banana tree care karein aur mentors ki respect karein.',
    },
  },
  Venus: {
    planet: 'Venus',
    sanskrit: 'Shukra',
    mantra: {
      vedic: 'ॐ अन्नात्परिस्रुतो रसं ब्रह्मणा व्यपिबत्क्षत्रं पयः सोमं प्रजापतिः। ऋतेन सत्यमिन्द्रियं विपानꣳ शुक्रमन्धस इन्द्रस्येन्द्रियमिदं पयोऽमृतं मधु॥',
      beej: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
      gayatri: 'ॐ भृगुपुत्राय विद्महे दिव्यदेहाय धीमहि तन्नो शुक्रः प्रचोदयात्॥',
      chantCount: 16000,
    },
    gemstone: {
      name: 'Diamond / White Zircon / Opal',
      hindiName: 'हीरा / ओपल (Heera / Opal)',
      metal: 'Platinum, White Gold or Silver',
      finger: 'Middle or Little Finger',
      wearingDay: 'Friday Morning (Shukla Paksha)',
      caution: 'Check clarity and absence of inclusions.',
    },
    charity: {
      items: ['White silk cloth', 'Ghee', 'Perfume (Itra)', 'Camphor (Kapur)', 'Sweets / Sugar'],
      bestDay: 'Friday',
      beneficiary: 'Young girls (Kanya Seva), artists, or women in need',
    },
    fasting: {
      day: 'Friday (Shukravar / Santoshi Mata Vrat)',
      deity: 'Goddess Mahalakshmi / Shukracharya',
      significance: 'Bestows material wealth, artistic mastery, marital harmony, and aesthetic beauty.',
    },
    lifestyle: {
      en: 'Maintain spotless personal hygiene, use natural fragrances, respect women in all spheres, and practice arts.',
      hi: 'स्वच्छता और सुरुचिपूर्ण जीवनशैली अपनाएं, सुगंधित द्रव्यों का प्रयोग करें और महिलाओं का सम्मान करें।',
      hinglish: 'High personal hygiene maintain karein, sweet natural fragrance use karein aur women ki respect karein.',
    },
  },
  Saturn: {
    planet: 'Saturn',
    sanskrit: 'Shani',
    mantra: {
      vedic: 'ॐ शं नो देवीरभिष्टये आपो भवन्तु पीतये। शं योरभि स्रवन्तु नः॥',
      beej: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
      gayatri: 'ॐ काकध्वजाय विद्महे खड्गहस्ताय धीमहि तन्नो मन्दः प्रचोदयात्॥',
      chantCount: 23000,
    },
    gemstone: {
      name: 'Blue Sapphire / Amethyst',
      hindiName: 'नीलम / जामुनिया (Neelam / Katela)',
      metal: 'Silver, White Gold or Iron/Ashtadhatu',
      finger: 'Middle Finger (Madhyama)',
      wearingDay: 'Saturday Evening (Sunset)',
      caution: 'Mandatory trial of 3-5 days under pillow or pocket before setting in metal.',
    },
    charity: {
      items: ['Mustard Oil (Sarson Tel)', 'Black sesame (Urad/Til)', 'Iron tools', 'Dark blankets', 'Leather footwear'],
      bestDay: 'Saturday',
      beneficiary: 'Laborers, disabled persons, sanitation workers, or needy elderly',
    },
    fasting: {
      day: 'Saturday (Shanivar Vrat)',
      deity: 'Lord Shani / Lord Shiva / Hanuman',
      significance: 'Protects against delays, accidents, health struggles, and bestows endurance and justice.',
    },
    lifestyle: {
      en: 'Light a mustard oil lamp under a Peepal tree on Saturday evenings, practice disciplined hard work, and serve manual workers with dignity.',
      hi: 'शनिवार संध्या पीपल वृक्ष के नीचे सरसों के तेल का दीपक जलाएं, कर्मठता बरतें और श्रमिकों की सेवा व सहायता करें।',
      hinglish: 'Saturday evening Peepal tree ke paas mustard oil diya jalayein, hard work aur ground reality se connect rahein.',
    },
  },
  Rahu: {
    planet: 'Rahu',
    sanskrit: 'Rahu',
    mantra: {
      vedic: 'ॐ कयानश्चित्र आ भुवदूती सदावृधः सखा। कया शचिष्ठया वृता॥',
      beej: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
      gayatri: 'ॐ शिरोरूपाय विद्महे अमृतेशाय धीमहि तन्नो राहुः प्रचोदयात्॥',
      chantCount: 18000,
    },
    gemstone: {
      name: 'Hessonite Garnet',
      hindiName: 'गोमेद (Gomed)',
      metal: 'Silver or Ashtadhatu',
      finger: 'Middle Finger (Madhyama)',
      wearingDay: 'Saturday Evening / Night',
      caution: 'Select honey-colored translucent gemstone with zero cracks.',
    },
    charity: {
      items: ['Black/Blue cloth', 'Mustard oil', 'Radish (Mooli)', 'Seven grains (Satnaja)', 'Blankets'],
      bestDay: 'Saturday',
      beneficiary: 'Lepers, sweepers, or stray animals (dogs)',
    },
    fasting: {
      day: 'Saturday / Amavasya',
      deity: 'Goddess Durga / Bhairava',
      significance: 'Removes mental illusion, sudden phobias, addictions, and foreign hurdles.',
    },
    lifestyle: {
      en: 'Feed stray dogs regularly, keep the entrance of your home clean and clutter-free, and avoid addictions.',
      hi: 'स्ट्रीट डॉग्स को प्रतिदिन भोजन दें, घर के मुख्य द्वार को स्वच्छ व व्यवस्थित रखें और व्यसनों से दूर रहें।',
      hinglish: 'Stray dogs ko daily feed karein, ghar ka main gate clean rakhein aur illusions/addictions avoid karein.',
    },
  },
  Ketu: {
    planet: 'Ketu',
    sanskrit: 'Ketu',
    mantra: {
      vedic: 'ॐ केतुं कृण्वन्नकेतवे पेशो मर्या अपेशसे। समुषद्भिरजायथाः॥',
      beej: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
      gayatri: 'ॐ चित्रवर्णाय विद्महे सर्परूपाय धीमहि तन्नो केतुः प्रचोदयात्॥',
      chantCount: 17000,
    },
    gemstone: {
      name: "Cat's Eye Chrysoberyl",
      hindiName: 'लहसुनिया (Lehsuniya)',
      metal: 'Silver or Gold',
      finger: 'Ring or Little Finger',
      wearingDay: 'Tuesday or Thursday Evening',
      caution: 'Should show sharp luminous chatoyancy ray through the center.',
    },
    charity: {
      items: ['Multi-colored blanket', 'Black and white sesame', 'Mustard seeds', 'Iron knife/utensil', 'Flags for temples'],
      bestDay: 'Tuesday or Thursday',
      beneficiary: 'Hermits, ascetics, ashrams, or animal shelters',
    },
    fasting: {
      day: 'Tuesday / Pradosh',
      deity: 'Lord Ganesha / Matsya Avatar',
      significance: 'Protects from hidden illnesses, unblocks spiritual intuition, and dissolves past karmas.',
    },
    lifestyle: {
      en: 'Worship Lord Ganesha with Durva grass daily, donate multi-colored blankets in winter, and practice selfless meditation.',
      hi: 'भगवान गणेश की दूर्वा से नित्य आराधना करें, सर्दियों में कंबलों का दान करें और निष्काम ध्यान का अभ्यास करें।',
      hinglish: 'Lord Ganesha ko Durva offer karein, needy ko blanket donate karein aur daily silent meditation karein.',
    },
  },
};
