import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}

const token = assertValue(
  process.env.SANITY_API_WRITE_TOKEN,
  'Missing environment variable: SANITY_API_WRITE_TOKEN',
)

// Server-only write client for learner progress. Kept separate from the
// read-only content client (./client): this one needs an Editor token and must
// never be served from the CDN, since progress is written and re-read often.
// The `server-only` import above fails the build if a client component imports
// this module, so the write token can never reach the browser (AGENTS.md §5).
export const progressClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})
