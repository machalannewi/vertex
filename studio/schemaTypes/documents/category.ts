import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const ICON_OPTIONS = [
  'BarChart2',
  'Code',
  'Database',
  'Layers',
  'Palette',
  'Cpu',
  'LineChart',
  'Globe',
  'Smartphone',
  'ShieldCheck',
].map((value) => ({title: value, value}))

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'lucide-react icon name used to represent this category on course cards.',
      options: {list: ICON_OPTIONS, layout: 'dropdown'},
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'icon'},
  },
})
