# Implementation prompt: Learner progress tracking

## Goal

Track per-learner progress — which lessons a learner has completed, and where
they left off in a lesson (a resume position) — and surface it as completion
marks and a resume affordance on the **catalog**, **course detail**, and
**lesson** pages (AGENTS.md §7). Progress is per-user app state, written only
through a server route with a write token, and kept apart from the read-only
content the pages render (AGENTS.md §5, §7, §8).

Out of scope (separate features): the My Learning page, the notifications bell,
the Notes tab. Read helpers built here must be reusable so My Learning can
consume them later, but no My Learning UI is built now. "Do not overbuild"
(AGENTS.md §1, §14).

## Decisions confirmed with the user

- **Reuse existing components** for all progress UI (no new visual design):
  `ProgressBar`, `StatusIndicator` (`completed` state), the already-stubbed
  "Your Progress" sticky bar on the course page, `Button`. Match current
  Tailwind/page styling; make it responsive down to mobile (AGENTS.md §3).
- **Completion = manual button + auto at ~90% watched.** A "Mark as complete"
  button, and auto-complete once ~90% of the video has been watched. This
  requires reading playback time, so the lesson video adopts the **YouTube
  IFrame Player API** (see Decisions below).

## Skills / docs read

- `sanity-best-practices` (SKILL.md, `references/schema.md`, `references/groq.md`):
  `defineType`/`defineField`/`defineArrayMember`, validation, document IDs
  (deterministic IDs allowed for singletons), GROQ projection/performance
  (`_ref` not `->` in filters, always project, `in $ids`), TypeGen workflow.
- AGENTS.md (root) §5 boundaries, §7 decisions, §8 data model, §13 checks.
- Before coding I will read the relevant guides under
  `web/node_modules/next/dist/docs/` (route handlers, server/client data
  fetching) — this is a modified Next.js 16.3.4 (middleware lives in
  `src/proxy.ts`, not `middleware.ts`), so I will not assume prior-version APIs.

## Code inspected (and what it tells me)

- `web/src/proxy.ts` — Clerk middleware via `clerkMiddleware()`. Auth is wired.
- `web/src/sanity/lib/client.ts` — server-only **read** client, `useCdn: true`,
  `SANITY_API_READ_TOKEN`. CDN-cached; unsuitable for freshly-written progress.
- `web/src/sanity/lib/data.ts` / `queries.ts` — data layer + `defineQuery`
  GROQ; `ALL_COURSES_QUERY`, `COURSE_BY_SLUG_QUERY`, `LESSON_PAGE_QUERY`.
- `web/src/app/api/search/route.ts` — route-handler conventions to mirror: Zod
  validation, `Response.json`, `maxDuration`. I will add Clerk `auth()`.
- `web/src/app/courses/[slug]/page.tsx` — already fetches `userId` via
  `auth()` and renders a sticky **"Your Progress"** bar with
  `<ProgressBar value={0} />` and a "Continue Learning" `CourseStartLink`
  hardcoded to the first lesson. This is the exact injection point.
- `web/src/app/courses/page.tsx` + `ui/course-card.tsx` + `course-card-props.tsx`
  — catalog cards; `CourseCard` has no progress prop yet.
- `web/src/components/ui/module-accordion.tsx` — client; lists lessons; no
  per-lesson completed state yet.
- `web/src/components/lesson/lesson-video.tsx` — **bare iframe** embed
  (youtube-nocookie), YouTube-only, uses `start` param for seek, remounts on
  start change. No player API → no way to read playback position today.
- `web/src/components/ui/status-indicator.tsx` — has `completed` (emerald
  check), `in-progress`, `now-playing`, `locked`. Reuse.
- `web/src/components/ui/progress-bar.tsx` — clamped 0–100 bar. Reuse.
- `web/src/components/analytics/capture-event.ts` + `lesson-view-tracker.tsx`
  — PostHog client capture pattern to mirror for new events.
- `studio/structure.ts` — `HIDDEN_FROM_CONTENT` set hides internal types
  (`video`, context) from the desk. Reuse to hide `progress`.
- `studio/sanity.cli.ts` — TypeGen config: `npm run typegen` in `studio/`
  runs `sanity schemas extract --force && sanity typegen generate`, scans
  `../web/src/**/*.{ts,tsx}`, writes `../web/sanity.types.ts`.
- `web/.env.example` — has read token; **no write token yet**.

## Decisions & assumptions

