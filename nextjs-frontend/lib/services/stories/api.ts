import {
  listStories as getStoriesApi,
  getStory as getStoryApi,
} from "@/app/openapi-client";
import type {
  PaginatedStoriesResponse,
  StoryRead,
} from "@/app/openapi-client/types.gen";
import type {
  StoriesQueryParams,
  StoriesService,
} from "@/lib/services/stories/types";
import { generateStoryUrls } from "@/lib/utils/storyUrls";

// Type alias for compatibility
type PaginatedResponse = PaginatedStoriesResponse;

const DEFAULT_LIMIT = 12;
const DEFAULT_PAGE = 1;

function buildQuery(params: StoriesQueryParams = {}) {
  // Backend API accepts "image" | "video" as category filter
  // and maps them to format internally (image -> raw, video -> mp4)
  // OpenAPI types expect "image" | "video" which matches the backend
  return {
    page: params.page ?? DEFAULT_PAGE,
    limit: params.limit ?? DEFAULT_LIMIT,
    search: params.search,
    category: params.category as "image" | "video" | null | undefined,
  };
}

function ensureData<T>(
  response: { data?: T | undefined; error?: unknown },
  context: string
): T {
  const error = response.error as Record<string, unknown> | undefined;

  if (error && Object.keys(error).length > 0) {
    throw new Error(`${context}: ${JSON.stringify(error)}`);
  }

  if (!response.data) {
    throw new Error(`${context}: response missing data payload`);
  }

  return response.data;
}

/**
 * Enrich story with client-generated fields (category, URLs)
 * The API returns format field and null for category/URLs
 * Frontend generates these from format + id
 */
/**
 * Utility to extract the format from a StoryRead object, with fallbacks.
 */
function getStoryFormat(story: StoryRead): string {
  return (
    (story.story_metadata?.format as string | undefined) ||
    // Some legacy stories may have format at the top level
    (story as unknown as { format?: string }).format ||
    "raw"
  );
}

function enrichStory(story: StoryRead): StoryRead {
  // Get format from story_metadata or assume default
  const format = getStoryFormat(story);

  // Generate URLs from format + id
  const urls = generateStoryUrls(story.id, format);

  // Note: We don't set category here because:
  // 1. API returns category as null (client-generated)
  // 2. Components derive category from format for display
  // 3. The StoryRead type expects "image" | "video" which matches our display categories
  // We keep the API's category field as-is (may be null or "image"/"video")
  // Components will derive display category from format

  return {
    ...story,
    // Keep category as-is from API (may be null)
    // Components derive display category from format
    thumbnail_url: urls.thumbnail_url ?? story.thumbnail_url,
    image_url: urls.image_url ?? story.image_url,
  };
}

/**
 * Enrich paginated response with client-generated fields
 */
function enrichPaginatedResponse(
  response: PaginatedResponse
): PaginatedResponse {
  return {
    ...response,
    data: response.data.map(enrichStory),
  };
}

async function getStoriesFromApi(
  params: StoriesQueryParams = {}
): Promise<PaginatedResponse> {
  const response = await getStoriesApi({
    query: buildQuery(params),
  });

  const data = ensureData<PaginatedResponse>(
    response,
    "Failed to fetch stories"
  );

  // Enrich stories with client-generated fields
  return enrichPaginatedResponse(data);
}

async function getStoryByIdFromApi(storyId: string) {
  const response = await getStoryApi({
    path: { story_id: storyId },
  });

  const story = ensureData<StoryRead>(
    response,
    `Failed to fetch story "${storyId}"`
  );

  // Enrich story with client-generated fields
  return enrichStory(story);
}

export const storiesApiService: StoriesService = {
  async getStories(params) {
    return getStoriesFromApi(params);
  },
  async getStoryById(storyId) {
    return getStoryByIdFromApi(storyId);
  },
  async searchStories(query, category) {
    return getStoriesFromApi({
      search: query,
      category,
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
    });
  },
};
