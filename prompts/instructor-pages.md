# Implementation prompt: Instructor pages

## Goal

Give each instructor their own page, and surface the instructor (linked to that
page) on the course and lesson pages — the part of AGENTS.md §7 ("Surface the
instructor on the course and lesson, and give each instructor their own page")
that isn't built yet. Read-only, presentational; no new content model.

## Decisions confirmed with the user

- **Compose from existing components** (no new visual design): a header block
  (photo, name, expertise, bio) + a `CourseCard` grid of the instructor's
  courses, matching current page styling and reusing components (AGENTS.md §3).
- **Detail pages only** — `/instructors/[slug]`, reached from links on the
  course and lesson pages. No `/instructors` index, no navbar link ("keep it
  small", §14).

## Skills / docs read

- Current task uses patterns already established in the repo; no new skill.
- Already read this session (still applies): `sanity-best-practices` GROQ
  (reverse references via `references(^._id)`, always project, `_ref`), and the
  modified Next.js docs (route handlers, server/client, `PageProps`). This is
  Next 16.3.4 with middleware in `src/proxy.ts`.

## Code inspected

- `studio/schemaTypes/documents/instructor.ts` — fields: `name`, `slug`,
  `photo` (+alt), `expertise` (string[]), `bio` (text). No "courses" field; a
  course references an instructor, so list courses via a reverse reference.
- `web/src/sanity/lib/queries.ts` — `INSTRUCTOR_BY_SLUG_QUERY` already returns
  name/slug/photo/expertise/bio. `ALL_COURSES_QUERY` is the card shape.
- `web/src/sanity/lib/data.ts` — `getInstructorBySlug` exists; logging pattern
  via `logContentRequest`.
- `web/src/app/courses/[slug]/page.tsx` — fetches `instructor` (name, slug,
  photo, expertise, bio) but **does not render it**. Header column has title →
  summary → meta row.
- `web/src/app/lessons/[slug]/page.tsx` + `LESSON_PAGE_QUERY` — the lesson's
  `course` projection has **no** instructor.
- `web/src/components/ui/course-card.tsx` + `web/src/lib/course-card-props.tsx`
  — `CourseCard` + `getCourseCardProps(course: ALL_COURSES_QUERY_RESULT[number])`;
  now also takes `progressPercent`. Reused for the grid.
- `web/src/components/analytics/tracked-course-link.tsx` — client link wrapper
  used by the catalog grid; reuse for the instructor's course grid.
- `web/src/sanity/lib/progress.ts` — `getUserProgress` + `courseProgress` for
  per-card progress when signed in (same as the catalog).
- No `/instructors` route exists yet.

## Decisions & assumptions

1. **Fetch the instructor's courses with a new, additive query**
   (`COURSES_BY_INSTRUCTOR_QUERY`, param `$instructorId`) rather than extending
   `INSTRUCTOR_BY_SLUG_QUERY`. Additive queries don't change existing generated
   types. It projects the `CourseCard` fields plus `_id`, `slug`, `lessonIds`,
   `firstLessonSlug` (so cards can show progress and link).
2. **Generalize `getCourseCardProps`** to accept a small structural interface
   (the fields it reads: `title`, `summary`, `level`, `duration`, `moduleCount`,
   `category.icon`) instead of `ALL_COURSES_QUERY_RESULT[number]`, so both the
   catalog result and the instructor-courses result satisfy it. Behaviour
   unchanged for existing callers (catalog, homepage).
3. **Course cards on the instructor page show progress** when signed in, exactly
   like the catalog (reuse `getUserProgress` + `courseProgress`).
4. **Instructor byline** is a small shared server component (photo thumbnail +
   name) linking to `/instructors/[slug]`, used on the course and lesson pages.
5. **Lesson page** gains the instructor by extending `LESSON_PAGE_QUERY`'s
   `course` projection with `"instructor": instructor->{name, "slug": slug.current}`
   and passing it through `getLessonPage`'s returned `course` object.
6. Dynamic route, no `generateStaticParams`/`generateMetadata` (matches the
   existing course/lesson pages). `notFound()` for an unknown slug.
7. **TypeGen caveat (same as the progress feature):** Studio TypeGen needs Node
   ≥22.12 and this shell has 22.11, so I will hand-refresh `web/sanity.types.ts`
   for the new `COURSES_BY_INSTRUCTOR_QUERY_RESULT` and the extended
   `LESSON_PAGE_QUERY_RESULT`, then verify with tsc/lint/build. The user should
   run `npm run typegen` in `studio/` on Node ≥22.12 to confirm (identical diff).

## Files to touch

### New
- `web/src/app/instructors/[slug]/page.tsx` — server component. Fetches the
  instructor + their courses; renders header (photo, name, expertise pills,
  bio) and a responsive `CourseCard` grid (progress when signed in). Breadcrumbs
  + `Navbar`. `notFound()` when missing. Empty state when no courses.
- `web/src/components/ui/instructor-byline.tsx` — shared linked byline
  (photo + name → `/instructors/[slug]`).

### Modified
- `web/src/sanity/lib/queries.ts` — add `COURSES_BY_INSTRUCTOR_QUERY`; extend
  `LESSON_PAGE_QUERY` course projection with `instructor`.
- `web/src/sanity/lib/data.ts` — add `getInstructorPage(slug)` (instructor +
  courses, with `logContentRequest`); thread `instructor` through
  `getLessonPage`'s returned `course`.
- `web/src/lib/course-card-props.tsx` — loosen the parameter type (decision 2).
- `web/src/app/courses/[slug]/page.tsx` — render the instructor byline in the
  header (data already fetched).
- `web/src/app/lessons/[slug]/page.tsx` — render the instructor byline from the
  extended query data.
- `web/sanity.types.ts` — hand-refresh for the new/changed query result types
  (decision 7).

## Requirements

- Each instructor has a page at `/instructors/[slug]` showing photo, name,
  expertise, bio, and their courses (§7).
- Instructor is surfaced and linked on the course and lesson pages (§7).
- Read-only; all data fetched server-side via the existing read client (§5).
- Grounded: only real instructors/courses; `notFound()` for unknown slugs.
- Responsive to mobile; desktop matches current styling; reuse components (§3).

## Security considerations

- Read-only content through the existing server-only read client; no tokens or
  writes involved. No new env vars.

## Acceptance criteria

- `/instructors/<slug>` renders the header + a grid of that instructor's
  courses; signed-in users see per-card progress; unknown slug → 404.
- The course page and lesson page show the instructor, linking to their page.
- No regression to the catalog/homepage cards (shared `getCourseCardProps`).

## Checks to run (AGENTS.md §13)

- `web/`: `npx tsc --noEmit`, `npm run lint`, `npm run build` (new route). Report
  real output.
- `studio/`: no schema change, so no typegen strictly required for the schema;
  but the web queries changed — note that `npm run typegen` (Node ≥22.12) should
  be run to regenerate `web/sanity.types.ts` authoritatively (I hand-refresh it).

## Manual test steps

1. `cd web && npm run dev`.
2. Open a course → click the instructor byline → lands on `/instructors/<slug>`.
3. The page shows photo, name, expertise, bio, and a grid of their courses.
4. Signed in: course cards there show a progress bar for started courses.
5. Open a lesson → the instructor byline shows and links to the same page.
6. Visit `/instructors/not-a-real-slug` → 404.
