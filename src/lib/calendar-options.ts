export type Region = 'north' | 'maharashtra' | 'gujarat' | 'telugu' | 'kannada' | 'tamil' | 'bengal' | 'kerala' | 'odisha' | 'nepal';
export type MonthConvention = 'amanta' | 'purnimanta';
export type Tradition = 'smarta' | 'vaishnava';
export type SunriseConvention = 'edges' | 'center';
export interface CalendarOptions { region: Region; monthConvention: MonthConvention; tradition: Tradition; sunriseConvention: SunriseConvention }
export const REGIONS: { id: Region; name: string; monthConvention: MonthConvention; newYear: string }[] = [
  { id: 'north', name: 'North Indian', monthConvention: 'purnimanta', newYear: 'Chaitra Navratri' },
  { id: 'maharashtra', name: 'Maharashtra', monthConvention: 'amanta', newYear: 'Gudi Padwa' },
  { id: 'gujarat', name: 'Gujarat', monthConvention: 'amanta', newYear: 'Gujarati New Year' },
  { id: 'telugu', name: 'Telugu · Andhra & Telangana', monthConvention: 'amanta', newYear: 'Ugadi' },
  { id: 'kannada', name: 'Karnataka', monthConvention: 'amanta', newYear: 'Ugadi' },
  { id: 'tamil', name: 'Tamil Nadu', monthConvention: 'amanta', newYear: 'Chaitra Shukla Pratipada' },
  { id: 'bengal', name: 'Bengal', monthConvention: 'purnimanta', newYear: 'Chaitra Shukla Pratipada' },
  { id: 'kerala', name: 'Kerala', monthConvention: 'amanta', newYear: 'Chaitra Shukla Pratipada' },
  { id: 'odisha', name: 'Odisha', monthConvention: 'purnimanta', newYear: 'Chaitra Shukla Pratipada' },
  { id: 'nepal', name: 'Nepal', monthConvention: 'purnimanta', newYear: 'Chaitra Shukla Pratipada' },
];
export const CALENDAR_DEFAULTS: CalendarOptions = { region: 'north', monthConvention: 'purnimanta', tradition: 'smarta', sunriseConvention: 'edges' };
export function calendarOptions(params: URLSearchParams): CalendarOptions {
  const region = params.get('region') || CALENDAR_DEFAULTS.region;
  const monthConvention = params.get('months') || REGIONS.find(r => r.id === region)?.monthConvention || CALENDAR_DEFAULTS.monthConvention;
  const tradition = params.get('tradition') || CALENDAR_DEFAULTS.tradition;
  const sunriseConvention = params.get('sunrise') || CALENDAR_DEFAULTS.sunriseConvention;
  if (!REGIONS.some(r => r.id === region) || !['amanta','purnimanta'].includes(monthConvention) || !['smarta','vaishnava'].includes(tradition) || !['edges','center'].includes(sunriseConvention)) throw new Error('Choose a supported region, lunar month, fasting tradition, and sunrise convention.');
  return { region, monthConvention, tradition, sunriseConvention } as CalendarOptions;
}
