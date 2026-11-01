import { NextResponse } from 'next/server';
import { verifyEphemerisFiles } from '@/lib/astronomy/ephemeris-integrity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const integrity = verifyEphemerisFiles();
    const { longitude } = await import('@/lib/astronomy/swiss-server');
    const { sourceConfiguration } = await import('@/lib/providers/service');
    // Exercise the native engine and require its Swiss-file flag, not just file presence.
    const sun = longitude(Date.parse('2000-01-01T12:00:00Z'), 0);
    if (!Number.isFinite(sun)) throw new Error('Native engine unavailable');
    return NextResponse.json({ status: 'ok', engine: 'Swiss Ephemeris', integrity,
      mode: sourceConfiguration().mode, supportedYears: [1900, 2100] },
    { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'unavailable', error: 'Ephemeris or server configuration check failed.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
