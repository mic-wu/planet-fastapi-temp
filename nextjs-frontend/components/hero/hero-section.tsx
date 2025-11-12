'use client';

import { useHeroVisibility } from '@/lib/contexts/hero-visibility-context';

export function HeroSection() {
  const { isVisible, isHydrated } = useHeroVisibility();

  if (!isHydrated || !isVisible) {
    return null;
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-primary-dark text-foreground dark:text-white">
      <div
        className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-primary/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 hidden h-72 w-72 translate-x-1/3 translate-y-1/4 rounded-full bg-success/30 blur-3xl lg:block"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1 text-sm font-medium text-primary-dark/90">
            Planet Insights Platform
          </div>
          <h1 className="text-4xl font-heading font-semibold tracking-tight md:text-5xl">
            Image Gallery — Earth as seen by a Satellite
          </h1>
          <p className="max-w-2xl text-lg text-foreground/80 dark:text-white/80 font-sans md:text-xl">
            Explore mission-ready imagery, filter by acquisition type, and
            access rich metadata curated for analysts and storytellers.
          </p>
        </div>
      </div>
    </section>
  );
}

