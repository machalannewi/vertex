import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/components/ui/course-card";
import { getAllCourses } from "@/sanity/lib/data";
import { getCourseCardProps } from "@/lib/course-card-props";

const barHeights = [72, 128, 96, 160, 56, 112, 144, 80, 168, 104, 64, 136];

export default async function Home() {
  const allCourses = await getAllCourses();
  const courses = allCourses.slice(0, 3);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-neutral-50">
      <Navbar showActions />

      <div className="mx-auto flex w-full max-w-360 flex-1 flex-col">
        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pt-20 text-center">
          <span className="rounded-full border border-primary-300 bg-primary-100 px-4 py-1 font-sans text-small font-medium tracking-wide text-primary-500 uppercase">
            Intelligent Learning
          </span>

          <h1 className="mt-6 font-display text-heading-1 font-bold text-neutral-900 sm:text-display-2 lg:text-display-1">
            Search your learning
            <br />
            in plain English.
          </h1>

          <p className="mt-6 max-w-xl font-sans text-body-lg text-neutral-500">
            Vertex understands what you want to learn and finds the exact
            lessons across all your courses.
          </p>

          <Button variant="primary" className="mt-8">
            Explore Courses
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="mt-10 w-full max-w-2xl">
            <Input
              icon
              shortcut="⌘K"
              placeholder="Ask anything about your learning..."
              className="h-14 rounded-lg shadow-md"
            />
          </div>
        </main>

        <section className="relative z-10 mx-auto mt-20 w-full max-w-5xl border-t border-neutral-200 px-6 pt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-heading-1 font-semibold text-neutral-900">
              All Courses
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1 font-sans text-body font-medium text-primary-500 hover:text-primary-500/80"
            >
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course._id} href={`/courses/${course.slug}`}>
                <CourseCard {...getCourseCardProps(course)} />
              </Link>
            ))}
          </div>
        </section>

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-5xl items-center gap-4 px-6">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="inline-flex items-center gap-2 font-sans text-body text-neutral-500">
            <Star className="h-4 w-4 text-primary-400" />
            New courses and lessons added every week.
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <div
          aria-hidden
          className="pointer-events-none mt-16 flex h-40 items-end justify-center gap-3 overflow-hidden px-6 pb-0 sm:gap-5"
        >
          {barHeights.map((height, i) => (
            <div
              key={i}
              className="w-8 rounded-t-sm bg-gradient-to-b from-primary-300 to-transparent sm:w-12"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
