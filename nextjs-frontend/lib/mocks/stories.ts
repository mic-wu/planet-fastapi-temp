import type {
  PaginatedResponse,
  StoryRead,
} from "@/app/openapi-client/types.gen";
import type { StoriesQueryParams } from "@/lib/services/stories/types";
import { formatToCategory, type StoryFormat } from "@/lib/utils/storyFormat";
import { generateStoryUrls } from "@/lib/utils/storyUrls";

// Mock stories with format field (as they would come from API)
const mockStoriesRaw: Array<StoryRead & { format?: string }> = [
  {
    id: "mock-aurora-horizon",
    story_id: "mock-aurora-horizon",
    title: "Aurora Over The Horizon",
    location: "Arctic Circle",
    description: "Vivid aurora curtains captured during a polar orbit pass.",
    image_url: null, // Will be generated
    thumbnail_url: null, // Will be generated
    category: "video", // Will be overridden by enrichment
    format: "mp4", // Video format
    story_metadata: {
      sensor: "PSX-Optic",
      captured_at: "2024-01-12T22:15:00Z",
      resolution: "0.5m",
      format: "mp4",
    },
    user_id: null,
    created_at: "2024-01-13T00:00:00Z",
    updated_at: "2024-01-13T00:00:00Z",
  },
  {
    id: "mock-desert-dunes",
    story_id: "mock-desert-dunes",
    title: "Rippled Desert Dunes",
    location: "Sahara Desert, Algeria",
    description: "Sunset light revealing wave-like dune formations.",
    image_url: null,
    thumbnail_url: null,
    category: "image",
    format: "raw", // Image format
    story_metadata: {
      sensor: "PSX-Optic",
      captured_at: "2024-02-05T15:40:00Z",
      resolution: "0.75m",
      format: "raw",
    },
    user_id: null,
    created_at: "2024-02-06T00:00:00Z",
    updated_at: "2024-02-06T00:00:00Z",
  },
  {
    id: "mock-storm-eye",
    story_id: "mock-storm-eye",
    title: "Eye of the Storm",
    location: "Western Pacific Ocean",
    description: "Synthetic aperture radar slice through a super-typhoon.",
    image_url: null,
    thumbnail_url: null,
    category: "image",
    format: "raw", // Image format
    story_metadata: {
      sensor: "PSX-Radar",
      captured_at: "2024-03-22T04:05:00Z",
      resolution: "1.0m",
      format: "raw",
    },
    user_id: null,
    created_at: "2024-03-23T00:00:00Z",
    updated_at: "2024-03-23T00:00:00Z",
  },
  {
    id: "mock-volcano-plume",
    story_id: "mock-volcano-plume",
    title: "Volcanic Plume Sentinel",
    location: "Mount Etna, Italy",
    description:
      "Thermal signature of an eruption venting into the stratosphere.",
    image_url: null,
    thumbnail_url: null,
    category: "video",
    format: "mp4", // Video format
    story_metadata: {
      sensor: "PSX-Thermal",
      captured_at: "2024-04-18T10:20:00Z",
      resolution: "5m",
      format: "mp4",
    },
    user_id: null,
    created_at: "2024-04-19T00:00:00Z",
    updated_at: "2024-04-19T00:00:00Z",
  },
  {
    id: "mock-forest-regrowth",
    story_id: "mock-forest-regrowth",
    title: "Rainforest Regrowth",
    location: "Amazon Basin, Brazil",
    description: "False-color composite highlighting canopy restoration zones.",
    image_url: null,
    thumbnail_url: null,
    category: "image",
    format: "raw", // Image format
    story_metadata: {
      sensor: "PSX-Multispectral",
      captured_at: "2024-05-09T13:30:00Z",
      resolution: "2m",
      format: "raw",
    },
    user_id: null,
    created_at: "2024-05-10T00:00:00Z",
    updated_at: "2024-05-10T00:00:00Z",
  },
  {
    id: "mock-city-grid",
    story_id: "mock-city-grid",
    title: "City Night Grid",
    location: "Tokyo, Japan",
    description: "Urban light network observed from geosynchronous orbit.",
    image_url: null,
    thumbnail_url: null,
    category: "video",
    format: "mp4", // Video format
    story_metadata: {
      sensor: "PSX-LowLight",
      captured_at: "2024-06-14T20:55:00Z",
      resolution: "1.5m",
      format: "mp4",
    },
    user_id: null,
    created_at: "2024-06-15T00:00:00Z",
    updated_at: "2024-06-15T00:00:00Z",
  },
];

/**
 * Enrich mock stories with URLs from format
 * This simulates what the API service does
 * Note: Category is derived in components from format, not set here
 */
function enrichMockStory(story: StoryRead & { format?: string }): StoryRead {
  const formatValue = story.format || story.story_metadata?.format as string || 'raw';
  // Ensure format is a valid StoryFormat type
  const format: StoryFormat = formatValue === "mp4" ? "mp4" : "raw";
  
  // Generate URLs from format + id
  const urls = generateStoryUrls(story.id, format);
  
  return {
    ...story,
    // Keep category as-is (components derive display category from format)
    thumbnail_url: urls.thumbnail_url ?? story.thumbnail_url,
    image_url: urls.image_url ?? story.image_url,
  };
}

// Export enriched stories
export const mockStories: StoryRead[] = mockStoriesRaw.map(enrichMockStory);

function normalizeCategory(category?: string | null): string | null {
  if (!category) {
    return null;
  }

  const normalized = category.toLowerCase();
  return normalized === "all" ? null : normalized;
}

function getFilterPredicate(
  params: StoriesQueryParams,
): (story: StoryRead) => boolean {
  const category = normalizeCategory(params.category);
  const searchTerm = params.search?.trim().toLowerCase();

  return (story: StoryRead) => {
    // Filter by category: map image/video to format, then check story's derived category
    let matchesCategory = true;
    if (category) {
      // Get format from story metadata to derive category
      const format = (story.story_metadata?.format as string) || 'raw';
      const storyCategory = formatToCategory(format);
      matchesCategory = storyCategory === category;
    }

    if (!searchTerm) {
      return matchesCategory;
    }

    const candidates = [story.title, story.location, story.description].filter(
      Boolean,
    ) as string[];

    const matchesSearch = candidates
      .map((candidate) => candidate.toLowerCase())
      .some((value) => value.includes(searchTerm));

    return matchesCategory && matchesSearch;
  };
}

export function buildMockPaginatedResponse(
  params: StoriesQueryParams = {},
): PaginatedResponse {
  const limit = Math.max(params.limit ?? 12, 1);
  const page = Math.max(params.page ?? 1, 1);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const filteredStories = mockStories.filter(getFilterPredicate(params));
  const paginatedStories = filteredStories.slice(startIndex, endIndex);

  return {
    data: paginatedStories,
    total: filteredStories.length,
    page,
    limit,
    has_more: endIndex < filteredStories.length,
  };
}

export function findMockStoryById(storyId: string): StoryRead | undefined {
  return mockStories.find((story) => story.id === storyId);
}
