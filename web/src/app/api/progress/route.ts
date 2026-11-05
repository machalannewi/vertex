import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { client } from "@/sanity/lib/client";
import { LESSON_DURATION_QUERY } from "@/sanity/lib/queries";
import {
  markComplete,
  markIncomplete,
  savePosition,
} from "@/sanity/lib/progress";

// Writes the authenticated learner's own progress. The browser never holds a
// Sanity token and never writes directly (AGENTS.md §5, §7): the user is taken
// from Clerk, never from the request body, so a learner can only write their
// own record.
const requestSchema = z.object({
  lessonId: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/)
    .max(120),
  action: z.enum(["complete", "uncomplete", "position"]),
  positionSeconds: z.number().int().min(0).max(360000).optional(),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { lessonId, action, positionSeconds } = parsed.data;

  // Ground against real content: reject unknown lessons and clamp a resume
  // position to the lesson's real duration.
  const lesson = await client.fetch(LESSON_DURATION_QUERY, { id: lessonId });
  if (!lesson?._id) {
    return Response.json({ error: "Unknown lesson." }, { status: 400 });
  }

  try {
    if (action === "complete") {
      await markComplete(userId, lessonId);
    } else if (action === "uncomplete") {
      await markIncomplete(userId, lessonId);
    } else {
      const duration = lesson.duration ?? 0;
      const clamped = Math.min(
        Math.max(0, positionSeconds ?? 0),
        duration > 0 ? duration : positionSeconds ?? 0,
      );
      await savePosition(userId, lessonId, clamped);
    }
  } catch (error) {
    console.error("[progress] write failed", error);
    return Response.json(
      { error: "Could not save progress." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
