import {contextPlugin} from '@sanity/context/studio'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {apiVersion, dataset, projectId} from './env'
import {schema} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'vertex',
  title: 'Vertex',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
    // Registers the sanity.agentContext type so the search Context document
    // (studio/context/vertex-search.json) can be edited here. Insights now
    // lives in the Sanity Dashboard Context app, so the Studio tool is off.
    contextPlugin({insights: {enabled: false}}),
  ],
})
