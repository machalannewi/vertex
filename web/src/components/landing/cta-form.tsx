"use client";

import { useRouter } from "next/navigation";
import { captureEvent } from "@/components/analytics/capture-event";

// Presentational email capture from the reference: nothing is stored here,
// "Get Started" just takes the visitor to sign-up.
export function CtaForm() {
  const router = useRouter();

  return (
    <form
      className="mt-7 flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        captureEvent("sign_up_started", { source: "landing_cta" });
        router.push("/sign-up");
      }}
    >
      <label htmlFor="cta-email" className="sr-only">
        Email
      </label>
      <input
        id="cta-email"
        type="email"
        placeholder="Enter email here"
        className="h-11 flex-1 rounded-md border border-white/10 bg-surface-raised px-4 font-sans text-body text-neutral-900 placeholder:text-neutral-500 outline-none focus:border-primary-500"
      />
      <button
        type="submit"
        className="btn-glow h-11 rounded-md bg-primary-500 px-5 font-sans text-body font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Get Started
      </button>
    </form>
  );
}
