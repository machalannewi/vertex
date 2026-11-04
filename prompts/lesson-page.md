# Lesson page

## Goal
Build the lesson page (`/lessons/[slug]`) to match `design/vertex-lesson.png`, using the seeded Sanity content. The lesson's video plays on the page in the provider's own embed and can start at a given second via `?t=<seconds>`. The page is read only, with no new writes and no schema changes.

## Skills and docs read
- `AGENTS.md`: workflow (section 2), UI fidelity (section 3), boundaries (section 5), playback in a provider embed with a start param and no custom player (section 7), the lesson data shape (section 8), a provider counts as supported only when both ingestion and playback exist (section 9), the Notes tab is presentational (section 7).
- `sanity-best-practices` conventions already in this repo: `defineQuery`, TypeGen into `web/sanity.types.ts`, and Portable Text rendered through `next-sanity`'s `PortableText`.
- `node_modules/next/dist/docs/`: a dynamic segment page with a promise `params`/`searchParams` (`PageProps<"/lessons/[slug]">`) and `notFound()`.
- `prompts/course-page.md`: the precedents for stubbed progress and a presentational bookmark.

## Code inspected
- `studio/schemaTypes/documents/lesson.ts`, `course.ts`, `objects/module.ts`, `objects/resource.ts`: field shapes. `duration` is in seconds. `resources[].type` is one of `article|download|video|link|other`.
- `web/src/sanity/lib/queries.ts` / `data.ts`: `LESSON_BY_SLUG_QUERY` and `COURSE_FOR_LESSON_QUERY` already exist, but together they don't carry the sidebar or prev/next data (per-lesson titles and durations, the course cover, the level). No page uses them yet.
- `web/src/sanity/lib/numbering.ts`: `getModuleLabel` and `getLessonLabel`.
- `web/src/app/courses/[slug]/page.tsx` and `components/ui/module-accordion.tsx`: layout shell (`Navbar showActions`, `max-w-360`, `bg-neutral-50`), token usage, and the analytics `captureEvent` pattern.
- Reusable UI: `Navbar`, `Breadcrumbs`, `Badge` (`popular` variant = orange "LESSON 5.1" chip), `ProgressBar`, `buttonVariants`, `formatDuration`.
- `web/src/components/ui/resource-card.tsx`: the design-system card has a meta footer row, while the lesson design's card is compact (icon, title, description, external-link icon). It doesn't fit as is.
- `scripts/seed.ndjson`: 10 courses, 120 lessons. Every `videoUrl` is YouTube `watch?v=`. Notes are an intro paragraph, then an h2, bullets, and a closing paragraph. Each lesson has 3 key points, a `proTip`, and resources (all `type: link`).
- `scripts/ingest-videos.ts`: ingestion is YouTube only.

## Decisions and assumptions
- **Route** `web/src/app/lessons/[slug]/page.tsx`, a server component. Existing links in the module accordion already point to `/lessons/<slug>`.
- **One new query, `LESSON_PAGE_QUERY`**, fetches the lesson plus its parent course through a reverse reference (`*[_type=="course" && references(^._id)][0]`), including course title/slug/cover/level and `modules[]{title, lessons[]->{_id,title,slug,duration}}`. A new `getLessonPage(slug)` in `data.ts` works out the module and lesson indexes, the labels, and the prev/next lessons across the whole course in reading order. It logs through `logContentRequest` like `getCourseBySlug`. I'll remove the unused `getLessonBySlug`/`getCourseAndPositionForLesson` and their queries, since the new helper replaces them. Then regenerate TypeGen (`npm run typegen` in `studio/`).
- **Video playback**: a `LessonVideo` server component builds the embed URL from `videoUrl`.
  - YouTube only, matching section 9, because only YouTube has ingestion. It parses `watch?v=`, `youtu.be/` and `embed/` forms, and embeds `https://www.youtube-nocookie.com/embed/<id>?start=<t>&rel=0`.
  - `t` comes from `?t=<seconds>`. It is validated as a non-negative integer, and anything else is ignored.
  - A Vimeo, Bunny or unrecognised URL shows a neutral "Video unavailable" panel in the same 16:9 frame instead of guessing.
  - It's a plain iframe (`allowFullScreen`, `loading="lazy"` not used, since the video is above the fold). The design's control bar is the provider player's own UI, so I build no custom controls.
- **Content mapping** (the design shows fields the schema lacks, so I map real fields onto them):
  - Subtitle under the title: the plain text of the first `normal` paragraph in `notes`. It's hidden if there isn't one.
  - Meta row: lesson duration, course level, and lesson `studentCount` formatted with thousands separators, since the design shows "3,426 students".
  - Overview: the full `notes` Portable Text, with styled `block`/`h2`/`list` components written with Tailwind classes to match the design. That means no new `@tailwindcss/typography` dependency.
  - "In this lesson you will": `keyPoints`, with orange check-circle icons.
  - Pro Tip panel: `proTip`, only when it's set.
  - Resources: `resources[]` as a new compact `LessonResourceCard` in a 3-column grid, opening in a new tab with `rel="noopener noreferrer"`. The icon depends on the type: `article`/`link` → FileText, `download` → Download, `video` → PlayCircle, `other` → Link. Lucide v1 has no brand icons, so the design's GitHub mark becomes the type icon.
