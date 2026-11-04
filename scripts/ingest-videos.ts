/**
 * Offline video ingestion pipeline (AGENTS.md section 9). Never run in the request path.
 *
 * Reads videos.json (lessonSlug -> YouTube video id/title/channel/duration/query),
 * fetches each video's player data, and turns its captions and chapter
 * markers into a `video` document: a table of contents (chapters) and a
 * transcript split into short timestamped chunks. Writes one NDJSON document
 * per line to videos.seed.ndjson, importable the same way as seed.ndjson:
 *
 *   npx sanity dataset import ../scripts/videos.seed.ndjson production --replace
 *
 * Note: caption URLs from the web watch page carry `exp=xpe` and need a
 * proof-of-origin token, so they return HTTP 200 with an empty body. The
 * player data is instead requested from YouTube's InnerTube `player` endpoint
 * as the ANDROID client, whose caption URLs work without one. That endpoint is
 * undocumented and may change; if chunks come back empty again, check it first.
 */

import {readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'

const INPUT_PATH = path.join(__dirname, 'videos.json')
const OUTPUT_PATH = path.join(__dirname, 'videos.seed.ndjson')
const TRANSCRIPT_WINDOW_SECONDS = 15
const REQUEST_PAUSE_MS = 500
const INNERTUBE_PLAYER_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false'
const ANDROID_CLIENT = {
  clientName: 'ANDROID',
  clientVersion: '20.10.38',
  androidSdkVersion: 34,
  hl: 'en',
}
const ANDROID_USER_AGENT = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)'

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

type PlayerResponse = {
  playabilityStatus?: {status?: string; reason?: string}
  captions?: {
    playerCaptionsTracklistRenderer?: {captionTracks?: CaptionTrack[]}
  }
  videoDetails?: {shortDescription?: string}
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

async function fetchPlayerResponse(videoId: string): Promise<PlayerResponse> {
  const res = await fetch(INNERTUBE_PLAYER_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'User-Agent': ANDROID_USER_AGENT},
    body: JSON.stringify({context: {client: ANDROID_CLIENT}, videoId}),
  })
  if (!res.ok) {
    throw new Error(`Player fetch failed with status ${res.status}`)
  }

  const player = (await res.json()) as PlayerResponse
  const status = player.playabilityStatus?.status
  if (status && status !== 'OK') {
    const reason = player.playabilityStatus?.reason
    throw new Error(`Video not playable: ${status}${reason ? ` (${reason})` : ''}`)
  }
  return player
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

function cleanCueText(raw: string): string {
  return decodeHtmlEntities(raw.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

// srv3 is `<p t="startMs" d="durationMs"><s>word</s>…</p>`; the legacy
// format is `<text start="seconds">…</text>`.
function parseCues(xml: string): {startSeconds: number; text: string}[] {
  const cues: {startSeconds: number; text: string}[] = []
  const srv3Pattern = /<p t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g
  const legacyPattern = /<text start="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
  let match: RegExpExecArray | null

  while ((match = srv3Pattern.exec(xml)) !== null) {
    const text = cleanCueText(match[2])
    if (text) cues.push({startSeconds: Math.floor(Number(match[1]) / 1000), text})
  }
  if (cues.length > 0) return cues

  while ((match = legacyPattern.exec(xml)) !== null) {
    const text = cleanCueText(match[2])
    if (text) cues.push({startSeconds: Math.round(Number(match[1])), text})
  }
  return cues
}

async function fetchTranscriptChunks(trackUrl: string): Promise<TranscriptChunk[]> {
  const url = new URL(trackUrl)
  url.searchParams.set('fmt', 'srv3')
  const res = await fetch(url, {headers: {'User-Agent': ANDROID_USER_AGENT}})
  const xml = await res.text()
  if (!xml.trim()) {
    throw new Error('Caption track returned an empty body')
  }

  return mergeCuesIntoWindows(parseCues(xml), TRANSCRIPT_WINDOW_SECONDS)
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

async function buildVideoDocument(source: VideoSource): Promise<VideoDocument> {
  const playerResponse = await fetchPlayerResponse(source.id)

  const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  const track = pickCaptionTrack(captionTracks)
  const chunks = track ? await fetchTranscriptChunks(track.baseUrl) : []

  const description = playerResponse.videoDetails?.shortDescription ?? ''
  const chapters = extractChapters(description)

  return {
    // No "." before the video id: Sanity splits document IDs on "." into
    // elements that must each start with an alphanumeric character, and
    // YouTube ids can start with "-" or "_".
    _id: `video.youtube-${sanitizeId(source.id)}`,
    _type: 'video',
    url: watchUrl(source.id),
    chapters,
    chunks,
  }
}

// YouTube throttles bursts with a temporary LOGIN_REQUIRED ("confirm you're
// not a bot"); backing off and retrying clears it.
const RETRY_DELAYS_MS = [5_000, 15_000]

async function buildWithRetry(source: VideoSource): Promise<VideoDocument> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await buildVideoDocument(source)
    } catch (error) {
      if (attempt >= RETRY_DELAYS_MS.length) throw error
      await sleep(RETRY_DELAYS_MS[attempt])
    }
  }
}

async function main() {
  const sources = await readVideoSources()
  const entries = Object.entries(sources)
  const lines: string[] = []
  const summary: {slug: string; chapters: number; chunks: number; error?: string}[] = []

  for (const [slug, source] of entries) {
    try {
      const doc = await buildWithRetry(source)
      lines.push(JSON.stringify(doc))
      summary.push({slug, chapters: doc.chapters.length, chunks: doc.chunks.length})
      console.log(`${slug}: ${doc.chapters.length} chapters, ${doc.chunks.length} chunks`)
    } catch (error) {
      summary.push({
        slug,
        chapters: 0,
        chunks: 0,
        error: error instanceof Error ? error.message : String(error),
      })
    }
    await sleep(REQUEST_PAUSE_MS)
  }

  await writeFile(OUTPUT_PATH, lines.join('\n') + '\n', 'utf-8')

  const failed = summary.filter((s) => s.error)
  const empty = summary.filter((s) => !s.error && s.chunks === 0)
  console.log(`Wrote ${lines.length} of ${entries.length} video documents to ${OUTPUT_PATH}`)
  if (empty.length > 0) {
    console.warn(`${empty.length} video(s) have no caption track, so no transcript chunks:`)
    for (const e of empty) console.warn(`  ${e.slug}`)
  }
  if (failed.length > 0) {
    console.error(`${failed.length} video(s) failed:`)
    for (const f of failed) console.error(`  ${f.slug}: ${f.error}`)
    process.exitCode = 1
  }
}

main()
