"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronDown, Play } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { captureEvent } from "@/components/analytics/capture-event";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OutlineModule } from "@/sanity/lib/data";

function ModuleItem({
  courseModule,
  moduleIndex,
  isCurrent,
  isLastInTimeline,
  inTimeline,
  currentLessonId,
  completedIds,
  courseSlug,
}: {
  courseModule: OutlineModule;
  moduleIndex: number;
  isCurrent: boolean;
  isLastInTimeline: boolean;
  inTimeline: boolean;
  currentLessonId: string;
  completedIds: Set<string>;
  courseSlug: string;
}) {
  const [open, setOpen] = useState(isCurrent);
  const duration = courseModule.lessons.reduce(
    (sum, lesson) => sum + lesson.duration,
    0,
  );

  return (
    <li
      className={cn(
        "relative",
        isCurrent && "bg-primary-100/40",
        !inTimeline && "border-t border-neutral-200",
        isCurrent && "border-b border-neutral-200",
      )}
    >
      {/* Vertical connector joining the numbered circles. */}
      {inTimeline && !isLastInTimeline && !open && (
        <span
          aria-hidden
          className="absolute top-10 bottom-0 left-[39px] w-px bg-neutral-200"
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="relative flex w-full items-start gap-4 px-6 py-4 text-left"
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-sans text-body font-medium",
            isCurrent
              ? "border-primary-500 bg-primary-500 text-white"
              : "border-neutral-200 bg-white text-neutral-700",
          )}
        >
          {moduleIndex + 1}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <span
            className={cn(
              "font-sans text-body font-medium",
              isCurrent ? "text-primary-500" : "text-neutral-900",
            )}
          >
            {courseModule.title}
          </span>
          <span className="font-sans text-small text-neutral-500">
            {formatDuration(duration)}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "mt-2 h-4 w-4 shrink-0 text-neutral-500 transition-transform",
            open && "rotate-180",
            isCurrent && "text-primary-500",
          )}
        />
      </button>

      {open && (
        <ol className="relative flex flex-col gap-1 pr-6 pb-4 pl-12">
          {courseModule.lessons.map((lesson) => {
            const isNowPlaying = lesson._id === currentLessonId;
            const isCompleted = completedIds.has(lesson._id);
            return (
              <li key={lesson._id} className="relative">
                <span
                  aria-hidden
                  className="absolute top-0 bottom-0 -left-[9px] w-px bg-neutral-200"
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3 -left-[12px] h-[7px] w-[7px] rounded-full border",
                    isNowPlaying
                      ? "border-primary-500 bg-primary-500"
                      : isCompleted
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-neutral-300 bg-white",
                  )}
                />
                <Link
                  href={`/lessons/${lesson.slug}`}
                  aria-current={isNowPlaying ? "page" : undefined}
                  onClick={() =>
                    captureEvent("lesson_sidebar_selected", {
                      course_slug: courseSlug,
                      lesson_slug: lesson.slug,
                    })
                  }
                  className="flex items-center gap-3 rounded-sm py-1.5 pl-4"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span
                      className={cn(
                        "font-sans text-small",
                        isNowPlaying
                          ? "font-medium text-neutral-900"
                          : "text-neutral-500 hover:text-neutral-900",
                      )}
                    >
                      {lesson.title}
                    </span>
                    <span
                      className={cn(
                        "font-sans text-small",
                        isNowPlaying
                          ? "text-primary-500"
                          : isCompleted
                            ? "text-emerald-500"
                            : "text-neutral-500",
                      )}
                    >
                      {isNowPlaying
                        ? "Now playing"
                        : isCompleted
                          ? "Completed"
                          : formatDuration(lesson.duration)}
                    </span>
                  </span>
                  {isNowPlaying ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                      <Play className="h-3 w-3 fill-current" />
                    </span>
                  ) : (
                    isCompleted && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    )
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </li>
  );
}

export function LessonSidebar({
  course,
  modules,
  currentModuleIndex,
  currentLessonId,
  showProgress,
  percent = 0,
  completedLessonIds = [],
}: {
  course: {
    title: string;
    slug: string;
    coverUrl: string | null;
    coverAlt: string;
  };
  modules: OutlineModule[];
  currentModuleIndex: number;
  currentLessonId: string;
  showProgress: boolean;
  percent?: number;
  completedLessonIds?: string[];
}) {
  // Mobile starts collapsed and desktop starts expanded; the toggle flips both.
  const [toggled, setToggled] = useState(false);
  const completedIds = new Set(completedLessonIds);

  return (
    <aside className="border-neutral-200 bg-white lg:border-r">
      <div className="px-6 pt-8 pb-6">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-2 font-sans text-body text-primary-500 hover:text-primary-500/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-neutral-900">
            {course.coverUrl && (
              <Image
                src={course.coverUrl}
                alt={course.coverAlt}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="font-sans text-body font-medium text-neutral-900">
              {course.title}
            </span>
            {showProgress && (
              <>
                <span className="font-sans text-small text-neutral-500">
                  {percent}% complete
                </span>
                <ProgressBar value={percent} showLabel={false} className="w-18" />
              </>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setToggled((prev) => !prev)}
        aria-expanded={!toggled}
        className="flex w-full items-center justify-between border-t border-neutral-200 px-6 py-4 font-sans text-body text-neutral-900"
      >
        Module {currentModuleIndex + 1} of {modules.length}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-neutral-500 transition-transform",
            toggled ? "rotate-180 lg:rotate-0" : "lg:rotate-180",
          )}
        />
      </button>

      <ol className={cn(toggled ? "block lg:hidden" : "hidden lg:block")}>
        {modules.map((courseModule, moduleIndex) => (
          <ModuleItem
            key={`${courseModule.title}-${moduleIndex}`}
            courseModule={courseModule}
            moduleIndex={moduleIndex}
            isCurrent={moduleIndex === currentModuleIndex}
            inTimeline={moduleIndex <= currentModuleIndex}
            isLastInTimeline={moduleIndex === currentModuleIndex}
            currentLessonId={currentLessonId}
            completedIds={completedIds}
            courseSlug={course.slug}
          />
        ))}
      </ol>
    </aside>
  );
}