- **Breadcrumbs**: All Courses → course → module title → lesson title, reusing `Breadcrumbs`.
- **Sidebar**:
  - Back to course link, then the course cover thumbnail and title. Signed-in users also see a progress bar.
  - A "Module N of M" header that collapses the list.
  - Numbered module rows with total durations. The current module is open by default with an orange number circle. It lists its lessons on a timeline, and the current lesson shows "Now playing" with an orange play icon.
  - Other modules expand on click. It's a small client component that gets its data as props.
- **Progress stays stubbed**, following the course page decision. Signed-in users see a 0% bar, signed-out users see none, and no module or lesson shows a completed check. Completion marks and resume position come with the progress tracking feature.
- **Presentational only**: the bookmark icon button, the notifications bell (already in the navbar), and the Notes tab. The Notes tab shows a textarea with the placeholder "Write your notes for this lesson…" and a note that notes aren't saved yet. Nothing is persisted.
- **Tabs**: "Lesson Content" and "Notes", a client toggle with Lesson Content as the default.
- **Footer bar**: a sticky bottom bar with "Previous Lesson" plus the previous lesson's title and duration on the left, and the next lesson's title and duration plus a primary "Next Lesson" on the right. The design shows module names there, but prev/next is by lesson, which is what the buttons navigate to. A side with no neighbour is hidden.
- **Analytics**: `lesson_viewed` fires once on mount (lesson slug, course slug, lesson label, start seconds), plus `lesson_navigated` for prev/next clicks. Tracking video play and how far it's watched needs the YouTube IFrame API, so it's deferred to the progress tracking task, which needs the same player events.
- **Responsive**: at `lg` and above, the sidebar (about 380px) and the main column sit side by side as in the design. Below `lg`, the sidebar stacks above the content and its module list starts collapsed behind the "Module N of M" toggle. The footer bar stacks tighter, and the resources grid drops to 1 column.

## Files expected to touch
- `web/src/app/lessons/[slug]/page.tsx`: new page.
- `web/src/components/lesson/lesson-sidebar.tsx`: new client sidebar and module list.
- `web/src/components/lesson/lesson-video.tsx`: new embed and URL parser.
- `web/src/components/lesson/lesson-tabs.tsx`: new client tabs, with a presentational Notes tab.
- `web/src/components/lesson/lesson-notes.tsx`: new Portable Text renderer.
- `web/src/components/lesson/lesson-resource-card.tsx`: new compact resource card.
- `web/src/components/lesson/lesson-footer-nav.tsx`: new prev/next bar.
- `web/src/components/analytics/lesson-view-tracker.tsx`: new `lesson_viewed` capture.
- `web/src/sanity/lib/queries.ts`, `data.ts`: add `LESSON_PAGE_QUERY`/`getLessonPage` and remove the unused lesson helpers.
- `web/sanity.types.ts`: regenerated.

## Requirements
- Match `design/vertex-lesson.png` on desktop: layout, spacing, type (Playfair for the title and section headings, Inter for body), colours from the existing tokens, the active tab underline, the pro tip panel, resource cards, and the sticky footer.
- Real seeded content only. Nothing invented.
- `notFound()` for an unknown slug, or for a lesson that no course references.
- The video plays inline, and `?t=90` starts it at 1:30.
- Mobile at about 375px with no horizontal scroll.

## Security
- All reads happen server side through the existing `server-only` client. No token reaches the browser, and client components only receive plain props.
- `t` is parsed as an integer before it goes into the embed URL. The video id comes from a strict regex (`[\w-]{11}`), so no raw `videoUrl` is put into the iframe `src`.
- Resource URLs come from Sanity, which only accepts http/https. They open with `noopener noreferrer`.
- No writes. The Notes tab and the bookmark persist nothing.

## Acceptance criteria
- `/lessons/nextjs-app-router-in-depth-caching-and-revalidation` renders:
  - "LESSON 3.2", the breadcrumbs, title, subtitle and meta row
  - the YouTube embed, plus the overview, key points, pro tip and resources
  - the sidebar with module 3 open and this lesson marked "Now playing"
  - prev/next pointing to 3.1 and 3.3
- `?t=90` starts the video at 90s, and `?t=abc` is ignored.
- The first lesson of a course has no Previous button, and the last has no Next.
- Clicking other modules in the sidebar expands them, and lesson links navigate.
- `/lessons/nope` returns 404.
- `lesson_viewed` shows in PostHog.

## Checks
- `web`: `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- `studio`: `npm run typegen`.

## Manual test
1. `npm run dev` in `web/`.
2. Open http://localhost:3000/lessons/nextjs-app-router-in-depth-caching-and-revalidation and compare it with `design/vertex-lesson.png`.
3. Press play and confirm the video plays on the page.
4. Open the same URL with `?t=90` and confirm playback starts at 1:30.
5. Click Next Lesson, then Previous Lesson, and confirm they navigate correctly.
6. Expand another module in the sidebar and click one of its lessons.
7. Switch to the Notes tab and back.
8. Resize to about 375px: the sidebar stacks and its list is collapsed, with no horizontal scroll.
9. Open http://localhost:3000/lessons/nope and confirm a 404.
10. Signed in, confirm the sidebar shows a 0% progress bar. Signed out, confirm there's none.
