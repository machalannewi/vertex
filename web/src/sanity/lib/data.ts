import { logContentRequest } from '@/lib/posthog-logger'
import { client } from './client'
import { getLessonLabel, getModuleLabel } from './numbering'
import {
  ALL_CATEGORIES_QUERY,
  ALL_COURSES_QUERY,
  ALL_INSTRUCTORS_QUERY,
  CATEGORY_BY_SLUG_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSE_FOR_LESSON_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  LESSON_BY_SLUG_QUERY,
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

export async function getLessonBySlug(slug: string) {
  return client.fetch(LESSON_BY_SLUG_QUERY, { slug })
}

/**
 * A lesson doesn't store its parent course, so this resolves it by finding
 * the course that references the lesson, then locating the lesson's position
 * within that course's modules to derive its "Module N" / "Lesson N.M" labels.
 */
export async function getCourseAndPositionForLesson(lessonId: string) {
  const course = await client.fetch(COURSE_FOR_LESSON_QUERY, { lessonId })
  if (!course?.modules) return null

  for (const [moduleIndex, courseModule] of course.modules.entries()) {
    const lessonIndex = (courseModule.lessons ?? []).findIndex(
      (lesson) => lesson?._id === lessonId,
    )
    if (lessonIndex !== -1) {
      return {
        course: { _id: course._id, title: course.title, slug: course.slug },
        moduleTitle: courseModule.title,
        moduleLabel: getModuleLabel(moduleIndex),
        lessonLabel: getLessonLabel(moduleIndex, lessonIndex),
      }
    }
  }

  return null
}
