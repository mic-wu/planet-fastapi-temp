import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getStories } from "@/components/actions/stories-action";

export default async function Home() {
  const initialData = await getStories({
    page: 1,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-planet-dark-blue via-planet-teal to-planet-blue text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Image Gallery - Earth as seen by a Satellite
            </h1>
            <p className="text-xl text-white/90 mb-8 font-sans">
              Discover crystal-clear perspectives of our planet captured by the
              Planet Story Explorer constellation.
            </p>
            <p className="text-white/80 font-sans">
              Switch between optical and radar imagery, search by location, and
              explore rich metadata from our satellites.
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <GalleryGrid initialData={initialData} />
      </div>
    </div>
  );
}
