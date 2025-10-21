import type {
  PaginatedResponse,
  StoryRead,
} from "@/app/openapi-client/types.gen";

export interface StoriesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface StoriesService {
  getStories(params?: StoriesQueryParams): Promise<PaginatedResponse>;
  getStoryById(storyId: string): Promise<StoryRead>;
  searchStories(query: string, category?: string): Promise<PaginatedResponse>;
}
