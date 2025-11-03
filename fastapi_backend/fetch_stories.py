import requests
import sqlite3
import json

API_URL = "https://api.planet.com/explorer/t2/animations"
DATABASE_NAME = "planet_stories.db"
TABLE_NAME = "stories"

def fetch_stories(limit=10):
    params = {'limit': limit}
    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status() 

        return response.json().get('data', [])
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")

        return None

def setup_database():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()
    cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            id TEXT PRIMARY KEY,
            title TEXT,
            author TEXT,
            format TEXT,
            created TEXT, 
            updated TEXT,  
            center_long REAL,
            center_lat REAL,
            embed_link TEXT,
            view_link TEXT
        )
    ''')
    conn.commit()
    conn.close()

def store_stories(stories):
    if not stories:
        return

    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    for story in stories:
        story_id = story.get('id')
        title = story.get('title')
        author = story.get('author')
        format = story.get('format')
        created = story.get('created')
        updated = story.get('updated')

        # Split center into latitude and longitude
        center = story.get('center', ['None', 'None'])
        center_long = center[0] if center and len(center) > 0 else None
        center_lat = center[1] if center and len(center) > 1 else None

        # Get embed link
        if (format == 'mp4'):
            embed_link = f"https://storage.googleapis.com/planet-t2/{story_id}/movie.mp4"
        elif (format == 'raw'):
            embed_link = f"https://www.planet.com/compare/?id={story_id}"

        # View story
        view_link = f"https://www.planet.com/stories/{story_id}"

        cursor.execute(f'''
            INSERT OR REPLACE INTO {TABLE_NAME} (id, title, author, format, created, updated, center_long, center_lat, embed_link, view_link)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            story_id,
            title,
            author,
            format,
            created,
            updated,
            center_long,
            center_lat,
            embed_link,
            view_link
        ))

    conn.commit()
    conn.close()
    print(f"Successfully stored {len(stories)} stories in the database.")

if __name__ == "__main__":
    # 1. Set up the database and table
    setup_database()

    # 2. Fetch the latest stories from the API
    stories_to_fetch = 20
    print(f"Fetching the latest {stories_to_fetch} stories...")
    latest_stories = fetch_stories(limit=stories_to_fetch)

    # 3. Store the fetched stories in the database
    if latest_stories:
        store_stories(latest_stories)