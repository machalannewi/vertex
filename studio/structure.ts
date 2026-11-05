import {CONTEXT_SCHEMA_TYPE_NAME} from '@sanity/context/studio'
import type {StructureResolver} from 'sanity/structure'

// `progress` is per-learner app state written by the web server, not authored
// content — hide it from the desk alongside the other internal types.
const HIDDEN_FROM_CONTENT = new Set(['video', 'progress', CONTEXT_SCHEMA_TYPE_NAME])

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...S.documentTypeListItems().filter((item) => !HIDDEN_FROM_CONTENT.has(item.getId() ?? '')),
      S.divider(),
      S.listItem()
        .title('Videos (internal)')
        .child(S.documentTypeList('video').title('Videos (internal)')),
      S.listItem()
        .title('Agents')
        .child(S.documentTypeList(CONTEXT_SCHEMA_TYPE_NAME).title('Agents')),
    ])
