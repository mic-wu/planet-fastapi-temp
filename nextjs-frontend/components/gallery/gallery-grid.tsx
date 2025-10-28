"use client";

import { useCallback, useMemo, useState } from "react";
import { StoryCard } from "./story-card";
import { StoryFilters } from "./story-filters";
import { GalleryPagination } from "./gallery-pagination";
import { GalleryPageSize } from "./gallery-page-size";
import { StoryRead, PaginatedResponse } from "@/app/openapi-client/types.gen";
import { getStories } from "@/components/actions/stories-action";
import type { ResolutionFilterOption } from "./story-filters";
import { StoryPreviewModal } from "./story-preview-modal";

interface GalleryGridProps {
  initialData: PaginatedResponse;
}

export function GalleryGrid({ initialData }: GalleryGridProps) {
  const [stories, setStories] = useState<StoryRead[]>(initialData.data);
  const [pagination, setPagination] = useState({
    total: initialData.total,
    page: initialData.page,
    limit: initialData.limit,
    hasMore: initialData.has_more,
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sensorFilter, setSensorFilter] = useState<string | null>(null);
  const [resolutionFilter, setResolutionFilter] =
    useState<ResolutionFilterOption>("any");

  const parseResolutionValue = useCallback((value: unknown) => {
    if (typeof value !== "string") {
      return null;
    }

    const match = value.trim().match(/^([\d.]+)\s*(cm|m)$/i);
    if (!match) {
      return null;
    }

    const [, raw, unit] = match;
    const numeric = Number.parseFloat(raw);
    if (Number.isNaN(numeric)) {
      return null;
    }

    if (unit.toLowerCase() === "cm") {
      return numeric / 100;
    }

    return numeric;
  }, []);

  const matchesResolutionFilter = useCallback(
    (value: number | null, filter: ResolutionFilterOption): boolean => {
      if (filter === "any") {
        return true;
      }

      if (value === null) {
        return false;
      }

      switch (filter) {
        case "lte-0.5":
          return value <= 0.5;
        case "lte-1":
          return value <= 1;
        case "lte-3":
          return value <= 3;
        case "gt-3":
          return value > 3;
        default:
          return true;
      }
    },
    [],
  );

  const availableSensors = useMemo(() => {
    const sensors = new Set<string>();
    stories.forEach((story) => {
      const sensor = story.story_metadata?.sensor;
      if (typeof sensor === "string" && sensor.trim().length > 0) {
        sensors.add(sensor);
      }
    });
    return Array.from(sensors).sort((a, b) => a.localeCompare(b));
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const sensor =
        typeof story.story_metadata?.sensor === "string"
          ? story.story_metadata.sensor
          : null;
      const resolutionValue = parseResolutionValue(
        story.story_metadata?.resolution,
      );

      if (sensorFilter && sensor !== sensorFilter) {
        return false;
      }

      if (!matchesResolutionFilter(resolutionValue, resolutionFilter)) {
        return false;
      }

      return true;
    });
  }, [
    stories,
    sensorFilter,
    resolutionFilter,
    parseResolutionValue,
    matchesResolutionFilter,
  ]);

  const hasActiveAdvancedFilters =
    sensorFilter !== null || resolutionFilter !== "any";

  const fetchStories = useCallback(
    async (
      page: number,
      limit: number,
      searchTerm: string,
      categoryFilter: string | null,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getStories({
          page,
          limit,
          search: searchTerm || undefined,
          category: categoryFilter || undefined,
        });

        setStories(response.data);
        setPagination({
          total: response.total,
          page: response.page,
          limit: response.limit,
          hasMore: response.has_more,
        });
      } catch (error) {
        console.error("Failed to fetch stories:", error);
        setError("Something went wrong while fetching stories. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      const normalizedSearch = searchTerm.trim();
      setSearch(normalizedSearch);
      fetchStories(1, pagination.limit, normalizedSearch, category);
    },
    [fetchStories, pagination.limit, category],
  );

  const handleCategoryChange = useCallback(
    (categoryFilter: string | null) => {
      setCategory(categoryFilter);
      fetchStories(1, pagination.limit, search, categoryFilter);
    },
    [fetchStories, pagination.limit, search],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchStories(page, pagination.limit, search, category);
    },
    [fetchStories, pagination.limit, search, category],
  );

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      fetchStories(1, limit, search, category);
    },
    [fetchStories, search, category],
  );

  const handleStoryClick = (story: StoryRead) => {
    setSelectedStoryId(story.id);
    setIsPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setSelectedStoryId(null);
  };

  const handleChangeStory = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <StoryFilters
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        searchValue={search}
        categoryValue={category || "all"}
        availableSensors={availableSensors}
        sensorValue={sensorFilter}
        onSensorChange={setSensorFilter}
        resolutionValue={resolutionFilter}
        onResolutionChange={setResolutionFilter}
        onClearAdvancedFilters={() => {
          setSensorFilter(null);
          setResolutionFilter("any");
        }}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-planet-teal"></div>
        </div>
      )}

      {/* Stories Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={handleStoryClick}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-heading font-semibold text-planet-dark-blue mb-2">
                No stories found
              </h3>
              <p className="text-planet-dark-blue/70 font-sans">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredStories.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
              <div className="flex items-center gap-4">
                <GalleryPageSize
                  currentSize={pagination.limit}
                  onSizeChange={handlePageSizeChange}
                  sizes={[12, 24, 48]}
                />
                <div className="text-sm text-planet-dark-blue/70 font-sans">
                  <span className="font-medium">
                    {filteredStories.length}{" "}
                    {filteredStories.length === 1 ? "story" : "stories"}
                  </span>{" "}
                  on this page
                  {hasActiveAdvancedFilters && (
                    <span className="ml-1 text-xs italic text-planet-teal">
                      (filtered)
                    </span>
                  )}
                  <div>
                    Page {pagination.page} of{" "}
                    {Math.max(
                      1,
                      Math.ceil(pagination.total / pagination.limit),
                    )}
                  </div>
                </div>
              </div>

              <GalleryPagination
                currentPage={pagination.page}
                totalPages={Math.ceil(pagination.total / pagination.limit)}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      <StoryPreviewModal
        stories={filteredStories}
        open={isPreviewOpen}
        activeStoryId={selectedStoryId}
        onClose={handlePreviewClose}
        onChangeStory={handleChangeStory}
      />
    </div>
  );
}
