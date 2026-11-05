import { createElement } from "react";
import { getLucideIcon } from "@/lib/icons";
import { formatDuration, formatLevel } from "@/lib/format";

// The subset of fields a course card needs. Any card-shaped GROQ result
// (catalog, an instructor's courses) satisfies this structurally.
export interface CourseCardSource {
  title: string | null;
  summary: string | null;
  level: string | null;
  duration: number | null;
  moduleCount: number | null;
  category: { icon: string | null } | null;
}

export function getCourseCardProps(course: CourseCardSource) {
  return {
    icon: createElement(getLucideIcon(course.category?.icon), {
      className: "h-5 w-5 text-white",
    }),
    iconClassName: "bg-neutral-900",
    title: course.title ?? "",
    description: course.summary ?? "",
    level: formatLevel(course.level ?? ""),
    duration: formatDuration(course.duration ?? 0),
    moduleCount: `${course.moduleCount ?? 0} modules`,
  };
}
