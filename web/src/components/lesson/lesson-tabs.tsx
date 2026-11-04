"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "content", label: "Lesson Content" },
  { id: "notes", label: "Notes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LessonTabs({ content }: { content: ReactNode }) {
  const [active, setActive] = useState<TabId>("content");

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-2 border-b border-neutral-200 sm:gap-4"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`lesson-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`lesson-panel-${tab.id}`}
            onClick={() => setActive(tab.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 font-display text-body-lg transition-colors",
              active === tab.id
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-neutral-500 hover:text-neutral-900",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="lesson-panel-content"
        aria-labelledby="lesson-tab-content"
        hidden={active !== "content"}
      >
        {content}
      </div>

      {/* Presentational only: notes are not saved anywhere (AGENTS.md §7). */}
      <div
        role="tabpanel"
        id="lesson-panel-notes"
        aria-labelledby="lesson-tab-notes"
        hidden={active !== "notes"}
        className="px-4 py-8 sm:px-5"
      >
        <textarea
          rows={8}
          placeholder="Write your notes for this lesson…"
          className="w-full resize-y rounded-md border border-neutral-200 bg-white p-4 font-sans text-body-lg text-neutral-900 placeholder:text-neutral-300 focus:border-primary-300 focus:outline-none"
        />
        <p className="mt-2 font-sans text-small text-neutral-500">
          Notes aren&apos;t saved yet.
        </p>
      </div>
    </div>
  );
}
