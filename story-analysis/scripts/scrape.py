'''
scrapes the planet stories public api for stories, and writes results to a json file.
'''

import requests
import json
import time

# Configuration
API_URL = "https://api.planet.com/explorer/t2/animations"
OUTPUT_FILE = "planet_stories.json"
LIMIT = 250
REQUEST_DELAY = 0.1  # seconds between requests
OWN_FILTER = False  # set to True to get only your own stories

def fetch_page(cursor=None):
    """Fetch a single page of stories from the API."""
    params = {"own": str(OWN_FILTER).lower(), "limit": LIMIT}
    if cursor:
        params["before"] = cursor
    
    headers = {
        "accept": "application/json",
    }
    
    response = requests.get(API_URL, params=params, headers=headers)
    response.raise_for_status()
    return response.json()

def scrape_all_stories():
    """Scrape all stories from the API, handling pagination."""
    all_stories = []
    cursor = None
    page_count = 0
    
    print("Starting to scrape Planet Stories...")
    
    while True:
        page_count += 1
        print(f"Fetching page {page_count}{'with cursor: ' + cursor if cursor else ''}...")
        
        try:
            data = fetch_page(cursor)
            stories = data.get("data", [])
            more = data.get("more", False)
            
            all_stories.extend(stories)
            print(f"  Retrieved {len(stories)} stories (total: {len(all_stories)})")
            
            if not more or not stories:
                print("No more pages to fetch.")
                break
            
            # Get cursor from last story (assuming it has an ID field)
            # Adjust this based on actual response structure
            if stories:
                cursor = stories[-1].get("id") or stories[-1].get("name")
            
            if not cursor:
                print("Warning: Could not find cursor for next page")
                break
            
            time.sleep(REQUEST_DELAY)
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching page: {e}")
            break
    
    return all_stories

def main():
    stories = scrape_all_stories()
    
    print(f"\nSaving {len(stories)} stories to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w") as f:
        json.dump(stories, f, indent=2)
    
    print("Done!")

if __name__ == "__main__":
    main()