import { Sun, Moon, CalendarDays, Clock3, BookOpen, Bookmark, Flower2, Sparkles, Compass } from 'lucide-react';
import { CITIES_DATABASE, type CityInfo } from '@/lib/geo/cities';
import type { PanchangResult } from '@/lib/panchang';
import { CALENDAR_DEFAULTS, type CalendarOptions } from '@/lib/calendar-options';
export type Section = 'today' | 'calendar' | 'muhurat' | 'festivals' | 'observances' | 'learn' | 'saved';
export type Preferences = CalendarOptions & { city: CityInfo; timeZone: string; language: 'en' | 'hi'; hour24: boolean; simple: boolean; dark: boolean; large: boolean; followLocation?: boolean };
export type SavedDay = { date: string; city: CityInfo; timeZone: string; title: string; calendar?: CalendarOptions };
export const DEFAULT: Preferences = { ...CALENDAR_DEFAULTS, city: CITIES_DATABASE[0], timeZone: 'Asia/Kolkata', language: 'en', hour24: false, simple: false, dark: false, large: false };
export const NAV = [
  { id: 'today' as Section, title: 'Today’s Panchang', hindi: 'आज का पंचांग', icon: Sun },
  { id: 'calendar' as Section, title: 'Hindu Calendar', hindi: 'हिन्दू कैलेंडर', icon: CalendarDays },
  { id: 'muhurat' as Section, title: 'Muhurat & Timings', hindi: 'मुहूर्त और समय', icon: Clock3 },
  { id: 'festivals' as Section, title: 'Festivals & Rituals', hindi: 'पर्व और अनुष्ठान', icon: Sparkles },
  { id: 'observances' as Section, title: 'Vrat & Observances', hindi: 'व्रत और तिथियाँ', icon: Flower2 },
  { id: 'saved' as Section, title: 'My Saved Days', hindi: 'मेरे सहेजे हुए दिन', icon: Bookmark },
  { id: 'learn' as Section, title: 'Learn Panchang', hindi: 'पंचांग सीखें', icon: BookOpen },
];
export const GLOSSARY = [
  { name: 'Tithi', hindiText: 'तिथि सूर्य और चंद्रमा की स्थिति के अंतर से बनती है। चंद्र महीने में ३० तिथियाँ होती हैं। एक तिथि किसी भी समय शुरू या समाप्त हो सकती है, इसलिए वह हमेशा पूरी तारीख के बराबर नहीं होती।', hi: 'तिथि', subtitle: 'The lunar day', text: 'A tithi spans 12° of separation between the Moon and Sun. There are 30 tithis in a lunar month. It can start or end at any time, so it does not always match a calendar day.', icon: Moon },
  { name: 'Nakshatra', hindiText: 'आकाश की नाक्षत्रिक राशि-पट्टी के २७ समान भाग नक्षत्र कहलाते हैं। चंद्रमा जिस भाग में होता है, वही उसका नक्षत्र है।', hi: 'नक्षत्र', subtitle: 'The Moon’s constellation', text: 'The sidereal zodiac is divided into 27 equal lunar mansions. The mansion occupied by the Moon is the current nakshatra. The daily Panchang uses Swiss Ephemeris Lahiri sidereal positions.', icon: Sparkles },
  { name: 'Yoga', hindiText: 'सूर्य और चंद्रमा की नाक्षत्रिक स्थितियों के योग से २७ योग बनते हैं। पंचांग का योग शारीरिक योगाभ्यास से अलग है।', hi: 'योग', subtitle: 'The Sun–Moon combination', text: 'One of 27 divisions determined by the sum of the sidereal longitudes of the Sun and Moon. This Panchang yoga is different from physical yoga practice.', icon: Sun },
  { name: 'Karana', hindiText: 'तिथि का आधा भाग करण कहलाता है। हर तिथि में दो करण होते हैं। सात करण क्रम से दोहराते हैं और चार करण निश्चित स्थानों पर आते हैं।', hi: 'करण', subtitle: 'Half of a lunar day', text: 'Each tithi has two karanas. A karana spans 6° of separation between the Sun and Moon. Seven names repeat through the month, with four fixed karanas at the new moon boundary.', icon: Compass },
  { name: 'Vara', hindiText: 'वार सप्ताह का दिन है। दैनिक पंचांग में चुने हुए स्थान के सूर्योदय के समय के पाँच अंग दिखाए जाते हैं।', hi: 'वार', subtitle: 'The weekday', text: 'Vara is the traditional weekday. The Panchang day is associated with local sunrise. This app displays the five elements at sunrise for the selected civil date and city.', icon: CalendarDays },
];
export const DAY_ORDER = [ ['Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg'], ['Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit'], ['Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh','Rog'], ['Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char','Labh'], ['Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal','Shubh'], ['Char','Labh','Amrit','Kaal','Shubh','Rog','Udveg','Char'], ['Kaal','Shubh','Rog','Udveg','Char','Labh','Amrit','Kaal'] ];
export const NIGHT_ORDER = [ ['Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh'], ['Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char'], ['Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal'], ['Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh','Udveg'], ['Amrit','Char','Rog','Kaal','Labh','Udveg','Shubh','Amrit'], ['Rog','Kaal','Labh','Udveg','Shubh','Amrit','Char','Rog'], ['Labh','Udveg','Shubh','Amrit','Char','Rog','Kaal','Labh'] ];
const ZONES: Record<string, string> = { 'United Kingdom': 'Europe/London', UK: 'Europe/London', USA: 'America/New_York', 'United States': 'America/New_York', Canada: 'America/Toronto', Australia: 'Australia/Sydney', UAE: 'Asia/Dubai', 'United Arab Emirates': 'Asia/Dubai', Singapore: 'Asia/Singapore', Nepal: 'Asia/Kathmandu' };
const CITY_ZONES: Record<string, string> = { 'Los Angeles': 'America/Los_Angeles', 'San Francisco': 'America/Los_Angeles', Chicago: 'America/Chicago', Houston: 'America/Chicago', Dallas: 'America/Chicago', Seattle: 'America/Los_Angeles', Vancouver: 'America/Vancouver', Perth: 'Australia/Perth', Melbourne: 'Australia/Melbourne', Adelaide: 'Australia/Adelaide', Brisbane: 'Australia/Brisbane' };
export function zoneFor(city: CityInfo) {
  if (city.timeZone) return city.timeZone;
  const more: Record<string, string> = { 'New Zealand': 'Pacific/Auckland', Japan: 'Asia/Tokyo', France: 'Europe/Paris', Germany: 'Europe/Berlin', 'Sri Lanka': 'Asia/Colombo', Bangladesh: 'Asia/Dhaka', Mauritius: 'Indian/Mauritius', Fiji: 'Pacific/Fiji' };
  return CITY_ZONES[city.name] || ZONES[city.country] || more[city.country] || (city.country === 'India' ? 'Asia/Kolkata' : `Etc/GMT${city.timezone >= 0 ? '-' : '+'}${Math.abs(city.timezone)}`);
}
export function localDay(zone: string, instant = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant); }
export function shiftDay(day: string, amount: number) { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + amount); return d.toISOString().slice(0, 10); }
export function dateLabel(day: string, options: Intl.DateTimeFormatOptions, locale = 'en-IN') { return new Date(`${day}T12:00:00Z`).toLocaleDateString(locale, { ...options, timeZone: 'UTC' }); }
export function observance(p: PanchangResult) { return p.tithi.index === 11 || p.tithi.index === 26 ? 'Ekadashi' : p.tithi.index === 15 ? 'Purnima' : p.tithi.index === 30 ? 'Amavasya' : p.tithi.index === 13 || p.tithi.index === 28 ? 'Trayodashi' : p.tithi.index === 19 ? 'Krishna Chaturthi' : null; }
export function downloadFile(name: string, text: string, type: string) { const url = URL.createObjectURL(new Blob([text], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
