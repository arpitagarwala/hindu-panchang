# Self-hosted Panchang backend

The default is `PANCHANG_DATA_MODE=local`. The daily and monthly APIs generate their own data from bundled Swiss Ephemeris Sun/Moon files and this application's ritual rules. No Panchang account, remote Panchang response, monthly credits or token renewal is needed. Existing Prokerala credentials are optional and ignored in local mode.

## Run on your computer

Use Node.js 22 LTS and npm. The native `sweph` module may require Python and C++ build tools when a prebuilt binary is unavailable.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. The same Next.js server serves the website and backend. Keep `data/ephemeris` with the deployment; never replace it with an empty directory. SHA-256 verification rejects missing or changed official files before calculation; the engine also rejects a lower precision fallback. Restart after updating ephemeris files, code or time-zone data. The health endpoint rechecks files on every request.

## Container deployment

```sh
docker compose up --build -d
```

This builds the native module on Linux, packages the standalone Next.js server, includes the ephemeris files, runs as a non-root user and exposes port 3000. `.env*` files are excluded from the build context. No credential is baked into the image. The image is built for the Docker host's architecture; use the same architecture for builder and runtime. Build-time package downloads require internet; runtime Panchang generation does not.

For a public installation, configure your own domain, HTTPS reverse proxy, resource limits and request rate limits. The local calculation caches are bounded and per-process. No public deployment has been made by this setup. Computing on hardware you already own has no per-request data-provider fee; electricity, hardware, a domain and hosted infrastructure may cost money. Free hosting tiers can change and must support Node.js native modules and persistent bundled files; static-only hosting cannot run this backend.

## API

```text
GET /api/panchang?date=2026-11-01&lat=28.6139&lon=77.209&tz=Asia%2FKolkata
GET /api/panchang-month?year=2026&month=11&lat=28.6139&lon=77.209&tz=Asia%2FKolkata
GET /api/panchang/source
GET /api/panchang/health
```

The health endpoint returns 200 only when the official-file hashes, native engine smoke check and configuration succeed; otherwise 503. It reveals no credentials. Source metadata identifies local generation without claiming an independent match. Supported user years: 1900–2100. Location, IANA time zone, sunrise convention, month convention, region and tradition affect the results.

## Verify without a Panchang service

```sh
npx tsx scripts/verify-self-hosted.ts
```

This blocks `fetch` before importing the engine and tests daily, month and festival generation in four time zones, including supported date limits. It also checks rejection of missing/corrupt ephemeris files. The separate Drik regression fixtures are stored locally; running `node scripts/validate-drik.mjs` against a running server does not scrape Drik or require their API. See README for the full astronomical and observance regressions.

City-name search optionally uses Open-Meteo; coordinate time-zone lookup and the built-in city fallback work locally. Google fonts and linked reference websites also need internet. These are distinct from Panchang generation. This is a self-hosted backend, not a full offline browser/PWA installation.

## Accuracy and licensing

Swiss Ephemeris is a high-precision astronomical engine; sunrise depends on atmospheric assumptions, elevation and horizon, and ritual observance depends on tradition. Existing regional-review labels remain necessary. Neither self-hosting nor agreement with another website establishes zero errors. Automated regression samples cover selected dates and conventions, not every city and ritual.

Swiss Ephemeris is dual licensed: AGPL or professional license. Public service/distribution requires meeting its applicable license conditions, including the AGPL source obligations if using that route. This setup does not assign a license to the entire existing project. See THIRD_PARTY_NOTICES.md and the upstream license before publishing. Self-hosting removes a Panchang API dependency; it does not remove software licensing obligations.

Optional independent checking remains available through `cross-check` or `verified-only`; see PROVIDER_BACKEND.md. It is off by default.
