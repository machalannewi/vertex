import {type SchemaTypeDefinition} from 'sanity'

import {category} from './documents/category'
import {course} from './documents/course'
import {instructor} from './documents/instructor'
import {lesson} from './documents/lesson'
import {video} from './documents/video'
import {chapter} from './objects/chapter'
import {learningOutcome} from './objects/learningOutcome'
import {moduleObject} from './objects/module'
import {resource} from './objects/resource'
import {transcriptChunk} from './objects/transcriptChunk'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    // Documents
    course,
    lesson,
    instructor,
    category,
    video,
    // Objects
    moduleObject,
    learningOutcome,
    resource,
    chapter,
    transcriptChunk,
  ],
}
