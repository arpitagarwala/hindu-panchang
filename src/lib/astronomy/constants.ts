/**
 * Vedic Astrology Astronomical & Shastra Constants
 */

export interface PlanetDef {
  id: string;
  name: string;
  sanskrit: string;
  symbol: string;
  glyph: string;
  lordOf: number[]; // 1-indexed Rashi numbers (1=Aries .. 12=Pisces)
  exaltationSign: number; // 1-12
  exaltationDegree: number; // 0-30 deg inside the sign
  debilitationSign: number; // 1-12
  debilitationDegree: number; // 0-30 deg inside the sign
  moolatrikonaSign: number;
  moolatrikonaDegrees: [number, number]; // [start, end]
  friends: string[];
  neutrals: string[];
  enemies: string[];
  gemstone: string;
  color: string;
  dayOfWeek: number; // 0=Sun .. 6=Sat
  element: 'Fire' | 'Earth' | 'Air' | 'Water' | 'Ether';
  gender: 'Male' | 'Female' | 'Neutral';
  gunas: 'Sattva' | 'Rajas' | 'Tamas';
}

export const PLANETS: Record<string, PlanetDef> = {
  Sun: {
    id: 'Sun',
    name: 'Sun',
    sanskrit: 'Surya',
    symbol: '☉',
    glyph: 'Su',
    lordOf: [5], // Leo
    exaltationSign: 1, // Aries 10°
    exaltationDegree: 10,
    debilitationSign: 7, // Libra 10°
    debilitationDegree: 10,
    moolatrikonaSign: 5, // Leo 0°-20°
    moolatrikonaDegrees: [0, 20],
    friends: ['Moon', 'Mars', 'Jupiter'],
    neutrals: ['Mercury'],
    enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu'],
    gemstone: 'Ruby (Manik)',
    color: '#e11d48',
    dayOfWeek: 0,
    element: 'Fire',
    gender: 'Male',
    gunas: 'Sattva',
  },
  Moon: {
    id: 'Moon',
    name: 'Moon',
    sanskrit: 'Chandra',
    symbol: '☽',
    glyph: 'Mo',
    lordOf: [4], // Cancer
    exaltationSign: 2, // Taurus 3°
    exaltationDegree: 3,
    debilitationSign: 8, // Scorpio 3°
    debilitationDegree: 3,
    moolatrikonaSign: 2, // Taurus 3°-30°
    moolatrikonaDegrees: [3, 30],
    friends: ['Sun', 'Mercury'],
    neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
    enemies: ['Rahu', 'Ketu'],
    gemstone: 'Pearl (Moti)',
    color: '#38bdf8',
    dayOfWeek: 1,
    element: 'Water',
    gender: 'Female',
    gunas: 'Sattva',
  },
  Mars: {
    id: 'Mars',
    name: 'Mars',
    sanskrit: 'Mangal',
    symbol: '♂',
    glyph: 'Ma',
    lordOf: [1, 8], // Aries, Scorpio
    exaltationSign: 10, // Capricorn 28°
    exaltationDegree: 28,
    debilitationSign: 4, // Cancer 28°
    debilitationDegree: 28,
    moolatrikonaSign: 1, // Aries 0°-12°
    moolatrikonaDegrees: [0, 12],
    friends: ['Sun', 'Moon', 'Jupiter'],
    neutrals: ['Venus', 'Saturn'],
    enemies: ['Mercury', 'Rahu', 'Ketu'],
    gemstone: 'Red Coral (Moonga)',
    color: '#ef4444',
    dayOfWeek: 2,
    element: 'Fire',
    gender: 'Male',
    gunas: 'Tamas',
  },
  Mercury: {
    id: 'Mercury',
    name: 'Mercury',
    sanskrit: 'Budha',
    symbol: '☿',
    glyph: 'Me',
    lordOf: [3, 6], // Gemini, Virgo
    exaltationSign: 6, // Virgo 15°
    exaltationDegree: 15,
    debilitationSign: 12, // Pisces 15°
    debilitationDegree: 15,
    moolatrikonaSign: 6, // Virgo 15°-20°
    moolatrikonaDegrees: [15, 20],
    friends: ['Sun', 'Venus'],
    neutrals: ['Mars', 'Jupiter', 'Saturn'],
    enemies: ['Moon'],
    gemstone: 'Emerald (Panna)',
    color: '#10b981',
    dayOfWeek: 3,
    element: 'Earth',
    gender: 'Neutral',
    gunas: 'Rajas',
  },
  Jupiter: {
    id: 'Jupiter',
    name: 'Jupiter',
    sanskrit: 'Guru',
    symbol: '♃',
    glyph: 'Ju',
    lordOf: [9, 12], // Sagittarius, Pisces
    exaltationSign: 4, // Cancer 5°
    exaltationDegree: 5,
    debilitationSign: 10, // Capricorn 5°
    debilitationDegree: 5,
    moolatrikonaSign: 9, // Sagittarius 0°-10°
    moolatrikonaDegrees: [0, 10],
    friends: ['Sun', 'Moon', 'Mars'],
    neutrals: ['Saturn'],
    enemies: ['Mercury', 'Venus'],
    gemstone: 'Yellow Sapphire (Pukhraj)',
    color: '#f59e0b',
    dayOfWeek: 4,
    element: 'Ether',
    gender: 'Male',
    gunas: 'Sattva',
  },
  Venus: {
    id: 'Venus',
    name: 'Venus',
    sanskrit: 'Shukra',
    symbol: '♀',
    glyph: 'Ve',
    lordOf: [2, 7], // Taurus, Libra
    exaltationSign: 12, // Pisces 27°
    exaltationDegree: 27,
    debilitationSign: 6, // Virgo 27°
    debilitationDegree: 27,
    moolatrikonaSign: 7, // Libra 0°-15°
    moolatrikonaDegrees: [0, 15],
    friends: ['Mercury', 'Saturn', 'Rahu', 'Ketu'],
    neutrals: ['Mars', 'Jupiter'],
    enemies: ['Sun', 'Moon'],
    gemstone: 'Diamond (Heera / Opal)',
    color: '#ec4899',
    dayOfWeek: 5,
    element: 'Water',
    gender: 'Female',
    gunas: 'Rajas',
  },
  Saturn: {
    id: 'Saturn',
    name: 'Saturn',
    sanskrit: 'Shani',
    symbol: '♄',
    glyph: 'Sa',
    lordOf: [10, 11], // Capricorn, Aquarius
    exaltationSign: 7, // Libra 20°
    exaltationDegree: 20,
    debilitationSign: 1, // Aries 20°
    debilitationDegree: 20,
    moolatrikonaSign: 11, // Aquarius 0°-20°
    moolatrikonaDegrees: [0, 20],
    friends: ['Mercury', 'Venus', 'Rahu', 'Ketu'],
    neutrals: ['Jupiter'],
    enemies: ['Sun', 'Moon', 'Mars'],
    gemstone: 'Blue Sapphire (Neelam)',
    color: '#6366f1',
    dayOfWeek: 6,
    element: 'Air',
    gender: 'Neutral',
    gunas: 'Tamas',
  },
  Rahu: {
    id: 'Rahu',
    name: 'Rahu',
    sanskrit: 'Rahu (North Node)',
    symbol: '☊',
    glyph: 'Ra',
    lordOf: [11], // Aquarius co-lord
    exaltationSign: 2, // Taurus
    exaltationDegree: 20,
    debilitationSign: 8, // Scorpio
    debilitationDegree: 20,
    moolatrikonaSign: 3, // Gemini
    moolatrikonaDegrees: [0, 30],
    friends: ['Venus', 'Saturn', 'Mercury'],
    neutrals: ['Jupiter'],
    enemies: ['Sun', 'Moon', 'Mars'],
    gemstone: 'Hessonite Garnet (Gomed)',
    color: '#8b5cf6',
    dayOfWeek: -1,
    element: 'Air',
    gender: 'Neutral',
    gunas: 'Tamas',
  },
  Ketu: {
    id: 'Ketu',
    name: 'Ketu',
    sanskrit: 'Ketu (South Node)',
    symbol: '☋',
    glyph: 'Ke',
    lordOf: [8], // Scorpio co-lord
    exaltationSign: 8, // Scorpio
    exaltationDegree: 20,
    debilitationSign: 2, // Taurus
    debilitationDegree: 20,
    moolatrikonaSign: 9, // Sagittarius
    moolatrikonaDegrees: [0, 30],
    friends: ['Mars', 'Venus', 'Saturn'],
    neutrals: ['Mercury', 'Jupiter'],
    enemies: ['Sun', 'Moon'],
    gemstone: "Cat's Eye (Lehsuniya)",
    color: '#14b8a6',
    dayOfWeek: -1,
    element: 'Fire',
    gender: 'Neutral',
    gunas: 'Tamas',
  },
};

