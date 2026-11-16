import type { Metadata } from "next";
import { Navbar } from "@/components/ui/navbar";
import { SearchExperience } from "@/components/search/search-experience";

export const metadata: Metadata = {
  title: "Search · Vertex",
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 200) : "";

  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip bg-neutral-50">
      {/* Ambient orange light from the top, echoing the landing hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(50%_55%_at_50%_0%,rgba(249,115,22,0.16),transparent)]"
      />
      <Navbar showActions />
      <div className="relative flex flex-1 flex-col">
        <SearchExperience query={query} />
      </div>
    </div>
  );
}
