import {
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";

const RESOURCE_ICONS: Record<string, LucideIcon> = {
  article: FileText,
  link: FileText,
  download: Download,
  video: PlayCircle,
  other: LinkIcon,
};

export function LessonResourceCard({
  type,
  title,
  description,
  url,
}: {
  type: string;
  title: string;
  description?: string | null;
  url: string;
}) {
  const Icon = RESOURCE_ICONS[type] ?? LinkIcon;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-md border border-neutral-200 bg-white p-4 transition-colors hover:border-primary-200"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-neutral-200 text-neutral-500">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-sans text-body font-medium text-neutral-900">
          {title}
        </span>
        {description && (
          <span className="font-sans text-small text-neutral-500">
            {description}
          </span>
        )}
      </span>
      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 group-hover:text-primary-500" />
    </a>
  );
}
