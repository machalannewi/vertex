import { z } from "zod";

import { runSearchAgent } from "@/lib/search/agent";
import {
  getCachedResults,
  isRateLimited,
  normalizeQuery,
  setCachedResults,
} from "@/lib/search/guards";
import { hydrateResults } from "@/lib/search/hydrate";
import type { SearchStreamEvent } from "@/lib/search/types";

export const maxDuration = 60;

const requestSchema = z.object({
  query: z.string().trim().min(2).max(200),
});

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

// Streams newline-delimited JSON: status lines while the agent works, then a
// single results (or error) line.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Enter a search between 2 and 200 characters." },
      { status: 400 },
    );
  }

  const { query } = parsed.data;
  const cacheKey = normalizeQuery(query);
  const cached = getCachedResults(cacheKey);

  if (!cached && isRateLimited(clientKey(request))) {
    return Response.json(
      { error: "Too many searches. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SearchStreamEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        if (cached) {
          send({ type: "results", ...cached });
          return;
        }

        const agentResults = await runSearchAgent(query, (message) =>
          send({ type: "status", message }),
        );
        send({ type: "status", message: "Preparing results…" });
        const hydrated = await hydrateResults(agentResults);
        setCachedResults(cacheKey, hydrated);
        send({ type: "results", ...hydrated });
      } catch (error) {
        console.error("[search] failed", error);
        send({
          type: "error",
          message: "Search is unavailable right now. Please try again.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
