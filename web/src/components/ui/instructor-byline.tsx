import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Links the instructor on the course and lesson pages to their own page.
export function InstructorByline({
  name,
  slug,
  photoUrl,
  photoAlt,
  className,
}: {
  name: string;
  slug: string;
  photoUrl: string | null;
  photoAlt?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/instructors/${slug}`}
      className={cn(
        "inline-flex items-center gap-2 font-sans text-body text-neutral-700 hover:text-neutral-900",
        className,
      )}
    >
      <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-200">
        {photoUrl && (
          <Image
            src={photoUrl}
            alt={photoAlt ?? name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        )}
      </span>
      <span>
        <span className="text-neutral-500">Instructor</span>{" "}
        <span className="font-medium">{name}</span>
      </span>
    </Link>
  );
}
