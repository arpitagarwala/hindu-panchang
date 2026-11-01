/**
 * Location-Aware Day & Night Choghadiya and Muhurat Engine
 * Computes 8 day & 8 night Choghadiya segments with live active indicator.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SunCalc = require('suncalc');

export type ChoghadiyaType = 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';

export interface ChoghadiyaMeta {
  type: ChoghadiyaType;
  sanskrit: string;
  quality: 'Excellent' | 'Good' | 'Neutral' | 'Bad' | 'Worst';
  isAuspicious: boolean;
  color: string;
  ruler: string;
  suitableFor: {
    en: string;
    hi: string;
    hinglish: string;
  };
}

export const CHOGHADIYA_DEFINITIONS: Record<ChoghadiyaType, ChoghadiyaMeta> = {
  Amrit: {
    type: 'Amrit',
    sanskrit: 'अमृत',
    quality: 'Excellent',
    isAuspicious: true,
    color: '#10b981', // green
    ruler: 'Moon',
    suitableFor: {
      en: 'All auspicious tasks, signing contracts, travel, medical treatments.',
      hi: 'सभी शुभ कार्य, व्यापार आरंभ, अनुबंध हस्ताक्षर, यात्रा व औषधि सेवन।',
      hinglish: 'Sabhi auspicious works, new beginnings, contract sign karna aur travel.',
    },
  },
  Shubh: {
    type: 'Shubh',
    sanskrit: 'शुभ',
    quality: 'Good',
    isAuspicious: true,
    color: '#059669',
    ruler: 'Jupiter',
    suitableFor: {
      en: 'Religious ceremonies, marriage talks, financial investments, purchases.',
      hi: 'मांगलिक कार्य, विवाह वार्ता, धन निवेश, नए सामान की खरीदारी।',
      hinglish: 'Pooja, investments, property deals aur family ceremonies ke liye best.',
    },
  },
  Labh: {
    type: 'Labh',
    sanskrit: 'लाभ',
    quality: 'Good',
    isAuspicious: true,
    color: '#0284c7',
    ruler: 'Mercury',
    suitableFor: {
      en: 'Starting new business, financial transactions, education, career moves.',
      hi: 'नवीन व्यापार शुभारंभ, वित्तीय लेन-देन, विद्यारंभ व व्यावसायिक वार्ता।',
      hinglish: 'Business launch, study/exam prep, payments receive karna aur deals.',
    },
  },
  Char: {
    type: 'Char',
    sanskrit: 'चर',
    quality: 'Neutral',
    isAuspicious: true,
    color: '#f59e0b',
    ruler: 'Venus',
    suitableFor: {
      en: 'Journeys, vehicle driving, electronic purchases, dynamic activities.',
      hi: 'यात्रा, वाहन चालन/क्रय, गतिशील कार्य व इलेक्ट्रॉनिक वस्तुओं की खरीद।',
      hinglish: 'Travel, driving, gadget purchase aur moving around ke works.',
    },
  },
  Rog: {
    type: 'Rog',
    sanskrit: 'रोग',
    quality: 'Bad',
    isAuspicious: false,
    color: '#ef4444',
    ruler: 'Mars',
    suitableFor: {
      en: 'Inauspicious. Avoid starting new ventures or health decisions.',
      hi: 'अशुभ। नए कार्य, शल्यक्रिया या महत्वपूर्ण निर्णय टालें।',
      hinglish: 'Challenging time. New work start mat karo, argument avoid karo.',
    },
  },
  Kaal: {
    type: 'Kaal',
    sanskrit: 'काल',
    quality: 'Worst',
    isAuspicious: false,
    color: '#991b1b',
    ruler: 'Saturn',
    suitableFor: {
      en: 'Highly inauspicious. Strictly avoid all auspicious undertakings.',
      hi: 'अत्यंत अशुभ। कोई भी महत्वपूर्ण अथवा मांगलिक कार्य न करें।',
      hinglish: 'Inauspicious window. Koi bhi important transaction ya journey postpone karein.',
    },
  },
  Udveg: {
    type: 'Udveg',
    sanskrit: 'उद्वेग',
    quality: 'Bad',
    isAuspicious: false,
    color: '#f97316',
    ruler: 'Sun',
    suitableFor: {
      en: 'Causes anxiety. Avoid government dealings and major commitments.',
      hi: 'चिंताकारक। प्रशासनिक कार्यों और महत्वपूर्ण वादों से बचें।',
      hinglish: 'Mental stress create ho sakta hai. Important decisions pause rakhein.',
    },
  },
};

// Day sequences indexed by weekday (0=Sun .. 6=Sat)
const DAY_CHOGHADIYA_ORDER: ChoghadiyaType[][] = [
  ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'], // Sun
  ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'], // Mon
  ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'], // Tue
  ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'], // Wed
  ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'], // Thu
  ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'], // Fri
  ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'], // Sat
];

// Night sequences indexed by weekday (0=Sun .. 6=Sat)
const NIGHT_CHOGHADIYA_ORDER: ChoghadiyaType[][] = [
  ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'], // Sun
  ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'], // Mon
  ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'], // Tue
  ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'], // Wed
  ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'], // Thu
  ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'], // Fri
  ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'], // Sat
];

export interface ChoghadiyaSlot {
  slotNumber: number; // 1-8
  isDay: boolean;
  type: ChoghadiyaType;
  meta: ChoghadiyaMeta;
  start: string; // ISO
  end: string; // ISO
  startFormatted: string; // "06:15 AM"
  endFormatted: string; // "07:45 AM"
  isActive: boolean;
  timeRemainingMinutes: number;
}

export interface ChoghadiyaResult {
  date: string;
  daySlots: ChoghadiyaSlot[];
  nightSlots: ChoghadiyaSlot[];
  activeSlot: ChoghadiyaSlot;
  nextAuspiciousSlot: ChoghadiyaSlot | null;
  sunrise: string;
  sunset: string;
}

import { formatTime12, ensureValidDate } from '../utils/format';

function formatTime(date: Date): string {
  return formatTime12(date);
}

/**
 * Computes Day and Night Choghadiya for date & coordinates
 */
