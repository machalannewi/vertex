import { ExternalLink, PlayCircle } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface LessonCardBaseProps {
  title: string;
  description: string;
  className?: string;
}

export function VideoLessonCard({
  title,
  description,
  lessonLabel,
  timestamp,
  className,
}: LessonCardBaseProps & { lessonLabel: string; timestamp: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <Badge variant="video" className="w-fit">
        Video
      </Badge>
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
          {title}
        </h3>
        <p className="font-sans text-body text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="font-sans text-small text-neutral-500">
          {lessonLabel} &middot; {timestamp}
        </span>
        <button className="inline-flex items-center gap-1 font-sans text-body font-medium text-primary-500 hover:text-primary-500/80">
          Watch from {timestamp}
          <PlayCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function LessonCard({
  title,
  description,
  moduleLabel,
  className,
}: LessonCardBaseProps & { moduleLabel: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <Badge variant="lesson" className="w-fit">
        Lesson
      </Badge>
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
          {title}
        </h3>
        <p className="font-sans text-body text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="font-sans text-small text-neutral-500">
          {moduleLabel}
        </span>
        <button className="inline-flex items-center gap-1 font-sans text-body font-medium text-primary-500 hover:text-primary-500/80">
          View lesson
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
