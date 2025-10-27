# Quickstart: Airbus‑style Satellite Image Gallery MVP

**Feature**: 001-airbus-style-satellite  
**Last Updated**: 2025-10-21

## Purpose

Get the satellite image gallery feature running locally in <5 minutes.

---

## Prerequisites

- Docker Desktop running (for PostgreSQL database)
- Node.js 20+ and pnpm installed
- Python 3.12+ and uv installed

---

## Setup Steps

### 1. Start the Database

```bash
cd /Users/andrewwang/Code/PlanetStoryExplorer
docker-compose up -d db
```

Verify database is running:

```bash
docker ps | grep postgres
```

### 2. Run Backend Migration

```bash
cd fastapi_backend

# Set environment variables (adjust for your local setup)
export DATABASE_URL="postgresql+asyncpg://postgres:password@localhost:5432/mydatabase"
export ACCESS_SECRET_KEY="test-secret-key"
export RESET_PASSWORD_SECRET_KEY="test-reset-key"
export VERIFICATION_SECRET_KEY="test-verification-key"

# Run migration to create stories table
uv run alembic upgrade head

# Seed database with placeholder stories
uv run python seed_stories.py
```

### 3. Start the Backend

```bash
# From fastapi_backend directory
uv run uvicorn app.main:app --reload
```

Backend should be running at `http://localhost:8000`.

Verify API:

```bash
curl http://localhost:8000/api/stories/ | jq
```

### 4. Generate TypeScript Client

```bash
cd ../nextjs-frontend

# Regenerate OpenAPI schema from backend
cd ../fastapi_backend
uv run python -m commands.generate_openapi_schema

# Copy to frontend and generate TypeScript client
cd ../nextjs-frontend
cp ../local-shared-data/openapi.json .
OPENAPI_OUTPUT_FILE=./openapi.json pnpm run generate-client
```

### 5. Start the Frontend

```bash
# From nextjs-frontend directory
pnpm install
pnpm dev
```

Frontend should be running at `http://localhost:3000`.

---

## Test the Feature

1. **Browse Gallery**:
   - Navigate to `http://localhost:3000/gallery`
   - Confirm 12 images load in a responsive grid

2. **Filter by Category**:
   - Click "Optical" tab → only optical images shown
   - Click "Radar" tab → only radar images shown
   - Click "All" → all images shown

3. **Search**:
   - Type "tokyo" in search box
   - Grid updates to show matching stories only

4. **Pagination**:
   - If more than 12 stories exist, click "Next" button
   - Confirm page 2 loads with next set of items

5. **View Modal**:
   - Click any story card
   - Modal opens with larger image and metadata
   - Press ESC or click close button to dismiss

---

## Troubleshooting

**Database connection error**:

- Ensure Docker is running: `docker ps`
- Check DATABASE_URL environment variable matches docker-compose.yml

**Migration fails**:

- Verify database is empty or run `uv run alembic downgrade base` to reset
- Check alembic_migrations/versions/ for migration files

**TypeScript errors in frontend**:

- Regenerate client: `OPENAPI_OUTPUT_FILE=./openapi.json pnpm run generate-client`
- Restart Next.js dev server

**Images not loading**:

- Check `seed_stories.py` placeholder URLs are valid
- Verify `thumbnail_url` and `image_url` fields in database

**Search/filter not working**:

- Check browser console for JavaScript errors
- Verify API endpoint returns data: `curl http://localhost:8000/api/stories/?search=tokyo`

---

## Next Steps

- Add more placeholder stories via `POST /api/stories/`
- Customize styling in `app/gallery/page.tsx` and `components/gallery/*`
- Integrate with Planet.com API for real story data
- Add tests: `pnpm test` (frontend), `uv run pytest` (backend)

---

## Useful Commands

```bash
# Backend
uv run pytest                          # Run backend tests
uv run alembic revision --autogenerate # Create new migration
uv run python -m commands.generate_openapi_schema  # Regenerate OpenAPI schema

# Frontend
pnpm test                              # Run frontend tests
pnpm lint                              # Check linting errors
pnpm run generate-client               # Regenerate TypeScript client

# Database
docker-compose up -d db                # Start database
docker-compose down                    # Stop all services
docker-compose logs db                 # View database logs
```

---

## File Locations

**Backend**:

- Models: `fastapi_backend/app/models.py`
- Routes: `fastapi_backend/app/routes/stories.py`
- Schemas: `fastapi_backend/app/schemas.py`
- Tests: `fastapi_backend/tests/routes/test_stories.py`
- Seed script: `fastapi_backend/seed_stories.py`

**Frontend**:

- Gallery page: `nextjs-frontend/app/gallery/page.tsx`
- Components: `nextjs-frontend/components/gallery/*`
- Actions: `nextjs-frontend/components/actions/stories-action.ts`
- Tests: `nextjs-frontend/__tests__/gallery.test.tsx`
- Generated client: `nextjs-frontend/app/openapi-client/*`

**Spec Documents**:

- Specification: `specs/001-airbus-style-satellite/spec.md`
- Plan: `specs/001-airbus-style-satellite/plan.md`
- Data Model: `specs/001-airbus-style-satellite/data-model.md`
- API Contract: `specs/001-airbus-style-satellite/contracts/stories-api.yaml`

