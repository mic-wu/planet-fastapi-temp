# Frontend Format-Based Approach: Analysis & Recommendations

**Date**: 2025-01-27  
**Approach**: Frontend accepts `format` instead of `category`, generates URLs client-side

## Current State

### Data Flow

```
Planet API → fetch_stories.py → Supabase → Backend API → Frontend
```

### Supabase Schema (from fetch_stories.py)

```python
{
  'id': str,
  'title': str,
  'author': str,
  'format': str,  # "mp4" or "raw"
  'created': timestamp,
  'updated': timestamp,
  'center_long': float,
  'center_lat': float,
  'view_link': str  # "https://www.planet.com/stories/{id}"
}
```

### URL Generation Logic (from commented code)

```python
# MP4 format:
embed_link = f"https://storage.googleapis.com/planet-t2/{story_id}/movie.mp4"

# Raw format:
embed_link = f"https://www.planet.com/compare/?id={story_id}"
```

---

## Approach Analysis

### ✅ What Works Well

1. **Keep fetch_stories.py unchanged** - Simple, clean data ingestion
2. **Client-side URL generation** - Flexible, no backend transformation needed
3. **API handles missing fields** - Graceful degradation

### ⚠️ Considerations

1. **Category vs Format**: Frontend currently filters by "optical"/"radar", but Supabase has "mp4"/"raw"
2. **URL Generation**: Need to determine `thumbnail_url` vs `image_url` usage
3. **Filtering Logic**: Backend needs to filter by `format` if frontend sends category filter

---

## Recommended Implementation Strategy

### Option A: Map Format → Category (Recommended ✅)

**Approach**: Frontend still uses `category` for filtering, but derives it from `format`

**How it works**:

- Backend returns `format` field from Supabase
- Frontend derives `category` from `format`:
  - `format === "mp4"` → `category = "optical"` (default)
  - `format === "raw"` → `category = "optical"` (default, or could be "radar" if determined)
- Frontend generates URLs from `format` + `id`

**Pros**:

- ✅ Minimal frontend changes (just add URL generation utility)
- ✅ Keeps existing category filtering UI
- ✅ Backend stays simple (just pass through `format`)
- ✅ Can evolve category detection later

**Cons**:

- ⚠️ Need format → category mapping logic in frontend
- ⚠️ If radar stories exist, need detection logic

**Complexity**: LOW

---

### Option B: Use Format Directly (Alternative)

**Approach**: Change frontend to filter by `format` instead of `category`

**How it works**:

- Change filter tabs from "All/Optical/Radar" to "All/MP4/Raw"
- Backend filters by `format` field
- Frontend displays `format` in badge

**Pros**:

- ✅ No mapping needed
- ✅ Direct use of data

**Cons**-:

- ❌ Less user-friendly ("MP4" vs "Optical")
- ❌ More frontend refactoring (filter UI, badge display)
- ❌ Breaks existing design (category concept)

**Complexity**: MEDIUM

---

## Recommended: Option A (Format → Category Mapping)

### Implementation Plan

#### 1. Backend API (Minimal Changes)

**What Backend Returns**:

```json
{
  "story_id": "earthquake_2017-Mmm7iE6NR",
  "id": "earthquake_2017-Mmm7iE6NR",
  "title": "Earthquake Aftermath",
  "format": "mp4",  // ← Add this field
  "author": "Planet Team",
  "created_at": "2017-09-20T10:00:00Z",
  "updated_at": "2017-09-20T10:00:00Z",
  "center_long": -98.5,
  "center_lat": 19.0,
  "view_link": "https://www.planet.com/stories/earthquake_2017-Mmm7iE6NR",
  // Optional fields (can be null):
  "location": null,
  "description": null,
  "thumbnail_url": null,  // Generated client-side
  "image_url": null,       // Generated client-side
  "category": null,        // Generated client-side
  "story_metadata": {
    "author": "Planet Team",
    "format": "mp4",
    "center": [-98.5, 19.0],
    "view_link": "https://www.planet.com/stories/earthquake_2017-Mmm7iE6NR"
  }
}
```

**Backend Logic**:

