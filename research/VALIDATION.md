# Drik Panchang validation

The current daily calculation engine was compared against nine manually recorded Drik Panchang reference cases across five cities and years 2025–2027. This is a bounded reference comparison, not an endorsement or comprehensive certification.

The comparison covers element names and end times, sunrise and sunset, Brahma/Abhijit Muhurta, Rahu Kalam, Yamaganda, Gulika, Amanta/Purnimanta month names, and the Chaitra-based Vikram year. Names are normalized only for documented transliteration variants (e.g. Ashwin/Ashwina), not to hide timing differences.

- Checks passed: **185 / 185**.
- Maximum element transition difference: **86.3 seconds**.
- Maximum sunrise/sunset difference: **34.0 seconds**.
- Maximum daily-window difference: **31.4 seconds**.
- Allowed differences: 120 seconds for element transitions and windows; 90 seconds for solar times.
- Sources have minute precision. Test coordinates are app centroids, not independently confirmed Drik centroids. Do not infer subminute accuracy from the reported differences.
- Convention: Swiss Ephemeris Lahiri, upper-edge sunrise with standard refraction, zero observer elevation. Drik's current Settings page states Edges is the default; its older FAQ describes geometric-center sunrise for legacy behavior.

| City | Date | Passing checks | Largest timing difference | Source |
|---|---|---:|---:|---|
| New Delhi | 2026-10-31 | 23/23 | 49.2 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2026&geoname-id=1261481) |
| Bengaluru | 2026-10-31 | 23/23 | 49.1 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2026&geoname-id=1277333) |
| Mumbai | 2026-10-31 | 21/21 | 49.2 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2026&geoname-id=1275339) |
| London | 2026-10-31 | 23/23 | 53.1 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2026&geoname-id=2643743) |
| New York City | 2026-10-31 | 23/23 | 53.0 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=31/10/2026&geoname-id=5128581) |
| New Delhi | 2026-10-30 | 13/13 | 86.3 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=30/10/2026&geoname-id=1261481) |
| New Delhi | 2026-11-01 | 13/13 | 71.1 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=01/11/2026&geoname-id=1261481) |
| New Delhi | 2025-01-14 | 23/23 | 58.7 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=14/01/2025&geoname-id=1261481) |
| New Delhi | 2027-01-15 | 23/23 | 59.2 s | [Drik reference](https://www.drikpanchang.com/panchang/day-panchang.html?date=15/01/2027&geoname-id=1261481) |

The machine-readable record is `public/validation/drik-comparison.json`, with each exact input, expected output, actual output, delta and source link. Re-run `node scripts/validate-drik.mjs` against a running server to refresh it.

Festival/parana references are tested separately by `scripts/verify-observances.mjs`. These include Rama Ekadashi, skipped-sunrise Smarta Devutthana, Vaishnava/Gauna Devutthana, their parana windows, Pradosh, Diwali fixed-lagna puja, Ganesh Chaturthi and Mumbai's October lunar observances. See `public/validation/festival-comparison.json`. Additional regression checks cover Adhika naming, Onam, Tamil Pongal, polar night, international locations and supported date boundaries.

## Differences requiring further work

On 30 June 2026 in New Delhi, the engine's Purnima transition falls about nine seconds after its sunrise. An almanac using slightly different solar/ephemeris conventions can assign the following tithi at sunrise instead. This is exposed through a boundary warning, not silently shifted to fit a fixture.

The complete sampradaya Mahadwadashi/nakshatra rules, all Holika Bhadra exceptions, every regional festival tie-break, full regional solar calendars, terrain/observer elevation effects, and exhaustive historical/future verification remain outside the validated scope. Such events have explicit review status in the application.

Browser automation could not be run for this update because browser access was disabled in Work settings. Production compilation and API/HTTP checks were performed; this does not establish that every client interaction was browser-verified.
