import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/ui/navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CourseCard } from "@/components/ui/course-card";
import { getMyLearningCourses } from "@/sanity/lib/data";
import { courseProgress, getUserProgress } from "@/sanity/lib/progress";
import { getCourseCardProps } from "@/lib/course-card-props";

interface LearningCard {
  id: string;
  cardProps: ReturnType<typeof getCourseCardProps>;
  percent: number;
  href: string;
}

export default async function MyLearningPage() {
  // The route is protected in middleware, so a user is always present here.
  const { userId } = await auth();
  const [courses, progress] = await Promise.all([
    getMyLearningCourses(),
    getUserProgress(userId),
  ]);

  const inProgress: LearningCard[] = [];
  const completed: LearningCard[] = [];

  for (const course of courses) {
    const lessons = course.lessons ?? [];
    const lessonIds = lessons.flatMap((lesson) =>
      lesson?._id ? [lesson._id] : [],
    );
    if (lessonIds.length === 0) continue;

    const started = lessonIds.some(
      (id) =>
        progress.completed.has(id) ||
        (progress.positions.get(id) ?? 0) > 0 ||
        progress.lastActiveAt.has(id),
    );
    if (!started) continue;

    const { percent, resumeLessonId } = courseProgress(progress, lessonIds);
    const cardProps = getCourseCardProps(course);

    if (percent >= 100) {
      completed.push({
        id: course._id,
        cardProps,
        percent,
        href: `/courses/${course.slug}`,
      });
    } else {
      const resumeSlug =
        lessons.find((lesson) => lesson?._id === resumeLessonId)?.slug ??
        lessons[0]?.slug ??
        null;
      inProgress.push({
        id: course._id,
        cardProps,
        percent,
        href: resumeSlug
          ? `/lessons/${resumeSlug}`
          : `/courses/${course.slug}`,
      });
    }
  }

  const hasAny = inProgress.length > 0 || completed.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar showActions />

      <div className="mx-auto w-full max-w-360 flex-1 px-6 py-8">
        <Breadcrumbs items={[{ label: "My Learning" }]} />

        <h1 className="mt-4 font-display text-display-2 font-bold text-neutral-900">
          My Learning
        </h1>

        {!hasAny ? (
          <div className="mt-8 rounded-md border border-neutral-200 bg-white p-10 text-center">
            <p className="font-sans text-body-lg text-neutral-500">
              You haven&apos;t started any courses yet.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex font-sans text-body font-medium text-primary-500 hover:text-primary-500/80"
            >
              Browse the catalog
            </Link>
          </div>
        ) : (
          <>
            {inProgress.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-heading-1 font-semibold text-neutral-900">
                  Continue learning
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgress.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <CourseCard
                        {...item.cardProps}
                        progressPercent={item.percent}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-heading-1 font-semibold text-neutral-900">
                  Completed
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completed.map((item) => (
                    <Link key={item.id} href={item.href}>
                      <CourseCard
                        {...item.cardProps}
                        progressPercent={item.percent}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
