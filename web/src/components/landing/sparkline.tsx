import { cn } from "@/lib/utils";

// Decorative trend line for KPI cards (no data is implied by its shape).
const SHAPES = [
  "M0 18 L10 12 L20 15 L30 6 L40 10 L50 4 L60 9 L70 3",
  "M0 6 L10 10 L20 5 L30 13 L40 9 L50 15 L60 8 L70 12",
  "M0 14 L10 9 L20 13 L30 8 L40 12 L50 6 L60 10 L70 5",
  "M0 10 L10 15 L20 8 L30 12 L40 4 L50 11 L60 6 L70 9",
];

export function Sparkline({
  variant = 0,
  className,
}: {
  variant?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 70 20"
      fill="none"
      aria-hidden
      className={cn("h-5 w-16", className)}
    >
      <path
        d={SHAPES[variant % SHAPES.length]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
