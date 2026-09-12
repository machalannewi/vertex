import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xs px-2 py-0.5 font-sans text-small font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        video: "bg-indigo-100 text-indigo-600",
        lesson: "bg-sky-100 text-sky-600",
        popular: "bg-primary-100 text-primary-500",
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
