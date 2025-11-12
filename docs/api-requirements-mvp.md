# API Requirements for MVP Frontend

**Date**: 2025-01-27  
**Feature**: 001-airbus-style-satellite (Gallery MVP)  
**Status**: Required for MVP

## Overview

The frontend MVP requires two main API endpoints to support the Airbus-style satellite image gallery. These endpoints handle listing stories with filtering/pagination and retrieving individual story details.

## Required Endpoints

### 1. List Stories (GET `/api/stories/`)

**Purpose**: Retrieve paginated stories for the gallery grid with filtering and search capabilities.

**Query Parameters**:

- `page` (integer, optional, default: 1, minimum: 1)
  - Page number for pagination
- `limit` (integer, optional, default: 12, enum: [12, 24, 48])
  - Number of items per page
- `category` (string, optional, enum: ["optical", "radar"])
  - Filter stories by category. Frontend sends "optical" or "radar" (or omits for "all")
- `search` (string, optional)
  - Search term to filter by title, location, or description

**Response Structure** (`PaginatedStoriesResponse` - this is what the frontend expects):

```json
{
  "data": [
    {
      "story_id": "uuid-string",
      "id": "uuid-string",
      "title": "Story Title",
      "location": "Location Name" | null,
      "description": "Story description" | null,
      "thumbnail_url": "https://example.com/thumb.jpg" | null,
      "image_url": "https://example.com/image.jpg" | null,
      "category": "optical" | "radar",
      "story_metadata": {} | null,
      "user_id": "uuid-string" | null,
      "created_at": "2025-01-27T00:00:00Z",
      "updated_at": "2025-01-27T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 12,
  "has_more": true
}
```

**Response Fields**:

- `data` (array of StoryRead): Array of story objects
- `total` (integer): Total number of stories matching the filter criteria
- `page` (integer): Current page number
- `limit` (integer): Items per page
- `has_more` (boolean): Whether there are more pages available

**Expected Behavior**:

- When `category` is provided, filter stories by that category
- When `search` is provided, search across `title`, `location`, and `description` fields
- When both `category` and `search` are provided, apply both filters
- Return empty array if no stories match
- Default to page 1 and limit 12 if not specified

---

### 2. Get Single Story (GET `/api/stories/{story_id}`)

**Purpose**: Fetch full details for a single story (used for modal/details view).

**Path Parameters**:

- `story_id` (string, required)
  - UUID of the story to retrieve

**Response Structure** (`StoryRead`):

```json
{
  "story_id": "uuid-string",
  "id": "uuid-string",
  "title": "Story Title",
  "location": "Location Name" | null,
  "description": "Story description" | null,
  "thumbnail_url": "https://example.com/thumb.jpg" | null,
  "image_url": "https://example.com/image.jpg" | null,
  "category": "optical" | "radar",
  "story_metadata": {} | null,
  "user_id": "uuid-string" | null,
  "created_at": "2025-01-27T00:00:00Z",
  "updated_at": "2025-01-27T00:00:00Z"
}
```

**Response Fields**:

- `story_id` (string, UUID): Unique identifier for the story
- `id` (string, UUID): Alias for story_id (frontend uses both)
- `title` (string, required): Story title (1-80 chars recommended)
- `location` (string | null): Optional geographic location tag (≤60 chars recommended)
- `description` (string | null): Optional rich text description for modal body
- `thumbnail_url` (string | null, URL): Small preview image URL for grid display
- `image_url` (string | null, URL): Full-size image URL for modal display
- `category` (enum, required): "optical" | "radar"
- `story_metadata` (object | null): Optional metadata object for future extensions
- `user_id` (string | null): Optional user ID if stories are user-specific
- `created_at` (string, ISO 8601): Creation timestamp
- `updated_at` (string, ISO 8601): Last update timestamp

**Error Responses**:

- `404`: Story not found

---

## Story Data Model

### Required Fields (Frontend Expects)

