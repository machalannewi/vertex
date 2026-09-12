/**
 * Offline video ingestion pipeline (AGENTS.md section 9). Never run in the request path.
 *
 * Reads videos.json (lessonSlug -> YouTube video id/title/channel/duration/query),
 * fetches each video's public watch page, and turns its captions and chapter
 * markers into a `video` document: a table of contents (chapters) and a
 * transcript split into short timestamped chunks. Writes one NDJSON document
 * per line to videos.seed.ndjson, importable the same way as seed.ndjson:
 *
 *   npx sanity dataset import ../scripts/videos.seed.ndjson production --replace
 *
 * Note: YouTube's caption URLs are signed against the requester's real IP.
 * From a network YouTube treats as suspicious (proxied, sandboxed, no real
 * egress IP), the caption fetch returns HTTP 200 with an empty body — a
 * known anti-scraping measure, not a bug here. Run this from a normal
 * machine/network for real results.
 */

import {readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'

const INPUT_PATH = path.join(__dirname, 'videos.json')
const OUTPUT_PATH = path.join(__dirname, 'videos.seed.ndjson')
const TRANSCRIPT_WINDOW_SECONDS = 15
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

type VideoSource = {
  id: string
  title: string
  channel: string
  duration: number
  query: string
}

type Chapter = {startSeconds: number; label: string}
type TranscriptChunk = {startSeconds: number; text: string}
type VideoDocument = {
  _id: string
  _type: 'video'
  url: string
  chapters: Chapter[]
  chunks: TranscriptChunk[]
}

type CaptionTrack = {baseUrl: string; languageCode: string; kind?: string}

async function readVideoSources(): Promise<Record<string, VideoSource>> {
  const raw = await readFile(INPUT_PATH, 'utf-8')
  return JSON.parse(raw)
}

function sanitizeId(id: string): string {
  return id.replace(/[^A-Za-z0-9_.-]/g, '-')
}

function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

async function fetchWatchPageHtml(videoId: string): Promise<string> {
  const res = await fetch(watchUrl(videoId), {
    headers: {'User-Agent': USER_AGENT, 'Accept-Language': 'en-US,en;q=0.9'},
  })
  if (!res.ok) {
    throw new Error(`Watch page fetch failed with status ${res.status}`)
  }
  return res.text()
}

/**
 * YouTube embeds `var ytInitialPlayerResponse = {...};` as a script-tag
 * assignment. The object itself is valid JSON; find it by counting braces
 * (respecting string literals) rather than a fragile non-greedy regex.
 */
function extractBalancedJson(html: string, marker: string): unknown {
  const markerIndex = html.indexOf(marker)
  if (markerIndex === -1) return null

  const start = html.indexOf('{', markerIndex)
  if (start === -1) return null

  let depth = 0
  let inString = false
  let stringChar = ''
  let escaped = false

  for (let i = start; i < html.length; i++) {
    const char = html[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === stringChar) inString = false
      continue
    }

    if (char === '"' || char === "'") {
      inString = true
      stringChar = char
      continue
    }

    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1))
        } catch {
          return null
        }
      }
    }
  }

  return null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function pickCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (tracks.length === 0) return null
  return (
    tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr') ??
    tracks.find((t) => t.languageCode === 'en') ??
    tracks[0]
  )
}

async function fetchTranscriptChunks(trackUrl: string): Promise<TranscriptChunk[]> {
  const res = await fetch(trackUrl, {headers: {'User-Agent': USER_AGENT}})
  const xml = await res.text()
  if (!xml.trim()) {
    return []
  }

  const cues: {startSeconds: number; text: string}[] = []
  const cuePattern = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
  let match: RegExpExecArray | null
  while ((match = cuePattern.exec(xml)) !== null) {
    const startSeconds = Math.round(Number(match[1]))
    const text = decodeHtmlEntities(match[2].replace(/<[^>]+>/g, '')).trim()
    if (text) cues.push({startSeconds, text})
  }

  return mergeCuesIntoWindows(cues, TRANSCRIPT_WINDOW_SECONDS)
}

