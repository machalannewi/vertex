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
    "lessonIds": modules[].lessons[]._ref,
    "firstLessonSlug": modules[0].lessons[0]->slug.current,
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
        thumbnail,
        studentCount
      }
    }
  }
`)

// A lesson doesn't store its parent course, so the course (and its full
// module/lesson outline for the sidebar and prev/next) comes from a reverse
// reference.
export const LESSON_PAGE_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources,
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      coverImage,
      level,
      modules[] {
        title,
        lessons[]-> {
          _id,
          title,
          "slug": slug.current,
          duration
        }
      }
    }
  }
`)

// Learner progress is app state (AGENTS.md §7): a per-user document whose id is
// `progress.<sanitizedUserId>`, read server-side scoped to the current user.
export const USER_PROGRESS_QUERY = defineQuery(`
  *[_type == "progress" && _id == $id][0] {
    userId,
    lessons[] {
      lessonId,
      completed,
      completedAt,
      positionSeconds,
      updatedAt
    }
  }
`)

// Minimal lookup so the progress route can clamp a resume position to the
// lesson's real duration and reject an unknown lesson id.
export const LESSON_DURATION_QUERY = defineQuery(`
  *[_type == "lesson" && _id == $id][0] { _id, duration }
`)

// Grounds and hydrates search results. The agent only picks lesson ids and
// seconds; everything a result card shows comes from here. The video's
// chapter/chunk starts are fetched as numbers only (never transcript text)
// so a "Watch from" second can be checked against stored data.
export const SEARCH_HITS_QUERY = defineQuery(`
  *[_type == "lesson" && _id in $ids] {
    _id,
    title,
    "slug": slug.current,
    duration,
    thumbnail,
    keyPoints,
    "intro": pt::text(notes[_type == "block" && (style == "normal" || !defined(style)) && !defined(listItem)][0...1]),
    "course": *[_type == "course" && references(^._id)][0] {
      title,
      "slug": slug.current,
      "icon": category->icon,
      "modules": modules[] {
        title,
        "lessonIds": lessons[]._ref
      }
    },
    "video": *[_type == "video" && url == ^.videoUrl][0] {
      "chapterStarts": chapters[].startSeconds,
      "chunkStarts": chunks[].startSeconds
    }
  }
`)
