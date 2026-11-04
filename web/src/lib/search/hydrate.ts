import "server-only";

import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { getLessonLabel, getModuleLabel } from "@/sanity/lib/numbering";
import { SEARCH_HITS_QUERY } from "@/sanity/lib/queries";
import type { AgentResult } from "./agent";
import type { SearchResult } from "./types";

const MAX_RESULTS = 100;

function dedupeKey(result: AgentResult): string {
  return result.kind === "video"
    ? `video:${result.lessonId}:${result.startSeconds}`
    : `lesson:${result.lessonId}`;
}

/**
 * Turns the agent's ranked picks into result cards using only stored data.
 * Drops anything that doesn't check out: unknown lessons, lessons no course
 * uses, and video results whose second isn't a stored chapter/chunk start.
 */
export async function hydrateResults(agentResults: AgentResult[]) {
  const seen = new Set<string>();
  const picks = agentResults
    .filter((result) => {
      if (result.kind === "video" && result.startSeconds === null) return false;
      const key = dedupeKey(result);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_RESULTS);

  const ids = [...new Set(picks.map((pick) => pick.lessonId))];
  if (ids.length === 0) return { results: [], courseCount: 0 };

  const lessons = await client.fetch(SEARCH_HITS_QUERY, { ids });
  const lessonsById = new Map(lessons.map((lesson) => [lesson._id, lesson]));

  const results: SearchResult[] = [];

  for (const pick of picks) {
    const lesson = lessonsById.get(pick.lessonId);
    if (!lesson?.slug || !lesson.course?.slug) continue;

    const modules = lesson.course.modules ?? [];
    const moduleIndex = modules.findIndex((courseModule) =>
      courseModule.lessonIds?.includes(lesson._id),
    );
    if (moduleIndex === -1) continue;
    const lessonIndex = modules[moduleIndex].lessonIds!.indexOf(lesson._id);

    const base = {
      lessonId: lesson._id,
      lessonSlug: lesson.slug,
      title: lesson.title ?? "",
      description: lesson.intro,
      course: {
        title: lesson.course.title ?? "",
        slug: lesson.course.slug,
        icon: lesson.course.icon,
      },
      moduleLabel: getModuleLabel(moduleIndex),
      moduleTitle: modules[moduleIndex].title ?? "",
      lessonLabel: getLessonLabel(moduleIndex, lessonIndex),
    };

    if (pick.kind === "video") {
      const storedStarts = [
        ...(lesson.video?.chapterStarts ?? []),
        ...(lesson.video?.chunkStarts ?? []),
      ];
      if (!storedStarts.includes(pick.startSeconds)) continue;

      results.push({
        ...base,
        kind: "video",
        thumbnailUrl: lesson.thumbnail?.asset
          ? urlFor(lesson.thumbnail).width(560).height(315).fit("crop").url()
          : null,
        thumbnailAlt: lesson.thumbnail?.alt ?? base.title,
        duration: lesson.duration ?? 0,
        startSeconds: pick.startSeconds!,
      });
    } else {
      results.push({ ...base, kind: "lesson", keyPoints: lesson.keyPoints ?? [] });
    }
  }

  const courseCount = new Set(results.map((result) => result.course.slug)).size;
  return { results, courseCount };
}
