import {
  buildMockPaginatedResponse,
  findMockStoryById,
} from "@/lib/mocks/stories";
import type { StoriesService } from "@/lib/services/stories/types";

export const storiesMockService: StoriesService = {
  async getStories(params = {}) {
    return buildMockPaginatedResponse(params);
  },
  async getStoryById(storyId) {
    const story = findMockStoryById(storyId);

    if (!story) {
      throw new Error(`Mock story with id "${storyId}" not found.`);
    }

    return story;
  },
  async searchStories(query, category) {
    return buildMockPaginatedResponse({
      search: query,
      category,
      page: 1,
      limit: 12,
    });
  },
};
