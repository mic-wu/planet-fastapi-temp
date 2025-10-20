import requests
import webbrowser

url = "https://api.planet.com/explorer/t2/animations"
params = {"limit": 5}

response = requests.get(url, params=params)
data = response.json()

stories = []

for story in data.get("data", []):
    story_info = {
        "id": story.get("id"),
        "title": story.get("title"),
        "created": story.get("created"),
        "thumbnail": story.get("thumbnail")
    }
    stories.append(story_info)

print(stories)

if stories:
    first_story = stories[0]
    story_id = first_story["id"]
    story_url = f"https://www.planet.com/stories/{story_id}"
    print(f"Opening: {story_url}")
    webbrowser.open(story_url)
else:
    print("No stories found.")