import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getStories } from "@/components/actions/stories-action";

export default async function Home() {
  const initialData = await getStories({
    page: 1,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border bg-primary-dark text-primary-foreground">
        <div
          className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-primary/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 hidden h-72 w-72 translate-x-1/3 translate-y-1/4 rounded-full bg-success/30 blur-3xl lg:block"
          aria-hidden="true"
        />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1 text-sm font-medium text-primary-dark/90">
              Planet Insights Platform
            </div>
            <h1 className="text-4xl font-heading font-semibold tracking-tight md:text-5xl">
              Image Gallery — Earth as seen by a Satellite
            </h1>
            <p className="max-w-3xl text-lg text-primary-foreground/80 font-sans md:text-xl">
              Explore mission-ready imagery, filter by acquisition type, and access rich metadata curated for analysts and storytellers.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary-soft bg-primary-soft/70 p-4 text-sm font-medium text-primary-dark shadow-sm">
                Brand palette aligned with Planet Insights system for visual consistency.
              </div>
              <div className="rounded-2xl border border-warning-light bg-warning-light/70 p-4 text-sm font-medium text-warning-foreground shadow-sm">
                Warning & onboarding states highlight observation readiness and tasking.
              </div>
              <div className="rounded-2xl border border-success-light bg-success-light/70 p-4 text-sm font-medium text-success-foreground shadow-sm">
                Success colors reinforce positive mission outcomes and data completeness.
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-10 md:py-14">
        <GalleryGrid initialData={initialData} />
      </div>
    </div>
  );
}
