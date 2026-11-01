# Independent provider backend

The running development app defaults to local generation, with no Prokerala requests. Optional server-only OAuth credentials are retained in the ignored `.env.local`; they are used only when an independent checking mode is explicitly enabled. See SELF_HOSTING.md for the default backend. Do not commit, copy into public files, or prefix these credentials with `NEXT_PUBLIC_`. No credentials are included in this document or the public source-status endpoint.

## What is actually fetched

The server calls the documented Prokerala `/v2/astrology/panchang` endpoint with Lahiri (`ayanamsa=1`), the selected coordinates and an ISO datetime carrying the actual IANA-zone offset. It obtains Tithi, Nakshatra, Yoga, Karana intervals, Vara, sunrise and sunset. It selects the element active at the provider's sunrise rather than trusting numeric IDs or arbitrary array order.

The UI continues to display the Swiss Ephemeris calculation with an independent comparison. The provider's values, time fetched, expiry, exact differences and tolerances are available in the source panel. Provider data does not silently replace parts of locally derived festivals or parana.

OAuth uses server-side form-encoded client credentials, cached bearer tokens and one refresh on authentication failure. Provider hosts are fixed; redirects are rejected. Data timestamps must carry an explicit offset, intervals must be valid and uniquely cover sunrise, solar events must belong to the requested civil date, and the weekday must agree with the date. Invalid upstream responses never count as a successful match.

References are cached for one hour. Identical concurrent requests share one fetch. Failure backoff is 30 seconds. The cache is bounded to 256 entries; no expired reference is served as a fresh match. A configurable per-process UTC-day budget defaults to 100 data requests. This budget resets on restart and is not a distributed quota or a provider billing guarantee. Multi-instance deployment needs a shared cache/rate limiter and a confirmed API plan.

## Modes

Set `PANCHANG_DATA_MODE` in the server environment:

- `cross-check` (opt-in): returns local calculations with an explicit source status. Disagreement, convention difference and provider failure are visible; they are never marked matched.
- `verified-only`: the daily endpoint returns HTTP 503 and withholds the daily result unless all twelve comparison checks pass. It does not prove that a matching result is correct.
- `local` (default): generates data on this server and disables external checking.

The mode is server-controlled. Callers cannot bypass verified-only by adding a query parameter. `/api/panchang/source` reports non-secret configuration and scope.

The monthly endpoint is explicitly a **local preview**, even in verified-only daily mode. It does not spend a provider request for every day of two loaded months. Every preview record is labeled `not-checked`; open a day for its independent check. This is not a verified-only calendar or festival service.

## Sunrise conventions found in live tests

On 1 November 2026, Prokerala's Delhi and Bengaluru solar times matched the geometric-center, no-refraction calculation within the configured solar tolerance. Delhi upper-edge sunrise and sunset differ by about 235 seconds. This is an observed convention difference in the sampled requests, not proof of a globally documented provider guarantee.

The backend identifies a convention difference only when the four elements agree and an actual geometric-center recalculation also matches the fetched solar events. It never widens tolerances or silently changes the user's convention to obtain a match. The UI offers an explicit button to select geometric-center sunrise and recheck. Other mismatches remain disagreements.

## Validation and limits

- Twelve comparisons: four element names, their four end times, Paksha, Vara, sunrise and sunset.
- Fixed tolerances: 120 seconds for element end times; 90 seconds for solar events.
- `scripts/verify-provider.ts`: mocked network tests for OAuth, token refresh, caching, expiry, concurrent requests, DST offsets, schema rejection, date rejection, failure backoff, quotas and fail-closed handling when credentials are absent.
- `research/provider/live-checks.json`: limited real API observations for two cities, explicitly separate from mocked tests.
- Production verified-only testing confirmed a matched response succeeds, an upper-edge/center discrepancy produces HTTP 503 without daily data, and calendar previews are never mislabeled independently checked.
- Public build assets and source-status responses were checked for credential exposure.

**This is not zero-error certification.** The fetched daily endpoint does not independently validate festival dates, Ekadashi selection, full sampradaya rules, parana, regional months, Muhurta, Kundali or all supported locations/dates. Those limitations remain visible in the app. Provider outages, quotas and interpretation/convention differences remain possible.

Primary references:

- https://api.prokerala.com/getting-started
- https://api.prokerala.com/spec/astrology.v2.yaml
- https://api.prokerala.com/docs/daily-panchang
- https://api.prokerala.com/tos

No claim is made that this is an official Drik Panchang API. The similarly named third-party Drik APIs found online are not assumed to be drikpanchang.com.
