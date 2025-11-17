# Viewer Instructions

### Setup

Frontend:

```bash
cd story-analysis/viewer-client
pnpm i
pnpm run dev
```

Backend Data:

- obtain story json file via download or via `scrape.py`
- preprocess with `preprocess.py`
  - (this might be hooked up incorrectly right now)
- move output file into `viewer-server/data`

Backend:

```bash
cd story-analysis/viewer-server
pip install -r requirements.txt # or install yourself
python server.py
```

### Tech Stack

Frontend:

- React
  - React Virtuoso (infinite scrolling)
  - Material UI & Icons
- @tanstack/react-query
- zod

Backend:

- FastAPI
- DuckDB