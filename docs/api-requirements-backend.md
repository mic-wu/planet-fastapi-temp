# API Requirements: Stories Endpoints

**Date**: 2025-01-27  
**Feature**: Gallery MVP + Admin Management  
**Status**: Ready for Implementation  
**Data Source**: Supabase (`planet_stories` table)

---

## Overview

This document specifies API endpoints for both:

1. **MVP Frontend Gallery** - Read-only endpoints for displaying stories
2. **Admin Management** - CRUD endpoints for managing stories in the database

Stories are stored in Supabase and fetched from the Planet API via the `fetch_stories.py` ingestion script.

**Data Flow**: `Planet API → fetch_stories.py → Supabase → FastAPI Backend → Frontend/Admin`

---

## Architecture & Responsibilities

### System Overview

The FastAPI backend serves as a **data access layer** that reads from Supabase and provides HTTP endpoints. It does NOT fetch from Planet API (that's `fetch_stories.py`'s job) and does NOT generate URLs or derive categories (that's the frontend's job).

### What the API SHOULD Do

✅ **Read from Supabase**

- Query `planet_stories` table
- Apply filters (category → format mapping, search)
- Handle pagination

✅ **Transform Response Format**

- Map Supabase fields → API response fields
- Add `story_metadata` object
- Convert timestamps to ISO 8601 strings
- Return `null` for client-generated fields

✅ **Handle Filtering Logic**

- Map `category` parameter → `format` filter for database queries
- Implement search in `title` field
- Combine filters correctly

### What the API should NOT Do

❌ **Generate URLs**

- Don't generate `thumbnail_url` or `image_url`
- Frontend generates these client-side from `format` + `id`

❌ **Derive Categories**

- Don't compute `category` from `format` for response
- Frontend derives this for display
- API only uses `category` for filtering (maps to `format`)

❌ **Fetch from Planet API**

- That's `fetch_stories.py`'s job (separate script)
- API only reads from Supabase

❌ **Do Geocoding**

- Don't convert coordinates to location strings
- Can add later, but not MVP

### Key Principle

**API = Data Access Layer**: Read from DB, apply filters, transform format, return data.  
**Frontend = Presentation Layer**: Generate URLs, derive categories, handle UI.

---

## Endpoint Categories

### MVP Endpoints (Frontend Gallery)

- ✅ **GET** `/api/stories/` - List stories (with pagination/filtering)
- ✅ **GET** `/api/stories/{story_id}` - Get single story

**Purpose**: Display stories in gallery, no database modifications.

### Admin Endpoints (Database Management)

- ✅ **POST** `/api/stories/` - Create new story
- ✅ **PUT/PATCH** `/api/stories/{story_id}` - Update existing story
- ✅ **DELETE** `/api/stories/{story_id}` - Delete story

**Purpose**: Admin interface for managing stories in database.

---

## MVP Endpoints (Frontend Gallery)

### 1. List Stories (GET `/api/stories/`)

**Purpose**: Retrieve paginated stories with filtering and search capabilities.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (minimum: 1) |
| `limit` | integer | No | 12 | Items per page (values: 12, 24, or 48) |
| `category` | string | No | null | Filter by category: `"image"` or `"video"` (maps to format) |
| `search` | string | No | null | Search term (searches in `title` field) |

#### Category → Format Mapping

When `category` parameter is provided, filter by `format` field:

- `category = "video"` → filter `format = "mp4"`
- `category = "image"` → filter `format = "raw"`
- `category = null` or omitted → no filter (show all)

#### Response Structure

```json
{
  "data": [
    {
      "story_id": "earthquake_2017-Mmm7iE6NR",
      "id": "earthquake_2017-Mmm7iE6NR",
      "title": "Earthquake Aftermath",
      "format": "mp4",
      "author": "Planet Team",
      "created_at": "2017-09-20T10:00:00Z",
      "updated_at": "2017-09-20T10:00:00Z",
      "center_long": -98.5,
      "center_lat": 19.0,
      "view_link": "https://www.planet.com/stories/earthquake_2017-Mmm7iE6NR",
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
      },
      "user_id": null
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 12,
  "has_more": true
}
```

#### Response Fields

**Top-level**:

- `data` (array): Array of story objects
- `total` (integer): Total number of stories matching filters
- `page` (integer): Current page number
- `limit` (integer): Items per page
- `has_more` (boolean): Whether more pages exist