- `story_id` / `id`: Unique identifier (UUID or Planet story ID)
- `title`: Story title
- `category`: "optical" or "radar" (REQUIRED - see mapping below)
- `thumbnail_url`: URL for thumbnail image (can be null, frontend handles placeholder)
- `image_url`: URL for full image (can be null, frontend handles placeholder)

### Optional Fields

- `location`: Geographic location tag (string, e.g., "Sahara Desert, Algeria")
- `description`: Rich text description
- `story_metadata`: Additional metadata object
- `user_id`: User association (if needed)
- `created_at` / `updated_at`: Timestamps (ISO 8601 format)

### Category Values

- `"optical"`: Optical satellite imagery
- `"radar"`: Radar satellite imagery

**Note**: The frontend currently supports filtering by "optical" and "radar". The "all" filter is handled client-side by omitting the category parameter.

---

## Data Source & Field Mapping

### Planet API / Supabase Data Structure

Based on the data ingestion script, stories are stored in Supabase (`planet_stories` table) with the following fields from Planet API:

**Planet API Fields** (`https://api.planet.com/explorer/t2/animations`):

- `id`: Story ID (e.g., "earthquake_2017-Mmm7iE6NR")
- `title`: Story title
- `author`: Author name
- `format`: Story format ("mp4" or "raw")
- `created`: Creation timestamp
- `updated`: Update timestamp
- `center`: Array `[longitude, latitude]` coordinates
- `view_link`: Generated as `https://www.planet.com/stories/{id}`

**Supabase Table Schema** (`planet_stories`):

```sql
- id (text/string)
- title (text)
- author (text)
- format (text: "mp4" | "raw")
- created (timestamp)
- updated (timestamp)
- center_long (numeric)
- center_lat (numeric)
- view_link (text)
```

### Field Mapping: Supabase → Frontend API Response

The backend API must transform Supabase data to match frontend expectations:

| Frontend Field | Source | Transformation Logic |
|----------------|--------|---------------------|
| `story_id` | `id` | Direct mapping |
| `id` | `id` | Same as `story_id` (alias) |
| `title` | `title` | Direct mapping |
| `category` | **DERIVED** | **REQUIRED**: Map `format` → category:<br>- `format == "mp4"` → `"optical"`<br>- `format == "raw"` → `"optical"` (or determine based on story metadata)<br>- Default to `"optical"` if unknown |
| `location` | `center_long`, `center_lat` | **OPTIONAL**: Convert coordinates to location string:<br>- Use reverse geocoding API (e.g., Nominatim, Google Geocoding)<br>- Or format as "Lat, Long" string<br>- Or leave as `null` if not available |
| `description` | **NOT AVAILABLE** | Set to `null` or generate from metadata |
| `thumbnail_url` | **DERIVED** | **REQUIRED**: Generate thumbnail URL:<br>- For `format == "mp4"`: `https://storage.googleapis.com/planet-t2/{id}/movie.mp4` (use video thumbnail)<br>- For `format == "raw"`: Generate from story viewer or use placeholder<br>- Can be `null` (frontend handles placeholder) |
| `image_url` | **DERIVED** | **REQUIRED**: Generate image/video URL:<br>- For `format == "mp4"`: `https://storage.googleapis.com/planet-t2/{id}/movie.mp4`<br>- For `format == "raw"`: `https://www.planet.com/compare/?id={id}` or story viewer URL<br>- Can be `null` (frontend handles placeholder) |
| `story_metadata` | Multiple fields | **OPTIONAL**: Include additional fields:<br>```json<br>{<br>  "author": "...",<br>  "format": "mp4",<br>  "center": [long, lat],<br>  "view_link": "https://www.planet.com/stories/{id}"<br>}<br>``` |
| `user_id` | **NOT APPLICABLE** | Set to `null` (stories are public) |
| `created_at` | `created` | Map timestamp to ISO 8601 string |
| `updated_at` | `updated` | Map timestamp to ISO 8601 string |

### Critical Transformation Requirements

