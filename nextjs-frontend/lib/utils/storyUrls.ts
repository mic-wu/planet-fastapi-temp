/**
 * Utility functions for generating story image/video URLs
 */

import type { StoryFormat } from './storyFormat';

export type StoryUrls = {
  thumbnail_url: string | null;
  image_url: string | null;
};

/**
 * Generate thumbnail and image URLs based on story ID and format
 * Based on the logic from fetch_stories.py commented code
 *
 * @param storyId - Story ID from API
 * @param format - Story format ("mp4" or "raw")
 * @returns Object with thumbnail_url and image_url
 */
export function generateStoryUrls(
  storyId: string,
  format: StoryFormat,
): StoryUrls {
  if (format === 'mp4') {
    return {
      // Try thumbnail first, fallback to video
      thumbnail_url: `https://storage.googleapis.com/planet-t2/${storyId}/thumbnail.jpg`,
      image_url: `https://storage.googleapis.com/planet-t2/${storyId}/movie.mp4`,
    };
  } else if (format === 'raw') {
    return {
      // No thumbnail for raw format, use compare tool URL
      thumbnail_url: null,
      image_url: `https://www.planet.com/compare/?id=${storyId}`,
    };
  }

  // Unknown format
  return {
    thumbnail_url: null,
    image_url: null,
  };
}

