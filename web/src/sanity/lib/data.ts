import { logContentRequest } from '@/lib/posthog-logger'
import { client } from './client'
import { getLessonLabel } from './numbering'
import {
  ALL_CATEGORIES_QUERY,
  ALL_COURSES_QUERY,
  ALL_INSTRUCTORS_QUERY,
  CATEGORY_BY_SLUG_QUERY,
  COURSE_BY_SLUG_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  LESSON_PAGE_QUERY,
} from './queries'

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
