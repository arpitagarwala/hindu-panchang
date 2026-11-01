import { NextRequest, NextResponse } from 'next/server';
import tzLookup from '@photostructure/tz-lookup';
import { searchLocalCities, type CityInfo, CITIES_DATABASE } from '@/lib/geo/cities';

type RemoteCity = { id: number; name: string; latitude: number; longitude: number; timezone: string; country?: string; country_code?: string; admin1?: string; admin2?: string; elevation?: number };
function legacyOffset(timeZone: string): number {
  const value=new Intl.DateTimeFormat('en',{timeZone,timeZoneName:'shortOffset'}).formatToParts(new Date()).find(p=>p.type==='timeZoneName')?.value||'GMT';
  const match=/GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(value);
  return match?(match[1]==='-'?-1:1)*(Number(match[2])+Number(match[3]||0)/60):0;
}
function withZone(city: CityInfo): CityInfo { return { ...city, timeZone: city.timeZone || tzLookup(city.latitude, city.longitude) }; }
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.has('lat') || params.has('lon')) {
    const lat = Number(params.get('lat')), lon = Number(params.get('lon'));
    if (!params.has('lat') || !params.has('lon') || !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180) return NextResponse.json({ error: 'Use valid latitude and longitude.' }, { status: 400 });
    return NextResponse.json({ timeZone: tzLookup(lat, lon), source: 'Coordinate time-zone lookup' }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const q = (params.get('q') || '').trim();
  if (q.length > 120) return NextResponse.json({ error: 'Please use a shorter place name.' }, { status: 400 });
  if (q.length < 2) return NextResponse.json({ results: CITIES_DATABASE.slice(0, 18).map(withZone), source: 'Popular cities', remote: false });
  const localResults = searchLocalCities(q, 30).map(withZone);
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({ name: q, count: '50', language: 'en', format: 'json' }).toString();
    const response = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error('Worldwide search is temporarily unavailable.');
    const payload = await response.json() as { results?: RemoteCity[] };
    const remote = (payload.results || []).filter(v => Number.isFinite(v.latitude) && Number.isFinite(v.longitude) && typeof v.timezone === 'string').map(v => ({ id: v.id, name: v.name, state: [v.admin2, v.admin1].filter((x,i,a)=>x && a.indexOf(x)===i).join(', '), country: v.country || v.country_code || '', countryCode: v.country_code, latitude: v.latitude, longitude: v.longitude, timeZone: v.timezone, timezone: legacyOffset(v.timezone), elevation: v.elevation } satisfies CityInfo));
    const combined = [...localResults];
    for (const city of remote) if (!combined.some(v => Math.abs(v.latitude-city.latitude)<0.025 && Math.abs(v.longitude-city.longitude)<0.025)) combined.push(city);
    return NextResponse.json({ results: combined, source: 'GeoNames via Open-Meteo', remote: true, attribution: 'https://open-meteo.com/en/docs/geocoding-api' }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
  } catch {
    return NextResponse.json({ results: localResults, source: 'Offline city directory', remote: false, warning: 'Worldwide search is temporarily unavailable. Try again, use GPS, or enter coordinates.' });
  }
}
