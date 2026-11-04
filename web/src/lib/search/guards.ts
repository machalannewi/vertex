import "server-only";

import type { SearchResult } from "./types";

// In-memory, per server instance. Enough to bound LLM cost on a public
// endpoint for now; a shared store (e.g. Redis) is needed across instances.

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.delete(hits.keys().next().value!);
  return false;
}

const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX = 100;
const cache = new Map<
  string,
  { at: number; value: { results: SearchResult[]; courseCount: number } }
>();

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getCachedResults(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedResults(
  key: string,
  value: { results: SearchResult[]; courseCount: number },
) {
  cache.delete(key);
  cache.set(key, { at: Date.now(), value });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!);
}