1. **Storage: a Sanity `progress` document per user, same dataset, hidden from
   the Studio desk.** Sanity storage is schemaless, so writes work without a
   Studio deploy; the schema exists for TypeGen and is hidden from authors.
2. **Deterministic document id `progress.<sanitizedUserId>`.** The Sanity skill
   discourages deterministic IDs for *ordinary* documents but allows them for
   *singletons*; per-user progress is a per-user singleton. A deterministic id
   gives atomic `createIfNotExists` upserts with no duplicate-doc race and no
   pre-read lookup. I also store the Clerk id in a `userId` field (source
   identity as content, per the skill). `userId` is sanitized to Sanity's id
   charset `[a-zA-Z0-9._-]` (Clerk ids are already safe; sanitize defensively).
3. **Lesson linkage by string, not reference.** Each entry stores `lessonId`
   (the content lesson `_id`) as a plain string, `_key` == `lessonId`. This
   keeps app state decoupled from the content graph (§7 "kept apart") and
   avoids weak-reference handling. Course membership/percent is computed in app
   from each course's lesson ids.
4. **Separate server-only progress client**, `useCdn: false`,
   `SANITY_API_WRITE_TOKEN` (Editor role). `import 'server-only'`. Never
   imported by a client component; never exposed to the browser.
5. **Writes only through `POST /api/progress`.** The route derives the user
   from Clerk `auth()` and writes **only that user's** doc; any id in the body
   is ignored. Browser never holds a Sanity token and never writes directly.
6. **Resume via YouTube IFrame Player API.** The lesson video becomes a client
   component that instantiates `YT.Player` on the (youtube-nocookie) embed with
   `enablejsapi=1`. This is still the provider's own player (not a custom
   player, §7) — the API only seeks to the resume second and reads
   `getCurrentTime()`/state to persist position and compute watch depth. The
   `start` query param (from search) still takes priority for the initial seek;
   otherwise it seeks to the saved resume position.
7. **Position write cadence:** client throttles position POSTs to ~every 15s
   while playing and on pause, and flushes on page hide via
   `navigator.sendBeacon`. Server clamps `positionSeconds` to
   `[0, lesson.duration]`.
8. **Auto-complete** fires once watched ratio ≥ 0.9 (position/duration), in
   addition to the manual button. Completion is idempotent.
9. **Signed-out learners**: pages render normally with no progress UI; the video
   plays but saves nothing and shows no "Mark complete".
10. **Studio deploy not required** for functionality (schemaless storage, type
    hidden). TypeGen regen **is** required.

## Files to touch

### Studio
- `studio/schemaTypes/objects/progressEntry.ts` — **new** object:
  `lessonId` (string, required), `completed` (boolean), `completedAt`
  (datetime), `positionSeconds` (number, min 0), `updatedAt` (datetime).
  Icon from `@sanity/icons/*` subpath.
- `studio/schemaTypes/documents/progress.ts` — **new** document:
  `userId` (string, required), `lessons` (array of `progressEntry`). Icon.
- `studio/schemaTypes/index.ts` — register `progress` + `progressEntry`.
- `studio/structure.ts` — add `'progress'` to `HIDDEN_FROM_CONTENT`.

### Web — data / server
- `web/src/sanity/lib/progress-client.ts` — **new** server-only write client
  (`useCdn: false`, `SANITY_API_WRITE_TOKEN`).
- `web/src/sanity/lib/progress.ts` — **new** server-only helpers:
  `progressDocId(userId)`, `getUserProgress(userId)` → `{ completed:Set<string>,
  positions:Map<string,number>, entries }`, plus small selectors used by pages
  (`courseProgress(progress, lessonIds)` → `{ completedCount, total, percent,
  resumeLessonId }`). Writes: `markComplete`, `markIncomplete`, `savePosition`
  — each `createIfNotExists` then upsert the `lessons[_key==lessonId]` entry
  (set fields when present, append when absent), merging so saving position
  never clears `completed` and vice-versa. Uses current dated `apiVersion`.
- `web/src/app/api/progress/route.ts` — **new** `POST` handler. Clerk `auth()`
  → 401 if signed out. Zod body `{ lessonId: string, action:
  'complete'|'uncomplete'|'position', positionSeconds?: number }`. Validates the
  lesson exists and clamps position to its duration (read via the read client).
  Mirrors the search route's shape.
- `web/src/sanity/lib/queries.ts` — extend `ALL_COURSES_QUERY` with
  `"lessonIds": modules[].lessons[]._ref`; add a small `LESSON_DURATION_QUERY`
  (`*[_type=="lesson" && _id==$id][0]{ _id, duration }`) for the route's clamp.

