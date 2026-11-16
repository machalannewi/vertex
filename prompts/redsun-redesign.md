# Implementation prompt: REDSUN-style redesign (whole app)

## Goal

Replace Vertex's light UI with the dark, orange-glow look of the reference video
("Perfect Scroll Animation Lighting effect … Showcasing Your SaaS App", a REDSUN
Webflow template, Pinterest pin 926052742129752155). Rebuild the homepage as a
faithful replica of that landing page — same section order, layout, spacing,
lighting effects and scroll animations — filled with **real Vertex content**,
and restyle every other page to the same visual language.

## Decisions confirmed with the user

- **Scope: whole app.** New landing page + every inner page restyled
  (courses, course detail, lesson, search, My Learning, instructor, sign-in/up).
- **Pricing section = real course prices.** Same 3-card layout, featuring 3 real
  courses from Sanity with their actual price, level and outcomes.
- "Replicate exactly" + "give more details on our project like the video":
  every section of the reference is reproduced, and each one describes a real
  part of Vertex using live Sanity data — nothing invented.

## Reference (source of truth for visuals)

Frames captured from the video, saved in `prompts/design/redsun-reference/`:

| File | What it shows |
| --- | --- |
| 01-intro-0.6s | Hero before the light comes on (arc unlit) |
| 02-arc-lights-up-1.4s | Arc ignites: orange glow + white rim highlight |
| 03-hero-2.2s, 04-hero-detail | Full hero: pill, headline, sub, two CTAs, arc |
| 05-dashboard-rises-3.2s, 06-dashboard-detail | Dashboard mockup rises from under the arc on scroll |
| 07-dashboard-and-logo-marquee | Dashboard body + "Join 4,000+ companies" logo marquee |
| 08-bento-grid, 09-bento-ai-sessions-10s | 4-card bento grid (beam card, dropdown card, chips, stat) |
| 10-features-row1-11.5s, 11-features-row2-13s | "Powerful Features": alternating text/visual rows |
| 12-pricing-16.4s | 3 pricing cards, middle highlighted |
| 13-blog-17.5s, 14-blog-cards-19s | "Insights & Inspiration" image cards |
| 15-cta-and-footer-22.4s | CTA band with email + dashboard preview; footer |

## Visual system (replaces current tokens)

- **Palette (dark):** page `#0A0A0C`; surface/card `#111216`; raised `#16171C`;
  border `rgba(255,255,255,0.08)`; text `#F4F4F5`; muted `#8A8D96`;
  orange `#F97316` (unchanged) with glow tints `#FB923C` / `#EA580C`.
- **Approach:** remap the existing `neutral-*` / `primary-*` tokens in
  `globals.css` to the dark palette, add `surface` / `surface-raised` / `glow`
  tokens, then replace the ~31 `bg-white` card usages with `bg-surface` and fix
  the few spots that rely on light-on-dark inversions (`bg-neutral-900` chips,
  video backdrop). Components keep their structure; the tokens carry the theme.
- **Type:** headings switch from Playfair (serif) to a geometric sans close to
  the reference — **Mulish** via `next/font` (assumption; one-token swap if you
  want another). Body stays Inter. Hero headline ~64px/72px, weight 600,
  section titles ~40px.
- **Shapes:** cards radius 16px with 1px translucent border and a faint inner
  top highlight; pill buttons; orange primary button with soft orange outer glow;
  dark secondary button with border.
- **Lighting:** radial orange glows behind key elements; the hero **arc** is a
  large circle (CSS) with an orange→deep-orange gradient fill, a thin white rim
  highlight on the upper edge, and a blurred orange halo.

## Landing page — section by section (reference → Vertex content)

1. **Navbar** (sticky, translucent dark, blur): wordmark **VERTEX** + orange dot;
   centered links Home · Courses · Search · My Learning; right: "Sign in" text +
   orange pill **"Start Learning →"** (signed out) or bell + avatar (signed in).
2. **Hero:** pill **"What's New" | "AI search v1.0 ›"**; headline
   **"Intelligent Learning / Powered by AI."**; sub: "Ask Vertex in plain English
   and jump to the exact second a topic is taught — across every course.";
   buttons **"Browse Courses →"** (dark) and **"Try AI Search →"** (orange);
   glowing arc below. Arc **ignites on load** (dim → lit over ~1.2s).
3. **Dashboard mockup rising from the arc** (scroll-linked: translates up and
   scales 0.92→1 as you scroll): Vertex app chrome (VERTEX logo, tabs My
   Learning · Courses · Search · Instructors, bell + avatar), title "Dashboard" +
   "Continue learning" button; **4 KPI cards from real data** — Courses, Lessons,
   Instructors, Hours of video (decorative sparklines); a **"Continue learning"
   list** (3 real courses with category icons + "Resume" buttons); a **bar chart
   "Lessons per course"** (real lesson counts, orange bars).
4. **Marquee:** "Learn the stack top teams build with" — infinite scrolling row
   of the real **categories** (lucide icon + name), faded edges.
5. **Bento grid (4 cards, reference layout):**
   - *Progress* (≈"Balance"): real lesson chips of a featured course, one in
     orange ("Now playing"), others with completion state.
   - *Learners* (≈"Users"): total students (sum of real `studentCount`) + sparkline.
   - *AI Search* (≈"Create", tall): orange **light beam** shining onto a glass
     icon tile (search icon).
   - *Jump to the moment* (≈"AI Sessions"): dropdown-style **module outline** of
     a real course with sparkle accents.
