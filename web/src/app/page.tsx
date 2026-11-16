import { Navbar } from "@/components/ui/navbar";
import { Hero } from "@/components/landing/hero";
import { ScrollRise } from "@/components/landing/scroll-rise";
import { DashboardMockup } from "@/components/landing/dashboard-mockup";
import { FitScale } from "@/components/landing/fit-scale";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { BentoGrid } from "@/components/landing/bento-grid";
import { Features } from "@/components/landing/features";
import { CoursePricing } from "@/components/landing/course-pricing";
import { CatalogCards } from "@/components/landing/catalog-cards";
import { CtaBand } from "@/components/landing/cta-band";
import { SiteFooter } from "@/components/landing/site-footer";
import { getLandingData } from "@/sanity/lib/data";

// REDSUN-style landing page (prompts/redsun-redesign.md). Every number,
// course, lesson and category shown comes from Sanity.
export default async function Home() {
  const data = await getLandingData();

  return (
    <div className="relative flex flex-1 flex-col overflow-x-clip">
      <Navbar showActions />
      <main>
        <Hero />
        <div className="relative z-10 mx-auto -mt-24 max-w-6xl px-4 sm:-mt-36 sm:px-6">
          <ScrollRise>
            <FitScale width={1100}>
              <DashboardMockup stats={data.stats} courses={data.byPopularity} />
            </FitScale>
          </ScrollRise>
        </div>
        <LogoMarquee categories={data.categories} />
        <BentoGrid
          featuredCourse={data.featuredCourse}
          students={data.stats.students}
        />
        <Features lessons={data.stats.lessons} />
        <CoursePricing courses={data.byPopularity} />
        <CatalogCards lessons={data.featuredLessons} />
        <CtaBand stats={data.stats} courses={data.byPopularity} />
      </main>
      <SiteFooter categories={data.categories} />
    </div>
  );
}
