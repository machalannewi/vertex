import { Sparkles, type LucideIcon, icons } from "lucide-react";

function toPascalCase(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Sanity stores lucide icon names inconsistently across schemas (e.g.
 * "layers" for learning outcomes, "Layers" for categories). Normalizes to
 * PascalCase and falls back to a generic icon if the name isn't a real
 * lucide-react export.
 */
export function getLucideIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Sparkles;
  const pascal = toPascalCase(name) as keyof typeof icons;
  return icons[pascal] ?? Sparkles;
}
