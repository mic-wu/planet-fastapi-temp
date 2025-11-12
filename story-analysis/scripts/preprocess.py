'''
script used to preprocess stories for the viewer-server.
- strips out frame data, leaving only frame count (my_framecount)
'''

import json

IN_FILE = 'planet_stories.json'
OUT_FILE = 'planet_stories_preprocessed.json'

with open(IN_FILE, 'r') as file:
    data = json.load(file)

for story in data:
    story["my_framecount"] = len(story["frames"])
    del story["frames"]

with open(OUT_FILE, "w") as json_file:
    json.dump(data, json_file, separators=(',', ':'))