import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";
import type { LandingData } from "@/sanity/lib/data";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

// The reference's "Insights & Inspiration" image cards (frames 13-14), filled
// with Vertex's most-watched lessons.
export function CatalogCards({
  lessons,
}: {
  lessons: LandingData["featuredLessons"];
}) {
  if (lessons.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
      <SectionHeading
        title="Fresh from the catalog"
        subtitle="The lessons learners are watching most right now — open one and start at the first second."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson, i) => (
          <Reveal key={lesson._id} delay={i * 100}>
            <Link
              href={`/lessons/${lesson.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl border border-white/[0.08] bg-surface"
            >
              {lesson.thumbnail?.asset && (
                <>
                  {/* Blurred fill keeps the reference's full-bleed card... */}
                  <Image
                    src={urlFor(lesson.thumbnail).width(320).url()}
                    alt=""
                    aria-hidden
                    fill
                    sizes="320px"
                    className="scale-125 object-cover opacity-60 blur-2xl"
                  />
                  {/* ...while the 16:9 video thumbnail stays sharp and uncropped. */}
                  <div className="absolute inset-x-0 top-[42%] aspect-video -translate-y-1/2 overflow-hidden shadow-2xl">
                    <Image
                      src={urlFor(lesson.thumbnail).width(800).url()}
                      alt={lesson.thumbnail.alt ?? lesson.title ?? ""}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
              <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-black/50 text-white backdrop-blur-sm transition-colors group-hover:bg-primary-500">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <div className="absolute inset-x-3 bottom-3 rounded-lg border border-white/10 bg-neutral-50/85 p-3 backdrop-blur-md transition-all duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
                <h3 className="line-clamp-1 font-sans text-body-lg font-semibold text-neutral-900">
                  {lesson.title}
                </h3>
                <p className="mt-1 line-clamp-1 font-sans text-small text-neutral-500">
                  {lesson.course?.title}
                  {lesson.duration ? ` · ${formatDuration(lesson.duration)}` : ""}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
