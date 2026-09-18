import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CourseCard } from "@/components/ui/course-card";
import { getAllCourses } from "@/sanity/lib/data";
import { getCourseCardProps } from "@/lib/course-card-props";

export default async function CoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar showActions />

      <div className="mx-auto w-full max-w-360 flex-1 px-6 py-8">
        <Breadcrumbs items={[{ label: "All Courses" }]} />

        <h1 className="mt-4 font-display text-display-2 font-bold text-neutral-900">
          All Courses
        </h1>
        <p className="mt-2 font-sans text-body text-neutral-500">
          {courses.length} course{courses.length === 1 ? "" : "s"}
        </p>

        {courses.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course._id} href={`/courses/${course.slug}`}>
                <CourseCard {...getCourseCardProps(course)} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-8 font-sans text-body text-neutral-500">
            No courses yet.
          </p>
        )}
      </div>
    </div>
  );
}
