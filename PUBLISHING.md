# Subdomain launch and Google indexing

The owner has selected **GitHub + Vercel Hobby** and the AGPL source-publication route. Follow VERCEL_DEPLOYMENT.md; the Render/Docker material below is an alternative, not the active launch plan.

Prepared for a Node.js/container host. Sites/Cloudflare Workers cannot load the native Swiss Ephemeris Node addon. No DNS change, public deployment or Search Console submission has been made by these local changes.

## Needed for launch

1. The user confirmed `panchang.arpitagarwala.com`. DNS provider and deployment-host access are still needed; this is not yet a live deployment.
2. Supply access to a suitable Node/container host. This repository has a standalone Docker build; a Linux server with Docker, ports 80/443 and enough memory to build Next.js can run it. Hosting charges are separate from Panchang generation.
3. Resolve Swiss Ephemeris licensing before public service: comply with AGPL source obligations or hold a professional license. No license is silently assigned to the existing project. Review the upstream terms and THIRD_PARTY_NOTICES.md. If using AGPL, make the applicable complete corresponding source, license notices and build instructions available to service users before launch; publish an accessible source link in the website.

## Cloudflare DNS with Render hosting

Cloudflare is the confirmed DNS provider. Render can build this app's existing Dockerfile and run the native engine. `render.yaml` prepares a **free, noindex preview**, with manual deployments, the Singapore region, no database and the native-engine health endpoint. It does not create a service or authorize a paid plan.

For a public, search-indexed site, use an always-on paid compute instance. Render's free tier sleeps after 15 idle minutes, can take about a minute to wake, and answers `/robots.txt` with a disallow-all response while asleep. It also has shared monthly hour, bandwidth and build limits. It is unsuitable for the requested reliable SEO launch. Review the current dashboard price before purchasing any paid instance. Primary references: https://render.com/docs/free and https://render.com/docs/docker .

Connect Render and provide a source repository to deploy the prepared Blueprint. Never push `.env.local` or private provider credentials. License/source-publication requirements apply even to a public preview. Render environment variables are supplied as Docker build arguments as well as runtime variables; the Dockerfile declares the public SEO configuration arguments explicitly. Keep `SITE_INDEXING=false` during preflight. If changing the plan or indexing in the dashboard, also update the Blueprint before syncing it again, so a later sync does not restore preview settings.

After Render creates a service, add `panchang.arpitagarwala.com` in that service's Custom Domains settings. Create only this DNS record in Cloudflare:

| Type | Name | Target | Initial proxy setting |
| --- | --- | --- | --- |
| CNAME | `panchang` | The **actual** `onrender.com` hostname returned by Render | DNS only |

Do not invent the target or change the root domain's records. Resolve conflicting records only at the `panchang` label. Verify the custom domain and TLS certificate in Render first; Cloudflare proxying can be enabled afterward with compatible TLS settings. Keep HTML and `/api/` out of any Cloudflare “Cache Everything” rule, because dates, locations and personalized requests differ. After the custom domain works, the alternate `onrender.com` domain can be disabled in Render to avoid duplicate public hosts. Instructions: https://render.com/docs/configure-cloudflare-dns and https://render.com/docs/custom-domains .

## Production configuration

Create a private `.env.production` on the deployment machine (not committed or copied into the image):

```dotenv
PANCHANG_DOMAIN=panchang.arpitagarwala.com
SITE_INDEXING=false
GOOGLE_SITE_VERIFICATION=
```

Use the literal real hostname, without `https://` or a path. Keep indexing false during preview and preflight. These public configuration values are passed at build time because Next.js generates metadata routes during the build; changing only runtime environment is insufficient. Panchang credentials are not required.

Point the subdomain's A record to the server's public IPv4 address; add AAAA only if IPv6 is configured and reachable. Do not replace existing root-domain or unrelated records. Open ports 80 and 443, then run:

```sh
docker compose --env-file .env.production -f compose.production.yaml up --build -d
```

Caddy requests and renews HTTPS certificates once DNS resolves to this host. The app is reachable only through the proxy in this production configuration. HTTPS enables browser location permission. The certificate data uses persistent Docker volumes. Monitor disk/memory, keep backups of deployment configuration, configure appropriate traffic limits and apply security updates.

For a managed Node host, set `SITE_URL=https://your-confirmed-subdomain.example.com`, `SITE_INDEXING`, and optional `GOOGLE_SITE_VERIFICATION` before `npm run build`. Retain the native addon, ephemeris files, `.next/static` and `public` when packaging the standalone server. Set `PANCHANG_DATA_MODE=local`. Do not deploy `.env.local` or optional Prokerala secrets.

## Preflight and enable indexing

- Check the real HTTPS homepage, `/about`, `/privacy`, a city page such as `/panchang/new-delhi`, and `/api/panchang/health`. Health must return 200 with `status: ok` and `mode: local`.
- Test location permission on mobile and desktop: allow, deny, timeout, manual city, reload, shared-location links and automatic mode. Manual selection must remain pinned; shared coordinates must take precedence. GPS precision and browser policy vary.
- Verify the canonical URL, Open Graph image, status codes and source link/license notices. Confirm that arbitrary missing city slugs return 404. No HTTP URL or localhost URL should appear as a production canonical.
- When the public site is ready, set `SITE_INDEXING=true` and rebuild/redeploy. Confirm that `/robots.txt` allows crawling (except `/api/`), `/sitemap.xml` lists the real HTTPS URLs, and HTML robots metadata says `index, follow`.

## Google Search Console

Use the domain owner's Search Console account to verify the domain using Google's actual DNS token, or use a URL-prefix property and Google's supplied HTML verification token in `GOOGLE_SITE_VERIFICATION` followed by a rebuild. Never invent a token. Submit the actual `https://your-subdomain/sitemap.xml`; inspect the homepage and a city URL and request indexing. This requires domain/account access and cannot be accomplished by adding metadata alone.

Server-rendered city pages contain calculated daily timings and explicit conventions. They determine the local date on each request, avoiding a stale “today” page at midnight; bounded in-process calculation caches reuse the day's calculations. The sitemap excludes arbitrary coordinate/date query variants and the APIs. Query variants canonicalize to the homepage; city pages each have their own canonical. Structured data describes the site and application without fabricated ratings or reviews. It does not promise a rich result.

Monitor Search Console coverage, structured-data reports and real user performance after launch. Ranking depends on many factors, including relevance, trust, competition, links and performance; no implementation guarantees first place or indexing. Do not create repetitive low-value pages, scrape competitors or buy links.

## Local checks

```sh
npm run build
npx tsx scripts/verify-device-location.ts
```

Run `node scripts/verify-seo.mjs` against a running server. Use `PANCHANG_TEST_URL` and `PANCHANG_EXPECT_INDEXING=true` for a public-config test build. Default local builds intentionally disallow indexing. The Docker/Caddy setup needs testing on the intended Linux host; Docker is not installed in this workspace.