- Query Supabase `planet_stories` table
- Return all fields as-is (no transformation)
- Handle missing fields gracefully (return `null`)
- Filter by `format` when frontend sends `category` filter (map category → format)

#### 2. Frontend URL Generation Utility

**Create utility function** (`lib/utils/storyUrls.ts`):

```typescript
export function generateStoryUrls(storyId: string, format: string): {
  thumbnail_url: string | null;
  image_url: string | null;
} {
  if (format === 'mp4') {
    return {
      thumbnail_url: `https://storage.googleapis.com/planet-t2/${storyId}/thumbnail.jpg`, // Try thumbnail first
      image_url: `https://storage.googleapis.com/planet-t2/${storyId}/movie.mp4`, // Fallback to video
    };
  } else if (format === 'raw') {
    return {
      thumbnail_url: null, // No thumbnail for raw format
      image_url: `https://www.planet.com/compare/?id=${storyId}`, // Compare tool URL
    };
  }
  
  // Unknown format
  return {
    thumbnail_url: null,
    image_url: null,
  };
}
```

**Usage in components**:

```typescript
const urls = generateStoryUrls(story.id, story.format);
const imageSource = urls.thumbnail_url ?? urls.image_url ?? null;
```

#### 3. Frontend Category Derivation

**Create utility function** (`lib/utils/storyCategory.ts`):

```typescript
export function deriveCategory(format: string | null | undefined): 'optical' | 'radar' {
  // For MVP: all stories default to optical
  // Can enhance later with metadata-based detection
  if (!format) {
    return 'optical'; // Default
  }
  
  // MP4 videos are typically optical
  if (format === 'mp4') {
    return 'optical';
  }
  
  // Raw format could be either, default to optical for MVP
  if (format === 'raw') {
    return 'optical'; // TODO: Add detection logic if radar stories exist
  }
  
  return 'optical'; // Safe default
}
```

**Usage**:

```typescript
const category = deriveCategory(story.format);
// Use category for filtering and display
```

#### 4. Backend Filtering Logic

**When frontend sends `category` filter**:

- Map `category === "optical"` → filter by `format IN ("mp4", "raw")` (or all formats for MVP)
- Map `category === "radar"` → filter by `format === "radar"` (if exists) or return empty
- Map `category === null` → no filter (show all)

**Alternative (simpler for MVP)**:

- If `category` filter sent, ignore it (show all)
- Frontend does client-side filtering by derived category
- Backend only filters by `format` if frontend sends `format` parameter directly

---

## URL Generation Strategy

### Question: How to use the URLs?

Based on the commented code and frontend usage:

**For MP4 Format**:

- `image_url`: `https://storage.googleapis.com/planet-t2/{id}/movie.mp4` (the video file)
- `thumbnail_url`:
  - Option 1: Try `https://storage.googleapis.com/planet-t2/{id}/thumbnail.jpg` (if exists)
  - Option 2: Use video URL and let browser handle it
  - Option 3: Generate thumbnail frame server-side (future enhancement)
  - **Recommendation**: Try thumbnail.jpg, fallback to video URL

**For Raw Format**:

- `image_url`: `https://www.planet.com/compare/?id={id}` (compare tool)
- `thumbnail_url`:
  - Option 1: `null` (frontend shows placeholder)
  - Option 2: Use `view_link` as thumbnail
  - **Recommendation**: `null` (frontend handles placeholder)

**Frontend Usage Pattern**:

```typescript
const imageSource = story.thumbnail_url ?? story.image_url ?? null;
```

- Uses `thumbnail_url` if available (smaller, faster)
- Falls back to `image_url` (full content)
- Shows placeholder if both null

---

## API Response Structure Recommendation

### Minimal Backend Response

```typescript
interface StoryFromAPI {
  // Required (from Supabase)
  story_id: string;
  id: string;  // Same as story_id
  title: string;
  format: string;  // "mp4" | "raw"
  
  // Optional (from Supabase, can be null)
  author?: string | null;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
  center_long?: number | null;
  center_lat?: number | null;
  view_link?: string | null;
  
  // Generated client-side (always null from API)
  thumbnail_url?: null;
  image_url?: null;
  category?: null;
  location?: null;
  description?: null;
  
  // Metadata object
  story_metadata?: {
    author?: string;
    format?: string;
    center?: [number, number];
    view_link?: string;
  } | null;
}
```

