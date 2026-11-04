// Playback uses the provider's own embed player. Only YouTube is supported:
// it's the only provider with both ingestion and playback (AGENTS.md §9).

const YOUTUBE_ID_PATTERNS = [
  /[?&]v=([\w-]{11})(?:&|$)/,
  /youtu\.be\/([\w-]{11})(?:[?&/]|$)/,
  /youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})(?:[?&/]|$)/,
];

function getYouTubeId(videoUrl: string): string | null {
  let host: string;
  try {
    host = new URL(videoUrl).hostname;
  } catch {
    return null;
  }
  if (!/(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be)$/.test(host)) {
    return null;
  }
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = videoUrl.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getEmbedUrl(videoUrl: string, startSeconds: number): string | null {
  const youTubeId = getYouTubeId(videoUrl);
  if (!youTubeId) return null;

  const params = new URLSearchParams({ rel: "0" });
  if (startSeconds > 0) params.set("start", String(startSeconds));
  return `https://www.youtube-nocookie.com/embed/${youTubeId}?${params}`;
}

export function LessonVideo({
  videoUrl,
  title,
  startSeconds,
}: {
  videoUrl: string;
  title: string;
  startSeconds: number;
}) {
  const embedUrl = getEmbedUrl(videoUrl, startSeconds);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-md bg-neutral-900 shadow-md">
      {embedUrl ? (
        <iframe
          // Remount when the start second changes so the embed seeks to it.
          key={embedUrl}
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-sans text-body text-neutral-300">
          Video unavailable
        </div>
      )}
    </div>
  );
}
