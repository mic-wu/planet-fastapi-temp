"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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

  // Initialize state from URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    const urlCategory = searchParams.get("category");
    const urlPage = Number.parseInt(searchParams.get("page") ?? "", 10);
    const urlLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const urlSensor = searchParams.get("sensor");
    const urlResolution = searchParams.get("resolution") as
      | ResolutionFilterOption
      | null;

    if (urlSearch) {
      setSearch(urlSearch);
    }
    setCategory(urlCategory ?? null);
    setSensorFilter(urlSensor ?? null);
    if (urlResolution && ["any", "lte-0.5", "lte-1", "lte-3", "gt-3"].includes(urlResolution)) {
      setResolutionFilter(urlResolution);
    }

    setPagination((prev) => ({
      ...prev,
      page: Number.isFinite(urlPage) && urlPage > 0 ? urlPage : prev.page,
      limit: Number.isFinite(urlLimit) && urlLimit > 0 ? urlLimit : prev.limit,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      router.replace(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

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
      updateQueryParams({
        search: normalizedSearch || null,
        page: "1",
      });
    },
    [fetchStories, pagination.limit, category, updateQueryParams],
  );

  const handleCategoryChange = useCallback(
    (categoryFilter: string | null) => {
      setCategory(categoryFilter);
      fetchStories(1, pagination.limit, search, categoryFilter);
      updateQueryParams({
        category: categoryFilter,
        page: "1",
      });
    },
    [fetchStories, pagination.limit, search, updateQueryParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchStories(page, pagination.limit, search, category);
      updateQueryParams({
        page: String(page),
      });
    },
    [fetchStories, pagination.limit, search, category, updateQueryParams],
  );

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      fetchStories(1, limit, search, category);
      updateQueryParams({
        page: "1",
        limit: String(limit),
      });
    },
    [fetchStories, search, category, updateQueryParams],
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
        onSensorChange={(value) => {
          setSensorFilter(value);
          updateQueryParams({
            sensor: value,
            page: "1",
          });
        }}
        resolutionValue={resolutionFilter}
        onResolutionChange={(value) => {
          setResolutionFilter(value);
          updateQueryParams({
            resolution: value,
            page: "1",
          });
        }}
        onClearAdvancedFilters={() => {
          setSensorFilter(null);
          setResolutionFilter("any");
          updateQueryParams({
            sensor: null,
            resolution: null,
            page: "1",
          });
        }}
        hasActiveAdvancedFilters={hasActiveAdvancedFilters}
      />

      {error && (
        <div className="rounded-md border border-destructive-light/40 bg-destructive-light/20 px-4 py-3 text-sm text-destructive-dark">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
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
              <h3 className="mb-2 text-lg font-heading font-semibold text-foreground">
                No stories found
              </h3>
              <p className="text-muted-foreground font-sans">
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
                <div className="text-sm text-muted-foreground font-sans">
                  <span className="font-medium">
                    {filteredStories.length}{" "}
                    {filteredStories.length === 1 ? "story" : "stories"}
                  </span>{" "}
                  on this page
                  {hasActiveAdvancedFilters && (
                    <span className="ml-1 text-xs italic text-primary">
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
