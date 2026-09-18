import { createElement } from "react";
import { getLucideIcon } from "@/lib/icons";
import { formatDuration, formatLevel } from "@/lib/format";
import type { ALL_COURSES_QUERY_RESULT } from "../../sanity.types";

export function getCourseCardProps(course: ALL_COURSES_QUERY_RESULT[number]) {
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
