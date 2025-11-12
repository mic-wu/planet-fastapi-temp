# Implementation Plan: Image/Video Format Approach

**Date**: 2025-01-27  
**Approach**: Use format directly, change category filter to "Image/Video"

## Overview

Change the frontend to use "Image/Video" instead of "Optical/Radar" to match actual data:

- `format === "mp4"` → `category = "video"`
- `format === "raw"` → `category = "image"`

## Mapping Strategy

### Format → Category Mapping

```typescript
format: "mp4" → category: "video"
format: "raw" → category: "image"
```

### Category → Format Filter Mapping (Backend)

```typescript
category: "video" → filter format = "mp4"
category: "image" → filter format = "raw"
category: null/"all" → no filter (show all)
```

## Changes Required

### 1. Frontend Filter UI

**File**: `nextjs-frontend/components/gallery/story-filters.tsx`

Change filter tabs:

- "All" → "All" (no change)
- "Optical" → "Image"
- "Radar" → "Video"

### 2. Frontend Category Derivation

**New utility**: `nextjs-frontend/lib/utils/storyFormat.ts`

```typescript
export function formatToCategory(format: string | null | undefined): 'image' | 'video' {
  if (format === 'mp4') {
    return 'video';
  }
  if (format === 'raw') {
    return 'image';
  }
  // Default fallback
  return 'image';
}

export function categoryToFormat(category: string | null): string | null {
  if (category === 'video') {
    return 'mp4';
  }
  if (category === 'image') {
    return 'raw';
  }
  return null; // "all" or null = no filter
}
```

### 3. Frontend URL Generation

**New utility**: `nextjs-frontend/lib/utils/storyUrls.ts`

```typescript
export function generateStoryUrls(storyId: string, format: string): {
  thumbnail_url: string | null;
  image_url: string | null;
} {
  if (format === 'mp4') {
    return {
      // Try thumbnail first, fallback to video
      thumbnail_url: `https://storage.googleapis.com/planet-t2/${storyId}/thumbnail.jpg`,
      image_url: `https://storage.googleapis.com/planet-t2/${storyId}/movie.mp4`,
    };
  } else if (format === 'raw') {
    return {
      thumbnail_url: null, // No thumbnail for raw format
      image_url: `https://www.planet.com/compare/?id=${storyId}`,
    };
  }
  
  // Unknown format
  return {
    thumbnail_url: null,
    image_url: null,
  };
}
```

### 4. Frontend Story Enrichment

**Update**: `nextjs-frontend/lib/services/stories/api.ts`

Add enrichment function to transform API response:

```typescript
import { formatToCategory, generateStoryUrls } from '@/lib/utils/storyFormat';

function enrichStory(story: StoryFromAPI): StoryRead {
  const category = formatToCategory(story.format);
  const urls = generateStoryUrls(story.id, story.format);
  
  return {
    ...story,
    category,
    thumbnail_url: urls.thumbnail_url,
    image_url: urls.image_url,
  };
}
```

### 5. Backend API Response

**Backend should return**:

```json
{
  "story_id": "earthquake_2017-Mmm7iE6NR",
  "id": "earthquake_2017-Mmm7iE6NR",
  "title": "Earthquake Aftermath",
  "format": "mp4",  // ← Include format field
  "author": "Planet Team",
  "created_at": "2017-09-20T10:00:00Z",
  "updated_at": "2017-09-20T10:00:00Z",
  "center_long": -98.5,
  "center_lat": 19.0,
  "view_link": "https://www.planet.com/stories/earthquake_2017-Mmm7iE6NR",
  // These are null from API, generated client-side:
  "category": null,
  "thumbnail_url": null,
  "image_url": null,
  "location": null,
  "description": null,
  "story_metadata": {
    "author": "Planet Team",
    "format": "mp4",
    "center": [-98.5, 19.0],
    "view_link": "https://www.planet.com/stories/earthquake_2017-Mmm7iE6NR"
  }
}
```

### 6. Backend Filtering Logic

**Backend should map category → format**:

```python
# When frontend sends category filter
if category == "video":
    # Filter by format = "mp4"
    query = query.eq("format", "mp4")
elif category == "image":
    # Filter by format = "raw"
    query = query.eq("format", "raw")
# else: no filter (show all)
```

## Implementation Checklist

### Frontend Changes

- [ ] Update `story-filters.tsx`: Change "Optical/Radar" → "Image/Video"
- [ ] Create `lib/utils/storyFormat.ts`: Format ↔ Category mapping
- [ ] Create `lib/utils/storyUrls.ts`: URL generation utility
- [ ] Update `lib/services/stories/api.ts`: Add story enrichment
- [ ] Update type definitions: Make `format` required, `category` optional/computed
- [ ] Update mock data: Change categories to "image"/"video"
- [ ] Test filtering works correctly

### Backend Changes

- [ ] Update API to return `format` field from Supabase
- [ ] Implement category → format mapping for filtering
- [ ] Return `null` for `category`, `thumbnail_url`, `image_url` (client-generated)
- [ ] Handle missing fields gracefully
- [ ] Update OpenAPI schema to include `format` field

### Testing

- [ ] Test filter by "Image" shows only raw format stories
- [ ] Test filter by "Video" shows only mp4 format stories
- [ ] Test filter by "All" shows all stories
- [ ] Test URL generation for both formats
- [ ] Test image display with generated URLs
- [ ] Test with real Supabase data

## File Changes Summary

### New Files

- `nextjs-frontend/lib/utils/storyFormat.ts` - Format/category mapping
- `nextjs-frontend/lib/utils/storyUrls.ts` - URL generation

### Modified Files

- `nextjs-frontend/components/gallery/story-filters.tsx` - Update filter labels
- `nextjs-frontend/lib/services/stories/api.ts` - Add enrichment
- `nextjs-frontend/lib/mocks/stories.ts` - Update mock categories
- Backend API routes - Add format field, implement filtering

## Benefits

1. ✅ Matches actual data structure (format field)
2. ✅ More accurate labels ("Image/Video" vs "Optical/Radar")
3. ✅ Client-side URL generation (flexible)
4. ✅ Backend stays simple (pass-through with filtering)
5. ✅ Easy to extend (can add more formats later)
