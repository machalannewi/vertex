import {UserIcon} from '@sanity/icons/User'
import {defineArrayMember, defineField, defineType} from 'sanity'

// Per-learner progress, keyed by the Clerk user id (AGENTS.md §7, §8).
//
// This is app state, not authored content: it is written only by the server
// (POST /api/progress) with a write token, and hidden from the Studio desk
// (see studio/structure.ts). The schema exists so TypeGen knows the shape and
// so the data is inspectable. `readOnly` guards against accidental edits in
// Studio; it does not affect token-authenticated API writes.
//
// The document `_id` is deterministic: `progress.<sanitizedUserId>`. A per-user
// record is effectively a per-user singleton, which is the one case where an
// explicit `_id` is appropriate (sanity-best-practices). It gives atomic
// upserts with no duplicate-document race. The Clerk id is also stored in the
// `userId` field as the source of identity.
export const progress = defineType({
  name: 'progress',
  title: 'Learner progress',
  type: 'document',
  icon: UserIcon,
  readOnly: true,
  fields: [
    defineField({
      name: 'userId',
      title: 'Clerk user ID',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [defineArrayMember({type: 'progressEntry'})],
    }),
  ],
  preview: {
    select: {userId: 'userId', lessons: 'lessons'},
    prepare({userId, lessons}) {
      const count = Array.isArray(lessons) ? lessons.length : 0
      return {
        title: userId ?? 'Learner',
        subtitle: `${count} lesson${count === 1 ? '' : 's'}`,
      }
    },
  },
})
