# Kundali & Jyotish

The `/jyotish` app generates a report on explicit form submission. It does not
calculate a fictitious default visitor chart. English and Hindi are supported.

## Calculation contract

- `POST /api/jyotish` accepts a birth date, recorded local 24-hour time, latitude,
  longitude, IANA birth zone, mean/true node preference, uncertainty in minutes,
  reading date and a separate residence for daily timings. Birth dates start at
  1900; reading dates run from birth through the 119th birthday. Gregorian dates.
- Historical wall time is resolved using the runtime's IANA data. Nonexistent
  times are rejected. Repeated times require an explicit first/second occurrence.
  Historical time-zone records, particularly before 1970, need independent review.
- Swiss Ephemeris 2.10.03, immutable Lahiri mode, geocentric apparent ecliptic
  positions, speed, seven physical grahas plus mean/true Rahu and opposite Ketu.
  Official bundled Sun/Moon/planet files must pass the existing SHA-256 checks.
  Physical planets cannot silently fall back to Moshier. UT is approximated by
  JavaScript UTC as in the existing Panchang; no subsecond accuracy is claimed.
- Whole-sign houses. Ascendant uses Swiss `houses_ex`, not a browser approximation.
  Zero elevation. Standard combustion orbs are labelled as traditional conventions.
  No consensus exaltation/debilitation is assigned to Rahu/Ketu.
- Fourteen existing varga methods: D1/2/3/4/7/9/10/12/16/20/24/27/30/60.
  D2 uses Parashari Sun/Moon Hora; D9 uses elemental starts; even-sign D10 starts
  from the ninth and counts forward; D30 uses unequal portions; D60 counts from
  the natal sign. These choices are not interchangeable with every school's methods.
- Birth-time sensitivity recomputes the chart at the two requested uncertainty
  endpoints and compares every varga's ascendant and planet signs. Intermediate
  changes can be missed. This is not birth-time rectification or a confidence score.
- Vimshottari uses the birth Moon's nakshatra and 365.242199-day years. Initial
  balance retains the theoretical pre-birth sequence of sub-periods. Ten
  mahadashas cover the shortened starting period plus a full cycle, avoiding the
  old late-life fallback to the birth dasha. Dates outside the timeline throw.
- Monthly outlook: twelve explicitly dated noon snapshots, not month-long transit
  intervals. MD/AD plus Jupiter/Saturn/Mercury signs from the natal Moon. A simple
  traditional house-set rule is disclosed in the interface. No vedha, complete
  aspect synthesis, event probability, event date or scientific prediction.
- Local daily solar windows reuse the Swiss Panchang backend for the residence.
  Tara bala uses the sunrise nakshatra (local noon where sunrise is absent), and
  Chandra bala uses the noon Moon sign. Polar solar windows remain unavailable.

## Interpretation contract

Rule-based bilingual prose explains the relevant planet, natal house and dasha.
It is cultural/spiritual interpretation, not evidence of a future event. The
colour/weekday/direction catalogue contains editorial common-practice associations;
it is not a measured luck model or a quotation from an authenticated scripture.
Numerology is separately labelled and uses reduced digit sums of day/full DOB.

The gemstone guide shows up to three recommended alternatives and up to three
stones not recommended as automatic remedies, with conventional finger, metal,
weekday and symbolism details. Both the page and offline report use the same
selector, including for previously saved profiles. Its explicitly selected school
is P.V.R. Narasimha Rao's functional-nature classification (section 13.2, Table 30)
and gemstone method (34.2) in
[Vedic Astrology: An Integrated Approach](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf).
This classification contains school-specific mixed-ownership exceptions; it is
not replaced by a blanket 6/8/12-house prohibition. Within favourable planets,
yogakaraka leads, then ascendant/trine priority with a mixed-ownership adjustment;
an active favourable dasha gives a small ordering preference. Combust/debilitated
benefic choices show an additional note, not a fabricated guaranteed effect.
Unfavourable planets are ordered by disclosed house-ownership priorities for a
maximum of three; this ranking is an editorial shortlist, not a classical dosage
rule. Neutral planets and lunar nodes are omitted. D1 endpoint changes withhold
the shortlist until birth time is confirmed. Picks are alternatives, not an
instruction to combine them. No automated gemstone purchase, ratti dose,
body-weight formula, medical cure, guaranteed benefit or forbidden colour/direction.
The optional weight converter uses an explicitly labelled jewellery convention,
1 ratti ≈ 0.182 g = 0.91 ct; the unit varies across sellers and historical standards.

Technical references: [Swiss programming manual](https://www.astro.com/swisseph/swephprg.htm),
[IANA time-zone database](https://www.iana.org/time-zones),
[PyJHora method variants](https://github.com/naturalstupid/PyJHora/blob/main/src/jhora/horoscope/chart/charts.py).
The existing varga formulas were retained; PyJHora was consulted to confirm named
method choices, not imported as a dependency or used to claim external certification.
For the illustrative jewellery unit, compare the seller's own
[ratti/carats guide](https://www.gempundit.com/engagement-rings); this is not a
gemstone-efficacy source or endorsement.

## Privacy and resource budget

No new provider, AI service, account, database, cron, worker or always-on server.
One stateless Vercel Node function invocation per new report; no calls on renders,
tab switches, chart selection or language changes. A synthetic local report was
about 47 KB; local computation is typically tens of milliseconds, not a platform
performance guarantee. Birth details travel in a private `no-store` POST body,
not URL query strings, application logs, shared links or CDN cache. Hosting
providers can still process normal request metadata; this is not an end-to-end
encryption or zero-retention claim.

Users explicitly opt into up to three locally saved profile/report pairs. There
is no cross-device sync or password protection. Only an identical explicitly
saved input can skip recalculation. An explicit delete control removes both new
reports and the legacy local birth-profile key. Offline HTML export escapes user
content, has no scripts/external assets, and includes all chart placements, daily
windows, periods and interpretation. Downloaded personal files need separate
deletion; downloaded copies may be accessible to others using the device.

Burst protection is **best effort per warm function instance**: 12 requests/minute
per hashed apparent IP, with a bounded map. It is not distributed rate limiting,
an authenticated quota, or a hard global spending cap. Operators can set
`JYOTISH_ENABLED=false` and redeploy to pause new generation without changing saved
reports. Vercel's platform limits/firewall and usage dashboard remain the authority.
No free-tier limit bypass, new paid plan, checkout or automatic charging is enabled.

[Vercel Hobby](https://vercel.com/docs/plans/hobby) is for personal, non-commercial
use. Before charging, choose a permitted commercial hosting plan and a real
payment/account integration. Reaching a free-tier limit can pause service; it
does not automatically turn visitors into paying customers. Review current
platform limits before a paid launch. AGPL public-source obligations remain.

## Verification

```
npx tsx scripts/verify-jyotish.ts
node scripts/verify-jyotish-http.mjs
```

The unit suite covers clock gaps/overlaps, historical second offsets, invalid
inputs, varga boundaries/ranges, dasha continuity/late ages, polar windows,
bilingual escaped exports, geography and absence of external requests. Sun/Moon
sanity comparisons against Astronomy Engine are limited to 0.03 degrees. Frozen
Swiss results are regressions, not independent JHora/Drik certification. The HTTP
suite exercises rendered metadata, the complete POST, private headers and errors.
