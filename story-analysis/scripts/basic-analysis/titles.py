'''
basic analysis of story titles - filters stories into english/ not english, and 
dumps to text file.
- "english detection" is based on length and space/char ratio.
'''

import json
import matplotlib.pyplot as plt

INPUT_FILE = "planet_stories.json"
OUT_ALL = "out/all.txt"
OUT_ENG = "out/eng.txt"
OUT_NUM = "out/num.txt"


def load_data():
    """Load the scraped stories data."""
    with open(INPUT_FILE, 'r') as f:
        return json.load(f)

stories_raw = load_data()

def naive_lang_detect(st):
    if len(st) < 5: return False

    char_ratio = sum(c.isalpha() for c in st) / len(st)
    if (char_ratio < 0.44): return False

    return True

all_titles = [story.get('title', '') for story in stories_raw]
eng_titles = [t for t in all_titles if naive_lang_detect(t)]
num_titles = [t for t in all_titles if not naive_lang_detect(t)]

with open(OUT_ALL, 'w') as f:
    f.write('\n'.join(all_titles))
with open(OUT_ENG, 'w') as f:
    f.write('\n'.join(eng_titles))
with open(OUT_NUM, 'w') as f:
    f.write('\n'.join(num_titles))


print(len(all_titles))
print(len(eng_titles))
print(len(num_titles))