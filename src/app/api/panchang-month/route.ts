import { NextRequest, NextResponse } from 'next/server';
import { calculateDaily } from '@/lib/panchang-server';
import { calculateObservances } from '@/lib/festivals/engine';
import { calendarOptions } from '@/lib/calendar-options';
import { readPanchangQuery, localNoon } from '@/lib/panchang-query';
import { calendarPreviewTrust } from '@/lib/providers/service';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { lat, lon, timeZone } = readPanchangQuery(params);
    const year = Number(params.get('year') ?? new Date().getFullYear());
    const month = Number(params.get('month') ?? new Date().getMonth() + 1);
    if (!Number.isInteger(year) || year < 1900 || year > 2100 || !Number.isInteger(month) || month < 1 || month > 12) throw new Error('Choose a month between January 1900 and December 2100.');
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const options=calendarOptions(params);
    const detailed=params.get('detailed')==='1';
    const prefix=`${year}-${String(month).padStart(2,'0')}`;
    const dataTrust=calendarPreviewTrust();
    const observances=calculateObservances(`${prefix}-01`,`${prefix}-${String(days).padStart(2,'0')}`,lat,lon,timeZone,options);
    const results = Array.from({ length: days }, (_, i) => {
      const day = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
      return {...calculateDaily(lat, lon, localNoon(day, timeZone), timeZone, options, detailed),observances:observances.filter(o=>o.date===day),dataTrust};
    });
    return NextResponse.json(results, { headers: { 'Cache-Control': detailed?'no-store':'public, max-age=3600, s-maxage=3600' } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Calculation failed' }, { status: 400 });
  }
}
