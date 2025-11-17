#!/usr/bin/env python3
"""
DuckDB + FastAPI server for querying Planet Stories JSON data
Usage: uvicorn server:app --reload
Or: python server.py
"""

import json
import re
import duckdb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import uvicorn
import data_insert

# DATA_FILE = "data/10_stories_preprocessed.json"
DATA_FILE = "data/planet_stories_preprocessed.json"

app = FastAPI(title="Planet Stories API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global database connection
conn = None

# Filter parsing utilities


class FilterParser:
    """Parse filter string into SQL clauses"""

    @staticmethod
    def parse_filter_string(filter_str: str) -> Tuple[List[str], List[Any], str]:
        """
        Parse filter string and return (where_clauses, params, remaining_text)

        Supported filters:
        - before:<date>
        - after:<date>
        - author:"<string>"
        - desc_length:>N or desc_length:<N
        - location:<lon>,<lat>,<distance_km>
        - type:<compare/mp4>
        """
        where_clauses = []
        params = []

        if not filter_str:
            return where_clauses, params, ""

        # Pattern for special filters
        patterns = {
            'before': r'before:(\S+)',
            'after': r'after:(\S+)',
            'author': r'author:"([^"]+)"',
            'desc_length_gt': r'desc_length:>(\d+)',
            'desc_length_lt': r'desc_length:<(\d+)',
            'location': r'location:([-\d.]+),([-\d.]+),([\d.]+)',
            'type': r'type:(compare|mp4)',
        }

        text = filter_str

        # Extract before: filter
        match = re.search(patterns['before'], text)
        if match:
            date_str = match.group(1)
            where_clauses.append("created < ?")
            params.append(date_str)
            text = text.replace(match.group(0), '')

        # Extract after: filter
        match = re.search(patterns['after'], text)
        if match:
            date_str = match.group(1)
            where_clauses.append("created > ?")
            params.append(date_str)
            text = text.replace(match.group(0), '')

        # Extract author: filter
        match = re.search(patterns['author'], text)
        if match:
            author_str = match.group(1)
            where_clauses.append("author ILIKE ?")
            params.append(f'%{author_str}%')
            text = text.replace(match.group(0), '')

        # Extract desc_length:> filter
        match = re.search(patterns['desc_length_gt'], text)
        if match:
            length = int(match.group(1))
            where_clauses.append("LENGTH(COALESCE(description, '')) > ?")
            params.append(length)
            text = text.replace(match.group(0), '')

        # Extract desc_length:< filter
        match = re.search(patterns['desc_length_lt'], text)
        if match:
            length = int(match.group(1))
            where_clauses.append("LENGTH(COALESCE(description, '')) < ?")
            params.append(length)
            text = text.replace(match.group(0), '')

        # Extract location: filter
        match = re.search(patterns['location'], text)
        if match:
            lon = float(match.group(1))
            lat = float(match.group(2))
            distance_km = float(match.group(3))
            where_clauses.append("""
                ST_Distance(
                    ST_Point(?, ?),
                    ST_Point(center_lon, center_lat)
                ) / 1000 <= ?
            """)
            params.extend([lon, lat, distance_km])
            text = text.replace(match.group(0), '')

        # Extract type: filter
        match = re.search(patterns['type'], text)
        if match:
            type_val = match.group(1)
            if type_val == "compare":
                where_clauses.append("format = ?")
                params.append("raw")
            elif type_val == "mp4":
                where_clauses.append("format = ?")
                params.append("mp4")
            text = text.replace(match.group(0), '')

        # Remaining text is free-text search
        remaining_text = text.strip()

        return where_clauses, params, remaining_text

# Request models


class GeoFilter(BaseModel):
    lat: float
    lng: float
    radius: float = 50  # km


class DateFilter(BaseModel):
    start: Optional[str] = None  # ISO date string
    end: Optional[str] = None


class SearchRequest(BaseModel):
    text: Optional[str] = None  # Search in title, author, description
    geo: Optional[GeoFilter] = None  # Geographic filter
    date: Optional[DateFilter] = None  # Date range filter
    author: Optional[str] = None  # Filter by author (exact or contains)
    status: Optional[str] = None  # Filter by status
    format: Optional[str] = None  # Filter by format (mp4, raw, etc)
    public: Optional[bool] = None  # Filter by public status


@app.on_event("startup")
async def startup():
    """Load data into DuckDB on startup"""

    global conn
    print("Loading data into DuckDB...")

    conn = duckdb.connect(':memory:')

    data_insert.create_and_load_table(conn, DATA_FILE)

    conn.execute("INSTALL spatial")
    conn.execute("LOAD spatial")

    count = conn.execute("SELECT COUNT(*) FROM stories").fetchone()[0]
    print(f"✓ Loaded {count} stories into DuckDB")
    print(f"✓ Server ready at http://localhost:8000")
    print(f"✓ API docs at http://localhost:8000/docs")


@app.get("/")
async def root():
    """API info"""
    return "this is an API. go to /docs for documentation."


@app.get("/api/all")
async def get_all(limit: int = 100, offset: int = 0, filter: str = ""):
    """
    Get all stories with pagination and filtering

    Filter syntax:
    - before:<date> - stories created before date (e.g., before:2025-10-01)
    - after:<date> - stories created after date (e.g., after:2025-09-01)
    - author:"<name>" - filter by author containing name (e.g., author:"NASA")
    - desc_length:>N - description longer than N chars (e.g., desc_length:>100)
    - desc_length:<N - description shorter than N chars (e.g., desc_length:<50)
    - location:<lon>,<lat>,<distance_km> - stories within distance of location (e.g., location:-122.4,37.8,50)
    - type:<compare/mp4> - filter by story type (e.g., type:mp4 or type:compare)
    - Any remaining text searches in title, author, and description

    Example: filter=after:2025-10-01 author:"John" location:-122.4,37.8,50 type:mp4 climate
    """
    try:
        # Parse filter string
        where_clauses, params, free_text = FilterParser.parse_filter_string(
            filter)

        print(where_clauses, params, free_text)

        # Add free-text search if present
        if free_text:
            where_clauses.append(
                "(title ILIKE ? OR author ILIKE ? OR description ILIKE ?)")
            text_pattern = f'%{free_text}%'
            params.extend([text_pattern, text_pattern, text_pattern])

        # Build WHERE clause
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

        # Execute main query
        query = f"""
            SELECT id, title, author, description, created, updated,
                   center_lat, center_lon,
                   format, height, width, zoom, rate, my_framecount
            FROM stories
            WHERE {where_sql}
            ORDER BY created DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])
        result = conn.execute(query, params).fetchdf()

        # Get total count with same filters
        count_query = f"""
            SELECT COUNT(*) FROM stories
            WHERE {where_sql}
        """
        total = conn.execute(
            count_query, params[:-2]).fetchone()[0]  # exclude limit/offset

        # Get unique authors with same filters
        authors_query = f"""
            SELECT COUNT(DISTINCT author) FROM stories
            WHERE {where_sql} AND author IS NOT NULL
        """
        unique_authors = conn.execute(authors_query, params[:-2]).fetchone()[0]

        return {
            "stories": result.to_dict(orient='records'),
            "total": total,
            "unique_authors": unique_authors,
            "limit": limit,
            "offset": offset,
            "filter": filter
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Filter error: {str(e)}")


@app.get("/api/stats")
async def get_stats():
    """Get database statistics"""
    try:
        total = conn.execute("SELECT COUNT(*) FROM stories").fetchone()[0]
        authors = conn.execute(
            "SELECT COUNT(DISTINCT author) FROM stories").fetchone()[0]
        date_range = conn.execute("""
            SELECT MIN(created) as min_date, MAX(created) as max_date 
            FROM stories
        """).fetchone()

        return {
            "total_stories": total,
            "unique_authors": authors,
            "date_range": {
                "min": date_range[0],
                "max": date_range[1]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/schema")
async def get_schema():
    """Get the database schema with column types and sample data"""
    try:
        # Get column info
        schema = conn.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'stories'
            ORDER BY ordinal_position
        """).fetchdf()

        # Get row count
        count = conn.execute("SELECT COUNT(*) FROM stories").fetchone()[0]

        # Get sample row
        sample = conn.execute("SELECT * FROM stories LIMIT 1").fetchdf()

        return {
            "table_name": "stories",
            "row_count": count,
            "columns": schema.to_dict(orient='records'),
            "sample_row": sample.to_dict(orient='records')[0] if len(sample) > 0 else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search")
async def search(request: SearchRequest):
    """
    Unified search with multiple filters

    Example requests:

    1. Text only:
    {"text": "forest fire"}

    2. Text + geo:
    {"text": "deforestation", "geo": {"lat": -3.0, "lng": -60.0, "radius": 100}}

    3. Date range + author:
    {"date": {"start": "2025-01-01", "end": "2025-12-31"}, "author": "NASA"}

    4. All filters combined:
    {
        "text": "agriculture",
        "geo": {"lat": 40.0, "lng": -100.0, "radius": 200},
        "date": {"start": "2025-01-01"},
        "author": "USDA",
        "format": "mp4",
        "public": true
    }
    """
    try:
        # Build dynamic SQL query
        where_clauses = []
        params = []

        # Text search in title, author, description
        if request.text:
            where_clauses.append(
                "(title ILIKE ? OR author ILIKE ? OR description ILIKE ?)")
            text_pattern = f'%{request.text}%'
            params.extend([text_pattern, text_pattern, text_pattern])

        # Geographic filter
        geo_select = ""
        if request.geo:
            where_clauses.append("""
                ST_Distance(
                    ST_Point(?, ?),
                    ST_Point(center_lon, center_lat)
                ) / 1000 <= ?
            """)
            params.extend(
                [request.geo.lng, request.geo.lat, request.geo.radius])
            # Add distance to select for sorting
            geo_select = f""",
                ST_Distance(
                    ST_Point({request.geo.lng}, {request.geo.lat}),
                    ST_Point(center_lon, center_lat)
                ) / 1000 as distance_km
            """

        # Date range filter
        if request.date:
            if request.date.start:
                where_clauses.append("created >= ?")
                params.append(request.date.start)
            if request.date.end:
                where_clauses.append("created <= ?")
                params.append(request.date.end)

        # Author filter
        if request.author:
            where_clauses.append("author ILIKE ?")
            params.append(f'%{request.author}%')

        # Format filter
        if request.format:
            where_clauses.append("format = ?")
            params.append(request.format)

        # Public filter
        if request.public is not None:
            where_clauses.append("public = ?")
            params.append(request.public)

        # Build WHERE clause
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

        # Order by distance if geo search, otherwise by date
        order_by = "distance_km" if request.geo else "created DESC"

        # Execute query
        query = f"""
            SELECT id, title, author, description, created, updated,
                   center_lat, center_lon,
                   format, public, height, width, zoom, rate, my_framecount{geo_select}
            FROM stories
            WHERE {where_sql}
            ORDER BY {order_by}
            LIMIT 100
        """

        result = conn.execute(query, params).fetchdf()

        return {
            "count": len(result),
            "results": result.to_dict(orient='records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/story/{story_id}")
async def get_story(story_id: str):
    """Get a single story by ID"""
    try:
        result = conn.execute("""
            SELECT id, title, author, description, created, updated,
                   center_lat, center_lon,
                   format, height, width, zoom, rate, my_framecount
            FROM stories
            WHERE id = ?
        """, [story_id]).fetchdf()

        if len(result) == 0:
            raise HTTPException(status_code=404, detail="Story not found")

        return result.to_dict(orient='records')[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
