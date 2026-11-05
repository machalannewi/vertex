import { BarChart2, Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";

export function CourseCard({
  icon,
  iconClassName,
  title,
  description,
  level,
  duration,
  moduleCount,
  progressPercent,
  className,
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  moduleCount: string;
  /** When set and > 0, shows a started-course progress bar. */
  progressPercent?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-900 font-display text-body-lg font-bold text-white",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
          {title}
        </h3>
        <p className="font-sans text-body text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center gap-4 border-t border-neutral-100 pt-3 font-sans text-small text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <BarChart2 className="h-3.5 w-3.5" />
          {level}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          {moduleCount}
        </span>
      </div>
      {progressPercent !== undefined && progressPercent > 0 && (
        <div className="flex flex-col gap-1.5">
          <span
            className={cn(
              "font-sans text-small font-medium",
              progressPercent >= 100 ? "text-emerald-500" : "text-primary-500",
            )}
          >
            {progressPercent >= 100 ? "Completed" : "Continue learning"}
          </span>
          <ProgressBar value={progressPercent} />
        </div>
      )}
    </div>
  );
}
