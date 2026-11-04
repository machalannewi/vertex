# Intelligent search

## Goal
Build Vertex's search end to end:
- the Sanity Context MCP connection and the Context document (content scope plus query instructions)
- a server side search API that lets an LLM write GROQ through the MCP, then grounds and hydrates what it finds
- the `/search?q=` results page matching `design/vertex-search.png`, with video moment results and lesson results

It covers courses and lessons, with video documents as the internal timestamp lookup.

## Skills and docs read
- `AGENTS.md`: sections 5 (search API and UI boundaries), 7 (grounded, cards not chat, chapters then transcript, playback on site), 10 (Context doc), 11 (search behaviour), 12 (pitfalls), 13 (checks).
- `create-agent-with-sanity-context`: `SKILL.md`, `references/nextjs-agent.md`, `references/studio-setup.md`, `references/system-prompts.md`, and the reference `ecommerce/app/src/app/api/chat/route.ts` (MCP client over HTTP, `/initial-context` fetch and cache, dropping the `initial_context` tool, `groq_query`/`schema_explorer`).
- `dial-your-context`: the Instructions field holds deltas only, and the `groqFilter` is a full GROQ expression. I'll use Path A (write via CLI to a doc I create, since none exists).
- `shape-your-agent`: short system prompt (role, boundaries, fallback), with no schema restated except the critical rules §11/§12 require in both places.
- `node_modules/next/dist/docs/01-app`: route handlers (`15-route-handlers.md`), `maxDuration` segment config, and page `searchParams` as a promise.

