import {defineField, defineType} from 'sanity'

// One learner's state for a single lesson. Embedded in the `progress` document.
// `lessonId` is the content lesson's `_id` as a plain string (not a reference):
// learner progress is app state kept apart from the content graph (AGENTS.md §7).
export const progressEntry = defineType({
  name: 'progressEntry',
  title: 'Lesson progress',
  type: 'object',
  fields: [
    defineField({
      name: 'lessonId',
      title: 'Lesson ID',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'completed',
      title: 'Completed',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed at',
      type: 'datetime',
    }),
    defineField({
      name: 'positionSeconds',
      title: 'Resume position (seconds)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {title: 'lessonId', subtitle: 'positionSeconds'},
  },
})
