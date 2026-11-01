import { NextRequest, NextResponse } from 'next/server';
import { calculateDaily } from '@/lib/panchang-server';
import { calculateObservances } from '@/lib/festivals/engine';
import { calendarOptions } from '@/lib/calendar-options';
import { civilDate } from '@/lib/astronomy/swiss-server';
import { readPanchangQuery, localNoon } from '@/lib/panchang-query';
import { checkDaily,VerificationRequired } from '@/lib/providers/service';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { lat, lon, timeZone } = readPanchangQuery(req.nextUrl.searchParams);
    const dateString = req.nextUrl.searchParams.get('date');
    const date = dateString ? localNoon(dateString, timeZone) : new Date();
    if(dateString&&(dateString<'1900-01-01'||dateString>'2100-12-31'))throw new Error('Choose a date between 1900 and 2100.');
    const options=calendarOptions(req.nextUrl.searchParams);
    const day=civilDate(date,timeZone);
    const data = calculateDaily(lat, lon, date, timeZone, options);
    const dataTrust=await checkDaily(data,{date:day,timeZone,latitude:lat,longitude:lon,instant:date},options);
    const observances=calculateObservances(day,day,lat,lon,timeZone,options);
    return NextResponse.json({...data,observances,dataTrust}, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if(err instanceof VerificationRequired)return NextResponse.json({error:err.message,dataTrust:err.trust},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'30'}});
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Calculation failed' }, { status: 400 });
  }
}
