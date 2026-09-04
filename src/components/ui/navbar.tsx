import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar({ className }: { className?: string }) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4",
        className,
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-primary-500 font-display text-body font-bold text-white">
          V
        </span>
        <span className="font-display text-heading-2 font-bold text-neutral-900">
          Vertex
        </span>
      </Link>
      <div className="flex items-center gap-6 font-sans text-body text-neutral-700">
        <Link href="/courses" className="hover:text-neutral-900">
          Courses
        </Link>
        <Link href="/my-learning" className="hover:text-neutral-900">
          My Learning
        </Link>
      </div>
    </nav>
  );
}
