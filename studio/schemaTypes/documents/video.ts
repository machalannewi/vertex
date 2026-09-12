import {PlayIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: PlayIcon,
  description:
    'Internal lookup for search. Built by the offline ingestion pipeline, keyed by video URL — never shown to learners directly. Do not author these by hand.',
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: "Matches the lesson's videoUrl exactly. This is how a video document is joined to its lesson.",
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      description: 'The table of contents, matched first when resolving a search result to a timestamp.',
      type: 'array',
      of: [defineArrayMember({type: 'chapter'})],
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript chunks',
      description: 'The transcript split into short timestamped pieces. Fallback match when no chapter fits.',
      type: 'array',
      of: [defineArrayMember({type: 'transcriptChunk'})],
    }),
  ],
  preview: {
    select: {title: 'url'},
  },
})
