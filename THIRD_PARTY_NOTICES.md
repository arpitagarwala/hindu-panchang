# Third-party notices

## Swiss Ephemeris

Daily Panchang and festival APIs use `sweph` (2.10.3-8), bindings to Swiss Ephemeris 2.10.03, Copyright Astrodienst AG. The dependency's license notice is in `node_modules/sweph/LICENSE`.

Swiss Ephemeris is offered under GNU AGPL or a Swiss Ephemeris Professional License. The project owner selected the AGPL route on 2026-11-01. This project's code is licensed AGPL-3.0-or-later; see LICENSE and NOTICE. The service's visible source link points to https://github.com/arpitagarwala/hindu-panchang . Dependencies retain their own notices and licenses. This choice does not imply certification or endorsement by Astrodienst.

Primary documentation:
- https://www.astro.com/swisseph/swephprg.htm
- https://github.com/timotejroiko/sweph
- https://github.com/aloistr/swisseph/tree/master/ephe

Official data downloaded on 2026-10-31:

| File | Source | SHA-256 |
|---|---|---|
| `sepl_18.se1` | https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/sepl_18.se1 | `ca1393ceab3a44fbc895887cf789c68819ae6a1cbc9b22225872dbe4ccd99a66` |
| `semo_18.se1` | https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/semo_18.se1 | `1ca07bd67c24374d77226180c20a4f9996cba013697894810518e7eb582ca4f7` |

These files cover 1800–2399. The application accepts user dates 1900–2100 and uses a small adjacent-day calculation margin.

## Location data

Worldwide search uses Open-Meteo Geocoding, based on GeoNames. The UI links to the attribution and documentation. Review the provider's rate limits and commercial-use terms before production/commercial use; no commercial plan was purchased.

- https://open-meteo.com/en/docs/geocoding-api
- https://www.geonames.org/

Coordinate time-zone lookup uses `@photostructure/tz-lookup` (CC0), based on timezone-boundary-builder. This compressed lookup is approximate at some boundaries. Provider-supplied IANA zones are used for named remote search results, and manual override is available for arbitrary coordinates.

- https://github.com/photostructure/tz-lookup

## Reference validation

Drik Panchang is a reference provider, not an API backend or sponsor. The engine computes its own data. Compact manually recorded factual test samples and primary source links appear in `research/`; no bulk copy of the provider's calendar or explanatory content is included.

The Drik comparison is limited to its recorded dates, cities, conventions and tolerances, and does not establish endorsement, certification, or full worldwide/sampradaya equivalence.
