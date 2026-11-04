import Image from "next/image";
import Link from "next/link";
import { ChevronRight, FileText, Folder, Play, PlayCircle } from "lucide-react";
import { formatTimestamp } from "@/lib/format";
import type { VideoSearchResult } from "@/lib/search/types";
import { ResultCourse, ResultKindBadge } from "./result-card-parts";

export function VideoResultCard({
  result,
  onSelect,
}: {
  result: VideoSearchResult;
  onSelect: () => void;
}) {
  const timestamp = formatTimestamp(result.startSeconds);

  return (
    <Link
      href={`/lessons/${result.lessonSlug}?t=${result.startSeconds}`}
      onClick={onSelect}
      className="group flex flex-col gap-5 rounded-md border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:flex-row"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-sm bg-neutral-900 md:w-[274px]">
        {result.thumbnailUrl && (
          <Image
            src={result.thumbnailUrl}
            alt={result.thumbnailAlt}
            fill
            sizes="(min-width: 768px) 274px, 100vw"
            className="object-cover"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md">
            <Play className="ml-0.5 h-5 w-5 fill-neutral-900 text-neutral-900" />
          </span>
        </span>
        <span className="absolute right-2 bottom-2 rounded-xs bg-neutral-900/90 px-1.5 py-0.5 font-sans text-small font-medium text-white">
          {formatTimestamp(result.duration)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <ResultCourse title={result.course.title} icon={result.course.icon} />
          <ResultKindBadge kind="video" />
        </div>
        <h3 className="mt-3 font-sans text-heading-3 font-medium text-neutral-900 group-hover:text-primary-500">
          {result.title}
        </h3>
        {result.description && (
          <p className="mt-2 line-clamp-2 max-w-xl font-sans text-body text-neutral-500">
            {result.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-sans text-small text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {result.lessonLabel}
            </span>
            <span aria-hidden>&middot;</span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Folder className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{result.moduleTitle}</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-2 font-sans text-body font-medium text-primary-500">
            <PlayCircle className="h-5 w-5" />
            Watch from {timestamp}
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
