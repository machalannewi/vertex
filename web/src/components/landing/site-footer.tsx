import Link from "next/link";
import type { LandingData } from "@/sanity/lib/data";

const PAGES: { label: string; href: string }[][] = [
  [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Search", href: "/search" },
  ],
  [
    { label: "My Learning", href: "/my-learning" },
    { label: "Sign in", href: "/sign-in" },
    { label: "Sign up", href: "/sign-up" },
  ],
];

const PROJECT = [
  { label: "GitHub", href: "https://github.com/machalannewi/vertex" },
  { label: "Style guide", href: "/style-guide" },
];

function ColumnTitle({ children }: { children: string }) {
  return (
    <h4 className="font-sans text-small font-semibold tracking-wider text-neutral-500 uppercase">
      {children}
    </h4>
  );
}

const linkClass =
  "font-sans text-body whitespace-nowrap text-neutral-700 transition-colors hover:text-neutral-900";

// Multi-column footer from the reference (frame 15).
export function SiteFooter({ categories }: { categories: LandingData["categories"] }) {
  return (
    <footer className="mt-24 border-t border-white/[0.06] sm:mt-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[1.1fr_1.6fr]">
        <div>
          <span className="font-display text-heading-2 font-extrabold tracking-tight text-neutral-900">
            VERTEX
            <span className="ml-0.5 inline-block h-2 w-2 -translate-y-2.5 rounded-full bg-primary-500" />
          </span>
          <p className="mt-6 max-w-sm font-display text-[26px] leading-[34px] font-semibold tracking-tight text-neutral-900">
            Transform the way you learn with Vertex
          </p>
          <p className="mt-4 max-w-sm font-sans text-body text-neutral-500">
            An AI-powered learning platform: plain-English search that jumps to
            the exact second a topic is taught.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <ColumnTitle>Pages</ColumnTitle>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {PAGES.map((column, i) => (
                <ul key={i} className="flex flex-col gap-3">
                  {column.map((page) => (
                    <li key={page.href}>
                      <Link href={page.href} className={linkClass}>
                        {page.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
          <div>
            <ColumnTitle>Categories</ColumnTitle>
            <ul className="mt-5 flex flex-col gap-3">
              {categories.slice(0, 5).map((category) => (
                <li key={category._id}>
                  <Link href="/courses" className={linkClass}>
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ColumnTitle>Project</ColumnTitle>
            <ul className="mt-5 flex flex-col gap-3">
              {PROJECT.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 font-sans text-small text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Vertex. All rights reserved.</span>
          <span>Built by Daniel Okeke</span>
        </div>
      </div>
    </footer>
  );
}