**Why this structure?**

- Backend just passes through Supabase data
- Frontend generates what it needs
- Clear separation: backend = data, frontend = presentation

---

## Frontend Changes Required

### 1. Update Type Definitions

**Option**: Make `category`, `thumbnail_url`, `image_url` optional/computed

```typescript
interface StoryRead {
  // ... existing fields
  format: string;  // Add this
  category?: string;  // Make optional (computed)
  thumbnail_url?: string | null;  // Make optional (computed)
  image_url?: string | null;  // Make optional (computed)
}
```

### 2. Create Utility Functions

- `generateStoryUrls()` - URL generation
- `deriveCategory()` - Category derivation
- `enrichStory()` - Combine all transformations

### 3. Update Components

**StoryCard**:

```typescript
const urls = generateStoryUrls(story.id, story.format);
const category = deriveCategory(story.format);
const imageSource = urls.thumbnail_url ?? urls.image_url ?? null;

// Use imageSource and category
```

**GalleryGrid**:

```typescript
// Filter by derived category client-side
const filteredStories = stories.filter((story) => {
  const category = deriveCategory(story.format);
  if (categoryFilter && category !== categoryFilter) {
    return false;
  }
  // ... other filters
});
```

### 4. Update API Service

**Option**: Transform in service layer before returning to components

```typescript
// lib/services/stories/api.ts
function enrichStory(story: StoryFromAPI): StoryRead {
  const urls = generateStoryUrls(story.id, story.format);
  const category = deriveCategory(story.format);
  
  return {
    ...story,
    category,
    thumbnail_url: urls.thumbnail_url,
    image_url: urls.image_url,
  };
}
```

---

## Backend Filtering Strategy

### Recommended: Hybrid Approach

**Backend filters by `format` when possible**:

- If frontend sends `category` parameter:
  - Map to `format` filter (if mapping exists)
  - Or ignore and let frontend filter client-side

**For MVP (simplest)**:

- Backend ignores `category` filter
- Returns all stories
- Frontend filters client-side by derived category
- Backend only filters by `format` if explicitly sent

**Future enhancement**:

- Backend maps `category` → `format` for server-side filtering
- More efficient for large datasets

---

## Missing Fields Handling

### API Behavior

**All optional fields return `null` if not in Supabase**:

- `location`: `null` (can add reverse geocoding later)
- `description`: `null` (can add AI generation later)
- `thumbnail_url`: `null` (generated client-side)
- `image_url`: `null` (generated client-side)
- `category`: `null` (derived client-side)

**Frontend handles gracefully**:

- Already has null checks
- Shows placeholders for missing images
- Hides optional fields if null

---

## Summary & Recommendations

### ✅ Recommended Approach

1. **Backend**: Return Supabase data as-is, add `format` field
2. **Frontend**: Generate URLs and derive category client-side
3. **Filtering**: Frontend filters by derived category (client-side for MVP)
4. **URLs**:
   - MP4: `thumbnail.jpg` (try) → `movie.mp4` (fallback)
   - Raw: `compare/?id={id}` → placeholder if unavailable

### Implementation Steps

1. ✅ Update backend API to return `format` field
2. ✅ Create frontend URL generation utility
3. ✅ Create frontend category derivation utility
4. ✅ Update components to use utilities
5. ✅ Update type definitions
6. ✅ Test with real Supabase data

### Complexity Assessment

- **Backend**: LOW (just pass through data)
- **Frontend**: LOW-MEDIUM (add utility functions, update components)
- **Testing**: LOW (utilities are simple, easy to test)

### Viability: ✅ HIGHLY VIABLE

This approach:

- ✅ Keeps `fetch_stories.py` unchanged
- ✅ Minimal backend work
- ✅ Reasonable frontend changes
- ✅ Flexible and maintainable
- ✅ Easy to enhance later
