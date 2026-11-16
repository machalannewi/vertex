"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Bell } from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { captureEvent } from "@/components/analytics/capture-event";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Search", href: "/search" },
  { label: "My Learning", href: "/my-learning" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar({
  className,
  showActions = false,
}: {
  className?: string;
  showActions?: boolean;
}) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/[0.06] bg-neutral-50/75 backdrop-blur-xl",
        className,
      )}
    >
      <nav className="relative mx-auto flex w-full max-w-360 items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-heading-2 font-extrabold tracking-tight text-neutral-900">
          VERTEX
          <span className="ml-0.5 inline-block h-2 w-2 -translate-y-2.5 rounded-full bg-primary-500" />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 font-sans text-body md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors",
                isActive(pathname, link.href)
                  ? "font-semibold text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <div className="flex items-center gap-4 font-sans text-body">
              <SignInButton>
                <button
                  type="button"
                  onClick={() => captureEvent("sign_in_started", { source: "navbar" })}
                  className="hidden text-neutral-500 transition-colors hover:text-neutral-900 sm:inline"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button
                  type="button"
                  onClick={() => captureEvent("sign_up_started", { source: "navbar" })}
                  className="btn-glow inline-flex items-center gap-1.5 rounded-md bg-primary-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
            </div>
          </Show>
          <Show when="signed-in">
            {showActions && (
              <button
                type="button"
                aria-label="Notifications"
                className="relative text-neutral-500 transition-colors hover:text-neutral-900"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-primary-500" />
              </button>
            )}
            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  );
}
