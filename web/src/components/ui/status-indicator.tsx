import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  "in-progress": {
    label: "In Progress",
    icon: Circle,
    className: "text-neutral-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-emerald-500",
  },
  "now-playing": {
    label: "Now Playing",
    icon: PlayCircle,
    className: "text-primary-500",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    className: "text-neutral-300",
  },
} as const;

export type Status = keyof typeof STATUS_CONFIG;

export function StatusIndicator({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const { label, icon: Icon, className: statusClassName } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-sans text-body text-neutral-700",
        className,
      )}
    >
      <Icon className={cn("h-4 w-4", statusClassName)} />
      {label}
    </span>
  );
}
