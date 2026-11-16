import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Reveal } from "./reveal";

// Hero: "What's New" pill, headline, two CTAs and the glowing planet arc that
// ignites on load (reference frames 01-04).
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(55%_45%_at_50%_0%,rgba(249,115,22,0.07),transparent)]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-16 text-center sm:pt-24">
        <Reveal>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface/80 p-1 pr-3 font-sans text-small text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <span className="rounded-full bg-primary-500 px-3 py-1 font-semibold text-white">
              What&apos;s New
            </span>
            AI search v1.0
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-7 font-display text-[40px] leading-[48px] font-medium tracking-tight text-neutral-900 sm:text-[56px] sm:leading-[64px] lg:text-hero">
            Intelligent Learning
            <br />
            Powered by AI.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-md font-sans text-body-lg text-neutral-500">
            Ask Vertex in plain English and jump to the exact second a topic is
            taught — across every course.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-white/10 bg-surface-raised px-4 font-sans text-body font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              Browse Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="btn-glow inline-flex h-10 items-center gap-1.5 rounded-md bg-primary-500 px-4 font-sans text-body font-semibold text-white transition-colors hover:bg-primary-600"
            >
              Try AI Search
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* The planet arc. Only its upper cap is visible; the dashboard rises over it. */}
      <div aria-hidden className="relative mt-14 h-[200px] sm:mt-16 sm:h-[280px]">
        <div className="hero-arc top-0 w-[1500px] sm:w-[1800px]">
          <div className="hero-arc__halo" />
          <div className="hero-arc__body" />
          <div className="hero-arc__rim" />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto h-40 max-w-3xl bg-[radial-gradient(50%_70%_at_50%_100%,rgba(249,115,22,0.35),transparent)] blur-2xl" />
      </div>
    </section>
  );
}
