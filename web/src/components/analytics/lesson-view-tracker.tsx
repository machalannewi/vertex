"use client";

import { useEffect } from "react";
import { captureEvent } from "@/components/analytics/capture-event";

export function LessonViewTracker({
  lessonSlug,
  courseSlug,
  lessonLabel,
  startSeconds,
}: {
  lessonSlug: string;
  courseSlug: string;
  lessonLabel: string;
  startSeconds: number;
}) {
  useEffect(() => {
    captureEvent("lesson_viewed", {
      lesson_slug: lessonSlug,
      course_slug: courseSlug,
      lesson_label: lessonLabel,
      start_seconds: startSeconds,
    });
  }, [lessonSlug, courseSlug, lessonLabel, startSeconds]);

  return null;
}