### Web — UI (reuse existing components)
- `web/src/app/lessons/[slug]/page.tsx` — read `getUserProgress` when signed in;
  pass `initialPositionSeconds` (resume) + `completed` + `duration` into the
  video area; `start` query param still overrides resume for the initial seek.
- `web/src/components/lesson/lesson-video.tsx` — convert to a client component
  using the YouTube IFrame API (seek, read time, emit position + completion via
  a new client `progress-controls`), preserving current markup/styling and the
  "Video unavailable" fallback.
- `web/src/components/lesson/lesson-progress-controls.tsx` — **new** client:
  "Mark as complete" / "Completed" button, posts to `/api/progress`; owns the
  throttled position save + 90% auto-complete; fires PostHog `video_played`,
  `video_progress`, `lesson_completed`.
- `web/src/app/courses/[slug]/page.tsx` — replace `ProgressBar value={0}` with
  the real percent; point "Continue Learning" at the resume lesson (first
  incomplete, or the one with a saved position); pass per-lesson `completed`
  into the accordion.
- `web/src/components/ui/module-accordion.tsx` — accept optional
  `completed` per `ModuleAccordionLesson`; render a `StatusIndicator`
  `completed` check when set. Backward compatible (optional).
- `web/src/app/courses/page.tsx` + `ui/course-card.tsx` +
  `lib/course-card-props.tsx` — when signed in, pass an optional `progress`
  (percent) to `CourseCard`; show a `ProgressBar` + "Continue" on started
  courses only. Optional prop keeps signed-out rendering unchanged.

### Config
- `web/.env.example` — add, with a server-only comment:
  `# Editor-role token from https://sanity.io/manage - server-only, writes learner progress.`
  `SANITY_API_WRITE_TOKEN=`

## Requirements

- Completion marks + resume affordance on catalog, course, and lesson (§7).
- Per-learner, keyed off the Clerk user id; browser never writes it (§7).
- Writes go through a server route with a write token; progress state kept
  apart from read-only content (§5, §7).
- Grounded: resume seconds clamped to the lesson's real duration.
- Responsive to mobile; desktop matches current styling; reuse components (§3).

## Security considerations

- `SANITY_API_WRITE_TOKEN` is server-only, never `NEXT_PUBLIC_*`; only the
  progress client reads it; that client carries `import 'server-only'`.
- The route trusts **only** `auth().userId` for the document id; `userId` is
  never accepted from the request body.
- Zod-validate the body; clamp `positionSeconds` to `[0, duration]`; reject
  unknown `lessonId`.
- Progress client is never imported by any client component (build fails if it
  is, via `server-only`).
- No Sanity token, MCP, or LLM access from the browser (§5).

## Acceptance criteria

- Signed-in: completing a lesson (button or ≥90% watched) shows the emerald
  check on the course accordion + advances the course "Your Progress" bar +
  shows a % and "Continue" on that course's catalog card.
- Reopening a partly-watched lesson resumes near where it was left; a `?start=`
  (search) link still wins for the initial position.
- "Continue Learning" targets the first incomplete / last-watched lesson.
- Signed-out: no progress UI anywhere; video still plays; nothing is written.
- Network shows `POST /api/progress`; no Sanity token in any client bundle.

## Checks to run (AGENTS.md §13)

- `studio/`: `npm run typegen` (schema + queries changed) — regenerates
  `web/sanity.types.ts`; verify `Progress` types appear.
- `web/`: `npx tsc --noEmit`; `npm run lint`; `npm run build` (routes/server
  changed); `npm run dev` for the manual test. Report real output.
- Studio deploy is **not** required for this feature (schemaless storage, type
  hidden); note it, don't run it.

## Manual test steps

1. `cd web && npm run dev` with `SANITY_API_WRITE_TOKEN` set in `.env.local`.
2. Sign in. Open a course → a lesson. Play the video ~20s, pause; reload the
   lesson → it resumes near that point.
3. Click "Mark as complete" → button flips to "Completed".
4. Go to the course page → that lesson shows the check; "Your Progress" bar
   reflects the new percent; "Continue Learning" points at the next lesson.
5. Open `/courses` → that course card shows a progress bar + "Continue".
6. Watch another lesson past ~90% without clicking → it auto-completes.
7. Sign out → no progress UI on catalog/course/lesson; video still plays.
8. DevTools Network: confirm `POST /api/progress`; search bundles for the
   write token (must be absent).