**Story Object Fields**:

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `story_id` | string | ✅ | `id` from Supabase | Story identifier |
| `id` | string | ✅ | `id` from Supabase | Same as `story_id` (alias) |
| `title` | string | ✅ | `title` from Supabase | Story title |
| `format` | string | ✅ | `format` from Supabase | `"mp4"` or `"raw"` |
| `author` | string \| null | ✅ | `author` from Supabase | Author name |
| `created_at` | string | ✅ | `created` from Supabase | ISO 8601 timestamp |
| `updated_at` | string | ✅ | `updated` from Supabase | ISO 8601 timestamp |
| `center_long` | number \| null | ✅ | `center_long` from Supabase | Longitude coordinate |
| `center_lat` | number \| null | ✅ | `center_lat` from Supabase | Latitude coordinate |
| `view_link` | string \| null | ✅ | `view_link` from Supabase | Planet story viewer URL |
| `category` | string \| null | ✅ | **Always `null`** | Generated client-side |
| `thumbnail_url` | string \| null | ✅ | **Always `null`** | Generated client-side |
| `image_url` | string \| null | ✅ | **Always `null`** | Generated client-side |
| `location` | string \| null | ✅ | **Always `null`** | Optional, can add later |
| `description` | string \| null | ✅ | **Always `null`** | Optional, can add later |
| `story_metadata` | object \| null | ✅ | Derived | See metadata structure below |
| `user_id` | string \| null | ✅ | **Always `null`** | Not applicable |

**Story Metadata Object**:

```json
{
  "author": "Planet Team",
  "format": "mp4",
  "center": [-98.5, 19.0],
  "view_link": "https://www.planet.com/stories/{id}"
}
```

#### Expected Behavior

1. **Pagination**:
   - Calculate `offset = (page - 1) * limit`
   - Return `limit` items starting from `offset`
   - Calculate `total` count with filters applied
   - Calculate `has_more = (page * limit) < total`

2. **Category Filtering**:
   - Map `category = "video"` → filter `format = "mp4"`
   - Map `category = "image"` → filter `format = "raw"`
   - If `category` is null/omitted, return all formats

3. **Search**:
   - Search in `title` field (case-insensitive)
   - Use SQL `ILIKE` or equivalent: `title ILIKE '%{search}%'`
   - Combine with category filter if both provided

4. **Missing Fields**:
   - Return `null` for optional fields that don't exist
   - Never omit fields (always include in response)

---

### 2. Get Single Story (GET `/api/stories/{story_id}`)

**Purpose**: Fetch full details for a single story (used for modal/details view).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `story_id` | string | ✅ | Story ID (from Supabase `id` field) |

#### Response Structure

Same as single story object in List Stories response (see above).

#### Error Responses

- `404 Not Found`: Story with given `story_id` does not exist
- `422 Validation Error`: Invalid `story_id` format

---

## Admin Endpoints (Database Management)

**Note**: These endpoints are for admin/management interface, NOT for the MVP frontend gallery.

### 3. Create Story (POST `/api/stories/`)

**Purpose**: Create a new story in the database (admin function).

**Request Body**:

```json
{
  "id": "story-id-123",
  "title": "New Story Title",
  "author": "Author Name",
  "format": "mp4",
  "created": "2024-01-01T00:00:00Z",
  "updated": "2024-01-01T00:00:00Z",
  "center_long": -122.4,
  "center_lat": 37.8,
  "view_link": "https://www.planet.com/stories/story-id-123"
}
```

**Required Fields**:

- `id` (string): Story identifier
- `title` (string): Story title
- `format` (string): `"mp4"` or `"raw"`
- `created` (string): ISO 8601 timestamp
- `updated` (string): ISO 8601 timestamp

**Optional Fields**:

- `author` (string | null)
- `center_long` (number | null)
- `center_lat` (number | null)
- `view_link` (string | null)

**Response**: Same as single story object (see Get Story endpoint)

**Status Codes**:

- `201 Created`: Story created successfully
- `400 Bad Request`: Invalid request data
- `409 Conflict`: Story with same `id` already exists

---

### 4. Update Story (PUT/PATCH `/api/stories/{story_id}`)

**Purpose**: Update an existing story in the database (admin function).

**Path Parameters**:

- `story_id` (string, required): Story ID to update

**Request Body** (PUT - full update, PATCH - partial update):

```json
{
  "title": "Updated Story Title",
  "author": "Updated Author",
  "format": "raw",
  "updated": "2024-01-02T00:00:00Z",
  "center_long": -122.5,
  "center_lat": 37.9
}
```

**Response**: Updated story object (same structure as Get Story endpoint)

**Status Codes**:

- `200 OK`: Story updated successfully
- `404 Not Found`: Story not found
- `400 Bad Request`: Invalid request data

**Note**:

- PUT: Replace entire story (all fields required)
- PATCH: Update only provided fields (partial update)

---

### 5. Delete Story (DELETE `/api/stories/{story_id}`)

**Purpose**: Delete a story from the database (admin function).

