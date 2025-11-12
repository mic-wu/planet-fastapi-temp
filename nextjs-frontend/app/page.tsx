import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getStories } from "@/components/actions/stories-action";
import { HeroSection } from "@/components/hero/hero-section";

export default async function Home() {
  const initialData = await getStories({
    page: 1,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <div className="container mx-auto px-4 py-10 md:py-14">
        <GalleryGrid initialData={initialData} />
      </div>
    </div>
  );
}
