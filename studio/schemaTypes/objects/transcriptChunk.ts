import {defineField, defineType} from 'sanity'

export const transcriptChunk = defineType({
  name: 'transcriptChunk',
  title: 'Transcript chunk',
  type: 'object',
  fields: [
    defineField({
      name: 'startSeconds',
      title: 'Start (seconds)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'text',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'text', subtitle: 'startSeconds'},
  },
})
