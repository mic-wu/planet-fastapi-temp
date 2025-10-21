"use client";

import { useCallback, useState } from "react";
import { StoryCard } from "./story-card";
import { StoryFilters } from "./story-filters";
import { GalleryPagination } from "./gallery-pagination";
import { GalleryPageSize } from "./gallery-page-size";
import { StoryRead, PaginatedResponse } from "@/app/openapi-client/types.gen";
import { getStories } from "@/components/actions/stories-action";

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

  const fetchStories = useCallback(
    async (
      page: number,
      limit: number,
      searchTerm: string,
      categoryFilter: string | null,
    ) => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      setSearch(searchTerm);
      fetchStories(1, pagination.limit, searchTerm, category);
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
    // TODO: Implement story detail view/modal
    console.log("Story clicked:", story);
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <StoryFilters
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        searchValue={search}
        categoryValue={category || "all"}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Stories Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={handleStoryClick}
              />
            ))}
          </div>

          {/* Empty State */}
          {stories.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No stories found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}

          {/* Pagination */}
          {stories.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8">
              <div className="flex items-center gap-4">
                <GalleryPageSize
                  currentSize={pagination.limit}
                  onSizeChange={handlePageSizeChange}
                  sizes={[12, 24, 48]}
                />
                <span className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} stories
                </span>
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
    </div>
  );
}
