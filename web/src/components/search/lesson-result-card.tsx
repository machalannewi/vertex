import Link from "next/link";
import { ChevronRight, ExternalLink, FileText } from "lucide-react";
import type { LessonSearchResult } from "@/lib/search/types";
import { ResultCourse, ResultKindBadge } from "./result-card-parts";

export function LessonResultCard({
  result,
  onSelect,
}: {
  result: LessonSearchResult;
  onSelect: () => void;
}) {
  return (
    <Link
      href={`/lessons/${result.lessonSlug}`}
      onClick={onSelect}
      className="group flex flex-col gap-5 rounded-md border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:flex-row"
    >
      <div className="flex w-full shrink-0 gap-6 rounded-sm bg-neutral-50 p-4 md:w-[274px]">
        <FileText className="h-5 w-5 shrink-0 text-neutral-700" />
        <ul className="flex min-w-0 flex-col gap-2 font-sans text-small text-neutral-700">
          {result.keyPoints.slice(0, 3).map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden>&bull;</span>
              <span className="line-clamp-2">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <ResultCourse title={result.course.title} icon={result.course.icon} />
          <ResultKindBadge kind="lesson" />
        </div>
        <h3 className="mt-2 font-sans text-heading-3 font-medium text-neutral-900 group-hover:text-primary-500">
          {result.title}
        </h3>
        {result.description && (
          <p className="mt-1.5 line-clamp-2 max-w-md font-sans text-body text-neutral-500">
            {result.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-2">
          <span className="font-sans text-small text-neutral-500">
            {result.moduleLabel}
          </span>
          <span className="inline-flex items-center gap-3 font-sans text-body font-medium text-primary-500">
            View lesson
            <ExternalLink className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
