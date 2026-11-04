"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { captureEvent } from "@/components/analytics/capture-event";
import type { SearchResult, SearchStreamEvent } from "@/lib/search/types";
import { SearchForm } from "./search-form";
import { VideoResultCard } from "./video-result-card";
import { LessonResultCard } from "./lesson-result-card";

type SortOption = "relevance" | "videos" | "lessons" | "course";

type SearchState =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "done"; results: SearchResult[]; courseCount: number }
  | { status: "error"; message: string };

function sortResults(results: SearchResult[], sort: SortOption) {
  if (sort === "relevance") return results;
  // Array.prototype.sort is stable, so relevance order holds within ties.
  return [...results].sort((a, b) => {
    if (sort === "course") return a.course.title.localeCompare(b.course.title);
    const first = sort === "videos" ? "video" : "lesson";
    return Number(b.kind === first) - Number(a.kind === first);
  });
}

async function readSearchStream(
  query: string,
  signal: AbortSignal,
  onEvent: (event: SearchStreamEvent) => void,
) {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null);
    onEvent({
      type: "error",
      message: body?.error ?? "Search is unavailable right now. Please try again.",
    });
    return;
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as SearchStreamEvent);
    }
  }
}

export function SearchExperience({ query }: { query: string }) {
  const [state, setState] = useState<SearchState>({ status: "idle" });
  const [sort, setSort] = useState<SortOption>("relevance");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (query.length < 2) return;

    const controller = new AbortController();
    const startedAt = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before a new streamed search
    setState({ status: "loading", message: "Searching lessons and videos…" });
    setSort("relevance");

    readSearchStream(query, controller.signal, (event) => {
      if (event.type === "status") {
        setState({ status: "loading", message: event.message });
      } else if (event.type === "error") {
        setState({ status: "error", message: event.message });
      } else {
        setState({
          status: "done",
          results: event.results,
          courseCount: event.courseCount,
        });
        captureEvent("search_performed", {
          query_length: query.length,
          result_count: event.results.length,
          video_count: event.results.filter((r) => r.kind === "video").length,
          lesson_count: event.results.filter((r) => r.kind === "lesson").length,
          course_count: event.courseCount,
          duration_ms: Date.now() - startedAt,
        });
      }
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error(error);
      setState({
        status: "error",
        message: "Search is unavailable right now. Please try again.",
      });
    });

    return () => controller.abort();
  }, [query, attempt]);

  const results = useMemo(
    () => (state.status === "done" ? sortResults(state.results, sort) : []),
    [state, sort],
  );

  const trackClick = useCallback(
    (result: SearchResult, position: number) => {
      captureEvent("search_result_clicked", {
        kind: result.kind,
        lesson_slug: result.lessonSlug,
        position,
        start_seconds: result.kind === "video" ? result.startSeconds : null,
      });
    },
    [],
  );

  const hasQuery = query.length >= 2;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-12 pb-16 sm:px-6 sm:pt-14">
      <div className="flex flex-col items-center text-center">
        <span className="rounded-xs bg-primary-100 px-3 py-1 font-sans text-small font-medium tracking-wide text-primary-500 uppercase">
          Search results
        </span>
        <h1 className="mt-4 font-display text-display-2 font-bold break-words text-neutral-900 sm:text-display-1">
          {hasQuery ? (
            <>
              Results for{" "}
              <span className="text-primary-500">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search your learning"
          )}
        </h1>
        <p className="mt-3 font-sans text-body-lg text-neutral-500" aria-live="polite">
          {!hasQuery && "Find the exact lesson and moment that teaches a topic."}
          {state.status === "loading" && state.message}
          {state.status === "done" &&
            `Found ${state.results.length} result${state.results.length === 1 ? "" : "s"} across ${state.courseCount} course${state.courseCount === 1 ? "" : "s"}`}
        </p>
        <div className="mt-6 w-full max-w-[820px]">
          <SearchForm
            defaultValue={query}
            placeholder="Ask anything about your learning..."
            inputClassName="h-14 rounded-md shadow-sm"
          />
        </div>
      </div>

      {hasQuery && (
        <>
          <div className="mt-8 flex items-center justify-between gap-4">
            <h2 className="font-sans text-heading-3 font-medium text-neutral-900">
              {state.status === "done"
                ? `${state.results.length} result${state.results.length === 1 ? "" : "s"}`
                : "Results"}
            </h2>
            <div className="w-44">
              <Select
                aria-label="Sort results"
                value={sort}
                disabled={state.status !== "done" || state.results.length === 0}
                onChange={(event) => setSort(event.target.value as SortOption)}
              >
                <option value="relevance">Most Relevant</option>
                <option value="videos">Videos first</option>
                <option value="lessons">Lessons first</option>
                <option value="course">Course A–Z</option>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {state.status === "loading" &&
              Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse flex-col gap-5 rounded-md border border-neutral-200 bg-white p-4 md:flex-row"
                >
                  <div className="aspect-video w-full rounded-sm bg-neutral-100 md:w-[274px]" />
                  <div className="flex flex-1 flex-col gap-3 py-2">
                    <div className="h-3 w-40 rounded-xs bg-neutral-100" />
                    <div className="h-5 w-2/3 rounded-xs bg-neutral-100" />
                    <div className="h-3 w-full rounded-xs bg-neutral-100" />
                  </div>
                </div>
              ))}

            {state.status === "error" && (
              <div className="flex flex-col items-center gap-4 rounded-md border border-neutral-200 bg-white px-6 py-10 text-center">
                <p className="font-sans text-body-lg text-neutral-700">
                  {state.message}
                </p>
                <Button variant="tertiary" onClick={() => setAttempt((n) => n + 1)}>
                  Try again
                </Button>
              </div>
            )}

            {state.status === "done" && state.results.length === 0 && (
              <p className="rounded-md border border-neutral-200 bg-white px-6 py-10 text-center font-sans text-body-lg text-neutral-700">
                No results for &ldquo;{query}&rdquo;.
              </p>
            )}

            {results.map((result, index) =>
              result.kind === "video" ? (
                <VideoResultCard
                  key={`video-${result.lessonId}-${result.startSeconds}`}
                  result={result}
                  onSelect={() => trackClick(result, index + 1)}
                />
              ) : (
                <LessonResultCard
                  key={`lesson-${result.lessonId}`}
                  result={result}
                  onSelect={() => trackClick(result, index + 1)}
                />
              ),
            )}

            {(state.status === "done" || state.status === "error") && (
              <div className="mt-1 flex flex-col gap-4 rounded-md border border-primary-100 bg-primary-100/50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                    <Search className="h-6 w-6 text-primary-500" />
                  </span>
                  <div className="flex flex-col gap-1 text-left">
                    <p className="font-sans text-body-lg font-medium text-neutral-900">
                      Can&apos;t find what you&apos;re looking for?
                    </p>
                    <p className="font-sans text-body text-neutral-500">
                      Try different keywords or browse our full course catalog.
                    </p>
                  </div>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-3 rounded-sm border border-neutral-200 bg-white px-5 font-sans text-body font-medium text-primary-500 hover:bg-neutral-50"
                >
                  Browse all courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
