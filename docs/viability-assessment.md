# Viability Assessment: Data Flow Integration

**Date**: 2025-01-27  
**Context**: Integrating Planet API → Supabase → Backend API → Frontend

## Current State Analysis

### Data Flow

```
Planet API → fetch_stories.py → Supabase (planet_stories) → Backend API → Frontend
```

### What Frontend Actually Uses

**REQUIRED Fields:**

- ✅ `id` / `story_id` - Exists in Supabase
- ✅ `title` - Exists in Supabase  
- ❌ `category` - **MISSING** (used for filtering & display)
- ❌ `thumbnail_url` - **MISSING** (for image display)
- ❌ `image_url` - **MISSING** (fallback for image)

**OPTIONAL Fields:**

- ❌ `location` - Missing (can be null for MVP)
- ❌ `description` - Missing (can be null for MVP)
- ❌ `story_metadata.resolution` - Missing (optional, for advanced filtering)
- ❌ `story_metadata.sensor` - Missing (optional, for advanced filtering)

### What Supabase Currently Stores

```python
{
  'id': str,              # ✅ Frontend needs this
  'title': str,           # ✅ Frontend needs this
  'author': str,          # Can go in story_metadata
  'format': str,          # "mp4" or "raw" - can derive category
  'created': timestamp,   # Can map to created_at
  'updated': timestamp,   # Can map to updated_at
  'center_long': float,   # Can derive location (optional)
  'center_lat': float,    # Can derive location (optional)
  'view_link': str        # Can go in story_metadata
}
```

## Viability Options

### Option 1: Transform in Backend API (Recommended ✅)

**Approach**: Keep Supabase schema as-is, transform data in FastAPI backend

**Implementation**:

- Backend reads from Supabase
- Backend derives `category` from `format` field
- Backend generates `thumbnail_url` and `image_url` from `id` + `format`
- Backend maps fields to frontend format

**Pros**:

- ✅ No changes to `fetch_stories.py` (data ingestion stays simple)
- ✅ No database migrations needed
- ✅ Frontend stays unchanged
- ✅ Single source of truth (Supabase)
- ✅ Easy to update transformation logic without touching DB
- ✅ Can add new derived fields without DB changes

**Cons**:

