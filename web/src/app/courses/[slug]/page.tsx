import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookOpen, Clock, Signal, Users } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/ui/navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LearningOutcomeCard } from "@/components/ui/learning-outcome-card";
import { ModuleAccordion } from "@/components/ui/module-accordion";
import { getCourseBySlug } from "@/sanity/lib/data";
import { urlFor } from "@/sanity/lib/image";
import { formatDuration, formatLevel, formatStudentCount } from "@/lib/format";

export default async function CoursePage({
  params,
}: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const { userId } = await auth();

  const modules = course.modules ?? [];
  const lessons = modules.flatMap((courseModule) => courseModule.lessons ?? []);
  const totalDuration = lessons.reduce(
    (sum, lesson) => sum + (lesson?.duration ?? 0),
    0,
  );
  const firstLessonSlug = modules[0]?.lessons?.[0]?.slug;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar showActions />

      <div className="mx-auto w-full max-w-360 flex-1 px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "All Courses", href: "/courses" },
            { label: course.title ?? "" },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <div className="aspect-square w-full overflow-hidden rounded-md bg-neutral-900 lg:h-70 lg:w-70">
            {course.coverImage && (
              <Image
                src={urlFor(course.coverImage).width(560).height(560).url()}
                alt={course.coverImage.alt ?? course.title ?? ""}
                width={560}
                height={560}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col justify-center gap-4">
            {course.popular && (
              <Badge variant="popular" className="w-fit">
                Popular
              </Badge>
            )}

            <h1 className="font-display text-display-2 font-bold text-neutral-900">
              {course.title}
            </h1>

            <p className="max-w-2xl font-sans text-body-lg text-neutral-500">
              {course.summary}
            </p>

            <div className="flex flex-wrap items-center gap-6 font-sans text-body text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Signal className="h-4 w-4" />
                {formatLevel(course.level ?? "")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDuration(totalDuration)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {modules.length} modules
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {formatStudentCount(course.studentCount ?? 0)} students
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              {firstLessonSlug ? (
                <Link
                  href={`/lessons/${firstLessonSlug}`}
                  className={buttonVariants({ variant: "primary" })}
                >
                  Start Course
                </Link>
              ) : (
                <Button variant="primary" disabled>
                  Start Course
                </Button>
              )}
              <Button variant="tertiary" type="button">
                <Bookmark className="h-4 w-4" />
                Bookmark
              </Button>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-md border border-neutral-200 bg-white p-6">
          <h2 className="font-display text-heading-1 font-semibold text-neutral-900">
            What you&apos;ll learn
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(course.learningOutcomes ?? []).map((outcome) => (
              <LearningOutcomeCard
                key={outcome._key}
                icon={outcome.icon ?? ""}
                title={outcome.title ?? ""}
                description={outcome.description ?? ""}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-md border border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-display text-heading-1 font-semibold text-neutral-900">
              Course Content
            </h2>
            <span className="font-sans text-body text-neutral-500">
              {modules.length} modules &middot; {formatDuration(totalDuration)}
            </span>
          </div>

          <ModuleAccordion
            modules={modules.map((courseModule) => ({
              title: courseModule.title ?? "",
              summary: courseModule.summary,
              lessons: (courseModule.lessons ?? []).flatMap((lesson) =>
                lesson
                  ? [
                      {
                        _id: lesson._id,
                        title: lesson.title ?? "",
                        slug: lesson.slug ?? "",
                        duration: lesson.duration ?? 0,
                      },
                    ]
                  : [],
              ),
            }))}
          />
        </section>

        {userId && (
          <div className="sticky bottom-0 mt-8 flex flex-col gap-4 rounded-md border border-neutral-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-1">
              <span className="font-sans text-body font-medium text-neutral-900">
                Your Progress
              </span>
              <ProgressBar value={0} className="max-w-sm" />
            </div>
            {firstLessonSlug && (
              <Link
                href={`/lessons/${firstLessonSlug}`}
                className={buttonVariants({ variant: "primary" })}
              >
                Continue Learning
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
