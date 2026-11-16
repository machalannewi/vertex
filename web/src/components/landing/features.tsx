import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { Sparkline } from "./sparkline";

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 font-sans text-body text-neutral-700">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-primary-500">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function FeatureText({
  title,
  body,
  href,
  cta,
  checklist,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  checklist: string[];
}) {
  return (
    <div>
      <h3 className="font-display text-[26px] leading-[34px] font-semibold tracking-tight text-neutral-900 sm:text-heading-1">
        {title}
      </h3>
      <p className="mt-4 max-w-md font-sans text-body-lg text-neutral-500">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-surface-raised px-3 font-sans text-small font-semibold text-neutral-900 hover:bg-neutral-100"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <Checklist items={checklist} />
    </div>
  );
}

const SEARCH_ROWS = [
  { icon: PlayCircle, title: "Video moments", body: "Matched to the exact second in a lesson." },
  { icon: BookOpen, title: "Lesson results", body: "Ranked by how specific the match is." },
  { icon: ShieldCheck, title: "Grounded answers", body: "Every result is a real lesson." },
];

// "Powerful Features": two alternating text/visual rows (frames 10-11).
export function Features({ lessons }: { lessons: number }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
      <SectionHeading
        title="Powerful Features"
        subtitle="Explore how Vertex turns hours of video into answers you can jump straight to — and keeps track of everything you learn."
      />

      {/* Row 1: text left, list + glowing ring right */}
      <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <FeatureText
            title="Search every lesson, to find the exact moment"
            body="Type a question the way you'd ask a teacher. Vertex searches lesson topics and video chapters together, then takes you to the second the answer starts."
            href="/search"
            cta="Try search"
            checklist={[
              "Ask questions in plain English.",
              "Chapter-first timestamps, transcript as backup.",
              "Only real lessons — nothing invented.",
            ]}
          />
        </Reveal>
        <Reveal delay={120}>
          <div className="card-glass relative min-h-[340px] overflow-hidden rounded-xl p-5">
            <ul className="relative z-10 flex max-w-[78%] flex-col gap-3">
              {SEARCH_ROWS.map(({ icon: Icon, title, body }, i) => (
                <li
                  key={title}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-white/[0.07] bg-surface-raised/80 p-3",
                    i > 0 && "opacity-80",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                      i === 0
                        ? "btn-glow bg-gradient-to-br from-primary-400 to-primary-600 text-white"
                        : "border border-white/10 bg-neutral-100 text-neutral-500",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-sans text-body font-semibold text-neutral-900">{title}</span>
                    <span className="font-sans text-small text-neutral-500">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
            {/* Glowing ring with a shield: results are grounded. */}
            <div className="absolute -right-16 -bottom-20 h-80 w-80">
              <div className="glow-ring absolute inset-0" />
              <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(closest-side,#1c0d06,#0a0a0c)]" />
              <ShieldCheck
                aria-hidden
                className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 fill-white text-neutral-50"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Row 2: tilted chart card left, text right */}
      <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <div className="card-glass relative min-h-[340px] overflow-hidden rounded-xl p-5">
            <div className="relative z-10 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-surface-raised/90 p-3">
              <span className="btn-glow flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-sans text-body font-semibold text-neutral-900">
                  Progress always ON!
                </span>
                <span className="font-sans text-small text-neutral-500">
                  Your resume point is saved as you watch.
                </span>
              </span>
            </div>
            {/* Faint dashboard rows under a perspective tilt */}
            <div className="absolute inset-x-6 bottom-6 h-44 [perspective:900px]">
              <div className="h-full origin-bottom rounded-lg border border-white/[0.06] bg-surface-raised/40 [transform:rotateX(38deg)]">
                <div className="flex gap-3 p-4 opacity-50">
                  {["Courses", "Search", "My Learning"].map((t) => (
                    <span key={t} className="font-sans text-small text-neutral-500">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating orange stat card */}
            <div className="absolute bottom-14 left-1/2 w-44 -translate-x-1/2 [perspective:700px]">
              <div className="rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 p-3 text-white shadow-[0_24px_60px_-10px_rgba(249,115,22,0.7)] [transform:rotateX(32deg)_rotateZ(-14deg)]">
                <span className="font-sans text-[10px] font-semibold tracking-wider uppercase opacity-80">
                  Lessons tracked
                </span>
                <div className="mt-1 flex items-end justify-between">
                  <span className="font-sans text-heading-3 font-bold">
                    {lessons.toLocaleString("en-US")}
                  </span>
                  <Sparkline variant={2} className="h-4 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120} className="order-1 lg:order-2">
          <FeatureText
            title="Pick up right where you left off"
            body="Vertex remembers the last second you watched in every lesson and marks the ones you finish — across the catalog, the course page and the lesson itself."
            href="/my-learning"
            cta="Open My Learning"
            checklist={[
              "Resume from your last second.",
              "Completion marks on every lesson.",
              "One hub for everything you've started.",
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}
