// Module and lesson numbers (e.g. "Module 5", "Lesson 5.1") are derived from
// array order, never stored in Sanity.

export function getModuleLabel(moduleIndex: number): string {
  return `Module ${moduleIndex + 1}`
}

export function getLessonLabel(moduleIndex: number, lessonIndex: number): string {
  return `Lesson ${moduleIndex + 1}.${lessonIndex + 1}`
}
