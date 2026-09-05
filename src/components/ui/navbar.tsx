import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar({
  className,
  showActions = false,
}: {
  className?: string;
  showActions?: boolean;
}) {
  return (
    <header
      className={cn(
        "border-b border-neutral-200 bg-white",
        className,
      )}
    >
      <nav className="relative mx-auto flex w-full max-w-360 items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary-500 font-display text-body font-bold text-white">
            V
          </span>
          <span className="font-display text-heading-2 font-bold text-neutral-900">
            Vertex
          </span>
        </Link>
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 font-sans text-body text-neutral-700 sm:flex">
          <Link href="/courses" className="hover:text-neutral-900">
            Courses
          </Link>
          <Link href="/my-learning" className="hover:text-neutral-900">
            My Learning
          </Link>
        </div>
        {showActions && (
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="text-neutral-700 hover:text-neutral-900"
            >
              <Bell className="h-5 w-5" />
            </button>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-300 font-sans text-small font-medium text-neutral-700">
              V
            </span>
          </div>
        )}
      </nav>
    </header>
  );
}
