# Course page

## Goal

Build the course detail page (`/courses/[slug]`) matching `design/vertex-course.png`, wired to real seeded Sanity content via the existing `getCourseBySlug` data helper. Read-only page: displays a course's hero, "What you'll learn" outcomes, and an expandable module/lesson list with a bottom summary bar. No new writes, no new schema.

## Skills and docs read

- `AGENTS.md` (sections 2, 3, 5, 6, 7, 8, 11-14) — workflow, UI fidelity rule, layering rules, data model, presentational-only surfaces.
- `sanity-best-practices` conventions already applied in this repo (GROQ via `defineQuery`, TypeGen) — followed existing patterns rather than re-deriving them.
- `node_modules/next/dist/docs/` App Router conventions for a dynamic segment page (`generateStaticParams`/server component fetch, `notFound()`).

## Code inspected

- `web/src/sanity/lib/queries.ts` / `data.ts` — `COURSE_BY_SLUG_QUERY` and `getCourseBySlug(slug)` already return everything the page needs: course fields, `learningOutcomes`, `instructor`, `category`, and `modules[]` with nested `lessons[]` (id, title, slug, duration, freePreview, posterImage, studentCount). No changes needed here.
- `web/src/sanity/lib/numbering.ts` — `getModuleLabel(i)` / `getLessonLabel(moduleIndex, lessonIndex)` for "Module N" / "Lesson N.M", derived from array order per AGENTS.md section 8.
- `studio/schemaTypes/documents/course.ts`, `lesson.ts`, `objects/learningOutcome.ts`, `objects/module.ts` — confirmed field shapes: `level` (`beginner|intermediate|advanced`), `popular` boolean, `studentCount`, `learningOutcomes[]` (`icon` string + title + description), `modules[]` (title, summary, lesson refs), lesson `duration` stored in **seconds**.
- `studio/schemaTypes/documents/category.ts` — category `icon` is a PascalCase lucide name (e.g. `Layers`); seeded `learningOutcome.icon` values are lowercase (e.g. `layers`, `gauge`, `rocket`) — need a case-insensitive lookup.
- Existing UI components to reuse as-is: `Navbar`, `Button`, `Badge`, `Breadcrumbs`, `ProgressBar`. `CourseCard`/`LessonCard`/`ResourceCard`/`StatusIndicator` are for other pages (catalog/lesson/search) and are not reused here — the module row and outcome tile in the design are new compositions.
- `web/src/app/page.tsx` for existing layout conventions (`max-w-360` shell, `font-display`/`font-sans` usage, spacing scale) to match.
- `scripts/seed.ndjson` for real content to test against, e.g. course slug `nextjs-app-router-in-depth` (12 lessons across 4 modules, durations in seconds, one `freePreview` lesson).
- No progress-tracking schema or route exists yet in the repo (confirmed via search) — consistent with the scope decision below.

## Decisions and assumptions

- **Progress bar / Continue Learning are stubbed, not wired to real data** (user decision). The course page stays read-only against Sanity content. Building the progress record schema, server route, and Clerk-keyed writes is a separate future task.
  - Signed-out: no bottom progress bar; hero CTA reads "Start Course" and links to the first lesson in module 1.
  - Signed-in: bottom progress bar renders with a hardcoded placeholder value (0%) and hero CTA still reads "Start Course" — real completion state isn't computed. This avoids implying tracking that doesn't exist yet.