1. **Category Field (REQUIRED)**:
   - Planet API doesn't provide category directly
   - Must derive from `format` field or story metadata
   - Default to `"optical"` if cannot be determined
   - Consider adding category detection logic based on story content/metadata

2. **Image/Thumbnail URLs (REQUIRED)**:
   - Planet API doesn't provide direct image URLs
   - Must generate URLs based on story `id` and `format`:
     - MP4 format: `https://storage.googleapis.com/planet-t2/{id}/movie.mp4`
     - Raw format: Use Planet story viewer URL or comparison tool
   - Consider generating thumbnail frames for videos

3. **Location String (OPTIONAL)**:
   - Planet API provides coordinates (`center_long`, `center_lat`)
   - Frontend expects a location string (e.g., "Sahara Desert, Algeria")
   - Options:
     - Use reverse geocoding to convert coordinates → location name
     - Format as "Latitude, Longitude" string
     - Leave as `null` if geocoding unavailable

4. **Pagination**:
   - Planet API uses `limit` and `before` parameters
   - Backend must convert to `page`/`limit` pagination
   - Calculate `total`, `has_more` from Planet API response

### Example Transformation

**Input (Supabase/Planet API)**:

```json
{
  "id": "earthquake_2017-Mmm7iE6NR",
  "title": "Earthquake Aftermath",
  "author": "Planet Team",
  "format": "mp4",
  "created": "2017-09-20T10:00:00Z",
  "updated": "2017-09-20T10:00:00Z",
  "center_long": -98.5,
  "center_lat": 19.0,
  "view_link": "https://www.planet.com/stories/earthquake_2017-Mmm7iE6NR"
}
```

**Output (Frontend API Response)**:

```json
{
  "story_id": "earthquake_2017-Mmm7iE6NR",
  "id": "earthquake_2017-Mmm7iE6NR",
  "title": "Earthquake Aftermath",
  "location": "Mexico City, Mexico",  // From reverse geocoding
  "description": null,
  "thumbnail_url": "https://storage.googleapis.com/planet-t2/earthquake_2017-Mmm7iE6NR/thumbnail.jpg",
  "image_url": "https://storage.googleapis.com/planet-t2/earthquake_2017-Mmm7iE6NR/movie.mp4",
  "category": "optical",
  "story_metadata": {
    "author": "Planet Team",
    "format": "mp4",
    "center": [-98.5, 19.0],
    "view_link": "https://www.planet.com/stories/earthquake_2017-Mmm7iE6NR"
  },
  "user_id": null,
  "created_at": "2017-09-20T10:00:00Z",
  "updated_at": "2017-09-20T10:00:00Z"
}
```

---

## Frontend Integration Details

### Current Implementation

- Frontend calls these endpoints via generated OpenAPI client (`@/app/openapi-client`)
- Endpoints are called from:
  - `lib/services/stories/api.ts` - API service layer
  - `components/actions/stories-action.ts` - Server actions
- Frontend expects endpoints at `/api/stories/` and `/api/stories/{story_id}`
- **Current Status**: Frontend is using **mock data by default** (`NEXT_PUBLIC_API_MODE=mock`). Switch to `NEXT_PUBLIC_API_MODE=live` to use real API.

### How Frontend Fetches Data

The frontend uses a service abstraction layer that switches between mock and live APIs:

1. **Service Layer** (`lib/services/stories/index.ts`):
   - Checks `NEXT_PUBLIC_API_MODE` environment variable
   - Routes to either `storiesMockService` or `storiesApiService`

2. **API Service** (`lib/services/stories/api.ts`):
   - Uses OpenAPI-generated client functions
   - Calls `listStories()` for GET `/api/stories/` (note: SDK exports `listStories`, not `getStories`)
   - Calls `getStory()` for GET `/api/stories/{story_id}`
   - Builds query parameters: `{ page, limit, search, category }`

