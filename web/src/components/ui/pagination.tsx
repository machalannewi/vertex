"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  className?: string;
}) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-sans text-body text-neutral-500",
        className,
      )}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange?.(p)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-sm",
            p === page
              ? "border border-primary-400 bg-primary-100 text-primary-500"
              : "hover:bg-neutral-50",
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange?.(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-sm border border-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
