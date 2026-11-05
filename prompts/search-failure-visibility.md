# Search failure visibility

## Goal

Every search on production returns "Search is unavailable right now". The route catches the error, writes it only to `console.error`, and streams an error line inside an HTTP 200. Nothing reaches PostHog, so the failing step is not visible. Make each failure name its step and its upstream status in PostHog, so the root cause can be found and fixed, and so a future failure does not stay silent.

## Skills and docs read

- `AGENTS.md`: §5 (server and client boundaries), §7 (PostHog analytics), §11 (search behaviour), §12 (private keys stay on the server), §13 (checks).
- `web/src/lib/posthog-logger.ts` and `web/src/instrumentation.ts`: the existing OTLP log pipeline to PostHog Logs (service `vertex-web`). It already works on production for content requests.

## Code inspected

- `web/src/app/api/search/route.ts`: the catch block logs to the console only.
- `web/src/lib/search/agent.ts`: env check, MCP connect, then `generateText`. The status line "Searching lessons and videos…" is sent only after the MCP tools load.
- `web/src/components/search/search-experience.tsx`: captures `search_performed` on success only.

## Findings

- A production request streams the "Searching lessons and videos…" status, then the error line about 7.5 s later, with no "Matching chapters and lessons…" status between them. So the env vars and the MCP connection work, and the failure is in the first LLM call.
- A local mock shows that the AI SDK retries a 429 or 5xx response 3 times with about 6 s of backoff. A 400 or 401 fails in under 50 ms. The production timing fits a retried OpenAI error, most likely a 429 (`insufficient_quota` or a rate limit). This is not yet confirmed.

## Decisions

- Tag each step (`config`, `mcp`, `llm`, `hydrate`) with a `SearchStepError` that keeps the original error as its `cause`.
- Log every search to PostHog Logs (`event: search.request`) through the existing OTLP logger. A failure log holds the step, the error class, the upstream HTTP status, the provider error code, and the first 300 characters of the message. Never log the query text or a key.
- Send the step in the stream error line. The client captures `search_failed` with the step, the query length, and the duration. The client does not get the error details.
- Do not change the search architecture or add a fallback search (AGENTS.md §7).

## Files

- `web/src/app/api/search/route.ts`
- `web/src/lib/search/agent.ts`
- `web/src/lib/search/types.ts`
- `web/src/lib/posthog-logger.ts`
- `web/src/components/search/search-experience.tsx`

## Security

- The browser gets only the step name. The error message and status stay in server logs.
- The PostHog project token is public by design. No new secret is added.

## Acceptance criteria

- A failed search writes one `search failed` log in PostHog Logs with `failed_step` and, for an LLM error, `error_status` and `error_code`.
- A failed search captures one `search_failed` event with `step`.
- A successful search writes one `search completed` log and still captures `search_performed`.

## Checks

- `web`: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- A local run against mock MCP, OpenAI (429), and OTLP servers.

## Manual test

1. Deploy, then search `/search?q=devops` on production.
2. In PostHog Logs, filter service `vertex-web` and attribute `event = search.request`. Read `failed_step`, `error_status`, and `error_code`.
3. If `error_status` is 429 with `insufficient_quota`, add billing or credit to the OpenAI account, or replace `OPENAI_API_KEY` on Vercel. Then redeploy and search again.
4. Confirm a `search_performed` event, or a new `search_failed` event with its step.
