# Wire homepage "All Courses" to real Sanity content

## Goal

Replace the hardcoded `courses` array in `web/src/app/page.tsx` with real seeded courses fetched from Sanity, reusing the existing `CourseCard` component and data layer.

## Code inspected

- `web/src/app/page.tsx` — currently a hardcoded `courses` array (icon letter, iconClassName, title, description, level, duration, moduleCount) rendered via `CourseCard`. Already a server component, no client fetch to worry about.
- `web/src/components/ui/course-card.tsx` — takes `icon: ReactNode`, `iconClassName?`, `title`, `description`, `level`, `duration`, `moduleCount` (all display strings except icon).
- `web/src/sanity/lib/queries.ts` (`ALL_COURSES_QUERY`) — already returns `title`, `slug`, `summary`, `coverImage`, `level`, `popular`, `studentCount`, `instructor`, `category{title,slug,icon}`, `moduleCount`, `lessonCount`. It does **not** return total duration.
- `web/src/lib/icons.ts` (`getLucideIcon`) and `web/src/lib/format.ts` (`formatDuration`, `formatLevel`) — already built for the course page, reusable here.
- Category `icon` field is a PascalCase lucide name (`Database`, `Code`, etc.) per `studio/schemaTypes/documents/category.ts`.

## Decisions and assumptions

- Add a `"duration": math::sum(modules[].lessons[]->duration)` projection to `ALL_COURSES_QUERY` (GROQ's `math::sum` over the dereferenced lesson durations), so the card can show total course length like the course detail page does. Re-run Studio typegen after.
- Homepage shows the first 3 courses from `getAllCourses()` (query already orders by title asc) — no "popular" curation logic exists to prefer, and design doesn't specify a selection rule beyond "a few example cards."
- Card icon: since Sanity has no per-course brand color, replace the mocked colored letter avatar with the course's **category** lucide icon (`getLucideIcon(category.icon)`) on a consistent `bg-neutral-900` tile, matching the visual weight of the existing design instead of inventing a color-coding scheme.
- Wrap each `CourseCard` in a `next/link` to `/courses/[slug]` so cards are navigable, consistent with the rest of the site.
- No changes to `CourseCard` itself — it already accepts a `ReactNode` icon.

## Files expected to touch

- `web/src/sanity/lib/queries.ts` — add `duration` to `ALL_COURSES_QUERY`.
- `web/src/app/page.tsx` — fetch via `getAllCourses()`, map to `CourseCard` props, remove the hardcoded array.
- `web/sanity.types.ts` — regenerated via Studio typegen (no manual edits).

## Acceptance criteria

- Homepage's "All Courses" section shows 3 real seeded courses (title, summary, level, computed duration, module count) with the right category icon.
- Each card links to its course page (`/courses/[slug]`) and that page loads (already built).
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass in `web`.

## Manual test steps

1. `cd web && npm run dev`, visit `/`.
2. Confirm the 3 course cards show real titles/summaries from `scripts/seed.ndjson` (not "Next.js for Production" / "Docker Essentials" / "TypeScript Deep Dive" mock copy).
3. Click a card, confirm it navigates to the matching `/courses/[slug]` page with matching data.
