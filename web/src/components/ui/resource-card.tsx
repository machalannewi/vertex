import { ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResourceCard({
  title,
  description,
  meta,
  className,
}: {
  title: string;
  description: string;
  meta: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-neutral-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-100 text-neutral-500">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
          {title}
        </h3>
        <p className="font-sans text-body text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="font-sans text-small text-neutral-500">{meta}</span>
        <ExternalLink className="h-4 w-4 text-neutral-500" />
      </div>
    </div>
  );
}
