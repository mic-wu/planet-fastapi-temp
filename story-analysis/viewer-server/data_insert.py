import duckdb
import json

TABLE_CREATE_STATEMENT = '''
    CREATE TABLE stories (
        id TEXT PRIMARY KEY,
        title TEXT,
        author TEXT,
        created TIMESTAMP,
        updated TIMESTAMP,
        center_lon DOUBLE,
        center_lat DOUBLE,
        format TEXT,
        height INTEGER,
        width INTEGER,
        description TEXT,
        rate DOUBLE,
        zoom DOUBLE,
        my_framecount INTEGER
    );
'''

TABLE_INSERT_STATEMENT = '''
    INSERT OR REPLACE INTO stories (
        id, title, author, created, updated,
        center_lon, center_lat, format, height, width,
        description, rate, zoom, my_framecount
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
'''


def create_and_load_table(conn, filename):
    conn.execute(TABLE_CREATE_STATEMENT)

    with open(filename, 'r') as f:
        stories_json = json.load(f)

    batch_insert_rows = []

    for story in stories_json:
        center_lon, center_lat = (None, None)
        if "center" in story and isinstance(story["center"], (list, tuple)) and len(story["center"]) == 2:
            center_lon, center_lat = story["center"]

        batch_insert_rows.append((
            story.get("id"),
            story.get("title"),
            story.get("author"),
            story.get("created"),
            story.get("updated"),
            center_lon,
            center_lat,
            story.get("format"),
            story.get("height"),
            story.get("width"),
            story.get("description"),
            story.get("rate"),
            story.get("zoom"),
            story.get("my_framecount")
        ))

    conn.executemany(TABLE_INSERT_STATEMENT, batch_insert_rows)
