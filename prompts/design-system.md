# Implementation prompt: Vertex Design System foundation

## Goal
Establish the Vertex design system as reusable Tailwind tokens and primitive UI components in the `web` workspace, matching `design/vertex-designsystem.png` exactly (colors, type scale, spacing, radius, shadows, icons, buttons, inputs, badges, status indicators, progress bar, cards, navigation). This is foundation work only — it does not build the home, course, lesson, or search pages (separate reference images exist for those and are out of scope here).

## Skills read
- AGENTS.md (this file) — sections 2 (workflow), 3 (UI work), 6 (tech stack).
- No CMS/auth/analytics skill applies here; this is pure styling/tokens/primitives, no Sanity/Clerk/PostHog surface touched.

## Code inspected
- `src/app/globals.css` — stock Tailwind v4 `@import "tailwindcss"` + `@theme inline` mapping `--color-background`/`--color-foreground` to Geist fonts. No custom tokens yet.
- `src/app/layout.tsx` — loads Geist Sans/Geist Mono via `next/font/google`, generic "Create Next App" metadata.
- `src/app/page.tsx` — default `create-next-app` boilerplate page (Next.js logo, Vercel/docs links). Untouched by this task since the home page has its own reference (`design/vertex-home.png`) and is a separate piece of work.
- `package.json` — only `next`, `react`, `react-dom`, Tailwind v4, TypeScript, ESLint. No icon library, no `clsx`/`cva`/`tailwind-merge`, no font for Playfair Display.
- `tsconfig.json` — `@/*` path alias already points at `src/*`.
- Confirmed only one workspace exists today (`web`, at repo root); the Sanity `studio` workspace referenced in AGENTS.md section 5 has not been created yet, so this task only touches the Next.js app.

## Decisions / assumptions
- **Fonts**: load `Playfair Display` (display/heading) and `Inter` (body/UI) via `next/font/google` in `layout.tsx`, exposed as `--font-display` / `--font-sans` CSS variables, wired into the Tailwind v4 `@theme` block. Drop Geist entirely — it's not in the reference.
- **Tokens live in `globals.css`** using Tailwind v4's CSS-first `@theme` (no `tailwind.config.ts`), matching the pattern already started there:
  - Colors: `primary-100..500`, `neutral-50..900`, `white`, exact hex values from the sheet.
  - Type scale: `display-1`, `display-2`, `heading-1..3`, `body-lg`, `body`, `small` as font-size/line-height/weight token pairs.
  - Spacing: the sheet's 4/8/12/16/24/32/40/48/64px scale is Tailwind's default spacing scale already (base unit 4px) — no custom spacing tokens needed, just use default utilities (`p-1`, `p-2`, `p-6`, `p-8`, `p-10`, `p-12`, `p-16`).
  - Radius: custom `--radius-xs(4)/sm(8)/md(12)/lg(16)/xl(24)/full` tokens since Tailwind v4 defaults don't line up with the sheet's names.
  - Shadows: custom `--shadow-sm/md/lg/xl` tokens using the exact `rgba(15,23,42,…)` values shown.
- **Icons**: the sheet's outline/filled icon set (24×24 grid, 2px stroke, rounded caps) maps directly to `lucide-react`. Adding it as a new dependency — flagging since AGENTS.md doesn't name an icon library.
- **Component variant styling**: adding `clsx`, `tailwind-merge`, and `class-variance-authority` (small, standard, zero-risk deps) to keep `Button`/`Badge`/`StatusIndicator` variant logic clean, plus a `cn()` helper in `src/lib/utils.ts`. This is the standard pattern for Tailwind primitive components and keeps future card/nav work consistent.
- **Primitives are generic, not feature-bound**: `CourseCard`/`LessonCard`/`ResourceCard` are built to the exact visual spec on the sheet (structure, spacing, states) but take plain props (title, meta, thumbnail, etc.) — no Sanity types, no data fetching. Wiring them to real course/lesson data happens when the catalog/course/lesson pages are built.
- **Verification surface**: since there's no feature page to host these yet, add an internal `/style-guide` route that lays out every section of the reference sheet (colors, type, spacing, radius/shadows, icons, buttons, inputs, badges, status, progress, cards, nav) so the result can be visually diffed against `design/vertex-designsystem.png`. This route is dev/reference scaffolding, not a product page.
- Root `page.tsx` and `layout.tsx` metadata get cleaned up (title → "Vertex", drop the create-next-app boilerplate content) since shipping that placeholder would fail a build/lint pass on unused Next/Vercel demo links — but no new home-page design work happens here.

