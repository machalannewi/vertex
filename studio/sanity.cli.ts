import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

export default defineCliConfig({
  api: {projectId, dataset},
  // Hosted at https://vertex-aas8orlf.sanity.studio. The Context MCP only
  // serves datasets with a deployed Studio.
  studioHost: 'vertex-aas8orlf',
  deployment: {appId: 'zk6axc4z6e4tior1xnrzejaa'},
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../web/sanity.types.ts',
    overloadClientMethods: true,
  },
})
