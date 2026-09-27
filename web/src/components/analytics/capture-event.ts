import posthog from "posthog-js";

type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export function captureEvent(
  eventName: string,
  properties?: EventProperties,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(eventName, properties);
}
