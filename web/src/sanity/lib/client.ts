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
  process.env.SANITY_API_READ_TOKEN,
  'Missing environment variable: SANITY_API_READ_TOKEN',
)

// Server-only: reads the private dataset with a token. Never import this
// from a client component — the `server-only` import above fails the build
// if that happens.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true,
})
