import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("mx-auto max-w-2xl text-center", className)}>
      <h2 className="font-display text-[32px] leading-[40px] font-semibold tracking-tight text-neutral-900 sm:text-display-2">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-xl font-sans text-body-lg text-neutral-500">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
