# Panchang

Live app: https://panchang.arpitagarwala.com · [Public AGPL source](https://github.com/arpitagarwala/hindu-panchang)

## Publishing and discoverability

See [PUBLISHING.md](PUBLISHING.md) for subdomain deployment, HTTPS, public licensing and Search Console setup. Configure `SITE_URL` and `SITE_INDEXING` before a public build; previews intentionally stay noindex. Crawlable city pages, canonical URLs, structured data, social previews and a sitemap are included. Device location is permission-based; saved manual cities and shared coordinates take precedence over automatic detection. No public deployment or Google submission is implied by the local implementation.

A location-aware Hindu Panchang built with Next.js 16 and React 19. Daily calendar and observance APIs use Swiss Ephemeris 2.10.03 with the official Sun and Moon ephemeris files. The existing Jyotish tools remain at `/jyotish` and retain their original calculation engine.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. The native Swiss Ephemeris package requires Node.js; this is not a static-only or Edge deployment. Next.js explicitly traces the ephemeris files into server builds.

## Verification

With the app server running:

```sh
npm run build
node scripts/validate-drik.mjs
node scripts/verify-panchang.mjs
node scripts/verify-observances.mjs
node scripts/verify-locations.mjs
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/verify-calendar-export.mjs
```

Set `PANCHANG_TEST_URL` for a different server. The Drik script records exact reference differences in `public/validation/drik-comparison.json`. Festival/parana samples are recorded separately in `public/validation/festival-comparison.json`. Primary reference URLs and location/convention qualifications are included. Reference times are published to the minute, so these comparisons do not establish second-level accuracy or worldwide certification.

## Daily calculations

- Geocentric Sun/Moon longitudes and Lahiri sidereal coordinates from Swiss Ephemeris, with bundled official `sepl_18.se1` and `semo_18.se1` data. Missing files stop the calculation; lower-precision fallback is not silent.
- Tithi, Nakshatra, Yoga and Karana sampled at local sunrise, with start/end transitions and explicit next-day dates. Search resolution is 0.25 seconds, not an accuracy guarantee.
- Upper-edge sunrise with standard refraction by default, or geometric-center sunrise as an explicit preference. Calculations use zero observer elevation, standard pressure and 15°C; terrain and actual weather are not modeled.
- Brahma Muhurta uses the preceding night's fourteenth muhurta. Abhijit uses the middle fifteenth of daylight. Rahu, Yamaganda and Gulika use verified weekday tables.
- Day/night Choghadiya, exact local moonrise/moonset, lunar illumination, IANA time zones and daylight saving.
- Amanta and Purnimanta month naming, Adhika detection, Kshaya detection and explicitly labeled Chaitra- or Gujarati Kartik-based Vikram years. Kshaya naming/ritual precedence still requires review. Gujarati preferences use the Kartik-year boundary; other presets explicitly label the Chaitra-based year. This is not a complete Nepali solar calendar.
- Polar dates do not fabricate sunrise or ritual windows. Elements use local noon with a visible warning. Tithi transitions within two minutes of sunrise are flagged as convention-sensitive.

## Festivals and fasting

The rule registry is `src/lib/festivals/rules.ts`. Rules select the ritual's actual anchor rather than simply labeling the tithi at sunrise:

- Smarta Ekadashi, skipped/repeated sunrise cases, named Ekadashis and Adhika-month Padmini/Parama.
- Vaishnava common arunodaya rules and extended Dwadashi/Vanjuli detection, explicitly marked for review. Full ISKCON/Gaudiya, Madhva, Sri Vaishnava and nakshatra Mahadwadashi precedence are not claimed.
- Ekadashi parana after sunrise and Hari Vasara, capped by Pratahkal/Dwadashi. Late Hari Vasara uses Aparahna; Dwadashi ending before sunrise uses the following-morning exception. Impossible intervals are withheld.
- Pradosh at sunset; Sankashti at local moonrise with an open-ended fast-breaking start; Purnima fasting via Madhyahna; Amavasya marker; monthly and Maha Shivaratri at Nishita with next-morning parana.
- Ganesh Chaturthi and Rama Navami at Madhyahna; Diwali at Amavasya Pradosh with sidereal Vrishabha lagna; Bhadra-excluded Raksha Bandhan window; Sandhi Puja at the Ashtami/Navami junction.
- Regional Gudi Padwa, Ugadi, Gujarati New Year, Durga Puja dates, Dahi Handi, North Indian vrats and other major lunar festivals.
- Kerala Onam from Shravana during Madhyahna in Simha. Tamil Drik/Thirukanitha Pongal/Puthandu day selection and related Pongal days are provisional and marked for regional review; Vakya calendars can differ.
- Exact sidereal Sankranti moments. Punya kaal, complete regional solar calendars, regional new years such as Vishu/Pohela Boishakh, and every local temple festival are not implemented.

Every event exposes the rule, primary source, location-specific window, parana where applicable, and a calculated/review/reference-checked status. Complex Holika Bhadra-tail/mouth precedence remains incomplete. A published New Delhi 2026 Holika exception is manually recorded and strictly limited to that city, year and sunrise convention; it is labeled reference-checked, not treated as a worldwide algorithm. Some festivals remain review-required because their complete regional tie-breaks are not implemented.

## Location and personalization

