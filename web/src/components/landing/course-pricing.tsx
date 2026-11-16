import Link from "next/link";
import { Check } from "lucide-react";
import { formatDuration, formatLevel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LandingData } from "@/sanity/lib/data";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Course = LandingData["byPopularity"][number];

// Sanity stores the price as a plain number; shown in USD like the reference.
function formatPrice(price: number | null) {
  if (!price) return { amount: "Free", unit: "" };
  return { amount: `$${price}`, unit: "USD" };
}

function features(course: Course) {
  const list = [
    `${formatLevel(course.level ?? "")} level`,
    `${course.moduleCount ?? 0} modules · ${course.lessonIds?.length ?? 0} lessons`,
    `${formatDuration(course.duration ?? 0)} of video`,
  ];
  if (course.instructor?.name) list.push(`Taught by ${course.instructor.name}`);
  if (course.category?.title) list.push(`${course.category.title} track`);
  return list;
}

// The reference's three pricing tiers, filled with three real courses: the
// most popular one is highlighted in the middle (frame 12).
export function CoursePricing({ courses }: { courses: LandingData["byPopularity"] }) {
  const [first, second, third] = courses;
  const picks = [second, first, third].filter(Boolean) as Course[];
  if (picks.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
      <SectionHeading
        title="Pick your next course"
        subtitle="Three of the most popular courses on Vertex — real prices, real lessons, ready when you are."
      />
      <div className="mt-14 grid items-start gap-5 md:grid-cols-3">
        {picks.map((course, i) => {
          const highlighted = course._id === first?._id;
          const price = formatPrice(course.price);
          return (
            <Reveal
              key={course._id}
              delay={i * 100}
              className={cn(
                "card-glass relative rounded-xl p-6",
                highlighted && "border-primary-500/70 shadow-glow md:-mt-4",
              )}
            >
              {highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary-500 px-3 py-1 font-sans text-[10px] font-bold tracking-wider text-white uppercase">
                  Most popular
                </span>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[34px] leading-none font-semibold text-neutral-900">
                  {price.amount}
                </span>
                {price.unit && (
                  <span className="font-sans text-body-lg font-semibold text-neutral-900">
                    {price.unit}
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-sans text-body-lg font-semibold text-neutral-900">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-3 min-h-[66px] font-sans text-body text-neutral-500">
                {course.summary}
              </p>
              <Link
                href={`/courses/${course.slug}`}
                className={cn(
                  "mt-6 flex h-10 items-center justify-center rounded-md font-sans text-body font-semibold transition-colors",
                  highlighted
                    ? "btn-glow bg-primary-500 text-white hover:bg-primary-600"
                    : "border border-white/10 bg-surface-raised text-neutral-900 hover:bg-neutral-100",
                )}
              >
                Get started
              </Link>
              <div className="my-6 h-px bg-white/[0.07]" />
              <ul className="flex flex-col gap-3">
                {features(course).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 font-sans text-body text-neutral-700"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-primary-500">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
