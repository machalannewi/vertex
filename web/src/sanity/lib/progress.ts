import 'server-only'

import { progressClient } from './progress-client'
import { USER_PROGRESS_QUERY } from './queries'

// Sanity document ids and array `_key`s allow this charset. Clerk user ids and
// Sanity lesson `_id`s already conform; we validate/sanitize defensively before
// building ids or interpolating a lesson id into a mutation path.
const SAFE_ID = /^[a-zA-Z0-9._-]+$/

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-')
}

/** Deterministic per-user document id (a per-user singleton). */
export function progressDocId(userId: string): string {
  return `progress.${sanitizeId(userId)}`
}

export interface UserProgress {
  /** Lesson ids the learner has completed. */
  completed: Set<string>
  /** Lesson id -> saved resume position in seconds. */
  positions: Map<string, number>
  /** Lesson id -> last-updated epoch ms, for resume ordering. */
  lastActiveAt: Map<string, number>
}

const EMPTY_PROGRESS: UserProgress = {
  completed: new Set(),
  positions: new Map(),
  lastActiveAt: new Map(),
}

/**
 * Reads the current user's progress, scoped to their own document. Uses the
 * no-CDN write client so a just-written position/completion reads back fresh.
 * Returns empty progress when the user has none yet.
 */
export async function getUserProgress(
  userId: string | null | undefined,
): Promise<UserProgress> {
  if (!userId) return EMPTY_PROGRESS

  const doc = await progressClient.fetch(USER_PROGRESS_QUERY, {
    id: progressDocId(userId),
  })
  if (!doc?.lessons) return EMPTY_PROGRESS

  const completed = new Set<string>()
  const positions = new Map<string, number>()
  const lastActiveAt = new Map<string, number>()

  for (const entry of doc.lessons) {
    if (!entry?.lessonId) continue
    if (entry.completed) completed.add(entry.lessonId)
    if (typeof entry.positionSeconds === 'number') {
      positions.set(entry.lessonId, entry.positionSeconds)
    }
    if (entry.updatedAt) {
      const ms = Date.parse(entry.updatedAt)
      if (!Number.isNaN(ms)) lastActiveAt.set(entry.lessonId, ms)
    }
  }

  return { completed, positions, lastActiveAt }
}

export interface CourseProgress {
  completedCount: number
  total: number
  percent: number
  /** Where "Continue" should go: last in-progress lesson, else first incomplete. */
  resumeLessonId: string | null
}

/** Derives per-course progress from a user's progress and the course's lesson ids. */
export function courseProgress(
  progress: UserProgress,
  lessonIds: string[],
): CourseProgress {
  const total = lessonIds.length
  if (total === 0) {
    return { completedCount: 0, total: 0, percent: 0, resumeLessonId: null }
  }

  const completedCount = lessonIds.filter((id) =>
    progress.completed.has(id),
  ).length
  const percent = Math.round((completedCount / total) * 100)

  // Prefer the most recently touched lesson that isn't finished.
  let resumeLessonId: string | null = null
  let bestAt = -1
  for (const id of lessonIds) {
    if (progress.completed.has(id)) continue
    const at = progress.lastActiveAt.get(id)
    if (at !== undefined && at > bestAt) {
      bestAt = at
      resumeLessonId = id
    }
  }
  if (!resumeLessonId) {
    resumeLessonId =
      lessonIds.find((id) => !progress.completed.has(id)) ?? lessonIds[0]
  }

  return { completedCount, total, percent, resumeLessonId }
}

// --- Writes (server route only) ---------------------------------------------

interface UpsertOptions {
  /** Fields to set on an existing entry (and merge into a new one). */
  set: Record<string, unknown>
  /** Entry fields to clear on an existing entry. */
  unset?: string[]
}

/**
 * Upserts one lesson entry inside the user's progress document. The entry's
 * `_key` is the lesson id, so it is addressable for an in-place `set`; when it
 * doesn't exist yet we append it. `createIfNotExists` makes the first write for
 * a user race-safe with the deterministic document id.
 */
async function upsertEntry(
  userId: string,
  lessonId: string,
  options: UpsertOptions,
): Promise<void> {
  if (!SAFE_ID.test(lessonId)) {
    throw new Error('Invalid lesson id')
  }

  const _id = progressDocId(userId)
  const now = new Date().toISOString()

  await progressClient.createIfNotExists({
    _id,
    _type: 'progress',
    userId,
    lessons: [],
  })

  const count = await progressClient.fetch<number>(
    `count(*[_id == $id][0].lessons[_key == "${lessonId}"])`,
    { id: _id },
  )

  if ((count ?? 0) > 0) {
    const prefix = `lessons[_key=="${lessonId}"]`
    const set: Record<string, unknown> = { [`${prefix}.updatedAt`]: now }
    for (const [key, value] of Object.entries(options.set)) {
      set[`${prefix}.${key}`] = value
    }
    let patch = progressClient.patch(_id).set(set)
    if (options.unset?.length) {
      patch = patch.unset(options.unset.map((key) => `${prefix}.${key}`))
    }
    await patch.commit()
    return
  }

  await progressClient
    .patch(_id)
    .setIfMissing({ lessons: [] })
    .append('lessons', [
      { _key: lessonId, lessonId, updatedAt: now, ...options.set },
    ])
    .commit()
}

export async function markComplete(
  userId: string,
  lessonId: string,
): Promise<void> {
  await upsertEntry(userId, lessonId, {
    set: { completed: true, completedAt: new Date().toISOString() },
  })
}

export async function markIncomplete(
  userId: string,
  lessonId: string,
): Promise<void> {
  await upsertEntry(userId, lessonId, {
    set: { completed: false },
    unset: ['completedAt'],
  })
}

export async function savePosition(
  userId: string,
  lessonId: string,
  positionSeconds: number,
): Promise<void> {
  const safe = Math.max(0, Math.floor(positionSeconds))
  await upsertEntry(userId, lessonId, { set: { positionSeconds: safe } })
}
