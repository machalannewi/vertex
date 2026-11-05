"use client";

// Playback uses the provider's own embed player (AGENTS.md §7 — not a custom
// player). Only YouTube is supported: it's the only provider with both
// ingestion and playback (AGENTS.md §9). We drive YouTube's own IFrame Player
// API only to seek to the resume second and to read playback time, which lets
// us persist a resume position, auto-complete at ~90% watched, and report
// watch depth to analytics. The learner never leaves the site.

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureEvent } from "@/components/analytics/capture-event";

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

// --- Minimal YouTube IFrame Player API typings ------------------------------

interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}
interface YTPlayerEvent {
  data: number;
  target: YTPlayer;
}
interface YTPlayerConfig {
  videoId: string;
  host?: string;
  width?: string;
  height?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
  };
}
interface YTNamespace {
  Player: new (el: HTMLElement, config: YTPlayerConfig) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("No window"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

const SAVE_INTERVAL_MS = 10_000;
const COMPLETE_RATIO = 0.9;

type ProgressAction = "complete" | "uncomplete" | "position";

export function LessonVideo({
  videoUrl,
  title,
  startSeconds,
  lessonId,
  lessonSlug,
  courseSlug,
  lessonLabel,
  durationSeconds,
  canTrack,
  initiallyCompleted,
}: {
  videoUrl: string;
  title: string;
  startSeconds: number;
  lessonId: string;
  lessonSlug: string;
  courseSlug: string;
  lessonLabel: string;
  durationSeconds: number;
  /** Signed in: persist position/completion. Signed out: play only. */
  canTrack: boolean;
  initiallyCompleted: boolean;
}) {
  const youTubeId = getYouTubeId(videoUrl);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const lastSavedAtRef = useRef(0);
  const lastPositionRef = useRef(startSeconds);
  const playedOnceRef = useRef(false);
  const completedRef = useRef(initiallyCompleted);

  const [completed, setCompleted] = useState(initiallyCompleted);
  const [pending, setPending] = useState(false);

  const postProgress = useCallback(
    (action: ProgressAction, positionSeconds?: number) => {
      if (!canTrack) return;
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, action, positionSeconds }),
        keepalive: true,
      }).catch(() => {});
    },
    [canTrack, lessonId],
  );

  const savePosition = useCallback(
    (seconds: number, force = false) => {
      if (!canTrack) return;
      const now = Date.now();
      if (!force && now - lastSavedAtRef.current < SAVE_INTERVAL_MS) return;
      lastSavedAtRef.current = now;
      lastPositionRef.current = seconds;
      postProgress("position", Math.floor(seconds));
    },
    [canTrack, postProgress],
  );

  const markCompleted = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    postProgress("complete");
    captureEvent("lesson_completed", {
      lesson_slug: lessonSlug,
      course_slug: courseSlug,
      lesson_label: lessonLabel,
      trigger: "watched",
    });
  }, [postProgress, lessonSlug, courseSlug, lessonLabel]);

  // Create the player once the API and the mount node are ready.
  useEffect(() => {
    if (!youTubeId || !mountRef.current) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const effectiveDuration = () => {
      const fromPlayer = playerRef.current?.getDuration() ?? 0;
      return fromPlayer > 0 ? fromPlayer : durationSeconds;
    };

    const tick = () => {
      const player = playerRef.current;
      if (!player) return;
      const current = player.getCurrentTime();
      savePosition(current);
      const total = effectiveDuration();
      if (total > 0) {
        const ratio = current / total;
        captureEvent("video_progress", {
          lesson_slug: lessonSlug,
          course_slug: courseSlug,
          percent: Math.round(ratio * 100),
        });
        if (ratio >= COMPLETE_RATIO) markCompleted();
      }
    };

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return;
        playerRef.current = new YT.Player(mountRef.current, {
          videoId: youTubeId,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: {
            rel: 0,
            start: startSeconds > 0 ? startSeconds : 0,
            origin: window.location.origin,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                if (!playedOnceRef.current) {
                  playedOnceRef.current = true;
                  captureEvent("video_played", {
                    lesson_slug: lessonSlug,
                    course_slug: courseSlug,
                    lesson_label: lessonLabel,
                  });
                }
                interval ??= setInterval(tick, SAVE_INTERVAL_MS);
              } else {
                if (interval) {
                  clearInterval(interval);
                  interval = undefined;
                }
                const current = event.target.getCurrentTime();
                savePosition(current, true);
                if (event.data === YT.PlayerState.ENDED) markCompleted();
              }
            },
          },
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // Player is created once per lesson mount; callbacks are stable via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youTubeId]);

  // Flush the latest position when the tab is hidden or the page unloads.
  useEffect(() => {
    if (!canTrack) return;
    const flush = () => {
      const player = playerRef.current;
      if (!player) return;
      const seconds = Math.floor(player.getCurrentTime());
      const payload = JSON.stringify({
        lessonId,
        action: "position" as const,
        positionSeconds: seconds,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/progress",
          new Blob([payload], { type: "application/json" }),
        );
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [canTrack, lessonId]);

  const toggleComplete = useCallback(() => {
    const next = !completed;
    setPending(true);
    completedRef.current = next;
    setCompleted(next);
    postProgress(next ? "complete" : "uncomplete");
    if (next) {
      captureEvent("lesson_completed", {
        lesson_slug: lessonSlug,
        course_slug: courseSlug,
        lesson_label: lessonLabel,
        trigger: "manual",
      });
    }
    setPending(false);
  }, [completed, postProgress, lessonSlug, courseSlug, lessonLabel]);

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label={title}
        className="aspect-video w-full overflow-hidden rounded-md bg-neutral-900 shadow-md"
      >
        {youTubeId ? (
          <div className="h-full w-full">
            <div ref={mountRef} className="h-full w-full" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-sans text-body text-neutral-300">
            Video unavailable
          </div>
        )}
      </div>

      {canTrack && youTubeId && (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant={completed ? "secondary" : "primary"}
            onClick={toggleComplete}
            disabled={pending}
            aria-pressed={completed}
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Mark as complete
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
