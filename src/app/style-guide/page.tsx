import {
  Bell,
  Bookmark,
  Clock,
  FileText,
  Play,
  Search,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CourseCard } from "@/components/ui/course-card";
import { VideoLessonCard, LessonCard } from "@/components/ui/lesson-card";
import { ResourceCard } from "@/components/ui/resource-card";
import { Navbar } from "@/components/ui/navbar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";

const PRIMARY_SWATCHES = [
  { name: "Primary 500", hex: "#F97316" },
  { name: "Primary 400", hex: "#FB923C" },
  { name: "Primary 300", hex: "#FDBA74" },
  { name: "Primary 200", hex: "#FED7AA" },
  { name: "Primary 100", hex: "#FFEEE5" },
];

const NEUTRAL_SWATCHES = [
  { name: "Neutral 900", hex: "#0F172A" },
  { name: "Neutral 700", hex: "#33415F" },
  { name: "Neutral 500", hex: "#64748B" },
  { name: "Neutral 300", hex: "#CBD5E1" },
  { name: "Neutral 200", hex: "#E2E8F0" },
  { name: "Neutral 100", hex: "#F1F5F9" },
  { name: "Neutral 50", hex: "#FAFAFC" },
  { name: "White", hex: "#FFFFFF" },
];

const TYPE_SCALE = [
  { style: "Display 1", font: "Playfair Display", size: "48 / 56", weight: "Bold", use: "Page titles" },
  { style: "Display 2", font: "Playfair Display", size: "36 / 44", weight: "Bold", use: "Section titles" },
  { style: "Heading 1", font: "Inter", size: "28 / 36", weight: "Semi Bold", use: "Card titles" },
  { style: "Heading 2", font: "Inter", size: "22 / 30", weight: "Semi Bold", use: "Sub section" },
  { style: "Heading 3", font: "Inter", size: "18 / 26", weight: "Medium", use: "Small titles" },
  { style: "Body Large", font: "Inter", size: "16 / 24", weight: "Regular", use: "Body copy" },
  { style: "Body", font: "Inter", size: "14 / 20", weight: "Regular", use: "Supporting text" },
  { style: "Small", font: "Inter", size: "12 / 16", weight: "Regular", use: "Captions, meta" },
];

