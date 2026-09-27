# PostHog reverse proxy

## Goal
Stop the dev console errors `[PostHog.js] [ExceptionAutocapture] failed to load script` and `TypeError: NetworkError when attempting to fetch resource`, and stop events from being silently dropped.

## Diagnosis
- The page renders (`GET / 200`). Only the browser's requests to PostHog fail.
- `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`. The browser calls `eu.i.posthog.com` (events) and `eu-assets.i.posthog.com` (lazy scripts such as exception autocapture) directly.
- "NetworkError when attempting to fetch resource" is Firefox's error for a blocked request. Firefox Enhanced Tracking Protection and ad blockers (uBlock and others) block `*.posthog.com`.
- Real learners with blockers would lose analytics the same way, so this matters beyond dev.

## Skills and docs read
- AGENTS.md (sections 5, 6, 12: PostHog key is public, no secrets change)
- Existing code: `web/instrumentation-client.ts`, `web/next.config.ts`, `web/src/proxy.ts`, `web/src/components/analytics/*`
- PostHog's Next.js reverse proxy guidance (rewrites to `/ingest`)

## Decisions
- Proxy through Next.js `rewrites()` at `/ingest`. No new server route, and no separate backend.
- Keep `NEXT_PUBLIC_POSTHOG_HOST` as the upstream ingestion host. Derive the assets host (`eu.i.` → `eu-assets.i.`) and the UI host (`eu.i.posthog.com` → `eu.posthog.com`) from it, so moving to US only requires an env change.
- Exclude `/ingest` from the Clerk middleware matcher, because analytics beacons don't need auth.

## Files to touch
- `web/next.config.ts`: add `rewrites()` for `/ingest/static/:path*` → assets host and `/ingest/:path*` → API host, plus `skipTrailingSlashRedirect: true`.
- `web/instrumentation-client.ts`: `api_host: "/ingest"`, `ui_host: <derived UI host>`.
- `web/src/proxy.ts`: exclude `ingest` from the matcher.

## Security
- No keys change. The project token is already public by design. No private key is involved.
- The proxy only forwards to PostHog hosts that are fixed at build time from env, so it is not an open proxy.

## Acceptance criteria
- No PostHog NetworkError or ExceptionAutocapture errors in the console, even with Firefox strict tracking protection or uBlock on.
- The network tab shows `/ingest/...` requests returning 200, and none to `*.posthog.com`.
- Events (`$pageview`, `course_selected`) appear in PostHog Activity.

## Checks
- `npx tsc --noEmit`, `npm run lint`, `npm run build` in `web/`.

## Manual test
1. Restart `npm run dev`, because config changes need a restart.
2. Open http://localhost:3000 in the same Firefox window that showed the errors.
3. DevTools → Console: no PostHog errors.
4. DevTools → Network, filter `ingest`: requests return 200.
5. Click a course card. `course_selected` shows up in PostHog → Activity within about a minute.