export function calculateChoghadiya(date: Date, lat: number, lon: number): ChoghadiyaResult {
  const d = ensureValidDate(date);
  const targetTime = d.getTime();
  const times = SunCalc.getTimes(d, lat, lon);

  const defaultSunrise = new Date(d);
  defaultSunrise.setHours(6, 0, 0, 0);
  const defaultSunset = new Date(d);
  defaultSunset.setHours(18, 0, 0, 0);

  const sunrise = (times.sunrise && !isNaN(times.sunrise.getTime())) ? times.sunrise : defaultSunrise;
  const sunset = (times.sunset && !isNaN(times.sunset.getTime())) ? times.sunset : defaultSunset;

  // Next day sunrise for night choghadiya span
  const tomorrow = new Date(d.getTime() + 86400000);
  const tomorrowTimes = SunCalc.getTimes(tomorrow, lat, lon);
  const defaultNextSunrise = new Date(tomorrow);
  defaultNextSunrise.setHours(6, 0, 0, 0);
  const nextSunrise = (tomorrowTimes.sunrise && !isNaN(tomorrowTimes.sunrise.getTime()))
    ? tomorrowTimes.sunrise
    : defaultNextSunrise;

  const weekday = d.getDay(); // 0=Sun .. 6=Sat
  const daySequence = DAY_CHOGHADIYA_ORDER[weekday];
  const nightSequence = NIGHT_CHOGHADIYA_ORDER[weekday];

  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  const daySlotDurationMs = dayDurationMs / 8;

  const nightDurationMs = nextSunrise.getTime() - sunset.getTime();
  const nightSlotDurationMs = nightDurationMs / 8;

  const daySlots: ChoghadiyaSlot[] = [];
  const nightSlots: ChoghadiyaSlot[] = [];
  let activeSlot: ChoghadiyaSlot | null = null;
  let nextAuspiciousSlot: ChoghadiyaSlot | null = null;

  // Build 8 Day Slots
  for (let i = 0; i < 8; i++) {
    const slotStart = new Date(sunrise.getTime() + i * daySlotDurationMs);
    const slotEnd = new Date(slotStart.getTime() + daySlotDurationMs);
    const type = daySequence[i];
    const meta = CHOGHADIYA_DEFINITIONS[type];
    const isActive = targetTime >= slotStart.getTime() && targetTime < slotEnd.getTime();
    const remainingMin = Math.max(0, Math.round((slotEnd.getTime() - targetTime) / 60000));

    const slot: ChoghadiyaSlot = {
      slotNumber: i + 1,
      isDay: true,
      type,
      meta,
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      startFormatted: formatTime(slotStart),
      endFormatted: formatTime(slotEnd),
      isActive,
      timeRemainingMinutes: isActive ? remainingMin : 0,
    };

    if (isActive) activeSlot = slot;
    if (!nextAuspiciousSlot && slotStart.getTime() > targetTime && meta.isAuspicious) {
      nextAuspiciousSlot = slot;
    }

    daySlots.push(slot);
  }

  // Build 8 Night Slots
  for (let i = 0; i < 8; i++) {
    const slotStart = new Date(sunset.getTime() + i * nightSlotDurationMs);
    const slotEnd = new Date(slotStart.getTime() + nightSlotDurationMs);
    const type = nightSequence[i];
    const meta = CHOGHADIYA_DEFINITIONS[type];
    const isActive = targetTime >= slotStart.getTime() && targetTime < slotEnd.getTime();
    const remainingMin = Math.max(0, Math.round((slotEnd.getTime() - targetTime) / 60000));

    const slot: ChoghadiyaSlot = {
      slotNumber: i + 1,
      isDay: false,
      type,
      meta,
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      startFormatted: formatTime(slotStart),
      endFormatted: formatTime(slotEnd),
      isActive,
      timeRemainingMinutes: isActive ? remainingMin : 0,
    };

    if (isActive) activeSlot = slot;
    if (!nextAuspiciousSlot && slotStart.getTime() > targetTime && meta.isAuspicious) {
      nextAuspiciousSlot = slot;
    }

    nightSlots.push(slot);
  }

  if (!activeSlot) {
    activeSlot = daySlots[0];
  }

  return {
    date: date.toISOString(),
    daySlots,
    nightSlots,
    activeSlot,
    nextAuspiciousSlot,
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
  };
}
