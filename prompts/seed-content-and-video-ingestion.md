# Seed Sanity content and build the video ingestion pipeline

## Goal

1. Seed the `production` dataset with the provided `scripts/seed.ndjson` (courses, lessons, instructors, categories) via the Sanity CLI, and verify document counts afterward.
2. Add the `video` document schema (section 8 of AGENTS.md) so video documents have somewhere to live.
3. Build the offline video-ingestion pipeline (section 9) that turns `scripts/videos.json` into real `video` documents: chapters from the source's chapter markers, and a transcript split into short timestamped chunks. Build it correctly, but do not run its network-fetching steps in this session.

`scripts/seed.ndjson` and `scripts/videos.json` are inputs and must not be modified.

## Skills and docs read

- `AGENTS.md` sections 5, 7, 8, 9, 12, 13 (workspace boundaries, video pipeline rules, things that trip you up, checks).
- `sanity-migration` skill (`references/general.md`): deterministic IDs, `createIfNotExists`/`--replace` for idempotent reruns, NDJSON for bulk import, import referenced documents before documents that reference them.
- `sanity-best-practices`: `defineType`/`defineField` conventions, running `typegen` after schema changes.

## Code inspected

- `studio/schemaTypes/documents/lesson.ts`: lesson has `videoUrl` (a plain `url` field, no reference field to a video document) — confirms section 8's "Lessons link to them by video URL," i.e. video docs are joined by matching URL string, not a Sanity reference.
- `studio/schemaTypes/index.ts`, `studio/structure.ts`, `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/env.ts`: schema registration pattern, and that `sanity.cli.ts` already declares TypeGen output to `../web/sanity.types.ts`.
- `scripts/seed.ndjson`: 141 lines — 6 `category`, 5 `instructor`, 10 `course`, 120 `lesson`. All documents use deterministic slug-based `_id`s (e.g. `course.nextjs-app-router-in-depth`, `lesson.nextjs-app-router-in-depth-file-system-routing`). Every lesson's `videoUrl` is `https://www.youtube.com/watch?v={id}`.
- `scripts/videos.json`: 120 entries keyed by lesson slug, each `{ id, title, channel, duration, query }` (`id` is the YouTube video id). Verified 1:1 against the 120 lesson slugs in `seed.ndjson` — no mismatches either direction.
- Confirmed via `npx sanity dataset list` and `npx sanity documents query` that the CLI is already authenticated against this project, and the `production` dataset currently holds 0 content documents (only Sanity system docs). Dataset import therefore needs no separate write token — it rides the CLI's existing login session.

## Decisions and assumptions

- **Import mechanism**: `npx sanity dataset import scripts/seed.ndjson production --replace`, run from `studio/`. `--replace` makes reruns converge instead of erroring on existing `_id`s.
- **`video` document shape** (per section 8, kept minimal):
  - `url` (string/url, required) — the exact video URL, matched against `lesson.videoUrl` at query time.
  - `chapters`: array of `{ startSeconds: number, label: string }`.
  - `chunks`: array of `{ startSeconds: number, text: string }`.
  - No reference field back to the lesson — the join is by URL string, as the lesson schema already implies.
  - `_id`: `` `video.youtube.${sanitizedId}` ``, sanitizing to `[A-Za-z0-9_.-]` even though YouTube ids already satisfy that, to match section 9's "stripping any characters the datastore rejects."
- **Studio visibility**: register `video` in `schemaTypes/index.ts` like the other document types, but split `structure.ts` into a "Content" list (existing document types) and a separate "Videos (internal)" list, since section 7 says video documents are an internal lookup never shown to learners as results — that's a search-UI rule, but keeping it visually separate in the Studio nav avoids editors mistaking it for content to author by hand.
- **Ingestion pipeline location**: new `scripts/` package (`scripts/package.json`, `scripts/tsconfig.json`), since section 5 calls the video pipeline "offline tooling" that must never run in the request path — it doesn't belong inside `web/` or `studio/`'s runtime.
  - `scripts/ingest-videos.ts`: reads `scripts/videos.json`, and for each entry:
    1. Fetches the YouTube watch page HTML for `https://www.youtube.com/watch?v={id}`.
    2. Parses the embedded `captionTracks` JSON to find an English track (prefer manually-created over `kind:"asr"`), then fetches that track's `timedtext` URL and parses the `<text start dur>` cues into `chunks`, decoding HTML entities and merging consecutive cues into ~15s windows.
    3. Parses the embedded player-response chapters renderer (falling back to regex-parsing `mm:ss — Label` lines in the video description) into `chapters`. If none found, `chapters` is `[]` — the search route already falls back to transcript matching per section 7.
    4. Writes one NDJSON line per video document to `scripts/videos.seed.ndjson` (generated, gitignored — not the input files).
  - No Sanity write token needed: the generated file is imported the same way as `seed.ndjson`, via the CLI's existing session (`npx sanity dataset import scripts/videos.seed.ndjson production --replace`).
