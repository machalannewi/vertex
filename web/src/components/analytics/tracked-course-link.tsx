"use client";

import Link from "next/link";
import { captureEvent } from "@/components/analytics/capture-event";

export function TrackedCourseLink({
  courseSlug,
  source,
  children,
}: {
  courseSlug: string | null;
  source: "home" | "course_catalog";
  children: React.ReactNode;
}) {
  if (!courseSlug) return children;

  return (
    <Link
      href={`/courses/${courseSlug}`}
      onClick={() =>
        captureEvent("course_selected", {
          course_slug: courseSlug,
          source,
        })
      }
    >
      {children}
    </Link>
  );
}
