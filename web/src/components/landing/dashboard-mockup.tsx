import { createElement } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Search,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { getLucideIcon } from "@/lib/icons";
import { formatLevel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LandingData } from "@/sanity/lib/data";
import { Sparkline } from "./sparkline";

const TABS = [
  { label: "My Learning", icon: LayoutDashboard, active: true },
  { label: "Courses", icon: BookOpen },
  { label: "Search", icon: Search },
  { label: "Instructors", icon: Users },
  { label: "Settings", icon: Settings },
];

const CHIP_TONES = [
  "bg-gradient-to-br from-primary-400 to-primary-700",
  "bg-gradient-to-br from-indigo-400 to-violet-600",
  "bg-gradient-to-br from-sky-400 to-blue-600",
];

function shortLabel(title: string | null) {
  const first = (title ?? "").split(/\s+/)[0] ?? "";
  return first.length > 8 ? `${first.slice(0, 7)}…` : first;
}

export function DashboardMockup({
  stats,
  courses,
  className,
}: {
  stats: LandingData["stats"];
  courses: LandingData["byPopularity"];
  className?: string;
}) {
  const kpis = [
    { label: "Courses", value: stats.courses, tone: "text-primary-400" },
    { label: "Lessons", value: stats.lessons, tone: "text-emerald-400" },
    { label: "Instructors", value: stats.instructors, tone: "text-primary-400" },
    { label: "Hours of video", value: stats.hours, tone: "text-emerald-400" },
  ];

  const top = courses.slice(0, 3);
  // Real minutes of video per course (lesson counts are uniform, durations aren't).
  const chart = courses.slice(0, 6).map((course) => ({
    label: shortLabel(course.title),
    minutes: Math.round((course.duration ?? 0) / 60),
  }));
  const max = Math.max(60, ...chart.map((c) => c.minutes));
  const axisMax = Math.ceil(max / 60) * 60;

  return (
    <div className={cn("card-glass overflow-hidden rounded-xl text-left", className)}>
      {/* App chrome */}
      <div className="flex items-center gap-6 border-b border-white/5 px-5 py-3.5 sm:px-8">
        <span className="font-display text-body-lg font-extrabold tracking-tight text-neutral-900">
          VERTEX
          <span className="ml-0.5 inline-block h-1.5 w-1.5 -translate-y-2 rounded-full bg-primary-500" />
        </span>
        <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {TABS.map(({ label, icon: Icon, active }) => (
            <span
              key={label}
              className={cn(
                "inline-flex items-center gap-1.5 font-sans text-small",
                active ? "font-semibold text-neutral-900" : "text-neutral-500",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="relative text-neutral-700">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary-500" />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-primary-600 text-white">
            <UserRound className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-heading-2 font-semibold text-neutral-900">
            Dashboard
          </h3>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface-raised px-3 py-1.5 font-sans text-small font-medium text-neutral-900 hover:bg-neutral-100"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Browse courses
          </Link>
        </div>

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-white/[0.07] bg-surface-raised/70 p-4 shadow-[inset_0_-1px_0_rgba(249,115,22,0.18)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  {kpi.label}
                </span>
                <ArrowUpRight className={cn("h-3.5 w-3.5", kpi.tone)} />
              </div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="font-sans text-heading-3 font-semibold text-neutral-900">
                  {kpi.value.toLocaleString("en-US")}
                </span>
                <Sparkline variant={i} className={kpi.tone} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* Continue learning list */}
          <div className="rounded-lg border border-white/[0.07] bg-surface-raised/50 p-5">
            <h4 className="font-sans text-body font-semibold text-neutral-900">
              Continue learning
            </h4>
            <p className="mt-0.5 font-sans text-small text-neutral-500">
              Pick up the most popular courses on Vertex.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {top.map((course, i) => (
                <li key={course._id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white",
                      CHIP_TONES[i % CHIP_TONES.length],
                    )}
                  >
                    {createElement(getLucideIcon(course.category?.icon), {
                      className: "h-4 w-4",
                    })}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-sans text-body font-medium text-neutral-900">
                      {course.title}
                    </span>
                    <span className="font-sans text-small text-neutral-500">
                      {course.lessonIds?.length ?? 0} lessons ·{" "}
                      {formatLevel(course.level ?? "")}
                    </span>
                  </span>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="shrink-0 font-sans text-small font-semibold text-primary-400 hover:text-primary-300"
                  >
                    Resume
                  </Link>
                </li>
              ))}
            </ul>
            <span className="mt-5 inline-flex items-center gap-1 font-sans text-small text-neutral-500">
              View all courses <ChevronDown className="h-3 w-3" />
            </span>
          </div>

          {/* Minutes of video per course (real durations) */}
          <div className="rounded-lg border border-white/[0.07] bg-surface-raised/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-sans text-body font-semibold text-neutral-900">
                Video per course
              </h4>
              <span className="inline-flex items-center gap-1 font-sans text-[10px] text-neutral-500">
                <span className="h-2 w-2 rounded-xs bg-primary-500" /> Minutes
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <div className="flex h-36 w-7 flex-col justify-between text-right font-sans text-[10px] text-neutral-500">
                {[axisMax, (axisMax * 3) / 4, axisMax / 2, axisMax / 4, 0].map((v) => (
                  <span key={v}>{Math.round(v)}</span>
                ))}
              </div>
              <div className="flex h-36 flex-1 items-end justify-between gap-2 border-b border-white/5">
                {chart.map((bar) => (
                  <div key={bar.label} className="flex h-full flex-1 items-end justify-center">
                    <div className="relative flex h-full w-3 items-end justify-center rounded-t-xs bg-white/[0.04] sm:w-4">
                      <span
                        className="w-full rounded-t-xs bg-gradient-to-t from-primary-700 to-primary-400 shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                        style={{ height: `${(bar.minutes / axisMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex justify-between gap-2 pl-10">
              {chart.map((bar) => (
                <span
                  key={bar.label}
                  className="flex-1 truncate text-center font-sans text-[10px] text-neutral-500"
                >
                  {bar.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
