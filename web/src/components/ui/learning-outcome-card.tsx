import { createElement } from "react";
import { getLucideIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function LearningOutcomeCard({
  icon,
  title,
  description,
  className,
}: {
  icon: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4",
        className,
      )}
    >
      {createElement(getLucideIcon(icon), {
        className: "h-6 w-6 text-primary-500",
        strokeWidth: 1.5,
      })}
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-heading-3 font-medium text-neutral-900">
          {title}
        </h3>
        <p className="font-sans text-body text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