A prominent location bar sits above the date controls. The picker searches cities, towns, villages and postal codes using GeoNames through Open-Meteo, with state/country qualifiers, up to 50 worldwide results, debounce, cancellation, caching, source attribution, offline popular-city fallback, recent locations, GPS and arbitrary manual coordinates.

Named cities carry provider IANA time zones; coordinates use an offline boundary lookup. Boundary lookup can be approximate near borders; manual time-zone override is available. Remote search requires connectivity. No finite gazetteer guarantees every named settlement, so coordinates work for any geographic point. Shared URLs and saved days retain location and calendar conventions.

Region, lunar-month convention, fasting tradition, sunrise convention, language labels, time format, theme, simple mode and text size are browser-local preferences. No account is required. English/Hindi navigation and date labels are available; explanatory prose remains English.

## Licensing and service attribution

See `THIRD_PARTY_NOTICES.md`. Swiss Ephemeris has an AGPL/professional dual-license requirement that must be resolved before distributing or publicly operating the application. No license is assigned to the user's existing project by this change. Open-Meteo's public endpoint has service-use limits and commercial-use requirements. No paid service or license was purchased, and this task does not publish a public service.

## Reading and daily planning

Normal text and controls now use larger readable sizes, stronger light/dark contrast and more generous spacing. Supporting text is generally 12–15px; the small brand tagline remains decorative. Cards reflow instead of shrinking text on narrow screens. The larger-text preference adds another reading-size step.

The daily overview includes moonrise, moonset, daylight/night length, active daily windows, the next listed window and future sunrise-sampled element transitions. Live status updates every minute only for today in the selected location. An expandable schedule shows all daily Muhurta/caution windows; overlapping caution periods take priority in the live description.

Festival search and type filters narrow the monthly observances. The calendar download includes the filtered all-day events and available timed parana, retaining regional-review labels. Calendar text is escaped and UTF-8 folded; open-ended moonrise parana has a start time without an invented deadline. The print control opens the browser's print/save-as-PDF flow for the current view.

Created and owned by **Arpit Agarwala** — https://arpitagarwala.com. The credit appears in the Panchang and Jyotish footers and author metadata.

## Self-hosted data and optional independent checks

The backend generates daily and monthly Panchang, festival, fasting and parana data locally by default (`PANCHANG_DATA_MODE=local`). No external Panchang API, API key, monthly quota or subscription is required. Bundled official ephemeris files are SHA-256 checked before use. See [SELF_HOSTING.md](SELF_HOSTING.md) for standalone/Docker setup, health checks, network-independent tests, infrastructure costs and licensing requirements.

Prokerala is an optional independent comparison, disabled in local mode. `cross-check` reports comparisons; `verified-only` withholds unmatched daily responses. This limited daily comparison does not certify festivals, parana or Jyotish. See [PROVIDER_BACKEND.md](PROVIDER_BACKEND.md).

Run provider tests without spending API credits:

```sh
npx tsx scripts/verify-provider.ts
```

The provider suite uses mocked network calls. Limited actual live checks are recorded separately in `research/provider/live-checks.json`.


## Vercel and public source

The preferred deployment is GitHub + Vercel Hobby with Node.js 22 functions. See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md). The same Swiss Ephemeris backend runs without a third-party Panchang API. Project source: https://github.com/arpitagarwala/hindu-panchang .

Licensed under GNU AGPL-3.0-or-later by the owner's choice; see LICENSE, NOTICE and THIRD_PARTY_NOTICES.md. The website includes a visible link to its corresponding source.


## Reading experience and Hindi

The personal Panchang supports English and Hindi throughout daily readings, astronomical names, timing cards, festival search, calendars, location selection and settings. Language is saved locally; shared links can specify `lang=hi`. The main screen keeps location and settings compact, with calculation/source details inside Learn Panchang.

Festival calendars display names directly. The full desktop calendar uses a week grid, while compact and mobile calendars use readable date cards. Festival summaries expose their actual rule's tithi interval separately from the sunrise-sampled daily tithi. Derived following-day events and solar/nakshatra rules do not invent a tithi window.

Daily Gita readings rotate through 36 bundled Sanskrit verses with original brief Hindi and English meanings. The selected civil date determines the verse, and a live view advances at local midnight. Run `npx tsx scripts/verify-reading-experience.ts` for the name, date-rotation and festival-tithi regressions.


## Installable PWA

Use the Install app menu item (Hindi: ऐप इंस्टॉल करें), or the browser's Add to Home Screen action, to open Panchang as a standalone home-screen app. The manifest, Android 192/512 icons, maskable icon and Apple touch icon are bundled. iPhone guidance uses Safari → Share → Add to Home Screen. Installation is controlled by the browser and requires HTTPS on the public site.

A service worker provides a small offline reader when a navigation cannot reach the network. Up to 20 daily readings opened online are stored locally with exact date/location/calendar identity, English and Hindi views, original transition/parana times and review warnings. Offline mode does not generate new dates, pretend an old reading is current, or call a lower-quality engine. Users can remove saved offline readings without removing preferences or bookmarks. Browser storage eviction/private browsing can limit offline use.

API responses and Next.js chunks are never cached by this service worker. Offline assets use a content-derived version; `npm run build` regenerates `public/sw.js` via the prebuild script. Online navigations use the network so deployment releases are not mixed with old application bundles. Run `npx tsx scripts/verify-pwa.ts` for manifest/icon, storage-isolation and worker lifecycle tests. `node scripts/generate-pwa-icons.mjs` regenerates the branded PNGs from the existing SVG.
