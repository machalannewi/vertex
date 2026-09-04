# Implementation prompt: Vertex homepage

## Goal
Build the Vertex homepage (`/`) to match `design/vertex-home.png` exactly: navbar, hero (badge, headline, subtext, CTA, search bar), "All Courses" section with three course cards, a divider callout line, and the decorative gradient bar-chart background at the bottom of the page. Presentational only — no routing to real pages, no data fetching, no search behavior.

## Skills read
- AGENTS.md sections 2 (workflow), 3 (UI work: reproduce the reference exactly, reuse existing components, responsive down to mobile), 6 (tech stack), 7 (search is a full results page — the homepage search bar is just an entry point, not the search UI itself).
- No Sanity/Clerk/PostHog skill applies — this is static presentation, no CMS data, no auth gating, no analytics events.

## Code inspected
- `design/vertex-home.png` — the reference.
- `src/app/page.tsx` — currently a placeholder ("Vertex" text centered). Replaced by this task.
- `src/app/layout.tsx` — already loads Inter + Playfair Display as `--font-sans` / `--font-display`; body is a flex column. No global `<Navbar />` is mounted yet — each page currently renders its own chrome (confirmed nothing else does this yet since only the placeholder page and `/style-guide` exist).
- `src/app/globals.css` — full token set already in place (`primary-100..500`, `neutral-50..900`, radii, shadows, type scale). `--color-primary-100: #ffeee5` is a light peach — closest existing token to the hero's warm off-white background (closer than `neutral-50`, which is a cool near-white).
- `src/components/ui/navbar.tsx` — logo + Courses/My Learning links, no right-side slot for notifications/avatar (the reference shows a bell icon and a circular avatar image on the right).
- `src/components/ui/button.tsx` — `primary/secondary/tertiary/text` variants, `lg`(h-11)/`md` sizes. `primary` matches the "Explore Courses" CTA.
- `src/components/ui/input.tsx` — already supports a leading search icon (`icon`) and a trailing shortcut label (`shortcut="⌘K"`), which is exactly the homepage search bar.
- `src/components/ui/course-card.tsx` — matches the reference's card layout (icon square, title, description, meta row with level/duration/modules) almost exactly, but hardcodes the icon square to `bg-neutral-900` — the reference shows a different background color per course (black for Next.js, light blue for Docker, blue for TypeScript).
- `src/components/ui/badge.tsx`, `progress-bar.tsx`, `status-indicator.tsx` — not used on this page (no badges/progress/status shown in the reference).
- No icon/logo assets exist in `public/` for Next.js, Docker, or TypeScript.

## Decisions / assumptions
- **Page background**: use `bg-primary-100` (`#ffeee5`) for the page, matching the warm off-white in the reference (closer than `neutral-50`).
- **Navbar right side**: extend `Navbar` with an optional `showActions` prop (default `false`) that renders a bell icon (`lucide-react` `Bell`) and a circular avatar placeholder (a plain `neutral-300` circle with an initial, since no real avatar image/asset exists and Clerk isn't wired yet — this is presentational chrome per AGENTS.md section 7, not real notifications or auth). Homepage passes `showActions`. Keeps `Navbar` backward compatible for any page that doesn't want it yet.
- **Course icon backgrounds**: no real Next.js/Docker/TypeScript logo assets exist in this repo, and AGENTS.md doesn't authorize fetching external logo images. I'll approximate with brand-colored monogram squares instead of illustrated logos: Next.js = black bg (existing default) + white "N", Docker = `#1D63ED`-ish blue bg + white "D", TypeScript = `#3178C6` bg + white "TS". To allow per-card background color, add an optional `iconClassName` prop to `CourseCard` (defaults to the current `bg-neutral-900`, so existing usage is unaffected) and pass the bg color per card from the homepage.
- **Hero search bar** is static markup only (no `useState`, no submit handler, no keyboard shortcut listener) — wiring it to the real search page is out of scope for this task per AGENTS.md section 11 (search is its own page/feature).
- **"Explore Courses" and "View all courses" links** point to `/courses` (the catalog route named in AGENTS.md section 5) via `next/link`, even though that page doesn't exist yet — this matches the nav pattern already used in `Navbar`.
- **Decorative bottom bars**: reproduced as a row of `div`s with varying heights and a `primary-300 → transparent` vertical gradient, absolutely positioned at the bottom of the page, `overflow-hidden`, `pointer-events-none`, purely decorative (no `alt` needed, or an empty `alt`/`aria-hidden` if implemented as an SVG/img).
- **Course card content** (titles, descriptions, level/duration/module counts) is copied verbatim from the reference image — it's static placeholder marketing copy, not real Sanity content (the content model doesn't exist yet).

## Files expected to touch
- `src/app/page.tsx` — full homepage markup.
- `src/components/ui/navbar.tsx` — add `showActions` prop (bell + avatar).
- `src/components/ui/course-card.tsx` — add optional `iconClassName` prop.

## Requirements
- Layout, spacing, typography, and color match `design/vertex-home.png` section by section: navbar, hero badge/headline/subtext/CTA/search, "All Courses" header + 3-card grid, divider callout, decorative bottom bars.
- Headline uses `font-display` (Playfair Display) at the `display-1`/`display-2` scale already defined; body copy uses `font-sans` (Inter).
- Responsive down to mobile per AGENTS.md section 3: nav collapses sensibly (links may wrap/hide if needed), hero text and search bar stay full-width and readable, the 3-card grid stacks to a single column, decorative bars never cause horizontal scroll.
- Reuse `Navbar`, `Button`, `Input`, `CourseCard` — do not hand-roll duplicate markup for things these already provide.
- No Sanity/Clerk/PostHog wiring; no client-side state beyond what's structurally necessary (none is, for this static page).

## Security considerations
None — fully static presentational page, no data, no external calls, no user input persisted.

## Acceptance criteria
- `/` visually matches `design/vertex-home.png`.
- Navbar shows logo, Courses/My Learning links, bell icon, and avatar circle on the right.
- Hero shows the "INTELLIGENT LEARNING" pill, two-line serif headline, subtext, orange "Explore Courses" button with arrow icon, and the search input with the ⌘K shortcut hint.
- Three course cards render with distinct icon-square colors (Next.js black, Docker blue, TypeScript blue) and the level/duration/module meta row.
- "View all courses" link with arrow appears at the top-right of the All Courses section.
- Bottom of the page shows the decorative gradient bar strip without introducing horizontal scroll at mobile widths.
- Type check, lint, and build all pass.

## Checks to run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev` and manually verify `/`

## Manual test steps
1. `npm run dev`, open `http://localhost:3000/`.
2. Compare against `design/vertex-home.png` top to bottom: navbar, hero, All Courses grid, divider line, bottom decorative bars.
3. Resize to a mobile width (~375px) and confirm the nav, hero, search bar, and card grid stack sensibly with no horizontal scroll.
4. Confirm "Explore Courses" and "View all courses" link to `/courses`, and the logo links to `/`.
