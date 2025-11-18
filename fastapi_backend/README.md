# Planet Story Explorer - Backend API

FastAPI backend for exploring Planet satellite imagery stories with AI chatbot assistance.

## Features

- **Stories API**: Fetch and browse satellite imagery stories from Planet.com
- **FastMCP Chatbot**: AI-powered chatbot for app assistance
- **Supabase Integration**: Direct Supabase client for data storage

## Tech Stack

- **FastAPI**: Modern Python web framework
- **Supabase**: PostgreSQL database and storage
- **FastMCP**: MCP protocol for chatbot tools
- **Vercel**: Edge deployment

## Quick Start

### Prerequisites

- Python 3.10+
- Supabase account

### Installation

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Environment Variables

Create a `.env` file with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### Database Setup

Create the `planet_stories` table in your Supabase database:

```sql
CREATE TABLE planet_stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  format TEXT NOT NULL,
  created TIMESTAMPTZ NOT NULL,
  updated TIMESTAMPTZ NOT NULL,
  center_long TEXT,
  center_lat TEXT,
  view_link TEXT
);
```

### Populate Database

Before starting the API, populate your database with stories:

```bash
# Fetch and store 20 stories from Planet.com
python scripts/populate_stories.py

# Or specify a custom amount
python scripts/populate_stories.py --limit 50
```

### Run Development Server

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`

- Interactive docs: `http://localhost:8000/docs`
- OpenAPI spec: `http://localhost:8000/openapi.json`

## API Endpoints

### Stories
- `GET /api/v1/stories` - List stories (paginated, filterable)
- `GET /api/v1/stories/{id}` - Get single story

### Chatbot
- `POST /api/v1/chatbot/chat` - Send chat message
- `GET /api/v1/chatbot/health` - Health check

### System
- `GET /` - API info
- `GET /health` - Health check

## Project Structure

```
fastapi_backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app & routes
│   ├── config.py            # Settings
│   ├── schemas.py           # Pydantic models
│   ├── fetch_stories.py     # Planet API client
│   ├── mcp_server.py        # FastMCP tools
│   └── routes/
│       ├── stories.py       # Stories endpoints
│       └── chatbot.py       # Chatbot endpoints
├── scripts/
│   ├── populate_stories.py  # Data ingestion script
│   └── README.md            # Scripts documentation
├── api/
│   └── index.py             # Vercel entry point
├── requirements.txt
├── .env.example
└── README.md
```

## Deployment

Configured for Vercel Edge:

```bash
vercel deploy
```

## Data Management

### Populating Stories

The API serves data from Supabase. To populate/refresh stories:

```bash
# Development: Run the script manually
python scripts/populate_stories.py --limit 20

# Production: Set up automated updates (see scripts/README.md)
# - Vercel Cron Jobs
# - GitHub Actions
# - External cron service
```

See [scripts/README.md](scripts/README.md) for scheduling options.
