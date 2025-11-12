/**
 * Utility functions for working with story formats and categories
 */

export type StoryFormat = 'mp4' | 'raw';
export type StoryCategory = 'image' | 'video';

/**
 * Convert format to category for display
 * @param format - Story format from API ("mp4" or "raw")
 * @returns Category for display ("image" or "video")
 */
export function formatToCategory(
  format: string | null | undefined,
): StoryCategory {
  if (format === 'mp4') {
    return 'video';
  }
  if (format === 'raw') {
    return 'image';
  }
  // Default fallback
  return 'image';
}

/**
 * Convert category filter to format for API queries
 * @param category - Category filter from UI ("image" or "video")
 * @returns Format string for API ("mp4" or "raw"), or null for "all"
 */
export function categoryToFormat(
  category: string | null | undefined,
): StoryFormat | null {
  if (category === 'video') {
    return 'mp4';
  }
  if (category === 'image') {
    return 'raw';
  }
  return null; // "all" or null = no filter
}

