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
    <div className="flex flex-1 flex-col bg-neutral-50">
      <Navbar showActions />
      <SearchExperience query={query} />
    </div>
  );
}
