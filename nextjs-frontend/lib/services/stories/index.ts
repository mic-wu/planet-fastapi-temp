import { getApiMode } from "@/lib/config/apiMode";
import { storiesApiService } from "@/lib/services/stories/api";
import { storiesMockService } from "@/lib/services/stories/mock";
import type {
  StoriesQueryParams,
  StoriesService,
} from "@/lib/services/stories/types";

function resolveService(): StoriesService {
  const mode = getApiMode();
  return mode === "mock" ? storiesMockService : storiesApiService;
}

export function getStories(params?: StoriesQueryParams) {
  return resolveService().getStories(params);
}

export function getStoryById(storyId: string) {
  return resolveService().getStoryById(storyId);
}

export function searchStories(query: string, category?: string) {
  return resolveService().searchStories(query, category);
}

export type { StoriesQueryParams, StoriesService } from "@/lib/services/stories/types";
export { storiesApiService, storiesMockService };
