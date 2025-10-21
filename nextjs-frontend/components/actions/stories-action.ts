import {
  getStories as getStoriesFromService,
  getStoryById as getStoryByIdFromService,
  searchStories as searchStoriesFromService,
} from "@/lib/services/stories";
import type { StoriesQueryParams } from "@/lib/services/stories";

export type GetStoriesParams = StoriesQueryParams;

export async function getStories(params: GetStoriesParams = {}) {
  return getStoriesFromService(params);
}

export async function getStoryById(storyId: string) {
  return getStoryByIdFromService(storyId);
}

export async function searchStories(query: string, category?: string) {
  return searchStoriesFromService(query, category);
}
