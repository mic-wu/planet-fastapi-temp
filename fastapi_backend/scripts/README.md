# Data Ingestion Scripts

Scripts for populating and managing data in Supabase.

## `populate_stories.py`

Fetches stories from Planet.com API and stores them in Supabase.

### Usage

```bash
# Fetch default 20 stories
python scripts/populate_stories.py

# Fetch custom amount
python scripts/populate_stories.py --limit 50

# Make executable and run directly
chmod +x scripts/populate_stories.py
./scripts/populate_stories.py --limit 10
```

### When to Run

- **Initial setup**: Populate database with stories
- **Development**: Refresh data periodically
- **Production**: Run as a cron job or scheduled task

### Production Scheduling Options

**Option 1: Vercel Cron Jobs** (Recommended if on Vercel)
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/update-stories",
    "schedule": "0 0 * * *"  // Daily at midnight
  }]
}
```

**Option 2: GitHub Actions** (Free, runs anywhere)
```yaml
# .github/workflows/update-stories.yml
name: Update Stories
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements.txt
      - run: python scripts/populate_stories.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

**Option 3: Local Cron** (Development/Self-hosted)
```bash
# Add to crontab
crontab -e

# Run daily at midnight
0 0 * * * cd /path/to/fastapi_backend && .venv/bin/python scripts/populate_stories.py
```

## Future Scripts

- `scripts/cleanup_old_stories.py` - Remove old/stale stories
- `scripts/validate_data.py` - Check data integrity
- `scripts/migrate_data.py` - Data migrations
