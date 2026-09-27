"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { captureEvent } from "@/components/analytics/capture-event";
import { Button, buttonVariants } from "@/components/ui/button";

export function CourseStartLink({
  courseSlug,
  lessonSlug,
  label,
  source,
}: {
  courseSlug: string;
  lessonSlug: string;
  label: string;
  source: "course_header" | "progress_bar";
}) {
  return (
    <Link
      href={`/lessons/${lessonSlug}`}
      className={buttonVariants({ variant: "primary" })}
      onClick={() =>
        captureEvent("course_started", {
          course_slug: courseSlug,
          source,
        })
      }
    >
      {label}
    </Link>
  );
}

export function CourseBookmarkButton({ courseSlug }: { courseSlug: string }) {
  return (
    <Button
      variant="tertiary"
      type="button"
      onClick={() =>
        captureEvent("course_bookmarked", { course_slug: courseSlug })
      }
    >
      <Bookmark className="h-4 w-4" />
      Bookmark
    </Button>
  );
}
