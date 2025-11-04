import requests 
from supabase import create_client, Client

SUPABASE_URL = "https://jypkhidwfvsuznfgkwfk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cGtoaWR3ZnZzdXpuZmdrd2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDQ2ODgsImV4cCI6MjA3Nzc4MDY4OH0.jg8do5MLqjggYHgEX9m7yKwPB0YgOavSvk9sXQ9G1fA"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

API_URL = "https://api.planet.com/explorer/t2/animations"
TABLE_NAME = "planet_stories"

def fetch_stories(limit=10):
    params = {'limit': limit}
    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status() 

        return response.json().get('data', [])
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from API: {e}")

        return None

def store_stories(stories):
    if not stories:
        return
    
    stories_insert = []

    for story in stories:
        # Get id and format for embed link
        story_id = story.get('id') 
        format = story.get('format') 
        center = story.get('center', ['None', 'None']) # Get center

        # Get embed link
        embed_link = None
        if (format == 'mp4'):
            embed_link = f"https://storage.googleapis.com/planet-t2/{story_id}/movie.mp4"
        elif (format == 'raw'):
            embed_link = f"https://www.planet.com/compare/?id={story_id}"

        story_data = {
            'id': story_id,
            'title': story.get('title'),
            'author': story.get('author'),
            'format': format,
            'created': story.get('created'),
            'updated': story.get('updated'),
            'center_long': center[0] if center and len(center) > 0 else None,
            'center_lat': center[1] if center and len(center) > 1 else None,
            'embed_link': embed_link,
            'view_link': f"https://www.planet.com/stories/{story_id}"
        }

        stories_insert.append(story_data)
    
    try:
        data, count = supabase.table(TABLE_NAME).upsert(stories_insert).execute()
        print(f"Successfully stored {len(stories)} stories in the database.")
    
    except Exception as e: 
        print(f"Error storing data in database: {e}")


if __name__ == "__main__":
    # Fetch the latest stories from the API
    stories_to_fetch = 20
    print(f"Fetching the latest {stories_to_fetch} stories...")
    latest_stories = fetch_stories(limit=stories_to_fetch)

    # Store the fetched stories in the database
    if latest_stories:
        store_stories(latest_stories)