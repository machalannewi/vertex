import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xs px-2 py-0.5 font-sans text-small font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        video: "bg-indigo-500/15 text-indigo-300",
        lesson: "bg-sky-500/15 text-sky-300",
        popular: "bg-primary-500/15 text-primary-400",
      },
    },
    defaultVariants: {
      variant: "lesson",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