## Files expected to touch
- `package.json` — add `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.
- `src/app/globals.css` — full token set (`@theme` block).
- `src/app/layout.tsx` — Playfair Display + Inter via `next/font/google`, metadata title/description.
- `src/app/page.tsx` — strip create-next-app boilerplate to a minimal placeholder (no new design work).
- `src/lib/utils.ts` — new, `cn()` helper.
- `src/components/ui/button.tsx`, `input.tsx`, `select.tsx`, `badge.tsx`, `status-indicator.tsx`, `progress-bar.tsx` — new.
- `src/components/ui/course-card.tsx`, `lesson-card.tsx`, `resource-card.tsx` — new.
- `src/components/ui/navbar.tsx`, `breadcrumbs.tsx`, `pagination.tsx` — new.
- `src/app/style-guide/page.tsx` — new, renders all sections above for visual QA.

## Requirements
- Colors, hex values, type scale (font/size/line-height/weight/use), spacing, radius, and shadow values match the sheet exactly.
- Buttons: primary/secondary/tertiary/text variants, each with default/hover/disabled states, 44px default height, 12px radius, Inter medium 14–16px, padding 16px (lg)/12px (md).
- Inputs: search and text variants, 44px height, 12px radius, 1px `#E2E8F0` border, focus border `#FB923C`, 16px horizontal padding; select shows a "Most Relevant"-style dropdown.
- Badges: `VIDEO`, `LESSON`, `POPULAR` tag styles with the sheet's colors.
- Status indicators: In Progress, Completed, Now Playing, Locked — icon + label per sheet.
- Progress bar: filled/track colors and percentage label matching the sheet.
- Cards: Course Card, Lesson Card (video variant + lesson variant), Resource Card, matching layout/spacing/typography shown.
- Navigation: top nav (logo + Courses/My Learning), breadcrumbs, pagination — matching the sheet.
- Everything responsive down to mobile (AGENTS.md section 3): the `/style-guide` page must not overflow horizontally on small viewports, sections stack sensibly.
- No feature logic, no Sanity/Clerk/PostHog wiring — pure presentation primitives with plain props.

## Security considerations
None — no data, no secrets, no auth, no external calls. Pure static UI/tokens.

## Acceptance criteria
- `/style-guide` visually matches `design/vertex-designsystem.png` section by section (colors, type, spacing, radius/shadows, icons, buttons incl. states, inputs, badges, status, progress, cards, nav).
- Playfair Display renders on display/heading styles, Inter on body/UI text.
- Button hover/disabled states are visibly distinct and match the sheet.
- Input focus state shows the `#FB923C` border.
- No unused create-next-app boilerplate remains.
- Type check, lint, and build all pass.

## Checks to run
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run dev` and manually verify `/style-guide`

## Manual test steps
1. `npm run dev`, open `http://localhost:3000/style-guide`.
2. Compare each numbered section against `design/vertex-designsystem.png` (colors → nav/principles) side by side.
3. Hover and tab-focus the buttons in the Buttons section; confirm hover darkens/lightens per variant and disabled state is muted and non-interactive.
4. Click into the search/text inputs; confirm the focus border turns `#FB923C` (primary-400).
5. Resize the browser to a mobile width (~375px) and confirm no section causes horizontal page scroll.
6. Open `http://localhost:3000/` and confirm the root page no longer shows Next.js/Vercel boilerplate.