3. **Response Handling**:
   - Expects response structure: `{ data, error }`
   - Extracts `data` field which contains `PaginatedStoriesResponse` or `StoryRead`
   - Type: `PaginatedStoriesResponse` = `{ data: StoryRead[], total: number, page: number, limit: number, has_more: boolean }`

### ✅ Frontend Code Issues - FIXED

**Status**: The following issues have been fixed in the frontend code:

1. **Function Name Mismatch** - FIXED:
   - Changed import from `getStories` to `listStories` (the actual SDK export)
   - File: `lib/services/stories/api.ts`

2. **Type Name Mismatch** - FIXED:
   - Added type alias: `export type PaginatedResponse = PaginatedStoriesResponse`
   - File: `app/openapi-client/types.gen.ts`
   - **Note**: This file is auto-generated, so the alias may need to be re-added after regenerating the OpenAPI client, or consider updating all imports to use `PaginatedStoriesResponse` directly.

The frontend is now ready for backend integration once the API endpoints are implemented.

### Authentication

**Note**: Based on the current frontend code, these endpoints appear to be **public** (no authentication required for MVP). The frontend doesn't send auth tokens for story endpoints, only for user-specific endpoints like items.

If authentication is needed later, the frontend can be updated to include:

```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

---

## Testing Requirements

### List Stories Endpoint

- ✅ Returns paginated results with correct structure
- ✅ Filters by category when provided
- ✅ Searches across title, location, description when search term provided
- ✅ Combines category and search filters correctly
- ✅ Handles empty results gracefully (returns empty array)
- ✅ Respects page and limit parameters
- ✅ Calculates `has_more` correctly based on total vs. current page

### Get Story Endpoint

- ✅ Returns story with all required fields
- ✅ Returns 404 for non-existent story_id
- ✅ Handles null/optional fields correctly

---

## OpenAPI Schema Reference

A reference OpenAPI schema is available at:

- `specs/001-airbus-style-satellite/contracts/gallery.yaml`

**Note**: The contract file uses slightly different field names (camelCase vs snake_case). The frontend expects snake_case in the API response (as shown above), but the contract file uses camelCase. Please align with the frontend's expected structure (snake_case).

---

## Priority

**P0 (Critical for MVP)**:

- List Stories endpoint with pagination
- Get Story endpoint
- Category filtering ("optical", "radar")
- Search functionality

**P1 (Nice to have)**:

- Optimized search indexing
- Caching headers
- Rate limiting

---

## Backend Implementation Notes

### Data Source

- **Primary Source**: Supabase database (`planet_stories` table)
- **Data Ingestion**: Script fetches from Planet API (`https://api.planet.com/explorer/t2/animations`) and stores in Supabase
- **Database**: Supabase (PostgreSQL)

### Required Backend Logic

1. **Query Supabase**:
   - Read from `planet_stories` table
   - Support filtering by category (derived from `format` field)
   - Support search across `title` (and optionally `author`)
   - Implement pagination using `page` and `limit` parameters

2. **Transform Data**:
   - Map Supabase fields to frontend API response format (see Field Mapping table above)
   - Generate `category` from `format` field
   - Generate `thumbnail_url` and `image_url` from story `id` and `format`
   - Optionally convert coordinates to location string via reverse geocoding

3. **Pagination**:
   - Convert `page`/`limit` to SQL LIMIT/OFFSET
   - Calculate `total` count (with filters applied)
   - Calculate `has_more` boolean

4. **Search**:
   - Search across `title` field (case-insensitive)
   - Optionally search `author` field
   - Combine with category filter if provided

### Supabase Integration

The backend needs to:

- Connect to Supabase using environment variables (`SUPABASE_URL`, `SUPABASE_KEY`)
- Query `planet_stories` table
- Handle async operations (FastAPI async endpoints)
- Transform Planet API data structure to frontend API format

### Example Backend Query (Pseudocode)