const SPACING = [4, 8, 12, 16, 24, 32, 40, 48, 64];
const RADII = [
  { label: "4px (xs)", className: "rounded-xs" },
  { label: "8px (sm)", className: "rounded-sm" },
  { label: "12px (md)", className: "rounded-md" },
  { label: "16px (lg)", className: "rounded-lg" },
  { label: "24px (xl)", className: "rounded-xl" },
  { label: "Full (circle)", className: "rounded-full" },
];
const SHADOWS = [
  { label: "Sm", className: "shadow-sm" },
  { label: "Md", className: "shadow-md" },
  { label: "Lg", className: "shadow-lg" },
  { label: "Xl", className: "shadow-xl" },
];

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-neutral-100 py-8">
      <h2 className="flex items-center gap-2 font-sans text-body font-semibold tracking-wide text-primary-500 uppercase">
        <span>{number}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-10 sm:px-8">
      <p className="font-sans text-small font-medium tracking-wide text-primary-500 uppercase">
        Vertex Design System
      </p>
      <h1 className="font-display text-display-2 font-bold text-neutral-900">
        Design System
      </h1>
      <p className="max-w-xl font-sans text-body-lg text-neutral-500">
        A unified design language for the Vertex learning platform. Clean,
        modern and focused on clarity, consistency and intuitive learning
        experiences.
      </p>

      <Section number="01" title="Colors">
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 font-sans text-body font-medium text-neutral-700">
              Primary
            </p>
            <div className="flex flex-wrap gap-4">
              {PRIMARY_SWATCHES.map((s) => (
                <div key={s.name} className="flex flex-col gap-1">
                  <div
                    className="h-16 w-24 rounded-sm"
                    style={{ backgroundColor: s.hex }}
                  />
                  <span className="font-sans text-small text-neutral-700">
                    {s.name}
                  </span>
                  <span className="font-sans text-small text-neutral-500">
                    {s.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-sans text-body font-medium text-neutral-700">
              Neutral
            </p>
            <div className="flex flex-wrap gap-4">
              {NEUTRAL_SWATCHES.map((s) => (
                <div key={s.name} className="flex flex-col gap-1">
                  <div
                    className="h-16 w-24 rounded-sm border border-neutral-200"
                    style={{ backgroundColor: s.hex }}
                  />
                  <span className="font-sans text-small text-neutral-700">
                    {s.name}
                  </span>
                  <span className="font-sans text-small text-neutral-500">
                    {s.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section number="02 / 03" title="Typography & Type Scale">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div>
            <p className="font-display text-display-2 font-bold text-neutral-900">
              Ag
            </p>
            <p className="font-sans text-body text-neutral-500">
              Playfair Display — Elegant, Readable, Timeless
            </p>
          </div>
          <div>
            <p className="font-sans text-display-2 font-bold text-neutral-900">
              Ag
            </p>
            <p className="font-sans text-body text-neutral-500">
              Inter — Clean, Modern, Highly legible
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse font-sans text-body">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="py-2 pr-4">Style</th>
                <th className="py-2 pr-4">Font</th>
                <th className="py-2 pr-4">Size / Line Height</th>
                <th className="py-2 pr-4">Weight</th>
                <th className="py-2">Use</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_SCALE.map((row) => (
                <tr key={row.style} className="border-b border-neutral-100">
                  <td className="py-2 pr-4 font-medium text-neutral-900">
                    {row.style}
                  </td>
                  <td className="py-2 pr-4 text-neutral-500">{row.font}</td>
                  <td className="py-2 pr-4 text-neutral-500">{row.size}</td>
                  <td className="py-2 pr-4 text-neutral-500">{row.weight}</td>
                  <td className="py-2 text-neutral-500">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section number="04" title="Spacing System">
        <p className="font-sans text-small text-neutral-500">Base unit: 4px</p>
        <div className="flex flex-wrap items-end gap-4">
          {SPACING.map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div
                className="rounded-xs bg-primary-200"
                style={{ width: s, height: s }}
              />
              <span className="font-sans text-small text-neutral-500">
                {s}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section number="05" title="Radius & Shadows">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-wrap gap-4">
            {RADII.map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-1">
                <div
                  className={`h-14 w-14 border border-neutral-200 bg-neutral-50 ${r.className}`}
                />
                <span className="font-sans text-small text-neutral-500">
                  {r.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            {SHADOWS.map((s) => (
              <div
                key={s.label}
                className={`flex h-14 w-20 items-center justify-center rounded-sm bg-white font-sans text-small text-neutral-500 ${s.className}`}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section number="06" title="Icons">
        <div className="flex gap-4 text-neutral-700">
          <Bell className="h-6 w-6" strokeWidth={2} />
          <Search className="h-6 w-6" strokeWidth={2} />
          <Play className="h-6 w-6" strokeWidth={2} />
          <FileText className="h-6 w-6" strokeWidth={2} />
          <Bookmark className="h-6 w-6" strokeWidth={2} />
          <Clock className="h-6 w-6" strokeWidth={2} />
          <User className="h-6 w-6" strokeWidth={2} />
          <ChevronRight className="h-6 w-6" strokeWidth={2} />
        </div>
      </Section>

      <Section number="07" title="Buttons">
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Get Started</Button>
          <Button variant="secondary">Explore Courses</Button>
          <Button variant="tertiary">View Lesson</Button>
          <Button variant="text">Watch Video</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" disabled>
            Get Started
          </Button>
          <Button variant="secondary" disabled>
            Explore Courses
          </Button>
          <Button variant="tertiary" disabled>
            View Lesson
          </Button>
          <Button variant="text" disabled>
            Watch Video
          </Button>
        </div>
      </Section>

      <Section number="08" title="Inputs">
        <div className="flex max-w-sm flex-col gap-4">
          <Input icon placeholder="Search anything..." shortcut="⌘K" />
          <Select defaultValue="relevant">
            <option value="relevant">Most Relevant</option>
            <option value="recent">Most Recent</option>
          </Select>
        </div>
      </Section>

      <Section number="09" title="Badges / Tags">
        <div className="flex gap-4">
          <Badge variant="video">Video</Badge>
          <Badge variant="lesson">Lesson</Badge>
          <Badge variant="popular">Popular</Badge>
        </div>
      </Section>

      <Section number="10" title="Status / Indicators">
        <div className="flex flex-wrap gap-6">
          <StatusIndicator status="in-progress" />
          <StatusIndicator status="completed" />
          <StatusIndicator status="now-playing" />
          <StatusIndicator status="locked" />
        </div>
      </Section>

      <Section number="11" title="Progress Bar">
        <ProgressBar value={35} className="max-w-sm" />
      </Section>

      <Section number="12" title="Cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CourseCard
            icon="N"
            title="Next.js for Production"
            description="Build scalable, high-performance web applications with Next.js."
            level="Intermediate"
            duration="18h 24m"
            moduleCount="12 modules"
          />
          <VideoLessonCard
            title="Data Fetching in Server Components"
            description="Learn how to fetch data on the server using async/await and Next.js best practices."
            lessonLabel="Lesson 5.1"
            timestamp="12:45"
          />
          <LessonCard
            title="Data Fetching & Caching"
            description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
            moduleLabel="Module 5"
          />
          <ResourceCard
            title="Caching and Revalidation Guide"
            description="Deep dive into Next.js caching strategies."
            meta="PDF · 1.2 MB"
          />
        </div>
      </Section>

      <Section number="13" title="Navigation">
        <div className="flex flex-col gap-4">
          <Navbar className="rounded-sm border border-neutral-200" />
          <Breadcrumbs
            items={[
              { label: "All Courses", href: "/courses" },
              { label: "Next.js for Production", href: "/courses/next" },
              { label: "Data Fetching & Caching" },
            ]}
          />
          <Pagination page={1} pageCount={8} />
        </div>
      </Section>

      <Section number="14" title="Principles">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div>
            <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
              Clarity First
            </h3>
            <p className="font-sans text-small text-neutral-500">
              Every element should communicate clearly.
            </p>
          </div>
          <div>
            <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
              Consistency
            </h3>
            <p className="font-sans text-small text-neutral-500">
              Use components and patterns consistently across the platform.
            </p>
          </div>
          <div>
            <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
              Focus & Calm
            </h3>
            <p className="font-sans text-small text-neutral-500">
              Remove noise and help learners focus on what matters.
            </p>
          </div>
          <div>
            <h3 className="font-sans text-heading-3 font-medium text-neutral-900">
              Accessible
            </h3>
            <p className="font-sans text-small text-neutral-500">
              Design with accessibility and inclusion in mind.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
