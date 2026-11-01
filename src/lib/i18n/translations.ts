/**
 * Trilingual Localization and Language Management
 * English, Devanagari Hindi, and authentic conversational Hinglish.
 */

export type LanguageCode = 'en' | 'hi' | 'hinglish';

export interface TranslationDictionary {
  nav: {
    todayPanchang: string;
    birthChart: string;
    dashaTimeline: string;
    numerology: string;
    matchmaking: string;
    remedies: string;
    journal: string;
    learn: string;
    simpleMode: string;
    proMode: string;
    switchMode: string;
  };
  dashboard: {
    heroTitle: string;
    heroSubtitle: string;
    currentChapter: string;
    lifeChapterDesc: string;
    todayVibe: string;
    activeChoghadiya: string;
    timeRemaining: string;
    rahuKaalAlert: string;
    muhuratWindow: string;
    viewFullChart: string;
    viewDashaDetails: string;
    remedyRecommendation: string;
  };
  chart: {
    northIndian: string;
    southIndian: string;
    eastIndian: string;
    ascendant: string;
    sign: string;
    degree: string;
    nakshatra: string;
    pada: string;
    dignity: string;
    retrograde: string;
    combust: string;
    speed: string;
    shadbala: string;
    ashtakavarga: string;
    divisionalCharts: string;
    exportPdf: string;
  };
  dasha: {
    title: string;
    subtitle: string;
    mahadasha: string;
    antardasha: string;
    pratyantardasha: string;
    sookshmaDasha: string;
    balanceAtBirth: string;
    currentRunning: string;
    daysLeft: string;
    progress: string;
  };
  panchang: {
    tithi: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    vara: string;
    hinduMonth: string;
    sunrise: string;
    sunset: string;
    brahmaMuhurta: string;
    abhijitMuhurta: string;
    rahuKaal: string;
    yamaganda: string;
    gulikaKaal: string;
  };
  numerology: {
    title: string;
    mulank: string;
    bhagyank: string;
    namank: string;
    lifePath: string;
    luckyNumbers: string;
    luckyColors: string;
    chartCrossReference: string;
  };
  gunaMilan: {
    title: string;
    boyDetails: string;
    girlDetails: string;
    totalGunas: string;
    verdict: string;
    nadiDosha: string;
    bhakootDosha: string;
  };
  journal: {
    title: string;
    newEntry: string;
    eventDate: string;
    eventCategory: string;
    tagWithDasha: string;
    notes: string;
    save: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    nav: {
      todayPanchang: 'Today Panchang',
      birthChart: 'Kundali Chart',
      dashaTimeline: 'Dasha Timeline',
      numerology: 'Numerology',
      matchmaking: 'Guna Milan',
      remedies: 'Remedies & Mantras',
      journal: 'Dasha Life Journal',
      learn: 'Learn Jyotish',
      simpleMode: 'Simple Mode',
      proMode: 'Pro Astrologer',
      switchMode: 'Toggle Mode',
    },
    dashboard: {
      heroTitle: 'Your Vedic Life Dashboard',
      heroSubtitle: 'Astronomically calculated real-time cosmic alignments, daily panchang and dasha guidance.',
      currentChapter: 'Current Life Chapter',
      lifeChapterDesc: 'Your primary energetic focus governed by the planetary period.',
      todayVibe: "Today's Astrological Vibe",
      activeChoghadiya: 'Active Choghadiya',
      timeRemaining: 'Remaining',
      rahuKaalAlert: 'Rahu Kaal Alert',
      muhuratWindow: 'Auspicious Window',
      viewFullChart: 'View Full Kundali',
      viewDashaDetails: 'Explore Sub-periods',
      remedyRecommendation: 'Recommended Daily Remedy',
    },
    chart: {
      northIndian: 'North Indian Diamond',
      southIndian: 'South Indian Square',
      eastIndian: 'East Indian',
      ascendant: 'Ascendant (Lagna)',
      sign: 'Sign',
      degree: 'Exact Degree',
      nakshatra: 'Nakshatra',
      pada: 'Pada',
      dignity: 'Dignity',
      retrograde: 'Retrograde (Vakri)',
      combust: 'Combust (Asta)',
      speed: 'Daily Motion',
      shadbala: '6-Fold Shadbala',
      ashtakavarga: 'Ashtakavarga (SAV & BAV)',
      divisionalCharts: 'Divisional Charts (Vargas)',
      exportPdf: 'Export Comprehensive PDF',
    },
    dasha: {
      title: 'Vimshottari Dasha Engine',
      subtitle: 'Recursive proportional 120-year timeline computed from the Moon’s exact birth Nakshatra.',
      mahadasha: 'Mahadasha',
      antardasha: 'Antardasha',
      pratyantardasha: 'Pratyantardasha',
      sookshmaDasha: 'Sookshma Dasha',
      balanceAtBirth: 'Balance at Birth',
      currentRunning: 'Currently Active',
      daysLeft: 'days remaining',
      progress: 'Progress Completed',
    },
    panchang: {
      tithi: 'Tithi',
      nakshatra: 'Nakshatra',
      yoga: 'Yoga',
      karana: 'Karana',
      vara: 'Weekday (Vara)',
      hinduMonth: 'Hindu Month & Samvat',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      brahmaMuhurta: 'Brahma Muhurta',
      abhijitMuhurta: 'Abhijit Muhurta',
      rahuKaal: 'Rahu Kaal',
      yamaganda: 'Yamaganda',
      gulikaKaal: 'Gulika Kaal',
    },
    numerology: {
      title: 'Vedic & Western Numerology',
      mulank: 'Mulank (Birth Number)',
      bhagyank: 'Bhagyank (Destiny Number)',
      namank: 'Namank (Name Number)',
      lifePath: 'Life Path Number',
      luckyNumbers: 'Lucky Numbers',
      luckyColors: 'Lucky Colors',
      chartCrossReference: 'Birth Chart Synthesis',
    },
    gunaMilan: {
      title: 'Ashtakoota 36-Guna Matchmaking',
      boyDetails: "Groom's Moon Chart",
      girlDetails: "Bride's Moon Chart",
      totalGunas: 'Total Compatible Gunas',
      verdict: 'Final Verdict',
      nadiDosha: 'Nadi Dosha',
      bhakootDosha: 'Bhakoot Dosha',
    },
    journal: {
      title: 'Life-Event Dasha Journal',
      newEntry: 'Log New Life Milestone',
      eventDate: 'Event Date',
      eventCategory: 'Category (Career, Love, Health, Shift)',
      tagWithDasha: 'Tagged Dasha Period',
      notes: 'Reflection / Personal Notes',
      save: 'Save to Timeline',
    },
  },
  hi: {
    nav: {
      todayPanchang: 'दैनिक पञ्चाङ्ग',
      birthChart: 'जन्म कुण्डली',
      dashaTimeline: 'विंशोत्तरी दशा',
      numerology: 'अंक ज्योतिष',
      matchmaking: 'गुण मिलान (३६ गुण)',
      remedies: 'शास्त्रोक्त उपाय व मंत्र',
      journal: 'दशा जीवन डायरी',
      learn: 'ज्योतिष सीखें',
      simpleMode: 'सरल मोड',
      proMode: 'विद्वान / प्रो मोड',
      switchMode: 'मोड बदलें',
    },
    dashboard: {
      heroTitle: 'वैदिक जीवन अवलोकन',
      heroSubtitle: 'खगोलीय गणनाओं पर आधारित सटीक पंचांग, जन्मकुंडली और महादशा मार्गदर्शन।',
      currentChapter: 'वर्तमान जीवन अध्याय (दशा)',
      lifeChapterDesc: 'आपके जीवन का मुख्य प्रवाह जो वर्तमान ग्रह दशा द्वारा संचालित है।',
      todayVibe: 'आज का ज्योतिषीय प्रभाव',
      activeChoghadiya: 'सक्रिय चौघड़िया',
      timeRemaining: 'शेष समय',
      rahuKaalAlert: 'राहुकाल चेतावनी',
      muhuratWindow: 'शुभ मुहूर्त समय',
      viewFullChart: 'संपूर्ण कुंडली देखें',
      viewDashaDetails: 'अंतरदशा विवरण',
      remedyRecommendation: 'आज का अनुशंसित उपाय',
    },
    chart: {
      northIndian: 'उत्तर भारतीय (हीरा चक्र)',
      southIndian: 'दक्षिण भारतीय (चौकोर)',
      eastIndian: 'पूर्वी भारतीय चक्र',
      ascendant: 'लग्न (प्रथम भाव)',
      sign: 'राशि',
      degree: 'सटीक अंश',
      nakshatra: 'नक्षत्र',
      pada: 'चरण',
      dignity: 'ग्रह स्थिति / बल',
      retrograde: 'वक्री (R)',
      combust: 'अस्त (Combust)',
      speed: 'दैनिक गति',
      shadbala: 'षड्बल (६-स्तरीय ग्रह बल)',
      ashtakavarga: 'अष्टकवर्ग (सर्वाष्टक/भिन्नाष्टक)',
      divisionalCharts: 'वर्ग कुंडलियां (D1-D60)',
      exportPdf: 'विस्तृत कुंडली PDF डाउनलोड',
    },
    dasha: {
      title: 'विंशोत्तरी महादशा चक्र',
      subtitle: 'जन्म समय चंद्र नक्षत्र के आधार पर १२० वर्षीय सटीक अनुपातिक दशा विभाजन।',
      mahadasha: 'महादशा',
      antardasha: 'अंतरदशा',
      pratyantardasha: 'प्रत्यंतर दशा',
      sookshmaDasha: 'सूक्ष्म दशा',
      balanceAtBirth: 'जन्म समय दशा शेष',
      currentRunning: 'वर्तमान सक्रिय काल',
      daysLeft: 'दिन शेष',
      progress: 'दशा अवधि पूर्ण',
    },
    panchang: {
      tithi: 'तिथि',
      nakshatra: 'नक्षत्र',
      yoga: 'योग',
      karana: 'करण',
      vara: 'वार (दिन)',
      hinduMonth: 'मास एवं विक्रम संवत्',
      sunrise: 'सूर्योदय',
      sunset: 'सूर्यास्त',
      brahmaMuhurta: 'ब्रह्म मुहूर्त',
      abhijitMuhurta: 'अभिजित मुहूर्त',
      rahuKaal: 'राहुकाल',
      yamaganda: 'यमगण्ड',
      gulikaKaal: 'गुलिक काल',
    },
    numerology: {
      title: 'वैदिक एवं पाश्चात्य अंक ज्योतिष',
      mulank: 'मूलांक (जन्म संख्या)',
      bhagyank: 'भाग्यांक (भाग्य संख्या)',
      namank: 'नामांक (नाम संख्या)',
      lifePath: 'लाइफ पाथ नंबर',
      luckyNumbers: 'शुभ अंक',
      luckyColors: 'शुभ रंग',
      chartCrossReference: 'कुंडली ग्रह सामंजस्य',
    },
    gunaMilan: {
      title: 'अष्टकूट ३६ गुण मिलान',
      boyDetails: 'वर चंद्र कुंडली विवरण',
      girlDetails: 'कन्या चंद्र कुंडली विवरण',
      totalGunas: 'प्राप्त गुण',
      verdict: 'मिलान निर्णय',
      nadiDosha: 'नाड़ी दोष',
      bhakootDosha: 'भकूट दोष',
    },
    journal: {
      title: 'दशा जीवन डायरी',
      newEntry: 'नया जीवन प्रसंग दर्ज करें',
      eventDate: 'घटना दिनांक',
      eventCategory: 'श्रेणी (करियर, विवाह, यात्रा, स्वास्थ्य)',
      tagWithDasha: 'संबद्ध दशा काल',
      notes: 'व्यक्तिगत टिप्पणी व अनुभव',
      save: 'डायरी में सुरक्षित करें',
    },
  },
  hinglish: {
    nav: {
      todayPanchang: 'Today Panchang',
      birthChart: 'Kundali Chart',
      dashaTimeline: 'Dasha Timeline',
      numerology: 'Numerology',
      matchmaking: 'Guna Milan',
      remedies: 'Remedies & Mantras',
      journal: 'Life Dasha Journal',
      learn: 'Learn Jyotish',
      simpleMode: 'Simple Mode',
      proMode: 'Pro Astrologer',
      switchMode: 'Switch Mode',
    },
    dashboard: {
      heroTitle: 'Aapka Vedic Life Dashboard',
      heroSubtitle: 'Exact astronomical calculations ke sath live panchang, birth chart aur dasha insights.',
      currentChapter: 'Current Life Chapter',
      lifeChapterDesc: 'Abhi jo planetary dasha run kar rahi hai aur aapki life ko direct kar rahi hai.',
      todayVibe: 'Aaj Ka Overall Cosmic Vibe',
      activeChoghadiya: 'Active Choghadiya',
      timeRemaining: 'Time Bacha Hai',
      rahuKaalAlert: 'Rahu Kaal Warning',
      muhuratWindow: 'Best Shubh Window',
      viewFullChart: 'Full Kundali Check Karein',
      viewDashaDetails: 'Sub-period Details',
      remedyRecommendation: 'Recommended Daily Remedy',
    },
    chart: {
      northIndian: 'North Indian Diamond',
      southIndian: 'South Indian Square',
      eastIndian: 'East Indian',
      ascendant: 'Lagna (Ascendant)',
      sign: 'Rashi',
      degree: 'Exact Degree',
      nakshatra: 'Nakshatra',
      pada: 'Pada',
      dignity: 'Planet Dignity',
      retrograde: 'Vakri (Retrograde)',
      combust: 'Asta (Combust)',
      speed: 'Daily Speed',
      shadbala: '6-Fold Shadbala Strength',
      ashtakavarga: 'Ashtakavarga Tables (SAV/BAV)',
      divisionalCharts: 'Divisional Charts (D1-D60)',
      exportPdf: 'Download Full PDF Report',
    },
    dasha: {
      title: 'Vimshottari Dasha Engine',
      subtitle: 'Moon ke birth Nakshatra se exact 120-year recursive period timeline.',
      mahadasha: 'Mahadasha',
      antardasha: 'Antardasha',
      pratyantardasha: 'Pratyantardasha',
      sookshmaDasha: 'Sookshma Dasha',
      balanceAtBirth: 'Balance at Birth',
      currentRunning: 'Currently Running Period',
      daysLeft: 'days bache hain',
      progress: 'Time Completed',
    },
    panchang: {
      tithi: 'Tithi',
      nakshatra: 'Nakshatra',
      yoga: 'Yoga',
      karana: 'Karana',
      vara: 'Day (Vara)',
      hinduMonth: 'Hindu Month & Samvat',
      sunrise: 'Sunrise',
      sunset: 'Sunset',
      brahmaMuhurta: 'Brahma Muhurta',
      abhijitMuhurta: 'Abhijit Muhurta',
      rahuKaal: 'Rahu Kaal',
      yamaganda: 'Yamaganda',
      gulikaKaal: 'Gulika Kaal',
    },
    numerology: {
      title: 'Vedic & Western Numerology',
      mulank: 'Mulank (Birth Number)',
      bhagyank: 'Bhagyank (Destiny Number)',
      namank: 'Namank (Name Number)',
      lifePath: 'Life Path Number',
      luckyNumbers: 'Lucky Numbers',
      luckyColors: 'Lucky Colors',
      chartCrossReference: 'Chart Synthesis with Number Lord',
    },
    gunaMilan: {
      title: 'Ashtakoota 36 Guna Milan',
      boyDetails: "Groom's Moon Details",
      girlDetails: "Bride's Moon Details",
      totalGunas: 'Total Matched Gunas',
      verdict: 'Final Match Verdict',
      nadiDosha: 'Nadi Dosha',
      bhakootDosha: 'Bhakoot Dosha',
    },
    journal: {
      title: 'Life-Event Dasha Journal',
      newEntry: 'Log Life Event',
      eventDate: 'Date of Event',
      eventCategory: 'Category (Job, Relationship, Move, Health)',
      tagWithDasha: 'Tagged Dasha Period',
      notes: 'Personal Note & Reflection',
      save: 'Save to Timeline',
    },
  },
};