- ⚠️ Backend does transformation on every request (minimal overhead)
- ⚠️ URL generation logic in backend (but it's just string templating)

**Complexity**: **LOW** - Simple field mapping and URL generation

**Viability**: ✅ **HIGHLY VIABLE**

---

### Option 2: Enhance Supabase Schema

**Approach**: Modify `fetch_stories.py` to store derived fields in Supabase

**Implementation**:

- Add `category` column (derive from `format` during ingestion)
- Add `thumbnail_url` column (generate during ingestion)
- Add `image_url` column (generate during ingestion)
- Update `fetch_stories.py` to populate these fields

**Pros**:

- ✅ Backend becomes simpler (just read & return)
- ✅ Better performance (no transformation per request)
- ✅ Data is pre-computed

**Cons**:

- ❌ Need database migration
- ❌ Need to update `fetch_stories.py` script
- ❌ If URL generation logic changes, need to re-run ingestion
- ❌ More complex ingestion script
- ❌ Storing URLs that could be generated (data duplication)

**Complexity**: **MEDIUM** - Requires DB migration + script updates

**Viability**: ⚠️ **VIABLE BUT NOT RECOMMENDED** (over-engineering for MVP)

---

### Option 3: Modify Frontend to Match Supabase

**Approach**: Change frontend to work with Supabase structure directly

**Implementation**:

- Frontend accepts `format` instead of `category`
- Frontend generates image URLs client-side
- Frontend handles missing fields gracefully

**Pros**:

- ✅ Minimal backend work (just proxy Supabase)
- ✅ No transformation needed

**Cons**:

- ❌ Frontend loses category filtering (would need to filter by `format` instead)
- ❌ Frontend needs URL generation logic (should be backend concern)
- ❌ Breaks existing frontend design
- ❌ More complex frontend code

**Complexity**: **HIGH** - Significant frontend refactoring

**Viability**: ❌ **NOT VIABLE** (breaks too much existing code)

---

## Recommended Approach: Option 1 (Backend Transformation)

### Why This Is Best

1. **Minimal Changes**: Only backend needs work, everything else stays the same
2. **Separation of Concerns**:
   - Data ingestion (`fetch_stories.py`) stays simple
   - Backend handles business logic (transformation)
   - Frontend stays clean
3. **Flexibility**: Easy to change transformation logic without DB migrations
4. **MVP-Friendly**: Fastest path to working integration

### Implementation Complexity

**Backend Transformation Logic** (Simple):

```python
def transform_story(supabase_row):
    story_id = supabase_row['id']
    format = supabase_row['format']
    
    # Derive category (simple mapping)
    category = "optical"  # Default, or derive from format/metadata
    
    # Generate URLs (simple string templating)
    if format == "mp4":
        thumbnail_url = f"https://storage.googleapis.com/planet-t2/{story_id}/thumbnail.jpg"
        image_url = f"https://storage.googleapis.com/planet-t2/{story_id}/movie.mp4"
    elif format == "raw":
        thumbnail_url = None  # Frontend handles placeholder
        image_url = f"https://www.planet.com/compare/?id={story_id}"
    else:
        thumbnail_url = None
        image_url = None
    
    return {
        "story_id": story_id,
        "id": story_id,
        "title": supabase_row['title'],
        "category": category,
        "thumbnail_url": thumbnail_url,
        "image_url": image_url,
        "location": None,  # Can add reverse geocoding later
        "description": None,  # Can add later
        "story_metadata": {
            "author": supabase_row.get('author'),
            "format": format,
            "center": [supabase_row.get('center_long'), supabase_row.get('center_lat')],
            "view_link": supabase_row.get('view_link')
        },
        "user_id": None,
        "created_at": supabase_row['created'].isoformat(),
        "updated_at": supabase_row['updated'].isoformat()
    }
```

**Complexity**: ~50 lines of transformation code

### Performance Impact

- **Transformation overhead**: ~1-2ms per story (negligible)
- **Database queries**: Same (no change)
- **Network**: Same (no change)

**Verdict**: Performance impact is negligible for MVP scale.

---

## Risk Assessment

### Low Risk ✅

- Field mapping is straightforward
- URL generation is deterministic (no external API calls)
- Frontend already handles null/optional fields gracefully

### Medium Risk ⚠️

- **Category derivation**: Currently all stories default to "optical". If radar stories exist, need detection logic.
  - **Mitigation**: Can add `category` detection later, default to "optical" for MVP
- **Image URL validation**: Generated URLs might not always exist
  - **Mitigation**: Frontend already handles broken images with placeholder

### High Risk ❌

- None identified

---

## Recommendation

**✅ PROCEED with Option 1 (Backend Transformation)**

**Rationale**:

1. Fastest path to working MVP
2. Minimal code changes
3. Easy to iterate and improve
4. Maintains clean separation of concerns
5. No database migrations needed
6. Frontend stays unchanged

**Next Steps**:

1. Implement backend transformation function
2. Create FastAPI endpoints that query Supabase
3. Transform data before returning to frontend
4. Test with real Supabase data
5. Iterate on category detection if needed

**Estimated Effort**: 2-4 hours for backend implementation

---

## Alternative: Hybrid Approach (If Needed Later)

If performance becomes an issue or we want to pre-compute some fields:

1. **Keep simple fields in Supabase** (id, title, format, etc.)
2. **Add `category` column** (derived during ingestion - simple)
3. **Generate URLs in backend** (keep dynamic - allows URL changes)

This gives us:

- ✅ Pre-computed category (faster filtering)
- ✅ Dynamic URLs (flexible)
- ✅ Still simple ingestion script

But for MVP, Option 1 is sufficient.