- **Bookmark button is presentational only**, matching the notifications bell precedent in AGENTS.md section 7 (no bookmark field exists anywhere in the section 8 data model, so this isn't an oversight — it's out of scope). Renders, does nothing on click.
- **Course total duration and module/lesson counts are derived, not stored**: sum all `lesson.duration` across all modules for the header stat, `modules.length` for module count, and count of all lesson refs for the "X modules • Yh Zm" summary line. This matches the "derived from order/content, not stored" pattern already used for module/lesson numbering.
- **Learning-outcome and category icons**: both are lucide-react icon names but with inconsistent casing in seed data. Add a small `getLucideIcon(name)` helper (new file `web/src/lib/icons.ts`) that normalizes to PascalCase and looks it up on the `lucide-react` icon map, falling back to a generic icon (e.g. `Sparkles`) if not found. Reused by the "What you'll learn" tiles now; other pages (catalog card, category) can adopt it later.
- **Module list expand/collapse**: the design shows collapsed rows with a chevron and a "Show all N modules" control below the first 6. This needs client interaction (per-row expand toggling lesson list, and a "show more" toggle for modules beyond the first 6), so it's a small client component (`web/src/components/ui/module-accordion.tsx`) that receives already-fetched module/lesson data as props — no client-side data fetching, consistent with the read-only/server-fetch boundary in AGENTS.md section 5.
- **Route**: `web/src/app/courses/[slug]/page.tsx`, a server component. Calls `getCourseBySlug(slug)`, calls Next's `notFound()` if missing. No `generateStaticParams` requested/needed for this task; default dynamic rendering is fine since content is author-managed and not build-time static-required.
- Breadcrumb reads "All Courses > {course title}", "All Courses" linking to `/courses` (catalog page not yet built, but the route is the agreed convention from the nav/breadcrumb components already in the repo).
- Free preview lessons aren't specially marked in this page's module list (design doesn't show a preview badge in the collapsed row); that's deferred to the lesson page / catalog per section 7's "free preview badge is presentational."
- Price is fetched (already in the query) but not displayed — the design doesn't show it on this page, and AGENTS.md says the reference image is the source of truth for visuals.

## Files expected to touch

- `web/src/app/courses/[slug]/page.tsx` — new, the course page (server component).
- `web/src/components/ui/module-accordion.tsx` — new, client component for the expandable module/lesson list.
- `web/src/components/ui/learning-outcome-card.tsx` — new, the "What you'll learn" tile.
- `web/src/lib/icons.ts` — new, lucide icon-name lookup helper.
- `web/src/lib/format.ts` — new (or extend `web/src/lib/utils.ts` if trivial) — `formatDuration(seconds)` → `"18h 24m"` / `"6m"` style, shared by header stat, module summary, and per-lesson time.
- No schema, query, or data-layer changes expected — `COURSE_BY_SLUG_QUERY` already covers this page.

## Requirements

- Match `design/vertex-course.png` exactly on desktop: breadcrumb, hero (cover image, POPULAR badge when `course.popular`, title, summary, stat row with level/duration/modules/students, Start Course + Bookmark buttons), "What you'll learn" panel (2x2 grid of outcome tiles), "Course Content" panel (numbered module rows with title/summary/duration/chevron, "Show all N modules" control, sticky-feeling progress bar footer), matching spacing, typography (`font-display` for headings, `font-sans` for body), and colors from the existing design tokens.
- Responsive down to mobile: hero stacks (image above text), stat row wraps, outcome grid collapses to 1 column, module rows keep readable tap targets, bottom bar stacks progress/button on small widths. Desktop layout stays exact per AGENTS.md section 3.
- Expanding a module row reveals its lessons (label, title, duration) inline; only one open state needed, no nested navigation logic beyond linking each lesson row to `/lessons/[slug]` (lesson page not yet built, but link target is the agreed convention).
- `notFound()` for an unknown slug.
- No client-side Sanity fetch, no token exposed to the browser — page is a server component using the existing server-only `client`.

## Security considerations

- No new data flows: reuses the existing read-only, server-side `getCourseBySlug`, which already uses the private dataset via the server client. No token touches the browser.
- No new write path introduced (progress intentionally stubbed, not backed by a fake write).
- Lesson/course links are internal routes only (no user-controlled URLs rendered as hrefs).

## Acceptance criteria

- `/courses/nextjs-app-router-in-depth` renders real seeded content: correct title, summary, cover image, level, total duration computed from lesson durations, module count, student count, all 4 modules with correct lesson counts/durations, and the "What you'll learn" tiles with resolved icons.
- Visiting `/courses/does-not-exist` 404s.
- Expanding/collapsing a module toggles its lesson list without a page navigation.
- Page matches the reference image at desktop width and remains usable/readable at mobile width (~375px).
- No console errors, no broken icon lookups for any seeded `learningOutcome.icon` or `category.icon` value.

## Checks to run

- `web`: `npm run lint`, `npx tsc --noEmit` (or the project's type-check script), `npm run build`.
- Manual test in dev server (steps below).

## Manual test steps

1. In `studio/`, confirm the dataset has the seed content imported (already done per repo history); in `web/`, run `npm run dev`.
2. Visit `http://localhost:3000/courses/nextjs-app-router-in-depth`.
3. Compare against `design/vertex-course.png`: hero layout, POPULAR badge, stat row, buttons, outcome tiles, module list, bottom bar.
4. Click a module row's chevron — confirm it expands to show its lessons with correct "Lesson N.M" labels and durations, and collapses again on second click.
5. Click "Show all N modules" if the course has more than 6 modules (seed courses have 4, so also spot check with a course that would exercise this, or temporarily confirm the control is hidden correctly since 4 < 6).
6. Resize the browser to ~375px width and confirm the layout stacks sensibly with no horizontal scroll.
7. Visit `http://localhost:3000/courses/not-a-real-course` and confirm a 404.
8. Check devtools network/sources — confirm no Sanity token or private client code ships to the browser bundle for this route.
