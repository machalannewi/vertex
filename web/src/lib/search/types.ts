// Shared between the search route and the results page. Client safe: plain,
// already-grounded display data only.

interface SearchResultBase {
  lessonId: string;
  lessonSlug: string;
  title: string;
  description: string;
  course: {
    title: string;
    slug: string;
    icon: string | null;
  };
  moduleLabel: string;
  moduleTitle: string;
  lessonLabel: string;
}

export interface VideoSearchResult extends SearchResultBase {
  kind: "video";
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  duration: number;
  startSeconds: number;
}

export interface LessonSearchResult extends SearchResultBase {
  kind: "lesson";
  keyPoints: string[];
}

export type SearchResult = VideoSearchResult | LessonSearchResult;

// The server step that failed: env config, the Context MCP, the LLM call, or
// hydrating the picks from Sanity.
export type SearchStep = "config" | "mcp" | "llm" | "hydrate";

export type SearchStreamEvent =
  | { type: "status"; message: string }
  | { type: "results"; results: SearchResult[]; courseCount: number }
  | { type: "error"; message: string; step?: SearchStep };
