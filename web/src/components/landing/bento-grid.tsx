import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  CircleDashed,
  Layers,
  PlayCircle,
  Search,
  Sparkle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingData } from "@/sanity/lib/data";
import { Reveal } from "./reveal";
import { Sparkline } from "./sparkline";

function CardTitle({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-display text-heading-3 font-semibold text-neutral-900">
        {title}
      </h3>
      <p className="mt-1.5 max-w-xs font-sans text-body text-neutral-500">
        {body}
      </p>
    </div>
  );
}

// Four-card bento from the reference (frames 08-09), each describing a real
// part of Vertex with live data.
export function BentoGrid({
  featuredCourse,
  students,
}: {
  featuredCourse: LandingData["featuredCourse"];
  students: number;
}) {
  const modules = featuredCourse?.modules ?? [];
  const firstLessons = (modules[0]?.lessons ?? []).filter(Boolean).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 sm:pt-20">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Progress (≈ "Balance") */}
        <Reveal className="card-glass relative overflow-hidden rounded-xl p-6 text-center">
          <CardTitle
            className="mx-auto"
            title="Progress"
            body="Every lesson you finish is marked, so you always know what's next."
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(60%_60%_at_40%_100%,rgba(249,115,22,0.22),transparent)]" />
          <ul className="relative mt-7 flex w-[118%] flex-col gap-2 text-left">
            {firstLessons.map((lesson, i) =>
              lesson ? (
                <li
                  key={lesson._id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2.5 font-sans text-small",
                    i === 0
                      ? "btn-glow bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                      : "border border-white/[0.07] bg-surface-raised/80 text-neutral-700",
                    i === 2 && "opacity-60",
                  )}
                >
                  <span className={cn("font-semibold", i === 0 ? "text-white/80" : "text-neutral-500")}>
                    1.{i + 1}
                  </span>
                  {i === 0 ? (
                    <PlayCircle className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5 shrink-0 text-primary-400" />
                  )}
                  <span className="truncate font-medium">{lesson.title}</span>
                </li>
              ) : null,
            )}
          </ul>
        </Reveal>

        {/* Learners (≈ "Users") */}
        <Reveal delay={80} className="card-glass relative overflow-hidden rounded-xl p-6 text-center">
          <CardTitle
            className="mx-auto"
            title="Learners"
            body="Thousands of students already learn with Vertex courses."
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[radial-gradient(55%_60%_at_50%_100%,rgba(249,115,22,0.25),transparent)]" />
          <div className="relative mx-auto mt-7 max-w-[240px] rounded-lg border border-white/[0.08] bg-surface-raised/90 p-4 text-left shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                Total learners
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-sans text-heading-2 font-semibold text-neutral-900">
                {students.toLocaleString("en-US")}
              </span>
              <Sparkline variant={0} className="text-neutral-700" />
            </div>
          </div>
        </Reveal>

        {/* AI Search (≈ "Create", tall card with the light beam) */}
        <Reveal
          delay={160}
          className="card-glass relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-xl p-6 md:row-span-2"
        >
          <div className="light-beam pointer-events-none absolute top-0 left-1/2 h-[62%] w-[85%] -translate-x-1/2" />
          <div className="pointer-events-none absolute top-[48%] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary-500/30 blur-3xl" />
          <div className="absolute top-[44%] left-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/15 bg-surface-raised/80 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md">
            <Search className="h-9 w-9 text-white" strokeWidth={2.25} />
          </div>
          <CardTitle
            className="relative"
            title="AI Search"
            body="Ask in plain English and get the exact lesson — and the exact second."
          />
          <Link
            href="/search"
            className="relative mt-4 inline-flex w-fit items-center gap-1 font-sans text-small font-semibold text-primary-400 hover:text-primary-300"
          >
            Try it <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        {/* Jump to the moment (≈ "AI Sessions") */}
        <Reveal
          delay={120}
          className="card-glass relative overflow-hidden rounded-xl p-6 md:col-span-2"
        >
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <CardTitle
              title="Jump to the moment"
              body="Every course is mapped module by module, lesson by lesson — so a search lands you exactly where the topic starts."
            />
            <div className="relative">
              <div className="relative w-full rounded-lg border border-white/[0.09] bg-surface-raised/90 p-3 shadow-xl sm:w-[300px]">
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-xs bg-primary-500" />
                  <span className="truncate font-sans text-body font-semibold text-neutral-900">
                    {featuredCourse?.title ?? "Your course"}
                  </span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-500" />
                </div>
                {modules.slice(0, 2).map((courseModule, mi) => (
                  <div key={`${courseModule.title}-${mi}`} className="mt-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 font-sans text-small font-medium text-neutral-700">
                      <Layers className="h-3.5 w-3.5 text-neutral-500" />
                      <span className="truncate">{courseModule.title}</span>
                    </div>
                    {mi === 0 && (
                      <div className="ml-4 border-l border-white/10 pl-3">
                        {(courseModule.lessons ?? []).slice(0, 2).map((lesson, li) =>
                          lesson ? (
                            <div
                              key={lesson._id}
                              className="truncate py-1 font-sans text-small text-neutral-500"
                            >
                              {mi + 1}.{li + 1} {lesson.title}
                            </div>
                          ) : null,
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Sparkle accents from the reference. */}
              <Sparkle aria-hidden className="absolute -top-3 -right-2 h-9 w-9 fill-white text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] sm:-right-6" />
              <Sparkle aria-hidden className="absolute top-10 -right-1 h-4 w-4 fill-white/90 text-white sm:-right-10" />
              <span aria-hidden className="absolute -top-5 right-12 h-2.5 w-2.5 rounded-full bg-white/90" />
              <span aria-hidden className="absolute top-2 right-2 h-5 w-5 rotate-45 rounded-sm bg-gradient-to-br from-white to-neutral-500 sm:-right-3" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
