import { logContentRequest } from '@/lib/posthog-logger'
import { client } from './client'
import { getLessonLabel } from './numbering'
import {
  ALL_CATEGORIES_QUERY,
  ALL_COURSES_QUERY,
  ALL_INSTRUCTORS_QUERY,
  CATEGORY_BY_SLUG_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSES_BY_INSTRUCTOR_QUERY,
  FEATURED_LESSONS_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  LESSON_PAGE_QUERY,
  MY_LEARNING_COURSES_QUERY,
} from './queries'

/**
 * Everything the landing page shows, all from real content: catalog stats,
 * courses ranked by popularity, categories, and a featured course's outline.
 */
export async function getLandingData() {
  const [courses, categories, instructors, topLessons] = await Promise.all([
    getAllCourses(),
    client.fetch(ALL_CATEGORIES_QUERY),
    client.fetch(ALL_INSTRUCTORS_QUERY),
    client.fetch(FEATURED_LESSONS_QUERY),
  ])

  // One lesson per course, so the cards show the catalog's range.
  const seenCourses = new Set<string>()
  const featuredLessons = topLessons
    .filter((lesson) => {
      const key = lesson.course?.slug ?? lesson._id
      if (seenCourses.has(key)) return false
      seenCourses.add(key)
      return true
    })
    .slice(0, 3)

  const byPopularity = [...courses].sort(
    (a, b) =>
      Number(Boolean(b.popular)) - Number(Boolean(a.popular)) ||
      (b.studentCount ?? 0) - (a.studentCount ?? 0),
  )

  const featured = byPopularity[0]
  const featuredCourse = featured?.slug
    ? await client.fetch(COURSE_BY_SLUG_QUERY, { slug: featured.slug })
    : null

  const totalSeconds = courses.reduce((sum, c) => sum + (c.duration ?? 0), 0)
  const stats = {
    courses: courses.length,
    lessons: courses.reduce((sum, c) => sum + (c.lessonIds?.length ?? 0), 0),
    instructors: instructors.length,
    hours: Math.max(1, Math.round(totalSeconds / 3600)),
    students: courses.reduce((sum, c) => sum + (c.studentCount ?? 0), 0),
  }

  return { courses, byPopularity, categories, featuredLessons, featuredCourse, stats }
}

export type LandingData = Awaited<ReturnType<typeof getLandingData>>

export async function getAllCategories() {
  return client.fetch(ALL_CATEGORIES_QUERY)
}

export async function getCategoryBySlug(slug: string) {
  return client.fetch(CATEGORY_BY_SLUG_QUERY, { slug })
}

export async function getAllInstructors() {
  return client.fetch(ALL_INSTRUCTORS_QUERY)
}

export async function getInstructorBySlug(slug: string) {
  return client.fetch(INSTRUCTOR_BY_SLUG_QUERY, { slug })
}

/** An instructor plus the courses they teach (reverse reference). */
export async function getInstructorPage(slug: string) {
  const startedAt = Date.now()

  let instructor
  try {
    instructor = await client.fetch(INSTRUCTOR_BY_SLUG_QUERY, { slug })
    await logContentRequest({
      operation: 'get_instructor',
      status: 'success',
      durationMs: Date.now() - startedAt,
      resultCount: instructor ? 1 : 0,
    })
  } catch (error) {
    await logContentRequest({
      operation: 'get_instructor',
      status: 'error',
      durationMs: Date.now() - startedAt,
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    throw error
  }

  if (!instructor?._id) return null

  const courses = await client.fetch(COURSES_BY_INSTRUCTOR_QUERY, {
    instructorId: instructor._id,
  })

  return { instructor, courses }
}

/** Every course with its lesson id/slug pairs, for the My Learning page. */
export async function getMyLearningCourses() {
  const startedAt = Date.now()

  try {
    const courses = await client.fetch(MY_LEARNING_COURSES_QUERY)
    await logContentRequest({
      operation: 'list_courses',
      status: 'success',
      durationMs: Date.now() - startedAt,
      resultCount: courses.length,
    })
    return courses
  } catch (error) {
    await logContentRequest({
      operation: 'list_courses',
      status: 'error',
      durationMs: Date.now() - startedAt,
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    throw error
  }
}

export async function getAllCourses() {
  const startedAt = Date.now()

  try {
    const courses = await client.fetch(ALL_COURSES_QUERY)
    await logContentRequest({
      operation: 'list_courses',
      status: 'success',
      durationMs: Date.now() - startedAt,
      resultCount: courses.length,
    })
    return courses
  } catch (error) {
    await logContentRequest({
      operation: 'list_courses',
      status: 'error',
      durationMs: Date.now() - startedAt,
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    throw error
  }
}

export async function getCourseBySlug(slug: string) {
  const startedAt = Date.now()

  try {
    const course = await client.fetch(COURSE_BY_SLUG_QUERY, { slug })
    await logContentRequest({
      operation: 'get_course',
      status: 'success',
      durationMs: Date.now() - startedAt,
      resultCount: course ? 1 : 0,
    })
    return course
  } catch (error) {
    await logContentRequest({
      operation: 'get_course',
      status: 'error',
      durationMs: Date.now() - startedAt,
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    throw error
  }
}

export interface OutlineLesson {
  _id: string
  title: string
  slug: string
  duration: number
}

export interface OutlineModule {
  title: string
  lessons: OutlineLesson[]
}

/**
 * Fetches a lesson with its parent course (via reverse reference) and derives
 * everything the lesson page needs from array order: the module/lesson
 * labels and the previous/next lessons across the whole course.
 */
export async function getLessonPage(slug: string) {
  const startedAt = Date.now()

  let lesson
  try {
    lesson = await client.fetch(LESSON_PAGE_QUERY, { slug })
    await logContentRequest({
      operation: 'get_lesson',
      status: 'success',
      durationMs: Date.now() - startedAt,
      resultCount: lesson ? 1 : 0,
    })
  } catch (error) {
    await logContentRequest({
      operation: 'get_lesson',
      status: 'error',
      durationMs: Date.now() - startedAt,
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    throw error
  }

  if (!lesson?.course) return null

  const modules: OutlineModule[] = (lesson.course.modules ?? []).map(
    (courseModule) => ({
      title: courseModule.title ?? '',
      lessons: (courseModule.lessons ?? []).flatMap((outlineLesson) =>
        outlineLesson
          ? [
              {
                _id: outlineLesson._id,
                title: outlineLesson.title ?? '',
                slug: outlineLesson.slug ?? '',
                duration: outlineLesson.duration ?? 0,
              },
            ]
          : [],
      ),
    }),
  )

  const flat = modules.flatMap((courseModule) => courseModule.lessons)
  const flatIndex = flat.findIndex((item) => item._id === lesson._id)
  if (flatIndex === -1) return null

  const moduleIndex = modules.findIndex((courseModule) =>
    courseModule.lessons.some((item) => item._id === lesson._id),
  )
  const lessonIndex = modules[moduleIndex].lessons.findIndex(
    (item) => item._id === lesson._id,
  )

  const { course, ...lessonFields } = lesson

  return {
    lesson: lessonFields,
    course: {
      _id: course._id,
      title: course.title ?? '',
      slug: course.slug ?? '',
      coverImage: course.coverImage,
      level: course.level,
      instructor: course.instructor ?? null,
    },
    modules,
    moduleIndex,
    lessonIndex,
    moduleTitle: modules[moduleIndex].title,
    lessonLabel: getLessonLabel(moduleIndex, lessonIndex),
    previousLesson: flat[flatIndex - 1] ?? null,
    nextLesson: flat[flatIndex + 1] ?? null,
  }
}
