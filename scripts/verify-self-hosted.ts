import assert from 'node:assert/strict';

async function main() {
  // Install before imports: any runtime request fails this test, including provider OAuth.
  let outboundRequests = 0;
  globalThis.fetch = async () => { outboundRequests++; throw new Error('Outbound networking blocked by self-hosted test'); };
  delete process.env.PANCHANG_DATA_MODE;
  // Even configured external credentials must not enable a provider by default.
  process.env.PROKERALA_CLIENT_ID = 'offline-test';
  process.env.PROKERALA_CLIENT_SECRET = 'offline-test';
  const { verifyEphemerisFiles, verifyEphemerisData } = await import('../src/lib/astronomy/ephemeris-integrity');
  const { calculateDaily } = await import('../src/lib/panchang-server');
  const { calculateObservances } = await import('../src/lib/festivals/engine');
  const { CALENDAR_DEFAULTS } = await import('../src/lib/calendar-options');
  const { localNoon } = await import('../src/lib/panchang-query');
  const { checkDaily, calendarPreviewTrust, sourceConfiguration } = await import('../src/lib/providers/service');
  assert.equal(verifyEphemerisFiles().verified, true);
  assert.throws(() => verifyEphemerisData({}), /missing or unreadable/);
  assert.throws(() => verifyEphemerisData({ 'sepl_18.se1': Buffer.from('corrupted file') }), /integrity check failed/);
  const places = [
    { latitude: 28.6139, longitude: 77.209, timeZone: 'Asia/Kolkata' },
    { latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' },
    { latitude: 27.7172, longitude: 85.324, timeZone: 'Asia/Kathmandu' },
    { latitude: -33.8688, longitude: 151.2093, timeZone: 'Australia/Sydney' },
  ];
  let days = 0, observances = 0;
  for (const place of places) {
    for (const date of ['1900-01-01', '2026-11-01', '2027-03-14', '2100-12-31']) {
      const instant = localNoon(date, place.timeZone);
      const daily = calculateDaily(place.latitude, place.longitude, instant, place.timeZone, CALENDAR_DEFAULTS);
      assert.equal(daily.localDate, date);
      assert.ok(daily.tithi.name && daily.nakshatra.name && daily.yoga.name && daily.karana.name);
      const trust = await checkDaily(daily, { ...place, date, instant }, CALENDAR_DEFAULTS);
      assert.equal(trust.status, 'local-only'); assert.equal(trust.provider, null); days++;
    }
    const monthly = calculateObservances('2026-11-01', '2026-11-30', place.latitude, place.longitude, place.timeZone, CALENDAR_DEFAULTS);
    assert.ok(monthly.length > 0); observances += monthly.length;
    for (let day = 1; day <= 30; day++) {
      const date = `2026-11-${String(day).padStart(2, '0')}`;
      const result = calculateDaily(place.latitude, place.longitude, localNoon(date, place.timeZone), place.timeZone, CALENDAR_DEFAULTS, false);
      assert.equal(result.localDate, date); days++;
    }
  }
  assert.equal(calendarPreviewTrust().status, 'local-only');
  assert.equal(sourceConfiguration().externalPanchangRequests, false);
  assert.equal(sourceConfiguration().apiKeyRequired, false);
  assert.equal(outboundRequests, 0);
  console.log(`Self-hosted checks passed: ${days} daily/calendar calculations, ${observances} observances across 4 time zones; missing/corrupt files rejected; ${outboundRequests} outbound fetch requests. This tests independence, not universal accuracy.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
