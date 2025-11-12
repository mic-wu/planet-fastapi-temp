import type {
  PaginatedResponse,
  StoryRead,
} from "@/app/openapi-client/types.gen";

export interface StoriesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: 'image' | 'video';
}

export interface StoriesService {
  getStories(params?: StoriesQueryParams): Promise<PaginatedResponse>;
  getStoryById(storyId: string): Promise<StoryRead>;
  searchStories(query: string, category?: 'image' | 'video'): Promise<PaginatedResponse>;
}