6. **"Powerful Features"** — title + sub, then two alternating rows (text +
   orange checklist + "See …" button | visual):
   - Row 1: "Search every lesson, find the exact moment" — checklist: plain-English
     questions · chapter-first timestamps · grounded results only; visual =
     stacked feature list + **glowing ring + shield** (grounded).
   - Row 2 (visual left): **3D-tilted orange card** "Progress always ON!" over a
     dashboard; text "Pick up right where you left off" — checklist: resume
     position saved · completion marks · My Learning hub.
7. **Pricing → "Pick your next course"**: 3 real courses (most popular in the
   highlighted middle card with orange border + orange button); price shown as
   **"$X USD"** (or "Free" when 0), level, short summary, 5 outcomes with orange
   check boxes, "Get started" → course page.
8. **"Insights & Inspiration" → "Fresh from the catalog"**: 3 image cards from
   real **lesson thumbnails**, arrow icon top-right, title + course overlay on
   hover/bottom (as frame 14), linking to the lesson.
9. **CTA band**: "Transform the way you learn with Vertex" + email input +
   **"Get Started"** (routes to `/sign-up`; no email is stored) + dashboard
   preview on the right with orange glow along the bottom edge.
10. **Footer**: VERTEX wordmark, large "Transform the way you learn with Vertex",
    blurb; columns **Pages** (Home, Courses, Search, My Learning),
    **Categories** (real), **Project** (GitHub repo, Style guide).

## Motion (no new dependencies)

- `Reveal` client component: IntersectionObserver fade-up (opacity + 24px) per
  section/card, staggered.
- Arc ignition: CSS keyframes on load.
- Dashboard rise: small client component reading scroll progress with
  `requestAnimationFrame` → `transform: translateY + scale`.
- Marquee: CSS infinite translate, paused on hover.
- All motion disabled under `prefers-reduced-motion`.

## Inner pages (restyle, same layouts)

Courses catalog, course detail, lesson (sidebar, tabs, video, footer nav),
search (+ arc glow behind the search hero), My Learning, instructor, sign-in/up
(Clerk `appearance.variables` dark — no new package), and shared UI components
(button, badge, input, select, cards, accordion, progress bar, breadcrumbs,
status indicator). Layout/structure unchanged; colors, type, radius, borders,
glows follow the system above. Responsive down to mobile.

## Data (all real, server-side via existing read client)

- Existing: `getAllCourses` (price, popular, studentCount, level, duration,
  lesson/module counts, category icon), `getAllCategories`, `getAllInstructors`,
  `getCourseBySlug` (featured course outline).
- **New additive query** `FEATURED_LESSONS_QUERY` for the catalog cards
  (lessons with thumbnails + parent course via reverse reference).
- KPI numbers are computed from real data; sparklines are decorative shapes
  with no numbers.

## Files to touch (expected)

- `web/src/app/globals.css` (dark tokens, glow/arc utilities, keyframes)
- `web/src/app/layout.tsx` (Mulish font, dark `<html>`, Clerk appearance)
- `web/src/app/page.tsx` (rebuilt landing)
- **New** `web/src/components/landing/*` (hero-arc, dashboard-mockup,
  logo-marquee, bento-grid, features, course-pricing, catalog-cards, cta-band,
  site-footer, reveal, scroll-rise)
- `web/src/components/ui/*` restyle (navbar, button, badge, input, select,
  course-card, etc.) and the ~20 files using `bg-white`
- Inner pages under `web/src/app/**/page.tsx` + lesson/search components
- `web/src/sanity/lib/queries.ts`, `data.ts` (featured lessons) +
  `web/sanity.types.ts` (hand-refresh; Studio TypeGen still needs Node ≥22.12)

## Assumptions to confirm

- Headline font **Mulish** as the closest match to the reference.
- Prices displayed in **USD** (Sanity stores a plain number, no currency).
- CTA email field is presentational: "Get Started" just routes to sign-up.

## Requirements / constraints

- Visual fidelity to the reference frames (layout, spacing, glow, motion).
- Every number, course, lesson, price and category shown is real Sanity data.
- Server/client boundaries unchanged; no new tokens or env vars; no new npm deps
  beyond the Google font.
- Accessible contrast on dark (muted text ≥ 4.5:1 on surfaces), focus rings,
  reduced-motion support. Responsive to mobile.

## Acceptance criteria

- Homepage reproduces all 10 reference sections in order with matching look and
  motion (arc ignites, dashboard rises on scroll, marquee scrolls, reveals).
- All inner pages render in the dark system with no light leftovers.
- Search, progress, auth, analytics behave exactly as before.

## Checks (AGENTS.md §13)

- `web`: tsc, lint, production build.
- Visual verification in the browser at desktop and mobile widths, comparing
  against the reference frames; screenshots shared.

## Manual test steps

1. `cd web && npm run dev`, open `/`: arc ignites; scroll → dashboard rises;
   marquee moves; sections fade up; pricing shows 3 real courses.
2. Click through Courses → a course → a lesson; Search; My Learning; an
   instructor page; Sign in — all dark, nothing light left over.
3. Resize to ~375px: everything stacks cleanly, no horizontal scroll.
4. Enable "reduce motion" in the OS: animations are off, content still visible.
