import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getStories } from "@/components/actions/stories-action";

export default async function GalleryPage() {
  // Fetch initial stories data
  const initialData = await getStories({
    page: 1,
    limit: 12,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section - Airbus-inspired */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Image Gallery - Earth as seen by a Satellite
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Discover the most beautiful, crystal-clear images of our planet
              captured by the Planet Story Explorer Constellation
            </p>
            <p className="text-slate-400">
              From radar to optical satellite imagery, find and download the
              best of our high-resolution Earth observation imagery.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <GalleryGrid initialData={initialData} />
      </div>
    </div>
  );
}
