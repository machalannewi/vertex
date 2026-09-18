"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";
import { getLessonLabel } from "@/sanity/lib/numbering";

const VISIBLE_MODULE_LIMIT = 6;

export interface ModuleAccordionLesson {
  _id: string;
  title: string;
  slug: string;
  duration: number;
}

export interface ModuleAccordionModule {
  title: string;
  summary?: string | null;
  lessons: ModuleAccordionLesson[];
}

function ModuleRow({
  courseModule,
  moduleIndex,
}: {
  courseModule: ModuleAccordionModule;
  moduleIndex: number;
}) {
  const [open, setOpen] = useState(false);
  const moduleDuration = courseModule.lessons.reduce(
    (sum, lesson) => sum + lesson.duration,
    0,
  );

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-neutral-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 font-sans text-body font-medium text-neutral-700">
          {moduleIndex + 1}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="font-sans text-body-lg font-medium text-neutral-900">
            {courseModule.title}
          </h3>
          {courseModule.summary && (
            <p className="truncate font-sans text-body text-neutral-500">
              {courseModule.summary}
            </p>
          )}
        </div>
        <span className="shrink-0 font-sans text-body text-neutral-500">
          {formatDuration(moduleDuration)}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-1 px-6 pb-4 pl-18">
          {courseModule.lessons.map((lesson, lessonIndex) => (
            <Link
              key={lesson._id}
              href={`/lessons/${lesson.slug}`}
              className="flex items-center justify-between gap-4 rounded-sm px-3 py-2 hover:bg-neutral-50"
            >
              <span className="font-sans text-body text-neutral-700">
                <span className="text-neutral-500">
                  {getLessonLabel(moduleIndex, lessonIndex)}
                </span>{" "}
                {lesson.title}
              </span>
              <span className="shrink-0 font-sans text-small text-neutral-500">
                {formatDuration(lesson.duration)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModuleAccordion({
  modules,
}: {
  modules: ModuleAccordionModule[];
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleModules = showAll
    ? modules
    : modules.slice(0, VISIBLE_MODULE_LIMIT);
  const hiddenCount = modules.length - visibleModules.length;

  return (
    <div>
      <div>
        {visibleModules.map((courseModule, index) => (
          <ModuleRow
            key={courseModule.title + index}
            courseModule={courseModule}
            moduleIndex={index}
          />
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="flex justify-center border-t border-neutral-100 px-6 py-4">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-4 py-2 font-sans text-body font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Show all {modules.length} modules
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
