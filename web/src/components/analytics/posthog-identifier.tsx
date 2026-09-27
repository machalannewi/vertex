"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

export function PostHogIdentifier() {
  const { isLoaded, user } = useUser();
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;

    if (user) {
      if (previousUserId.current && previousUserId.current !== user.id) {
        posthog.reset();
      }

      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      });
      previousUserId.current = user.id;
      return;
    }

    if (previousUserId.current) {
      posthog.reset();
    }
    previousUserId.current = null;
  }, [isLoaded, user]);

  return null;
}
