import "server-only";

import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs } from "ai";
import { z } from "zod";

import { buildSystemPrompt } from "./system-prompt";

const DEFAULT_MODEL = "gpt-5-mini";
const MAX_STEPS = 10;

// Only these MCP tools reach the model. `initial_context` is already in the
// system prompt, and `array_field_reader` could page through whole transcripts.
const ALLOWED_TOOLS = ["groq_query", "schema_explorer"] as const;

const agentOutputSchema = z.object({
  results: z
    .array(
      z.object({
        kind: z.enum(["video", "lesson"]),
        lessonId: z.string().describe("The lesson document _id"),
        startSeconds: z
          .number()
          .int()
          .min(0)
          .nullable()
          .describe("Matched chapter or chunk start, for video results only"),
        matchedOn: z.enum(["chapter", "transcript"]).nullable(),
      }),
    )
    .describe("All relevant results, ranked best first"),
});

export type AgentResult = z.infer<typeof agentOutputSchema>["results"][number];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// Cached for the life of the server process, so Context document changes to
// the schema overview only land after a restart.
let initialContextPromise: Promise<string | null> | null = null;

function fetchInitialContext(mcpUrl: string, token: string) {
  if (!initialContextPromise) {
    const url = new URL(mcpUrl);
    url.pathname = `${url.pathname.replace(/\/$/, "")}/initial-context`;
    initialContextPromise = fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null)
      .then((text) => {
        // Don't cache a failure; retry on the next request.
        if (!text) initialContextPromise = null;
        return text;
      });
  }
  return initialContextPromise;
}

export async function runSearchAgent(
  query: string,
  onStatus: (message: string) => void,
): Promise<AgentResult[]> {
  const mcpUrl = requireEnv("SANITY_CONTEXT_MCP_URL");
  const token = requireEnv("SANITY_API_READ_TOKEN");
  requireEnv("OPENAI_API_KEY");

  let mcpClient: MCPClient | null = null;

  try {
    const [client, initialContext] = await Promise.all([
      createMCPClient({
        transport: {
          type: "http",
          url: mcpUrl,
          headers: { Authorization: `Bearer ${token}` },
        },
      }),
      fetchInitialContext(mcpUrl, token),
    ]);
    mcpClient = client;

    const allTools = await mcpClient.tools();
    const tools = Object.fromEntries(
      ALLOWED_TOOLS.flatMap((name) =>
        allTools[name] ? [[name, allTools[name]]] : [],
      ),
    );

    onStatus("Searching lessons and videos…");

    const { output } = await generateText({
      model: openai(process.env.OPENAI_MODEL || DEFAULT_MODEL),
      instructions: buildSystemPrompt(initialContext),
      prompt: `Search query: ${JSON.stringify(query)}`,
      tools,
      output: Output.object({ schema: agentOutputSchema }),
      stopWhen: stepCountIs(MAX_STEPS),
      onStepEnd({ toolCalls }) {
        if (toolCalls.length > 0) onStatus("Matching chapters and lessons…");
      },
    });

    return output.results;
  } finally {
    await mcpClient?.close();
  }
}
