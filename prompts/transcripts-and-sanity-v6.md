# Transcripts for search, Sanity v6, and the Context plugin

## Goal
1. Get real transcripts into the 120 `video` documents so search can fall back to transcript moments when no chapter matches (AGENTS.md §7, §9).
2. Upgrade the Studio from Sanity v5.31 to v6, and install the `@sanity/context` Studio plugin so the `vertex-search` Context document can be edited in the Studio.

## Skills and docs read
- `AGENTS.md`: §9 (offline ingestion, short timestamped chunks, never whole transcripts in the request path), §10 (Context document), §12 (install the plugin only when it supports the Studio's major), §13 (deploy the Studio, deploy the schema, import).
- `create-agent-with-sanity-context`: `references/studio-setup.md` (installing the plugin, `contextPlugin()`, adding the Context types to a custom structure, redeploying), and `references/conversation-classification.md` for what Insights needs.
- `sanity-best-practices`: Studio config and structure conventions.

## Code and live state inspected
- `scripts/ingest-videos.ts`: scrapes the watch page's `ytInitialPlayerResponse`, takes `captionTracks[].baseUrl`, parses `<text start=…>` cues, and merges them into 15s chunks. It writes `scripts/videos.seed.ndjson`, which is imported with `--replace`.
- Live dataset: 120 video docs, 60 with chapters, **0 with chunks**.
- **Root cause, reproduced on this machine** (`9602Yzvd7ik`):
  - the watch page's caption URL contains `exp=xpe` and returns **0 bytes**, because YouTube now requires a proof-of-origin (PO) token for web-client caption URLs
  - the same video requested through YouTube's InnerTube `player` endpoint as the **ANDROID** client returns a caption track whose URL returns **28 KB** of `srv3` XML (`<p t="ms" d="ms">…</p>`)

  So the file header's "suspicious IP" explanation is wrong, and re-running the script from another network won't help.
- `studio/package.json`: `sanity ^5.31.2`, `@sanity/vision ^5.31.2`, `@sanity/icons ^3.8.0`, `styled-components ^6.5.3`.
- npm: `sanity@latest` is 6.16.0 (engines `node >=22.12`, and this machine runs Node 24.21), `@sanity/vision` 6.16.0 (peer `sanity ^6`), `@sanity/icons` 5.2.2 (peer `react ^18 || ^19`), and `@sanity/context` 2.0.0 (peer `sanity ^6`, `ai ^6.0.175`, `@sanity/client ^8.4`).
- The Studio only uses `defineType`/`defineField`/`defineArrayMember`, `structureTool` with a custom `structure.ts`, `visionTool`, and `@sanity/icons`. That's a small surface for a major upgrade.
- `web/` has `ai@7`, while `@sanity/context`'s AI SDK Insights integration peers `ai ^6`.

## Decisions and assumptions
**Transcripts**
- The ingest script gets the video's player data from the InnerTube `player` endpoint with the ANDROID client context, instead of scraping the watch page. That one response carries both the caption tracks and `videoDetails.shortDescription`, so chapters keep coming from the description exactly as today.
- Track choice is unchanged: manual English first, then auto-generated (`asr`) English, then the first track.
- It fetches the track with `fmt=srv3` and parses `<p t="ms">` cues, stripping the inner `<s>` tags, decoding entities and collapsing whitespace. The old `<text start="s">` format stays supported as a fallback. Cues are merged into the same 15s chunks.
- Requests are sequential with a 500ms pause, and there's one retry per video.
- The summary prints chapters and chunks per video. If a video gets 0 chunks, it warns with the real reason: no caption track, or an empty body.
- The file header comment is updated with the correct explanation.
- Doc ids and URLs are unchanged: `video.youtube-<id>` and the `watch?v=` URL, so the lesson join is unaffected.
- Re-import with `npx sanity dataset import ../scripts/videos.seed.ndjson <dataset> --replace` from `studio/`. The import replaces the whole video docs, so chapters are regenerated too, from the same descriptions.
- **Risk:** the InnerTube endpoint is undocumented, and scraping captions may conflict with YouTube's Terms of Service. It can break without notice. Because this runs offline, a breakage only stops future ingests. It never affects the live site. The official YouTube Data API `captions.download` only works for videos you own via OAuth, so it can't fetch these third-party videos. Flagged for your decision.
- No search code changes are needed. The system prompt, the Context instructions and `hydrate.ts` (which already accepts `chunkStarts`) handle the transcript fallback.

**Sanity v6 and the plugin** (`studio/` only; `web/` is untouched)
- Bump `sanity` and `@sanity/vision` to `^6.16.0` and `@sanity/icons` to `^5.2.2`, keep `styled-components`, and add `@sanity/context@^2.0.0`. Fix any type or config errors the upgrade surfaces.
- `sanity.config.ts`: add `contextPlugin({insights: false})`.
  - **Insights is off.** It needs `sanityInsightsIntegration` in the search route, and that peers `ai ^6` while `web` uses `ai@7`. That route also uses `generateText`, not a chat thread. Turning Insights on would show an empty dashboard.
  - Insights can be enabled later, once `@sanity/context` supports AI SDK v7.
- `structure.ts`: add an "Agents" group listing the Context type (`CONTEXT_SCHEMA_TYPE_NAME`, imported from `@sanity/context/studio`), and keep it out of the main content list, following the reference structure.
- Check that the existing `vertex-search-context` document (created by CLI import) matches the plugin's field names (`name`, `slug`, `instructions`, `groqFilter`). If a field name differs, rename it in `studio/context/vertex-search.json` and re-import.
- Redeploy the Studio (`npx sanity deploy`), which also deploys the schema. The Context MCP must keep serving.
- `AGENTS.md` §12 stays as is. It's a general rule ("when the plugin lags"), which no longer applies once the Studio is on v6.

## Files expected to touch
- `scripts/ingest-videos.ts`: InnerTube player fetch, srv3 parser, retry and pacing, corrected header.
- `scripts/videos.seed.ndjson`: regenerated.
- `studio/package.json`, `studio/package-lock.json`: upgrade and the new plugin.
- `studio/sanity.config.ts`: `contextPlugin`.
- `studio/structure.ts`: the Agents group.
- `studio/context/vertex-search.json`: only if the field names differ.
- `web/sanity.types.ts`: regenerated with `npm run typegen`. The plugin's type may appear in it.

## Requirements
- Most of the 120 videos get transcript chunks. Videos with no caption track are reported, not faked.
- No video document holds a whole transcript in one field. Chunks stay 15s windows.
- The Studio runs on v6, and the Context document opens and saves in the Studio.
- The deployed Studio is v6, and the Context MCP still serves the `vertex-search` slug with its instructions and filter.

## Security
- The ingest script uses no credentials against YouTube. The Sanity import uses the logged-in CLI session, as before. No token is added to any file.
- Transcript text lives only in `video.chunks`. The request path fetches it only through filtered MCP queries (at most 3 per video) and never sends it to the browser. `hydrate.ts` only reads `chunks[].startSeconds`.
- The plugin runs in the Studio only. No new secrets, and no change to `web`'s token handling.

## Acceptance criteria
- `npm run ingest` in `scripts/` prints per-video chunk counts, and most are above 0.
- After import, `count(*[_type=="video" && count(chunks) > 0])` is well above 0.
- A live MCP `groq_query` for `chunks[text match "…"]` on a phrase that's only in speech returns a moment. `/api/search` for that phrase returns a video result whose `startSeconds` is a chunk start.
- In `studio/`, `npm run dev` starts on v6, the "Agents" group lists "Vertex search", and editing its instructions saves.
- `npx sanity deploy` succeeds, and the MCP `tools/list` and `/initial-context` for `vertex-search` still return the instructions.
- `web`: `tsc`, lint and build still pass after typegen.

## Checks
- `scripts`: `npx tsc --noEmit`, `npm run ingest`.
- `studio`: `npm install`, `npx tsc --noEmit`, `npm run build`, `npx sanity deploy`, the dataset import, and `npm run typegen`.
- Live MCP: `tools/list`, `/initial-context`, and a transcript `groq_query`.
- `web`: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Manual test
1. `cd studio && npm run dev`, open http://localhost:3333 and confirm the Studio loads.
2. Open Agents → Vertex search and confirm the instructions and filter are there. Add a space, publish, then revert it.
3. Open Videos (internal) and pick any video. Its Transcript chunks list should have entries.
4. Restart the web dev server, since search caches results and the initial context in memory.
5. Search a phrase that's spoken in a video but isn't a chapter title. A VIDEO card should appear, and "Watch from" should start near where it's said.