```python
# GET /api/stories/
async def list_stories(
    page: int = 1,
    limit: int = 12,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    # Build Supabase query
    query = supabase.table("planet_stories").select("*")
    
    # Apply category filter (map format → category)
    if category:
        # Filter by format that maps to category
        # This requires determining format → category mapping
        pass
    
    # Apply search filter
    if search:
        query = query.ilike("title", f"%{search}%")
    
    # Apply pagination
    offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    # Execute query
    response = query.execute()
    
    # Transform to frontend format
    stories = [transform_story(row) for row in response.data]
    
    # Get total count (with filters)
    total_query = supabase.table("planet_stories").select("*", count="exact")
    # Apply same filters...
    total_response = total_query.execute()
    total = total_response.count
    
    # Return paginated response
    return {
        "data": stories,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": (page * limit) < total
    }
```

## Questions for Backend Team

1. **Category Mapping**: How should `format` field map to `category`?
   - Should all stories default to `"optical"`?
   - Is there metadata to determine radar vs optical?
   - Should we add a `category` column to Supabase table?

2. **Image URLs**:
   - How to generate `thumbnail_url` for MP4 videos? (extract frame? use placeholder?)
   - Should `image_url` point directly to Planet storage or be proxied?
   - Do we need to validate URLs exist?

3. **Location Geocoding**:
   - Should we implement reverse geocoding (coordinates → location name)?
   - Or format as "Lat, Long" string?
   - Or leave as `null` for MVP?

4. **Search**:
   - Search only `title` field, or also `author`?
   - Should search be case-sensitive?
   - Do we need full-text search indexing?

5. **Performance**:
   - Should we cache transformed stories?
   - Any rate limiting needed for Planet API calls?
   - Database indexing strategy for `title` search?

6. **Authentication**: Should story endpoints require authentication, or are they public? (Currently appears public)

---

## Related Files

- Frontend API Service: `nextjs-frontend/lib/services/stories/api.ts`
- Frontend Mock Service: `nextjs-frontend/lib/services/stories/mock.ts`
- Frontend Types: `nextjs-frontend/app/openapi-client/types.gen.ts`
- OpenAPI SDK: `nextjs-frontend/app/openapi-client/sdk.gen.ts`
- OpenAPI Contract: `specs/001-airbus-style-satellite/contracts/gallery.yaml`
- Data Model Spec: `specs/001-airbus-style-satellite/data-model.md`

## Integration Checklist

Before backend integration, ensure:

### Backend Implementation

- [ ] Backend connects to Supabase (`planet_stories` table)
- [ ] Backend implements GET `/api/stories/` with query params: `page`, `limit`, `category`, `search`
- [ ] Backend implements GET `/api/stories/{story_id}`
- [ ] Field transformation logic implemented (Supabase → Frontend format)
- [ ] Category mapping logic implemented (`format` → `category`)
- [ ] Image URL generation logic implemented (`thumbnail_url`, `image_url`)
- [ ] Pagination logic implemented (calculate `total`, `has_more`)
- [ ] Search logic implemented (filter by `title`)

### Response Format

- [ ] Response format matches `PaginatedStoriesResponse` structure exactly
- [ ] Response format matches `StoryRead` structure exactly
- [ ] Field names use snake_case (e.g., `thumbnail_url`, not `thumbnailUrl`)
- [ ] All required fields present (`story_id`, `id`, `title`, `category`, `thumbnail_url`, `image_url`)
- [ ] Timestamps in ISO 8601 format

### Frontend Configuration

- [ ] Frontend code bugs are fixed (see "Frontend Code Issues" section above)
- [ ] Environment variable `NEXT_PUBLIC_API_MODE=live` is set for production
- [ ] `API_BASE_URL` environment variable points to backend
- [ ] CORS is configured to allow frontend origin

### Testing

- [ ] Test with real Supabase data
- [ ] Test pagination (page 1, 2, etc.)
- [ ] Test category filtering ("optical", "radar")
- [ ] Test search functionality
- [ ] Test single story retrieval
- [ ] Verify image URLs are accessible
- [ ] Test empty results handling
