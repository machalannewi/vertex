import { createElement } from "react";
import { getLucideIcon } from "@/lib/icons";
import type { LandingData } from "@/sanity/lib/data";
import { Reveal } from "./reveal";

// The reference's "Join 4,000+ companies" logo strip, filled with Vertex's
// real course categories (frame 07).
export function LogoMarquee({
  categories,
}: {
  categories: LandingData["categories"];
}) {
  if (categories.length === 0) return null;
  // Repeat short lists so the strip is always wider than the viewport.
  const base =
    categories.length < 6 ? [...categories, ...categories, ...categories] : categories;
  const items = [...base, ...base];

  return (
    <section className="mx-auto max-w-6xl px-6 pt-20 sm:pt-24">
      <Reveal>
        <p className="text-center font-sans text-body text-neutral-500">
          Learn the stack top teams build with
        </p>
      </Reveal>
      <div className="marquee mt-8 overflow-hidden">
        <div className="marquee__track flex w-max items-center gap-12 sm:gap-16">
          {items.map((category, i) => (
            <span
              key={`${category._id}-${i}`}
              aria-hidden={i >= base.length}
              className="inline-flex shrink-0 items-center gap-2.5 font-display text-[22px] font-bold tracking-tight whitespace-nowrap text-neutral-500/80"
            >
              {createElement(getLucideIcon(category.icon), {
                className: "h-6 w-6",
                strokeWidth: 2,
              })}
              {category.title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
