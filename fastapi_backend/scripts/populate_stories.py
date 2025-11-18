#!/usr/bin/env python3
"""
Script to fetch stories from Planet.com API and populate Supabase database.

Usage:
    python scripts/populate_stories.py [--limit 20]
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path so we can import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.fetch_stories import fetch_stories, store_stories


def main():
    parser = argparse.ArgumentParser(
        description="Fetch and store Planet stories in Supabase"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Number of stories to fetch (default: 20)"
    )
    args = parser.parse_args()

    print(f"🔄 Fetching {args.limit} stories from Planet.com API...")

    stories = fetch_stories(limit=args.limit)

    if stories:
        print(f"📦 Retrieved {len(stories)} stories")
        store_stories(stories)
        print("✅ Stories successfully stored in Supabase!")
    else:
        print("❌ Failed to fetch stories")
        sys.exit(1)


if __name__ == "__main__":
    main()
