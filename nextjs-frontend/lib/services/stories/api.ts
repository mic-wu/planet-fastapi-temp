import {
  getStories as getStoriesApi,
  getStory as getStoryApi,
} from "@/app/openapi-client";
import type {
  PaginatedResponse,
  StoryRead,
} from "@/app/openapi-client/types.gen";
import type {
  StoriesQueryParams,
  StoriesService,
} from "@/lib/services/stories/types";

const DEFAULT_LIMIT = 12;
const DEFAULT_PAGE = 1;

function buildQuery(params: StoriesQueryParams = {}) {
  return {
    page: params.page ?? DEFAULT_PAGE,
    limit: params.limit ?? DEFAULT_LIMIT,
    search: params.search,
    category: params.category,
  };
}

function ensureData<T>(
  response: { data?: T | undefined; error?: unknown },
  context: string,
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

async function getStoriesFromApi(
  params: StoriesQueryParams = {},
): Promise<PaginatedResponse> {
  const response = await getStoriesApi({
    query: buildQuery(params),
  });

  return ensureData<PaginatedResponse>(response, "Failed to fetch stories");
}

async function getStoryByIdFromApi(storyId: string) {
  const response = await getStoryApi({
    path: { story_id: storyId },
  });

  return ensureData<StoryRead>(response, `Failed to fetch story "${storyId}"`);
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
