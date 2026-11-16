import type { LandingData } from "@/sanity/lib/data";
import { CtaForm } from "./cta-form";
import { DashboardMockup } from "./dashboard-mockup";
import { Reveal } from "./reveal";

// "Transform your work" band with the dashboard peeking in on the right and an
// orange horizon glowing along the bottom edge (frame 15).
export function CtaBand({
  stats,
  courses,
}: {
  stats: LandingData["stats"];
  courses: LandingData["byPopularity"];
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
      <Reveal>
        <div className="card-glass glow-bottom relative grid overflow-hidden rounded-2xl lg:grid-cols-[1fr_1.15fr]">
          <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12">
            <h2 className="font-display text-[30px] leading-[38px] font-semibold tracking-tight text-neutral-900 sm:text-[34px] sm:leading-[42px]">
              Transform the way you learn with Vertex
            </h2>
            <p className="mt-4 max-w-sm font-sans text-body-lg text-neutral-500">
              Join the learners who search their courses in plain English and
              jump straight to the answer.
            </p>
            <CtaForm />
          </div>
          <div className="relative hidden min-h-[360px] lg:block">
            <div className="absolute top-10 left-0 w-[860px] origin-top-left scale-[0.72]">
              <DashboardMockup stats={stats} courses={courses} />
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 -bottom-10 h-20 rounded-full bg-primary-500/40 blur-3xl"
          />
        </div>
      </Reveal>
    </section>
  );
}
