import { createElement } from "react";
import { getLucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function ResultCourse({
  title,
  icon,
}: {
  title: string;
  icon: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs bg-neutral-900">
        {createElement(getLucideIcon(icon), {
          className: "h-3 w-3 text-white",
          "aria-hidden": true,
        })}
      </span>
      <span className="truncate font-sans text-small text-neutral-700">
        {title}
      </span>
    </div>
  );
}

export function ResultKindBadge({ kind }: { kind: "video" | "lesson" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-xs px-2 py-0.5 font-sans text-small font-medium tracking-wide uppercase",
        kind === "video"
          ? "bg-primary-100 text-primary-500"
          : "bg-indigo-100 text-indigo-600",
      )}
    >
      {kind}
    </span>
  );
}