## Code and live state inspected
- `studio/schemaTypes/**`: `course.modules[]` holds embedded `module` objects with `lessons[]` references. A `lesson` has `videoUrl`, `thumbnail`, `duration` (seconds), `notes` (Portable Text), and `keyPoints`. A `video` has `url` (equal to `lesson.videoUrl`), `chapters[]{startSeconds,label}` and `chunks[]{startSeconds,text}`.
- `studio/sanity.config.ts`: Sanity **v5.31**, with no `studioHost` in `sanity.cli.ts`.
- `npm info @sanity/context`: 2.0.0, with peer `sanity ^6`. It lags the Studio major, so per §12 **I won't install it**, and the Context document is created by CLI import.
- Live dataset (read token, GROQ API): 10 courses, 120 lessons, 120 video docs. **60 have chapters and 0 have transcript chunks**, because the caption fetch returned empty, as `scripts/ingest-videos.ts` warns. There's no `sanity.agentContext` document yet.
- Live MCP `tools/list` returns `-32004 Only datasets with deployed Studio applications are supported`. **The Studio must be deployed first.**
- `web/src/sanity/lib/{client,data,queries,numbering}.ts`: a server-only token client, `defineQuery` plus TypeGen, and `getLessonLabel`/`getModuleLabel`.
- `web/src/components/ui/{input,select,badge,button,navbar}.tsx`, `lib/icons.ts` (`getLucideIcon`), `lib/course-card-props.tsx` (a course is shown as its category's lucide icon on a dark square), `lib/format.ts`, and `components/analytics/capture-event.ts`.
- `web/src/app/lessons/[slug]/page.tsx`: already honours `?t=<seconds>` and passes it to the YouTube embed's `start`.
- `web/src/app/page.tsx`: the homepage search `Input` (⌘K) isn't wired to anything.
- `web/.env.local`: no `OPENAI_API_KEY` yet. `web/.env.example` also lacks the PostHog vars that are already in use.

## Decisions and assumptions
**Search pipeline (server only)**
1. `POST /api/search` with `{ query }`. It's validated with Zod (trimmed, 2–200 chars).
2. The agent (`web/src/lib/search/agent.ts`, `server-only`):
   - opens `createMCPClient` (`@ai-sdk/mcp`, HTTP transport) to `SANITY_CONTEXT_MCP_URL` (the slug URL of the Context doc), with the bearer `SANITY_API_READ_TOKEN` (viewer)
   - fetches `/initial-context` once and caches it for the life of the process (§12, so changes need a restart), then drops the `initial_context` tool
   - runs `generateText` (AI SDK, `@ai-sdk/openai`) with the MCP tools, `stopWhen: stepCountIs(10)`, and structured output (Zod) `{ results: [{ kind: "video"|"lesson", lessonId, startSeconds?, matchedOn?: "chapter"|"transcript" }] }`, ranked best first
   - closes the MCP client in `finally`
   - reads the model from `OPENAI_MODEL`, defaulting to `gpt-5-mini`
3. **Grounding and hydration** (`web/src/lib/search/hydrate.ts`). The LLM only chooses ids and seconds. Everything shown comes from one server GROQ fetch (`SEARCH_HITS_QUERY`, `_id in $ids`) that returns:
   - the lesson fields
   - the parent course through a reverse reference, with its category icon and module outline, so labels come from `numbering.ts`
   - the matching video doc's `chapters[].startSeconds` and `chunks[].startSeconds`, which are numbers only and never the transcript text

   Results are dropped when:
   - the lesson doesn't exist or no course uses it
   - it's a video result whose `startSeconds` isn't one of that video's stored chapter or chunk starts
   - it's a duplicate

   So a count, course, lesson or timestamp can never be invented.
4. **Streaming**: the route returns `application/x-ndjson`. It sends `{type:"status"}` lines as the agent steps through tool calls ("Searching lessons…"), then one `{type:"results", results, courseCount}` line, or `{type:"error", message}`. The client reads the stream with `fetch` and `getReader()`, so there's no chat hook.
5. **Cost and abuse guards**, since search is public and every request is a paid LLM call:
   - an in-memory per-IP limit of 10 searches a minute (429 when exceeded)
   - an in-memory result cache keyed by the normalized query (10 min TTL, max 100 entries)
   - `maxDuration = 60`

   Both in-memory guards are per instance. That's enough for now, and it's noted as a limitation.

**Query rules**: these go in both the inline system prompt and the Context doc, per §11/§12. The rules:
- Search both ways and merge:
  - lessons on topic: `title`, `pt::text(notes)` and `keyPoints`
  - video moments on `video.chapters[].label` first, and `chunks[].text` only for videos with no chapter hit
- Join video to lesson with `lesson.videoUrl == video.url`, and never return a video without its lesson.
- Tokenize the query, wildcard each keyword (`"fetch*"`), and OR the keywords. Never match a whole phrase.
- Rank with `score(boost(title match …, 3), …)` so an exact concept in the title wins.
- Project at most 3 matching chapters/chunks per video (`chapters[label match …][0...3]`), and never a whole `chunks` array.
- Return every relevant result, not a handful.
- `text::semanticSimilarity` is not used (embeddings unconfirmed).
- The backticks inside the template literal prompt are escaped.

**Context document** (`studio/context/vertex-search.json`, type `sanity.agentContext`, `_id: "vertex-search-context"`, slug `vertex-search`):
- `groqFilter`: `_type in ["course","lesson","category","instructor","video"] && !(_id in path("drafts.**"))`
- `instructions`: the deltas above (the videoUrl join, the reverse reference course lookup, labels derived from order, the `pt::text` rule, the chapter then transcript order and chunk limits, and the wildcard OR rule), in about 15 lines

It's created with `npx sanity documents create context/vertex-search.json --replace` from `studio/`. If the MCP won't apply a doc whose type isn't in the deployed schema, the fallback is the base MCP URL with `?instructions=&groqFilter=` params. I'd flag that rather than install the incompatible plugin.

**Studio deploy**: add `studioHost` to `studio/sanity.cli.ts` (the hostname you choose), then `npx sanity deploy` from `studio/`. The MCP needs this (§12).

**Results page UI** (`/search?q=`), matching `design/vertex-search.png`:
- A server `page.tsx` reads `q` and renders `Navbar showActions` plus the client `SearchExperience`.
- Header: a "SEARCH RESULTS" pill, `Results for "<q>"` with the quoted query in orange, and "Found N results across M courses" (computed from hydrated results). Below that, the search input (reuses `Input` with `icon` and `⌘K`, submits to `/search?q=`, and ⌘K/Ctrl+K focuses it).
- A row with "N results" and a `Select` sort control: **Most Relevant** (default), Videos first, Lessons first, Course A–Z. Sorting is client side over the ranked list.
- **Video card**:
  - left: the lesson thumbnail with a play overlay and the clip length (lesson duration, `m:ss`)
  - right: the course icon and name, an orange `VIDEO` badge, the lesson title, a 2-line description (the lesson's intro paragraph from `notes`), and `Lesson 5.1 · <module title>`
  - action: "Watch from m:ss" → `/lessons/<slug>?t=<startSeconds>`
- **Lesson card**:
  - left: a panel with a document icon and the lesson's key points as bullets
  - right: the course, a lavender `LESSON` badge, the title, the description and `Module N`
  - action: "View lesson" → `/lessons/<slug>`
  - The design's check mark on the left panel is a completion mark. Progress isn't built yet, so it's **not rendered**. I won't show a false completion state.
- The bottom banner "Can't find what you're looking for? … Browse all courses →" links to `/courses`. With zero results it becomes the empty state: "No results for "q"" plus the same banner.
- Loading shows the streamed status text and skeleton cards. An error shows a message with a retry button.
- The homepage search input becomes a form that submits to `/search?q=`, with the same ⌘K focus.
- The navbar is unchanged. The design's orange "Courses" active state is out of scope for this task.
- **Responsive**: below `md`, the cards stack (thumbnail/panel on top, full width) and the header text scales down. There's no horizontal scroll at 375px.

**Analytics** (PostHog, browser, existing `captureEvent`):
- `search_performed` with `{query_length, result_count, video_count, lesson_count, course_count, duration_ms}`. The raw query isn't sent, to avoid capturing free text PII.
- `search_result_clicked` with `{kind, lesson_slug, position, start_seconds}`.

**Not built**: no chat, no markdown reply (the design shows none, so `react-markdown` isn't added), no Conversation Insights (it needs the plugin), no semantic search, and no transcript re-ingestion.

## Files expected to touch
- `studio/sanity.cli.ts`: `studioHost`.
- `studio/context/vertex-search.json`: new Context document.
- `web/package.json` / lockfile: add `ai`, `@ai-sdk/mcp`, `@ai-sdk/openai`, `zod`.
- `web/.env.example`: `OPENAI_API_KEY`, `OPENAI_MODEL`, `SANITY_CONTEXT_MCP_URL`, and the PostHog vars.
- `web/src/app/api/search/route.ts`: new.
- `web/src/lib/search/{agent,system-prompt,hydrate,guards}.ts`: new, server only.
- `web/src/lib/search/types.ts`: new, the shared result type (client safe, with no secrets).
- `web/src/sanity/lib/queries.ts`: add `SEARCH_HITS_QUERY`.
- `web/sanity.types.ts`: regenerated.
- `web/src/app/search/page.tsx`: new.
- `web/src/components/search/{search-experience,search-form,video-result-card,lesson-result-card}.tsx`: new.
- `web/src/app/page.tsx`: use `SearchForm`.
- `web/src/lib/format.ts`: add `formatTimestamp` (m:ss / h:mm:ss).

## Requirements
- Matches the design on desktop, and is responsive to mobile.
- Every card is backed by real Sanity data, and every "Watch from" second exists in that video's chapters or chunks.
- Chapters are matched before the transcript, and the transcript is never returned wholesale.
- All ranked results are shown with a count, and the sort defaults to Most Relevant.
- An empty state links to `/courses`.

## Security
- `OPENAI_API_KEY`, `SANITY_API_READ_TOKEN` and the MCP URL are server only. The `lib/search` modules import `server-only`. The browser only calls `/api/search` and never the MCP or the LLM.
- Input is validated with Zod and length capped, and LLM output is Zod validated and then re-verified against Sanity before anything is rendered.
- `lessonId` values are passed as GROQ params and never interpolated.
- The in-memory rate limit and cache bound the cost exposure of the public endpoint.
- The Context doc's `groqFilter` restricts the agent to content types and excludes drafts. The token is viewer only, so the agent can't write.
- The raw query isn't sent to PostHog.

## Acceptance criteria
- MCP `tools/list` succeeds after the Studio deploy, and `/initial-context` returns the schema.
- `curl -N -X POST localhost:3000/api/search -d '{"query":"caching"}'` streams status lines, then results in which every `lessonId` resolves and every video `startSeconds` is a stored chapter start.
- `/search?q=data fetching` renders a mix of video and lesson cards with a count and "across M courses".
- "Watch from" opens `/lessons/<slug>?t=<s>` and the embed starts there.
- A nonsense query shows the empty state with "Browse all courses".
- An 11th search within a minute from the same IP gets a 429 message in the UI.
- `search_performed` and `search_result_clicked` show up in PostHog.

## Checks
- `studio`: `npx sanity deploy`, `npx sanity documents create context/vertex-search.json --replace`, and `npm run typegen`.
- Live MCP: `tools/list`, `/initial-context`, and a `groq_query` for each query pattern (lesson topic and chapter moment).
- `web`: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run dev` plus a curl against `/api/search`.

## Manual test
1. Add `OPENAI_API_KEY` (and `SANITY_CONTEXT_MCP_URL`, which I'll print after creating the doc) to `web/.env.local`.
2. From `web/`, run `npm run dev`.
3. On http://localhost:3000, type "data fetching" in the hero search and press Enter. It should land on `/search?q=data+fetching`.
4. Watch the status text, then the results. Compare them with `design/vertex-search.png`.
5. Change the sort to "Lessons first", then back to "Most Relevant".
6. Click "Watch from …" on a video card. The lesson page should open and the video should start at that second.
7. Go back, and click "View lesson" on a lesson card.
8. Search "zzqx". You should see the empty state, and "Browse all courses" should go to `/courses`.
9. Press ⌘K (or Ctrl+K) and the search input should get focus.
10. Resize to 375px. The cards should stack, with no horizontal scroll.
11. In PostHog, confirm `search_performed` and `search_result_clicked`.
