# All Courses (catalog) page

## Goal

A simple `/courses` page listing every course from Sanity as cards, linking to each course's detail page. No design reference exists for this page (`design/` has no catalog image), and the user asked to keep it simple, so this reuses existing components/patterns as-is rather than introducing new UI.

## Code inspected

- `design/` — confirmed no catalog/all-courses reference image exists (only home, course, lesson, search, design-system).
- `web/src/components/ui/course-card.tsx` — reused as-is (icon, title, description, level, duration, moduleCount).
- `web/src/sanity/lib/data.ts` / `queries.ts` — `getAllCourses()` / `ALL_COURSES_QUERY` already returns everything a card needs, including the `duration` field added for the homepage.
- `web/src/app/page.tsx` — the "All Courses" section built there is the direct precedent for card mapping (category icon via `getLucideIcon`, `formatLevel`, `formatDuration`); this page reuses the same mapping.
- `web/src/components/ui/navbar.tsx`, `breadcrumbs.tsx` — reused for the page shell.
- `web/src/components/ui/select.tsx`, `input.tsx`, `pagination.tsx` exist but their sample usage in `style-guide/page.tsx` ("Most Relevant"/"Most Recent" sort, `⌘K` search) reads as scaffolding for the AI search results page (AGENTS.md section 11), not this catalog — left unused here to keep scope small, per "keep it simple."

## Decisions and assumptions

- No search box, sort control, filters, or pagination — just a breadcrumb, a heading with a result count, and a responsive grid of every seeded course (10 today). Pagination/search/sort can be added later if the catalog grows or the user asks.
- Route: `web/src/app/courses/page.tsx`, server component, fetches `getAllCourses()` directly (same pattern as the course detail page).
- Card icon/duration/level mapping copied from the homepage's course-card mapping for consistency (category lucide icon on a `bg-neutral-900` tile, `formatLevel`, `formatDuration`).
- Breadcrumb: just "All Courses" (current page, no parent link needed since this is the top-level catalog).
- No empty state needed beyond a simple "No courses yet" fallback text, since Sanity always has seeded content today but the page shouldn't break on an empty dataset.

## Files expected to touch

- `web/src/app/courses/page.tsx` — new.
- No component, query, or schema changes — everything needed already exists.

## Acceptance criteria

- `/courses` renders all seeded courses as cards (title, summary, level, duration, module count, category icon), each linking to `/courses/[slug]`.
- Heading shows an accurate count (e.g. "10 courses").
- Responsive grid matches the homepage's card grid breakpoints (1 / 2 / 3 columns).
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass.

## Manual test steps

1. `cd web && npm run dev`, visit `/courses`.
2. Confirm all 10 seeded courses render as cards with correct data and category icons.
3. Click a card, confirm it navigates to the right `/courses/[slug]` page.
4. Click "Courses" in the navbar and "View all courses" on the homepage, confirm both land here.