**Path Parameters**:

- `story_id` (string, required): Story ID to delete

**Response**:

```json
{
  "message": "Story deleted successfully",
  "story_id": "earthquake_2017-Mmm7iE6NR"
}
```

**Status Codes**:

- `200 OK`: Story deleted successfully
- `404 Not Found`: Story not found

**Note**: This is a permanent deletion. Consider soft delete (add `deleted_at` flag) if needed.

---

## Authentication & Authorization

### MVP Endpoints (Frontend Gallery)

- **Authentication**: Public (no authentication required)
- **Authorization**: None (read-only)

### Admin Endpoints (Database Management)

- **Authentication**: Required (JWT token or API key)
- **Authorization**: Admin role required
- **Headers**: `Authorization: Bearer {token}`

**Implementation Note**: Use FastAPI dependencies to protect admin endpoints:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_admin_token(token: str = Depends(security)):
    # Verify token and check admin role
    # Raise HTTPException if invalid
    pass

@router.post("/api/stories/", dependencies=[Depends(verify_admin_token)])
async def create_story(...):
    ...
```

---

## Supabase Schema Reference

### Table: `planet_stories`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | text | No | Story ID (primary key) |
| `title` | text | No | Story title |
| `author` | text | Yes | Author name |
| `format` | text | No | Story format: `"mp4"` or `"raw"` |
| `created` | timestamp | No | Creation timestamp |
| `updated` | timestamp | No | Update timestamp |
| `center_long` | numeric | Yes | Longitude coordinate |
| `center_lat` | numeric | Yes | Latitude coordinate |
| `view_link` | text | Yes | Planet story viewer URL |

---

## Implementation Notes

### 1. Database Connection

- Use Supabase client library
- Environment variables: `SUPABASE_URL`, `SUPABASE_KEY`
- Use async/await for database queries (FastAPI async endpoints)

### 2. Query Building

**Example query structure** (pseudocode):

```python
# Build base query
query = supabase.table("planet_stories").select("*")

# Apply category filter (map to format)
if category == "video":
    query = query.eq("format", "mp4")
elif category == "image":
    query = query.eq("format", "raw")
# else: no filter

# Apply search filter
if search:
    query = query.ilike("title", f"%{search}%")

# Get total count (with filters applied)
total_query = supabase.table("planet_stories").select("*", count="exact")
# Apply same filters to total_query
total_response = total_query.execute()
total = total_response.count

# Apply pagination
offset = (page - 1) * limit
query = query.range(offset, offset + limit - 1)

# Execute query
response = query.execute()
stories = response.data
```

### 3. Response Transformation

Transform Supabase rows to API response format:

```python
def transform_story(row):
    return {
        "story_id": row["id"],
        "id": row["id"],  # Same as story_id
        "title": row["title"],
        "format": row["format"],
        "author": row.get("author"),
        "created_at": row["created"].isoformat(),  # Convert to ISO 8601 string
        "updated_at": row["updated"].isoformat(),
        "center_long": row.get("center_long"),
        "center_lat": row.get("center_lat"),
        "view_link": row.get("view_link"),
        # Client-generated fields (always null)
        "category": None,
        "thumbnail_url": None,
        "image_url": None,
        "location": None,
        "description": None,
        "user_id": None,
        # Metadata object
        "story_metadata": {
            "author": row.get("author"),
            "format": row["format"],
            "center": [row.get("center_long"), row.get("center_lat")],
            "view_link": row.get("view_link")
        } if any([row.get("author"), row.get("center_long"), row.get("view_link")]) else None
    }
