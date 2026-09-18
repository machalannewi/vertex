import { defineQuery } from 'next-sanity'

export const ALL_CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    icon
  }
`)

export const CATEGORY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    icon
  }
`)

export const ALL_INSTRUCTORS_QUERY = defineQuery(`
  *[_type == "instructor"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio
  }
`)

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio
  }
`)

export const ALL_COURSES_QUERY = defineQuery(`
  *[_type == "course"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    "instructor": instructor->{name, "slug": slug.current},
    "category": category->{title, "slug": slug.current, icon},
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons),
    "duration": math::sum(modules[].lessons[]->duration)
  }
`)

export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    learningOutcomes,
    "instructor": instructor->{_id, name, "slug": slug.current, photo, expertise, bio},
    "category": category->{_id, title, "slug": slug.current, icon},
    modules[] {
      title,
      summary,
      lessons[]-> {
        _id,
        title,
        "slug": slug.current,
        duration,
        freePreview,
        posterImage,
        studentCount
      }
    }
  }
`)

export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    posterImage,
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources
  }
`)

// Reverse lookup: a lesson doesn't store its parent course, so find the
// course that references it and carry enough of the module/lesson shape to
// compute "Module N" / "Lesson N.M" labels from array position.
export const COURSE_FOR_LESSON_QUERY = defineQuery(`
  *[_type == "course" && references($lessonId)][0] {
    _id,
    title,
    "slug": slug.current,
    modules[] {
      title,
      lessons[]-> {
        _id,
        "slug": slug.current
      }
    }
  }
`)