- **Not running the scraper now**: I tested fetching a real caption track from this sandbox (both via `curl` and Node `fetch`) and YouTube returned HTTP 200 with an **empty body** — the caption URL is signed against the requester's real IP (`ip=0.0.0.0` placeholder baked into the signature), which this environment's egress doesn't match. This is a known anti-scraping measure, not a bug in the approach. Per your direction, I'm building the real pipeline and documenting how to run it, but not executing its network steps here — you'd run `npm run ingest` inside `scripts/` from a normal machine/network to actually populate `videos.seed.ndjson`, then import it.

## Files expected to touch

- `studio/schemaTypes/documents/video.ts` (new)
- `studio/schemaTypes/index.ts` (register `video`)
- `studio/structure.ts` (split Content vs. internal Videos list)
- `scripts/package.json`, `scripts/tsconfig.json` (new, minimal — `@sanity/client` isn't even needed since we write NDJSON, not mutate directly; only needs `typescript`/`tsx` to run the script)
- `scripts/ingest-videos.ts` (new)
- `scripts/.gitignore` (new — ignore `videos.seed.ndjson`, `node_modules`)
- No changes to `scripts/seed.ndjson` or `scripts/videos.json`.

## Requirements

- Do not modify the two input files.
- `sanity dataset import` for `seed.ndjson` is run now, in this session, and verified by count.
- The ingestion script must be real, runnable code — not a stub — but its scraping steps are not executed in this session.
- Keep the video document internal: no UI or search-facing code changes here (out of scope for this task).

## Security considerations

- No secrets required for either step: dataset import rides the CLI's existing authenticated session; the ingestion script only calls public YouTube endpoints (watch page HTML, public `timedtext` captions) — no API key, no token.
- `scripts/videos.seed.ndjson` is gitignored since it's a generated artifact that may contain partial/empty data depending on when and where it's run.

## Acceptance criteria

- After import: `count(*[_type=="category"])` = 6, `instructor` = 5, `course` = 10, `lesson` = 120.
- `video` schema type is registered, Studio type-checks, and `npm run typegen` (in `studio/`) succeeds and updates `web/sanity.types.ts` with the new type.
- `scripts/ingest-videos.ts` type-checks and, when run with real network access, writes `scripts/videos.seed.ndjson` with 120 lines, each a valid `video` document.
- `git diff` shows no changes to `scripts/seed.ndjson` or `scripts/videos.json`.

## Checks to run

- `studio`: `npx tsc --noEmit`, `npm run typegen`.
- `scripts`: `npx tsc --noEmit`.
- Live verification: `npx sanity documents query` count check against the `production` dataset after import.

## Manual test steps

1. `cd studio && npx sanity dataset import ../scripts/seed.ndjson production --replace`
2. `npx sanity documents query '{"category":count(*[_type=="category"]),"instructor":count(*[_type=="instructor"]),"course":count(*[_type=="course"]),"lesson":count(*[_type=="lesson"])}'` — expect `{category:6, instructor:5, course:10, lesson:120}`.
3. `cd studio && npm run dev` — confirm the Studio loads, "Videos (internal)" appears as its own list item, and the existing content types are unaffected.
4. `cd scripts && npm install` — confirm it installs cleanly, then `npx tsc --noEmit` — confirm it type-checks.
5. (Later, from a machine with normal network access) `cd scripts && npm run ingest`, then `cd ../studio && npx sanity dataset import ../scripts/videos.seed.ndjson production --replace`, then re-run the count query for `video` — expect 120.