export interface ZodiacSignDef {
  number: number; // 1-12
  name: string;
  sanskrit: string;
  lord: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  mobility: 'Chara (Movable)' | 'Sthira (Fixed)' | 'Dwisvabhava (Dual)';
  gender: 'Male' | 'Female';
  symbol: string;
}

export const ZODIAC_SIGNS: ZodiacSignDef[] = [
  { number: 1, name: 'Aries', sanskrit: 'Mesha', lord: 'Mars', element: 'Fire', mobility: 'Chara (Movable)', gender: 'Male', symbol: '♈' },
  { number: 2, name: 'Taurus', sanskrit: 'Vrishabha', lord: 'Venus', element: 'Earth', mobility: 'Sthira (Fixed)', gender: 'Female', symbol: '♉' },
  { number: 3, name: 'Gemini', sanskrit: 'Mithuna', lord: 'Mercury', element: 'Air', mobility: 'Dwisvabhava (Dual)', gender: 'Male', symbol: '♊' },
  { number: 4, name: 'Cancer', sanskrit: 'Karka', lord: 'Moon', element: 'Water', mobility: 'Chara (Movable)', gender: 'Female', symbol: '♋' },
  { number: 5, name: 'Leo', sanskrit: 'Simha', lord: 'Sun', element: 'Fire', mobility: 'Sthira (Fixed)', gender: 'Male', symbol: '♌' },
  { number: 6, name: 'Virgo', sanskrit: 'Kanya', lord: 'Mercury', element: 'Earth', mobility: 'Dwisvabhava (Dual)', gender: 'Female', symbol: '♍' },
  { number: 7, name: 'Libra', sanskrit: 'Tula', lord: 'Venus', element: 'Air', mobility: 'Chara (Movable)', gender: 'Male', symbol: '♎' },
  { number: 8, name: 'Scorpio', sanskrit: 'Vrishchika', lord: 'Mars', element: 'Water', mobility: 'Sthira (Fixed)', gender: 'Female', symbol: '♏' },
  { number: 9, name: 'Sagittarius', sanskrit: 'Dhanu', lord: 'Jupiter', element: 'Fire', mobility: 'Dwisvabhava (Dual)', gender: 'Male', symbol: '♐' },
  { number: 10, name: 'Capricorn', sanskrit: 'Makara', lord: 'Saturn', element: 'Earth', mobility: 'Chara (Movable)', gender: 'Female', symbol: '♑' },
  { number: 11, name: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn', element: 'Air', mobility: 'Sthira (Fixed)', gender: 'Male', symbol: '♒' },
  { number: 12, name: 'Pisces', sanskrit: 'Meena', lord: 'Jupiter', element: 'Water', mobility: 'Dwisvabhava (Dual)', gender: 'Female', symbol: '♓' },
];

export interface NakshatraDef {
  number: number; // 1-27
  name: string;
  sanskrit: string;
  lord: string; // Vimshottari Dasha Lord
  deity: string;
  symbol: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: string;
  nadi: 'Adi' | 'Madhya' | 'Antya';
  varna: 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
  vashya: 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanachara' | 'Keeta';
  syllables: [string, string, string, string]; // Padas 1, 2, 3, 4
}

export const NAKSHATRAS: NakshatraDef[] = [
  { number: 1, name: 'Ashwini', sanskrit: 'Aśvinī', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: "Horse's head", gana: 'Deva', yoni: 'Horse', nadi: 'Adi', varna: 'Vaishya', vashya: 'Chatushpada', syllables: ['Chu', 'Che', 'Cho', 'La'] },
  { number: 2, name: 'Bharani', sanskrit: 'Bharaṇī', lord: 'Venus', deity: 'Yama', symbol: 'Yoni / Vagina', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', varna: 'Shudra', vashya: 'Manava', syllables: ['Li', 'Lu', 'Le', 'Lo'] },
  { number: 3, name: 'Krittika', sanskrit: 'Kṛttikā', lord: 'Sun', deity: 'Agni', symbol: 'Razor / Flame', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya', varna: 'Brahmin', vashya: 'Chatushpada', syllables: ['A', 'I', 'U', 'E'] },
  { number: 4, name: 'Rohini', sanskrit: 'Rohiṇī', lord: 'Moon', deity: 'Brahma', symbol: 'Chariot / Temple', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya', varna: 'Shudra', vashya: 'Chatushpada', syllables: ['O', 'Va', 'Vi', 'Vu'] },
  { number: 5, name: 'Mrigashirsha', sanskrit: 'Mṛgaśīrṣā', lord: 'Mars', deity: 'Soma', symbol: "Deer's head", gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya', varna: 'Vaishya', vashya: 'Chatushpada', syllables: ['Ve', 'Vo', 'Ka', 'Ki'] },
  { number: 6, name: 'Ardra', sanskrit: 'Ārdrā', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop / Diamond', gana: 'Manushya', yoni: 'Dog', nadi: 'Adi', varna: 'Shudra', vashya: 'Manava', syllables: ['Ku', 'Gha', 'Nga', 'Chha'] },
  { number: 7, name: 'Punarvasu', sanskrit: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow & Quiver', gana: 'Deva', yoni: 'Cat', nadi: 'Adi', varna: 'Vaishya', vashya: 'Manava', syllables: ['Ke', 'Ko', 'Ha', 'Hi'] },
  { number: 8, name: 'Pushya', sanskrit: 'Puṣya', lord: 'Saturn', deity: 'Brihaspati', symbol: "Cow's udder / Flower", gana: 'Deva', yoni: 'Sheep', nadi: 'Madhya', varna: 'Kshatriya', vashya: 'Jalachara', syllables: ['Hu', 'He', 'Ho', 'Da'] },
  { number: 9, name: 'Ashlesha', sanskrit: 'Āśleṣā', lord: 'Mercury', deity: 'Sarpas / Nagas', symbol: 'Coiled serpent', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya', varna: 'Shudra', vashya: 'Keeta', syllables: ['De', 'Du', 'De', 'Do'] },
  { number: 10, name: 'Magha', sanskrit: 'Maghā', lord: 'Ketu', deity: 'Pitris (Ancestors)', symbol: 'Royal Throne', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya', varna: 'Shudra', vashya: 'Vanachara', syllables: ['Ma', 'Mi', 'Mu', 'Me'] },
  { number: 11, name: 'Purva Phalguni', sanskrit: 'Pūrva Phalgunī', lord: 'Venus', deity: 'Bhaga', symbol: 'Front legs of bed / Hammock', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya', varna: 'Brahmin', vashya: 'Manava', syllables: ['Mo', 'Ta', 'Ti', 'Tu'] },
  { number: 12, name: 'Uttara Phalguni', sanskrit: 'Uttara Phalgunī', lord: 'Sun', deity: 'Aryaman', symbol: 'Back legs of bed', gana: 'Manushya', yoni: 'Cow', nadi: 'Adi', varna: 'Kshatriya', vashya: 'Manava', syllables: ['Te', 'To', 'Pa', 'Pi'] },
  { number: 13, name: 'Hasta', sanskrit: 'Hasta', lord: 'Moon', deity: 'Savitr', symbol: 'Open Hand / Fist', gana: 'Deva', yoni: 'Buffalo', nadi: 'Adi', varna: 'Vaishya', vashya: 'Manava', syllables: ['Pu', 'Sha', 'Na', 'Tha'] },
  { number: 14, name: 'Chitra', sanskrit: 'Citrā', lord: 'Mars', deity: 'Tvashtar / Vishvakarma', symbol: 'Bright Jewel / Pearl', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya', varna: 'Shudra', vashya: 'Manava', syllables: ['Pe', 'Po', 'Ra', 'Ri'] },
  { number: 15, name: 'Swati', sanskrit: 'Svātī', lord: 'Rahu', deity: 'Vayu', symbol: 'Young sprout / Coral', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya', varna: 'Shudra', vashya: 'Manava', syllables: ['Ru', 'Re', 'Ro', 'Ta'] },
  { number: 16, name: 'Vishakha', sanskrit: 'Viśākhā', lord: 'Jupiter', deity: 'Indragni', symbol: 'Triumphal Arch / Potter wheel', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya', varna: 'Brahmin', vashya: 'Manava', syllables: ['Ti', 'Tu', 'Te', 'To'] },
  { number: 17, name: 'Anuradha', sanskrit: 'Anurādhā', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus / Staff', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya', varna: 'Shudra', vashya: 'Manava', syllables: ['Na', 'Ni', 'Nu', 'Ne'] },
  { number: 18, name: 'Jyeshtha', sanskrit: 'Jyeṣṭhā', lord: 'Mercury', deity: 'Indra', symbol: 'Circular Amulet / Umbrella', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Adi', varna: 'Vaishya', vashya: 'Keeta', syllables: ['No', 'Ya', 'Yi', 'Yu'] },
  { number: 19, name: 'Mula', sanskrit: 'Mūla', lord: 'Ketu', deity: 'Nirriti', symbol: 'Tied roots / Lion tail', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Adi', varna: 'Shudra', vashya: 'Vanachara', syllables: ['Ye', 'Yo', 'Bha', 'Bhi'] },
  { number: 20, name: 'Purva Ashadha', sanskrit: 'Pūrvāṣāḍhā', lord: 'Venus', deity: 'Apas (Water)', symbol: "Elephant's tusk / Winnowing fan", gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya', varna: 'Brahmin', vashya: 'Manava', syllables: ['Bhu', 'Dha', 'Pha', 'Dha'] },
  { number: 21, name: 'Uttara Ashadha', sanskrit: 'Uttarāṣāḍhā', lord: 'Sun', deity: 'Vishvedevas', symbol: 'Small Cot / Elephant tusk', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya', varna: 'Kshatriya', vashya: 'Manava', syllables: ['Bhe', 'Bho', 'Ja', 'Ji'] },
  { number: 22, name: 'Shravana', sanskrit: 'Śravaṇa', lord: 'Moon', deity: 'Vishnu', symbol: 'Ear / Three footprints', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya', varna: 'Shudra', vashya: 'Manava', syllables: ['Khi', 'Khu', 'Khe', 'Kho'] },
  { number: 23, name: 'Dhanishtha', sanskrit: 'Dhaniṣṭhā', lord: 'Mars', deity: 'Ashta Vasus', symbol: 'Drum (Damaru) / Flute', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya', varna: 'Vaishya', vashya: 'Chatushpada', syllables: ['Ga', 'Gi', 'Gu', 'Ge'] },
  { number: 24, name: 'Shatabhisha', sanskrit: 'Śatabhiṣaj', lord: 'Rahu', deity: 'Varuna', symbol: 'Empty Circle / 100 Flowers', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Adi', varna: 'Shudra', vashya: 'Jalachara', syllables: ['Go', 'Sa', 'Si', 'Su'] },
  { number: 25, name: 'Purva Bhadrapada', sanskrit: 'Pūrva Bhādrapadā', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Two front legs of funeral cot / Sword', gana: 'Manushya', yoni: 'Lion', nadi: 'Adi', varna: 'Brahmin', vashya: 'Manava', syllables: ['Se', 'So', 'Da', 'Di'] },
  { number: 26, name: 'Uttara Bhadrapada', sanskrit: 'Uttara Bhādrapadā', lord: 'Saturn', deity: 'Ahirbudhnya', symbol: 'Two back legs of funeral cot / Snake in water', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya', varna: 'Kshatriya', vashya: 'Jalachara', syllables: ['Du', 'Tha', 'Jha', 'Na'] },
  { number: 27, name: 'Revati', sanskrit: 'Revatī', lord: 'Mercury', deity: 'Pushan', symbol: 'Fish / Pair of fish', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya', varna: 'Shudra', vashya: 'Jalachara', syllables: ['De', 'Do', 'Cha', 'Chi'] },
];

export type AyanamsaType = 'lahiri' | 'raman' | 'kp' | 'yukteshwar' | 'fagan_bradley' | 'tropical';

export const AYANAMSA_OFFSETS: Record<AyanamsaType, { name: string; offset2000: number; speedPerYear: number }> = {
  lahiri: { name: 'Chitrapaksha / Lahiri (Standard)', offset2000: 23.856944, speedPerYear: 50.290966 / 3600 },
  raman: { name: 'B.V. Raman', offset2000: 22.428333, speedPerYear: 50.290966 / 3600 },
  kp: { name: 'Krishnamurti Paddhati (KP)', offset2000: 23.816667, speedPerYear: 50.290966 / 3600 },
  yukteshwar: { name: 'Sri Yukteshwar', offset2000: 21.050000, speedPerYear: 50.290966 / 3600 },
  fagan_bradley: { name: 'Fagan-Bradley (Western Sidereal)', offset2000: 24.743889, speedPerYear: 50.290966 / 3600 },
  tropical: { name: 'Sayana (Tropical / No Ayanamsa)', offset2000: 0, speedPerYear: 0 },
};
