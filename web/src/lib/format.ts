export function formatDuration(totalSeconds: number): string {
  // Round to whole minutes first so e.g. 3599s reads "1h 0m", not "0h 60m".
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatStudentCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

export function formatLevel(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

// Video clock time, e.g. 765 -> "12:45", 3725 -> "1:02:05".
export function formatTimestamp(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${s}`;
  return `${m}:${s}`;
}
