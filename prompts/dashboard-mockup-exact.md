# Landing dashboard mockup — match the reference on every screen

## Goal
The homepage dashboard mockup (`web/src/components/landing/dashboard-mockup.tsx`) must look like the
user's reference image (desktop render: VERTEX wordmark, icon tabs My Learning / Courses / Search /
Instructors / Settings, bell + avatar, Dashboard + Browse courses, 4 KPI cards with sparklines,
Continue learning list with Resume links, Video per course bar chart) — "with the icons and everything".

## What I inspected
- Live site at 1440px: already matches the reference.
- Live site at 375px: tab row (icons + labels) is hidden (`hidden md:flex`); the two-column grid
  overflows the card — long course titles widen the grid track, so "Resume" links are clipped; the
  chart's 6th bar is clipped too.

## Decision
Render the mockup at its fixed desktop design width (1100px) and scale it down uniformly to fit the
container on narrower screens. Every screen then shows the exact reference composition (icon tabs,
both columns, all six bars, Resume links) — it's a product screenshot-style mockup, like the
reference template's hero dashboard. Desktop (≥ ~1150px container) is unchanged at scale 1.
- New small client wrapper `FitScale` measures container width (ResizeObserver) and applies
  `transform: scale(w / 1100)` with origin top-left, setting the wrapper height to the scaled height
  so no blank space or overflow. SSR renders at scale 1 inside `overflow-hidden`, so no layout jump
  beyond a single resize.
- Inside the mockup, drop the responsive breakpoints (tabs always shown, KPIs always 4 columns,
  columns always 2) and add `min-w-0` to grid children so long titles truncate instead of widening.
- Links inside remain clickable.

## Files
- `web/src/components/landing/fit-scale.tsx` (new, client)
- `web/src/components/landing/dashboard-mockup.tsx`
- `web/src/app/page.tsx` (wrap mockup in FitScale)

## Security
UI only; no data, env, or boundary changes.

## Acceptance criteria
- At 1440px: identical to the reference image.
- At 375px and 768px: same composition as the reference, scaled; nothing clipped; no horizontal
  page scroll.
- Reduced motion and ScrollRise still work.

## Checks
`npx tsc --noEmit`, `npm run lint`, `next build` in `web`.

## Manual test
1. `npm run dev` in `web`, open `/`.
2. Desktop: compare dashboard to the reference image.
3. DevTools device mode 375px: dashboard shows tabs with icons, all KPIs, Resume links, 6 bars.

## Then
Capture LinkedIn screenshots of the homepage and dashboard.
