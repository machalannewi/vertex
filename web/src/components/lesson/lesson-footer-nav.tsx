"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { captureEvent } from "@/components/analytics/capture-event";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

interface NeighbourLesson {
  title: string;
  slug: string;
  duration: number;
}

export function LessonFooterNav({
  lessonSlug,
  previousLesson,
  nextLesson,
}: {
  lessonSlug: string;
  previousLesson: NeighbourLesson | null;
  nextLesson: NeighbourLesson | null;
}) {
  function track(direction: "previous" | "next", target: string) {
    captureEvent("lesson_navigated", {
      from_lesson_slug: lessonSlug,
      to_lesson_slug: target,
      direction,
    });
  }

  return (
    <div className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-360 items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          {previousLesson && (
            <>
              <Link
                href={`/lessons/${previousLesson.slug}`}
                onClick={() => track("previous", previousLesson.slug)}
                className={cn(
                  buttonVariants({ variant: "tertiary" }),
                  "shrink-0 px-5",
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous Lesson</span>
                <span className="sm:hidden">Previous</span>
              </Link>
              <div className="hidden min-w-0 flex-col gap-1 md:flex">
                <span className="truncate font-sans text-body text-neutral-500">
                  {previousLesson.title}
                </span>
                <span className="font-sans text-body text-neutral-500">
                  {formatDuration(previousLesson.duration)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-6">
          {nextLesson && (
            <>
              <div className="hidden min-w-0 flex-col items-end gap-1 md:flex">
                <span className="truncate font-sans text-body text-neutral-500">
                  {nextLesson.title}
                </span>
                <span className="font-sans text-body text-neutral-500">
                  {formatDuration(nextLesson.duration)}
                </span>
              </div>
              <Link
                href={`/lessons/${nextLesson.slug}`}
                onClick={() => track("next", nextLesson.slug)}
                className={cn(
                  buttonVariants({ variant: "primary" }),
                  "shrink-0 px-6",
                )}
              >
                <span className="hidden sm:inline">Next Lesson</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
