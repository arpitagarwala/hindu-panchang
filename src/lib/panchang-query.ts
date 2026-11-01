export function readPanchangQuery(params: URLSearchParams) {
  const lat = Number(params.get('lat') ?? 28.6139);
  const lon = Number(params.get('lon') ?? 77.209);
  const timeZone = params.get('tz') || 'Asia/Kolkata';
  if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180) throw new Error('Please use valid latitude and longitude.');
  try { new Intl.DateTimeFormat('en', { timeZone }); } catch { throw new Error('Please use a valid IANA time zone.'); }
  return { lat, lon, timeZone };
}

export function localNoon(day: string, timeZone: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Please use a date in YYYY-MM-DD format.');
  const utc = new Date(`${day}T12:00:00Z`);
  if (!Number.isFinite(utc.getTime()) || utc.toISOString().slice(0, 10) !== day) throw new Error('Please choose a valid calendar date.');
  if (utc.getUTCFullYear() < 1800 || utc.getUTCFullYear() > 2399) throw new Error('Choose a date between 1800 and 2399.');
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(utc);
  const get = (key: string) => Number(parts.find(p => p.type === key)?.value);
  const wallAsUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  return new Date(utc.getTime() - (wallAsUtc - utc.getTime()));
}
