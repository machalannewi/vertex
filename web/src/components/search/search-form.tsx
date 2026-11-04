"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

// Submits to /search?q=. ⌘K / Ctrl+K focuses the input from anywhere on the page.
export function SearchForm({
  defaultValue = "",
  placeholder,
  inputClassName,
}: {
  defaultValue?: string;
  placeholder?: string;
  inputClassName?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      role="search"
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        const query = inputRef.current?.value.trim() ?? "";
        if (query.length < 2) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }}
    >
      <Input
        // Remount when the URL query changes so the field shows it.
        key={defaultValue}
        ref={inputRef}
        type="search"
        name="q"
        icon
        shortcut="⌘K"
        aria-label="Search lessons and videos"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={200}
        className={inputClassName}
      />
    </form>
  );
}