```

### 4. Pagination Calculation

```python
total = total_count  # From count query
page = current_page
limit = page_limit
has_more = (page * limit) < total
```

### 5. Error Handling

- Handle database connection errors gracefully
- Return appropriate HTTP status codes
- Include error messages in response for debugging
- Validate query parameters (page >= 1, limit in [12, 24, 48])

---

## Testing Requirements

### List Stories Endpoint

- [ ] Returns paginated results with correct structure
- [ ] Filters by `category = "video"` → only `format = "mp4"` stories
- [ ] Filters by `category = "image"` → only `format = "raw"` stories
- [ ] Returns all stories when `category` is omitted
- [ ] Searches in `title` field (case-insensitive)
- [ ] Combines category and search filters correctly
- [ ] Handles empty results gracefully (returns empty array)
- [ ] Respects `page` and `limit` parameters
- [ ] Calculates `total` correctly (with filters applied)
- [ ] Calculates `has_more` correctly
- [ ] Returns `null` for optional fields that don't exist
- [ ] Converts timestamps to ISO 8601 format

### Get Story Endpoint

- [ ] Returns story with all required fields
- [ ] Returns 404 for non-existent `story_id`
- [ ] Handles null/optional fields correctly
- [ ] Returns `null` for client-generated fields

---

## Example Requests & Responses

### Example 1: List All Stories (Page 1)

**Request**:

```
GET /api/stories/?page=1&limit=12
```

**Response**:

```json
{
  "data": [
    {
      "story_id": "story-1",
      "id": "story-1",
      "title": "Example Story",
      "format": "mp4",
      "author": "Planet Team",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "center_long": -122.4,
      "center_lat": 37.8,
      "view_link": "https://www.planet.com/stories/story-1",
      "category": null,
      "thumbnail_url": null,
      "image_url": null,
      "location": null,
      "description": null,
      "story_metadata": {
        "author": "Planet Team",
        "format": "mp4",
        "center": [-122.4, 37.8],
        "view_link": "https://www.planet.com/stories/story-1"
      },
      "user_id": null
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 12,
  "has_more": true
}
```

### Example 2: Filter by Video Category

**Request**:

```
GET /api/stories/?category=video&page=1&limit=12
```

**Response**: Same structure, but only stories with `format = "mp4"`

### Example 3: Search Stories

**Request**:

```
GET /api/stories/?search=earthquake&page=1&limit=12
```

**Response**: Stories where `title` contains "earthquake" (case-insensitive)

### Example 4: Get Single Story

**Request**:

```
GET /api/stories/earthquake_2017-Mmm7iE6NR
```

**Response**: Single story object (same structure as items in `data` array)

---

## OpenAPI Schema

The frontend expects these endpoints to match the OpenAPI schema. Key points:

- Endpoints: `/api/stories/` and `/api/stories/{story_id}`
- Response format: `PaginatedStoriesResponse` for list, `StoryRead` for single
- Field names: Use snake_case (e.g., `thumbnail_url`, not `thumbnailUrl`)
- Timestamps: ISO 8601 format strings

---

## Questions & Clarifications

If you need clarification on any of the following, please ask:

1. **Supabase Connection**: Do you have access to Supabase credentials?
2. **Error Handling**: Preferred error response format?
3. **Performance**: Any caching requirements?
4. **Rate Limiting**: Should we implement rate limiting?
5. **Authentication**: Are these endpoints public or require auth?

---

## Priority

### MVP Endpoints (P0 - Critical)

**Must implement for MVP**:

- ✅ **GET** `/api/stories/` - List stories with pagination
- ✅ **GET** `/api/stories/{story_id}` - Get single story
- ✅ Category filtering (video/image → format mapping)
- ✅ Search functionality
- ✅ Return `format` field
- ✅ Return `null` for client-generated fields

### Admin Endpoints (P1 - Post-MVP)

**Can implement after MVP**:

- ⚠️ **POST** `/api/stories/` - Create story (admin)
- ⚠️ **PUT/PATCH** `/api/stories/{story_id}` - Update story (admin)
- ⚠️ **DELETE** `/api/stories/{story_id}` - Delete story (admin)
- ⚠️ Authentication/authorization for admin endpoints

**Note**: Admin endpoints are needed for the admin management interface but not required for the MVP gallery frontend.

### Nice to Have (P2)

- Optimized search indexing
- Caching headers
- Rate limiting
- Soft delete (instead of hard delete)

---

## Related Files

- Data Ingestion Script: `fastapi_backend/fetch_stories.py`
- Frontend API Service: `nextjs-frontend/lib/services/stories/api.ts`
- Frontend Types: `nextjs-frontend/app/openapi-client/types.gen.ts`
- OpenAPI Contract: `specs/001-airbus-style-satellite/contracts/gallery.yaml`

---

## Summary

### MVP Endpoints (Frontend Gallery)

**Key Points**:

1. Return Supabase data as-is (including `format` field)
2. Map `category` filter to `format` field for filtering
3. Return `null` for `category`, `thumbnail_url`, `image_url` (client-generated)
4. Include `story_metadata` object with author, format, center, view_link
5. Handle missing fields gracefully (return `null`, don't omit)
6. Convert timestamps to ISO 8601 strings
7. **No authentication required** (public endpoints)

**Remember**: The frontend will generate URLs and derive categories client-side. Your job is to return the raw data from Supabase in the correct format.

### Admin Endpoints (Database Management)

**Key Points**:

1. **Require authentication** (JWT token or API key)
2. **Require admin authorization** (check user role)
3. Validate all input data before database operations
4. Handle conflicts (e.g., duplicate `id` on create)
5. Return appropriate HTTP status codes
6. Consider soft delete vs hard delete

**Note**: Admin endpoints are for managing the database, not for the MVP gallery frontend. Can be implemented after MVP is complete.
