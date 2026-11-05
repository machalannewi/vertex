import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { toPlainText } from "next-sanity";
import {
  Bookmark,
  CircleCheck,
  Clock,
  Lightbulb,
  Signal,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { InstructorByline } from "@/components/ui/instructor-byline";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LessonVideo } from "@/components/lesson/lesson-video";
import { LessonTabs } from "@/components/lesson/lesson-tabs";
import { LessonNotes } from "@/components/lesson/lesson-notes";
import { LessonResourceCard } from "@/components/lesson/lesson-resource-card";
import { LessonFooterNav } from "@/components/lesson/lesson-footer-nav";
import { LessonViewTracker } from "@/components/analytics/lesson-view-tracker";
import { getLessonPage } from "@/sanity/lib/data";
import { courseProgress, getUserProgress } from "@/sanity/lib/progress";
import { urlFor } from "@/sanity/lib/image";
import { formatDuration, formatLevel } from "@/lib/format";

// `?t=<seconds>` starts the video at that second (used by search results).
function parseStartSeconds(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^\d{1,6}$/.test(value)) return 0;
  return Number(value);
}

export default async function LessonPage({
  params,
  searchParams,
}: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  const { t } = await searchParams;
  const data = await getLessonPage(slug);

  if (!data) notFound();

  const { userId } = await auth();
  const {
    lesson,
    course,
    modules,
    moduleIndex,
    moduleTitle,
    lessonLabel,
    previousLesson,
    nextLesson,
  } = data;

  // Progress is per-learner app state, read server-side scoped to this user.
  const progress = await getUserProgress(userId);
  const courseLessonIds = modules.flatMap((m) => m.lessons.map((l) => l._id));
  const { percent } = courseProgress(progress, courseLessonIds);
  const lessonCompleted = progress.completed.has(lesson._id);
  const resumeSeconds = Math.floor(progress.positions.get(lesson._id) ?? 0);

  // A `?t=` from search wins for the initial seek; otherwise resume where the
  // learner left off.
  const requestedStart = parseStartSeconds(t);
  const startSeconds = requestedStart > 0 ? requestedStart : resumeSeconds;
  const notes = lesson.notes ?? [];
  const introBlock = notes.find(
    (block) => (block.style ?? "normal") === "normal" && !block.listItem,
  );
  const subtitle = introBlock ? toPlainText([introBlock]) : null;
  const keyPoints = lesson.keyPoints ?? [];
  const resources = lesson.resources ?? [];

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar showActions />
      <LessonViewTracker
        lessonSlug={lesson.slug ?? slug}
        courseSlug={course.slug}
        lessonLabel={lessonLabel}
        startSeconds={startSeconds}
      />

      <div className="mx-auto grid w-full max-w-360 flex-1 grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
        <LessonSidebar
          course={{
            title: course.title,
            slug: course.slug,
            coverUrl: course.coverImage
              ? urlFor(course.coverImage).width(112).height(112).url()
              : null,
            coverAlt: course.coverImage?.alt ?? course.title,
          }}
          modules={modules}
          currentModuleIndex={moduleIndex}
          currentLessonId={lesson._id}
          showProgress={Boolean(userId)}
          percent={percent}
          completedLessonIds={Array.from(progress.completed)}
        />

        <main className="min-w-0 px-4 py-8 sm:px-9 lg:py-10">
          <Breadcrumbs
            className="flex-wrap"
            items={[
              { label: "All Courses", href: "/courses" },
              { label: course.title, href: `/courses/${course.slug}` },
              { label: moduleTitle, href: `/courses/${course.slug}` },
              { label: lesson.title ?? "" },
            ]}
          />

          <Badge variant="popular" className="mt-10">
            {lessonLabel}
          </Badge>

          <div className="mt-4 flex items-start justify-between gap-6">
            <h1 className="font-display text-display-2 font-bold text-neutral-900 sm:text-display-1">
              {lesson.title}
            </h1>
            {/* Presentational only: bookmarks aren't stored anywhere. */}
            <button
              type="button"
              aria-label="Bookmark lesson"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-200 bg-white text-primary-500 hover:bg-primary-100"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>

          {subtitle && (
            <p className="mt-4 max-w-2xl font-sans text-body-lg leading-7 text-neutral-500">
              {subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 font-sans text-body text-neutral-500">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDuration(lesson.duration ?? 0)}
            </span>
            {course.level && (
              <span className="inline-flex items-center gap-2">
                <Signal className="h-4 w-4" />
                {formatLevel(course.level)}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {(lesson.studentCount ?? 0).toLocaleString("en-US")} students
            </span>
          </div>

          {course.instructor?.slug && (
            <div className="mt-6">
              <InstructorByline
                name={course.instructor.name ?? ""}
                slug={course.instructor.slug}
                photoUrl={
                  course.instructor.photo
                    ? urlFor(course.instructor.photo).width(64).height(64).url()
                    : null
                }
                photoAlt={course.instructor.photo?.alt ?? undefined}
              />
            </div>
          )}

          <div className="mt-8">
            <LessonVideo
              videoUrl={lesson.videoUrl ?? ""}
              title={lesson.title ?? "Lesson video"}
              startSeconds={startSeconds}
              lessonId={lesson._id}
              lessonSlug={lesson.slug ?? slug}
              courseSlug={course.slug}
              lessonLabel={lessonLabel}
              durationSeconds={lesson.duration ?? 0}
              canTrack={Boolean(userId)}
              initiallyCompleted={lessonCompleted}
            />
          </div>

          <div className="mt-10">
            <LessonTabs
              content={
                <div className="flex flex-col">
                  {notes.length > 0 && (
                    <section className="border-b border-neutral-200 px-4 py-8 sm:px-5">
                      <h2 className="font-display text-heading-2 font-semibold text-neutral-900">
                        Overview
                      </h2>
                      <div className="mt-4 max-w-3xl">
                        <LessonNotes value={notes} />
                      </div>
                    </section>
                  )}

                  {keyPoints.length > 0 && (
                    <section className="px-4 pt-8 sm:px-5">
                      <h2 className="font-sans text-body-lg font-medium text-neutral-900">
                        In this lesson you will:
                      </h2>
                      <ul className="mt-6 flex flex-col gap-4">
                        {keyPoints.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-4 font-sans text-body-lg text-neutral-700"
                          >
                            <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {lesson.proTip && (
                    <section className="px-4 pt-8 sm:px-5">
                      <div className="flex items-start gap-4 rounded-md border border-primary-100 bg-primary-100/50 p-5">
                        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                        <div className="flex flex-col gap-2">
                          <h2 className="font-display text-body-lg font-semibold text-neutral-900">
                            Pro Tip
                          </h2>
                          <p className="font-sans text-body leading-6 text-neutral-500">
                            {lesson.proTip}
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {resources.length > 0 && (
                    <section className="mt-6 border-t border-neutral-200 px-4 py-6 sm:px-5">
                      <h2 className="font-display text-heading-3 font-semibold text-neutral-900">
                        Resources
                      </h2>
                      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {resources.map((resource) => (
                          <LessonResourceCard
                            key={resource._key}
                            type={resource.type ?? "other"}
                            title={resource.title ?? ""}
                            description={resource.description}
                            url={resource.url ?? "#"}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              }
            />
          </div>
        </main>
      </div>

      <LessonFooterNav
        lessonSlug={lesson.slug ?? slug}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
      />
    </div>
  );
}
