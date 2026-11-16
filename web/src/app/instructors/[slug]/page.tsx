import { notFound } from "next/navigation";
import Image from "next/image";
import { toPlainText, type PortableTextBlock } from "next-sanity";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/ui/navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CourseCard } from "@/components/ui/course-card";
import { TrackedCourseLink } from "@/components/analytics/tracked-course-link";
import { getInstructorPage } from "@/sanity/lib/data";
import { courseProgress, getUserProgress } from "@/sanity/lib/progress";
import { getCourseCardProps } from "@/lib/course-card-props";
import { urlFor } from "@/sanity/lib/image";

export default async function InstructorPage({
  params,
}: PageProps<"/instructors/[slug]">) {
  const { slug } = await params;
  const data = await getInstructorPage(slug);

  if (!data) notFound();

  const { instructor, courses } = data;
  const { userId } = await auth();
  const progress = await getUserProgress(userId);

  const expertise = instructor.expertise ?? [];

  // The schema declares `bio` as plain text, but seeded data stores it as
  // Portable Text blocks. Render either shape as plain text.
  const rawBio: unknown = instructor.bio;
  const bioText =
    typeof rawBio === "string"
      ? rawBio
      : Array.isArray(rawBio)
        ? toPlainText(rawBio as PortableTextBlock[])
        : null;

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar showActions />

      <div className="mx-auto w-full max-w-360 flex-1 px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "All Courses", href: "/courses" },
            { label: instructor.name ?? "" },
          ]}
        />

        <section className="card-glass mt-6 flex flex-col gap-6 rounded-xl p-6 sm:flex-row sm:items-start">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-neutral-200">
            {instructor.photo && (
              <Image
                src={urlFor(instructor.photo).width(224).height(224).url()}
                alt={instructor.photo.alt ?? instructor.name ?? ""}
                width={224}
                height={224}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="font-display text-display-2 font-bold text-neutral-900">
              {instructor.name}
            </h1>

            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary-500/25 bg-primary-500/10 px-3 py-1 font-sans text-small font-medium text-primary-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {bioText && (
              <p className="max-w-2xl font-sans text-body-lg leading-7 text-neutral-500">
                {bioText}
              </p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-heading-1 font-semibold text-neutral-900">
            Courses by {instructor.name}
          </h2>

          {courses.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const lessonIds = (course.lessonIds ?? []).filter(
                  (id): id is string => Boolean(id),
                );
                const { percent } = courseProgress(progress, lessonIds);
                return (
                  <TrackedCourseLink
                    key={course._id}
                    courseSlug={course.slug}
                    source="instructor_page"
                  >
                    <CourseCard
                      {...getCourseCardProps(course)}
                      progressPercent={userId ? percent : undefined}
                    />
                  </TrackedCourseLink>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 font-sans text-body text-neutral-500">
              No courses yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
