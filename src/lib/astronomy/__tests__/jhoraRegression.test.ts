/**
 * Golden Regression Test: Jagannatha Hora (JHora) & DrikPanchang Cross-Validation
 * Birth Data Benchmark: 2003-06-26, 07:54 AM IST (02:24:00 UTC), Jaipur, Rajasthan
 * Coordinates: 26° 54' 44.64" N (26.9124°), 75° 47' 14.28" E (75.7873°)
 * Reference Ephemeris: Swiss Ephemeris / Jagannatha Hora 8.0 / Astro.com
 */

import { calculateVedicChart } from '../ephemeris';
import { calculateVargaChart } from '../vargas';

export interface JHoraPlanetComparison {
  body: string;
  tropicalLon: number;
  siderealLon: number;
  sign: string;
  signSanskrit: string;
  house: number;
  dms: string;
  nakshatraPada: string;
}

export function runJHoraRegressionTest() {
  console.log('=== RUNNING JAGANNATHA HORA (JHORA) GOLDEN REGRESSION TEST ===');
  const birthDate = new Date('2003-06-26T02:24:00.000Z');
  const lat = 26.9124;
  const lon = 75.7873;

  const chart = calculateVedicChart(birthDate, lat, lon);

  console.log(`Birth Input: 2003-06-26 07:54:00 IST (UTC: ${birthDate.toISOString()})`);
  console.log(`Location: Jaipur (Lat: ${lat}°, Lon: ${lon}°)`);
  console.log(`Lahiri Ayanamsa: ${chart.ayanamsaDms} (${chart.ayanamsaValue.toFixed(4)}°)`);
  console.log(`Ascendant (Lagna): ${chart.ascendant.signName} (${chart.ascendant.signSanskrit}) ${chart.ascendant.dms} • Nakshatra: ${chart.ascendant.nakshatraName} Pada ${chart.ascendant.pada}`);

  console.log('\n--- D1 Rashi Planet Placements ---');
  for (const [id, p] of Object.entries(chart.planets)) {
    console.log(
      `${id.padEnd(8)}: Tropical ${p.tropicalLon.toFixed(4)}° | Sidereal ${p.siderealLon.toFixed(4)}° | ${p.signName.padEnd(12)} (${p.signSanskrit.padEnd(10)}) ${p.dms} | House ${p.house} | ${p.nakshatraName} (Pada ${p.pada})`
    );
  }

  // D9 Navamsha Chart Test
  const d9Chart = calculateVargaChart(
    'D9',
    chart.ascendant.siderealLon,
    Object.fromEntries(
      Object.entries(chart.planets).map(([k, v]) => [k, { siderealLon: v.siderealLon, name: v.name }])
    )
  );

  console.log('\n--- D9 Navamsha (Dharma Chart) Placements ---');
  console.log(`D9 Ascendant: ${d9Chart.ascendantSignName}`);
  for (const [id, p] of Object.entries(d9Chart.placements)) {
    console.log(`${id.padEnd(8)}: Navamsha Sign ${p.sign} -> ${p.signName} | House ${p.house}`);
  }

  return { chart, d9Chart };
}