function mergeCuesIntoWindows(
  cues: {startSeconds: number; text: string}[],
  windowSeconds: number,
): TranscriptChunk[] {
  if (cues.length === 0) return []

  const chunks: TranscriptChunk[] = []
  let windowStart = cues[0].startSeconds
  let windowTexts: string[] = []

  for (const cue of cues) {
    if (cue.startSeconds - windowStart >= windowSeconds && windowTexts.length > 0) {
      chunks.push({startSeconds: windowStart, text: windowTexts.join(' ')})
      windowStart = cue.startSeconds
      windowTexts = []
    }
    windowTexts.push(cue.text)
  }

  if (windowTexts.length > 0) {
    chunks.push({startSeconds: windowStart, text: windowTexts.join(' ')})
  }

  return chunks
}

const CHAPTER_LINE_PATTERN = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s*[-–—:]?\s*(.+)$/

function extractChapters(description: string): Chapter[] {
  const chapters: Chapter[] = []

  for (const rawLine of description.split('\n')) {
    const line = rawLine.trim()
    const match = CHAPTER_LINE_PATTERN.exec(line)
    if (!match) continue

    const [, hours, minutes, seconds, label] = match
    const startSeconds = (Number(hours ?? 0) * 3600) + (Number(minutes) * 60) + Number(seconds)
    const trimmedLabel = label.trim()
    if (trimmedLabel) {
      chapters.push({startSeconds, label: trimmedLabel})
    }
  }

  // A single timestamp in a description isn't a table of contents.
  return chapters.length >= 2 ? chapters : []
}

async function buildVideoDocument(slug: string, source: VideoSource): Promise<VideoDocument> {
  const url = watchUrl(source.id)
  const html = await fetchWatchPageHtml(source.id)

  const playerResponse = extractBalancedJson(html, 'ytInitialPlayerResponse') as
    | {
        captions?: {
          playerCaptionsTracklistRenderer?: {captionTracks?: CaptionTrack[]}
        }
        videoDetails?: {shortDescription?: string}
      }
    | null

  const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  const track = pickCaptionTrack(captionTracks)
  const chunks = track ? await fetchTranscriptChunks(track.baseUrl) : []

  const description = playerResponse?.videoDetails?.shortDescription ?? ''
  const chapters = extractChapters(description)

  return {
    // No "." before the video id: Sanity splits document IDs on "." into
    // elements that must each start with an alphanumeric character, and
    // YouTube ids can start with "-" or "_".
    _id: `video.youtube-${sanitizeId(source.id)}`,
    _type: 'video',
    url,
    chapters,
    chunks,
  }
}

async function main() {
  const sources = await readVideoSources()
  const entries = Object.entries(sources)
  const lines: string[] = []
  const summary: {slug: string; chapters: number; chunks: number; error?: string}[] = []

  for (const [slug, source] of entries) {
    try {
      const doc = await buildVideoDocument(slug, source)
      lines.push(JSON.stringify(doc))
      summary.push({slug, chapters: doc.chapters.length, chunks: doc.chunks.length})
    } catch (error) {
      summary.push({
        slug,
        chapters: 0,
        chunks: 0,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  await writeFile(OUTPUT_PATH, lines.join('\n') + '\n', 'utf-8')

  const failed = summary.filter((s) => s.error)
  const empty = summary.filter((s) => !s.error && s.chunks === 0)
  console.log(`Wrote ${lines.length} of ${entries.length} video documents to ${OUTPUT_PATH}`)
  if (empty.length > 0) {
    console.warn(
      `${empty.length} video(s) had no transcript chunks (likely a caption fetch returning empty — see the note at the top of this file).`,
    )
  }
  if (failed.length > 0) {
    console.error(`${failed.length} video(s) failed:`)
    for (const f of failed) console.error(`  ${f.slug}: ${f.error}`)
    process.exitCode = 1
  }
}

main()
