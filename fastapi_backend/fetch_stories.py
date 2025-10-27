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
            created_at TEXT,
            title TEXT,
            description TEXT,
            thumbnail_url TEXT,
            story_url TEXT
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
        attributes = story.get('attributes', {})
        links = story.get('links', {})

        story_url = links.get('self', f"https://www.planet.com/stories/{story_id}")

        cursor.execute(f'''
            INSERT OR REPLACE INTO {TABLE_NAME} (id, created_at, title, description, thumbnail_url, story_url)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            story_id,
            attributes.get('createdAt'),
            attributes.get('title'),
            attributes.get('description'),
            attributes.get('thumbnail'),
            story_url
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