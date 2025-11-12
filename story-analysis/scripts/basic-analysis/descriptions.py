'''
reads stories and writes story url + descriptions to a text file.
'''

import json
import matplotlib.pyplot as plt

INPUT_FILE = "planet_stories.json"
OUT_ALL = "out/all_desc.txt"


def load_data():
    """Load the scraped stories data."""
    with open(INPUT_FILE, 'r') as f:
        return json.load(f)


stories_raw = load_data()

all_descs = [story for story in stories_raw if story.get(
    'description', '').strip() != '']

formatted = [
    f'{("https://www.planet.com/stories/"+story.get("id")).rjust(100)}: {repr(story.get("description"))}' for story in all_descs
]

with open(OUT_ALL, 'w') as f:
    f.write('\n'.join(formatted))


print(len(formatted))
print(max(len(story.get("id")) for story in all_descs))
