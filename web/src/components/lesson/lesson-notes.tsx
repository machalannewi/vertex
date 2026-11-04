import { PortableText, type PortableTextComponents } from "next-sanity";
import type { LESSON_PAGE_QUERY_RESULT } from "../../../sanity.types";

type LessonNotesValue = NonNullable<
  NonNullable<LESSON_PAGE_QUERY_RESULT>["notes"]
>;

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-sans text-body-lg leading-7 text-neutral-500">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h3 className="pt-2 font-sans text-body-lg font-medium text-neutral-900">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="pt-2 font-sans text-body-lg font-medium text-neutral-900">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary-200 pl-4 font-sans text-body-lg text-neutral-500 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex list-disc flex-col gap-1.5 pl-5 font-sans text-body-lg text-neutral-500 marker:text-neutral-300">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 font-sans text-body-lg text-neutral-500 marker:text-neutral-500">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-700">{children}</strong>
    ),
    code: ({ children }) => (
      <code className="rounded-xs bg-neutral-100 px-1 py-0.5 text-body text-neutral-700">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-500 underline underline-offset-2 hover:text-primary-500/80"
      >
        {children}
      </a>
    ),
  },
};

export function LessonNotes({ value }: { value: LessonNotesValue }) {
  return (
    <div className="flex flex-col gap-4">
      <PortableText value={value} components={components} />
    </div>
  );
}
