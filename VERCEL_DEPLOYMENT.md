# GitHub and Vercel Hobby deployment

Source: https://github.com/arpitagarwala/hindu-panchang

Target domain: https://panchang.arpitagarwala.com

## Runtime

This is a Next.js application with Node.js 22 Vercel Functions, not an Edge-only app. The same Swiss Ephemeris native engine, official Sun/Moon files and ritual rules run on the server. No external Panchang API, database, cron job, writable persistent disk or paid add-on is required. `sweph` includes a Linux x64 native binary; explicit Next.js tracing includes the native prebuilds and ephemeris files in function bundles. SHA-256 verification and the native engine flag reject missing/corrupt data and silent lower-precision fallback.

`vercel.json` selects Next.js, npm ci and the Mumbai function region. `package.json` pins Node.js 22.x. Native calculation routes declare the Node.js runtime with a 60-second maximum duration. This is a ceiling, not a claimed response time. In-memory caches are optimizations only: every fresh function can regenerate data from bundled files. Node settings and trace paths must be preserved when updating the deployment.

## Git integration

Import the GitHub repository into the existing Vercel Hobby account and use the Next.js framework preset. Root directory is the repository root. The `main` branch is the production branch; pull requests can produce previews. The Linux GitHub Actions workflow runs the astronomy, ritual, offline-generation and SEO regression suites.

No private `.env*`, Vercel project state, generated build output or local artifacts should be committed. Optional Prokerala credentials are unnecessary and must not be uploaded. The project is AGPL-3.0-or-later at the owner's request; the public repository, dependency notices, build instructions and visible service source link accompany that choice.

## Environment

Set these values for production and preview **before building**:

```dotenv
PANCHANG_DATA_MODE=local
SITE_URL=https://panchang.arpitagarwala.com
SITE_INDEXING=false
```

Keep previews noindex. Once the custom domain is connected, verified and tested, enable `SITE_INDEXING=true` for production only and redeploy. The indexing flag affects build-generated sitemap/robots/metadata; changing it requires a new build. An actual Search Console HTML verification token can be added as `GOOGLE_SITE_VERIFICATION`; never invent one. Submit the live `/sitemap.xml` through the domain owner's Search Console account.

## Custom domain with Cloudflare

Add `panchang.arpitagarwala.com` to this project's Vercel Domains settings. Use the exact DNS record that Vercel returns. In Cloudflare, change only the `panchang` record; leave the root site and unrelated subdomains intact. Initially use DNS-only mode for verification. Wait for Vercel to verify DNS and issue TLS before enabling any optional proxying. Do not cache `/api/` or personalized/date-sensitive HTML with a Cache Everything rule.

## Verification

Check the deployed `/api/panchang/health`, `/api/panchang/source`, daily/monthly APIs, city pages, source link, canonical host, location permission and failure cases. Re-run `validate-drik.mjs`, `verify-panchang.mjs`, `verify-observances.mjs` and `verify-seo.mjs` against the actual deployment using `PANCHANG_TEST_URL`. Use `PANCHANG_EXPECT_INDEXING=true` only for the launch-configured production build. Previews may require Vercel authentication; never disable protection solely to make a test pass.

Hosting does not change astronomical conventions or resolve the documented regional limitations. Hobby usage quotas still apply, and Hobby's permitted-use terms are independent of the software license. No paid Vercel plan or add-on is authorized by this configuration.
