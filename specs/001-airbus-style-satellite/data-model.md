# Data Model: Airbus‑style Satellite Image Gallery MVP

**Feature**: 001-airbus-style-satellite  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-10-21

## Purpose

Define the data entities, attributes, relationships, and validation rules for the satellite image gallery feature.

---

## Entities

### Story (Image Item)

Represents a single satellite image/story with associated metadata for gallery display.

**Attributes**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | UUID | Yes | Unique identifier | Auto-generated (primary key) |
| `story_id` | String | Yes | External/Planet API story ID | Unique, non-empty, max 255 chars |
| `title` | String | Yes | Story/image title | Non-empty, max 255 chars |
| `location` | String | No | Geographic location (e.g., "Tokyo, Japan") | Max 255 chars |
| `description` | Text | No | Detailed description of the story | Max 2000 chars |
| `thumbnail_url` | String (URL) | No | Small image URL for grid (400x300 recommended) | Valid URL format |
| `image_url` | String (URL) | No | Full-size image URL for modal (1200x800+ recommended) | Valid URL format |
| `category` | Enum | Yes | Image category | Must be one of: `optical`, `radar` |
| `story_metadata` | JSON | No | Additional metadata (resolution, satellite, coordinates, etc.) | Valid JSON object |
| `created_at` | DateTime | Yes | Timestamp when story was added | Auto-generated |
| `updated_at` | DateTime | Yes | Timestamp of last update | Auto-updated |
| `user_id` | UUID (FK) | No | Optional reference to User (for future auth) | Foreign key to User.id |

**Indexes**:

- Primary key: `id`
- Unique constraint: `story_id`
- Index on `category` (for filtering)
- Index on `created_at DESC` (for ordering)

**Example**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "story_id": "tokyo-urban-expansion-2024",
  "title": "Tokyo Urban Expansion",
  "location": "Tokyo, Japan",
  "description": "High-resolution satellite imagery showing Tokyo's urban development...",
  "thumbnail_url": "https://images.unsplash.com/photo-123/thumb.jpg",
  "image_url": "https://images.unsplash.com/photo-123/full.jpg",
  "category": "optical",
  "story_metadata": {
    "resolution": "30cm",
    "satellite": "Pléiades Neo",
    "date_captured": "2024-01-15",
    "coordinates": { "lat": 35.6762, "lng": 139.6503 }
  },
  "created_at": "2025-10-21T10:00:00Z",
  "updated_at": "2025-10-21T10:00:00Z",
  "user_id": null
}
```

---

### FilterState (Client-side only - not persisted)

Represents the current gallery view state for filtering, searching, and pagination.

**Attributes**:

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `category` | String | No | Selected category filter | `null` (shows all) |
| `search` | String | No | Search term (title/location/description) | `""` (no search) |
| `page` | Integer | Yes | Current page number | `1` |
| `limit` | Integer | Yes | Items per page | `12` |

**Validation**:

- `category`: Must be `null`, `"optical"`, or `"radar"`
- `search`: Max 255 chars
- `page`: Min 1
- `limit`: Min 1, max 100

**Example**:

```json
{
  "category": "optical",
  "search": "tokyo",
  "page": 2,
  "limit": 12
}
```

---

## Relationships

**Story → User** (Optional, for future):

- `Story.user_id` → `User.id` (nullable foreign key)
- One-to-many: One user can create many stories
- For MVP: `user_id` is `null` (no authentication)

**No other relationships in MVP scope.**

---

## State Transitions

**Story Lifecycle** (simplified for MVP):

1. **Created**: Story added to database (manual or API ingestion)
2. **Updated**: Metadata modified (title, description, etc.)
3. **Deleted**: Story removed (out of scope for MVP - no delete endpoint)

**FilterState Transitions**:

- User actions (tab click, search input, pagination) → Update FilterState → Fetch new data from API

---

## Data Access Patterns

### Read Patterns

1. **Gallery Page Load** (P1 - most common):
   - Query: `SELECT * FROM stories WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
   - Indexes used: `category`, `created_at`
   - Expected frequency: Every page load (high)

2. **Search** (P2):
   - Query: `SELECT * FROM stories WHERE (title ILIKE ? OR location ILIKE ? OR description ILIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`
   - Full-text search on title, location, description
   - Expected frequency: Moderate (user-initiated)

3. **Single Story Detail** (P2):
   - Query: `SELECT * FROM stories WHERE id = ?`
   - Indexed lookup by primary key
   - Expected frequency: When modal opens (moderate)

### Write Patterns

- **Create Story**: `INSERT INTO stories (...) VALUES (...)`
- **Update Story**: `UPDATE stories SET ... WHERE id = ?`
- MVP: No user-facing write operations (admin/ingestion only)

---

## Validation Rules

### Backend (Pydantic Schemas)

**StoryCreate**:

- `story_id`: Required, unique, non-empty string
- `title`: Required, non-empty string, max 255 chars
- `category`: Required, enum (`optical` | `radar`)
- `location`, `description`: Optional strings
- `thumbnail_url`, `image_url`: Optional, valid URL format
- `story_metadata`: Optional, valid JSON object

**StoryRead** (extends StoryCreate):

- `id`: Auto-generated UUID
- `created_at`, `updated_at`: Auto-generated timestamps
- `user_id`: Nullable UUID

### Frontend (TypeScript)

- Generated from OpenAPI schema via `openapi-ts`
- Type-safe interfaces for `Story`, `PaginatedResponse`, `FilterState`

---

## Performance Considerations

1. **Indexes**: `category` and `created_at` are indexed for fast filtering and ordering
2. **Pagination**: Offset-based pagination for MVP (simple, works well for <10K items)
3. **Search**: ILIKE queries on indexed columns; consider full-text search (PostgreSQL `ts_vector`) if performance degrades
4. **Image URLs**: Stored as strings (not blobs) to avoid database bloat; CDN/cloud storage handles images
5. **Caching**: No caching for MVP; add Redis/HTTP caching if needed post-launch

---

## Migration Strategy

1. **Initial Migration**: Create `stories` table with all columns and indexes
2. **Seed Data**: Insert 5-10 placeholder stories for MVP demo (Unsplash images)
3. **Future Migrations**: Add columns as needed (e.g., `published`, `featured`, `tags`)

---

## Next Steps

- Generate OpenAPI schema in `/contracts/`
- Create backend migration (`alembic revision --autogenerate -m "add_story_model"`)
- Seed database with placeholder data

