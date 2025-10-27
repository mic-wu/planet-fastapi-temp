# Implementation Plan: Airbus‑style Satellite Image Gallery MVP

**Branch**: `001-airbus-style-satellite` | **Date**: 2025-10-21 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-airbus-style-satellite/spec.md`

## Summary

Build an Airbus-inspired satellite image gallery MVP with responsive grid, category filtering (All/Optical/Radar), text search, pagination, and simple modal detail view. Target architecture: Next.js 15 frontend + FastAPI backend (existing stack). Leverage existing UI components (shadcn/ui) and backend patterns. Priority P1 items (browse grid + category tabs) deliver immediate value; P2 items (search, pagination, modal) enhance discoverability and exploration.

## Current Focus & Branching

- Active effort is centered on frontend experience within `nextjs-frontend` (detail views, richer filters/search, gallery UX polish).  
- Backend enhancements (e.g., Story API, migrations) are complete for this milestone and should move to a dedicated backend branch if further work is required.  
- Adopt separate feature branches per surface area (`001-frontend-gallery-enhancements`, `001-backend-stories-api`, etc.) so revisions to API layers do not block UI delivery.  
- Completed this iteration: full-screen story detail route under `/gallery/[storyId]`, modal deep-link button, client-side advanced filters (sensor + resolution), and promoted the gallery landing to `/` (with `/gallery` redirecting home).  
- Next focus: elevate the story detail page to match Airbus-grade depth (hero stats, mission narrative, insights cards, data access CTAs, related imagery rail). Requires richer metadata extraction but keeps existing visual theme.

## Story Detail Upgrade (In Progress)

- Enrich hero band with KPI stats (resolution, capture time, sensor, revisit cadence) and CTA cluster (download, briefing request, share).  
- Expand mission narrative with highlight bullet list sourced from metadata, alongside imagery insight cards summarising incident, mission data, and recommended actions.  
- Introduce a data/access panel (download/contact/license/tags) plus mission context and raw metadata archive for power users.  
- Surface related imagery via category-matched StoryCards to encourage exploration of adjacent captures.
- Upcoming frontend backlog includes: richer search affordances (highlighted matches, saved filter presets), tab-level analytics badges, and progressive image loading states for slow networks.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), Python 3.12 (backend)  
**Primary Dependencies**: Next.js 15, React 19, FastAPI, SQLAlchemy, shadcn/ui (Radix UI), TailwindCSS  
**Storage**: PostgreSQL (existing backend database)  
**Testing**: Jest + React Testing Library (frontend), pytest (backend)  
**Target Platform**: Web (responsive: mobile ≥ 390px, tablet ~768px, desktop ≥ 1280px)  
**Project Type**: Web application (Next.js frontend + FastAPI backend - monorepo structure already established)  
**Performance Goals**:

- Gallery initial load <2s on broadband
- Filter/pagination updates <1s in 95% of interactions
- Support 12-48 items per page without performance degradation  
**Constraints**:
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- Image placeholder for missing/broken URLs
- No authentication for MVP browsing  
**Scale/Scope**: MVP targets <100 stories initially; pagination supports scaling to 1000+ items

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution has no concrete principles; no violations possible. Proceeding with repository guidelines compliance:

- ✅ Feature branch follows `NNN-short-slug` pattern (`001-airbus-style-satellite`)
- ✅ Backend uses Python 3.12 + FastAPI (established stack)
- ✅ Frontend uses Next.js 15 + TypeScript (established stack)
- ✅ Tests will mirror app structure (pytest for backend, Jest for frontend)
- ✅ Type hints and linting enforced (Ruff for Python, ESLint for TypeScript)

**Re-evaluation after Phase 1**: Constitution compliance will be verified after data model and contracts are defined.

## Project Structure

### Documentation (this feature)

```
specs/001-airbus-style-satellite/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (next)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI schemas)
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks - not yet created)
```

### Source Code (repository root)

Existing monorepo structure (web application pattern):

```
fastapi_backend/
├── app/
│   ├── models.py         # [EXTEND] Add Story model
│   ├── schemas.py        # [EXTEND] Add Story schemas (Pydantic)
│   ├── routes/
│   │   └── stories.py    # [NEW] Stories API endpoints
│   └── database.py       # [REUSE] Existing DB session management
├── tests/
│   └── routes/
│       └── test_stories.py  # [NEW] Backend API tests
└── alembic_migrations/
    └── versions/
        └── [timestamp]_add_story_model.py  # [NEW] Migration

nextjs-frontend/
├── app/
│   ├── gallery/
│   │   ├── page.tsx      # [NEW] Gallery page (server component)
│   │   └── layout.tsx    # [NEW] Gallery layout
│   └── openapi-client/   # [REGENERATE] TypeScript client from OpenAPI
├── components/
│   ├── gallery/
│   │   ├── story-card.tsx       # [NEW] Individual story card
│   │   ├── story-filters.tsx    # [NEW] Search + category tabs
│   │   ├── gallery-grid.tsx     # [NEW] Grid + pagination logic
│   │   └── story-modal.tsx      # [NEW] Detail modal overlay
│   ├── actions/
│   │   └── stories-action.ts    # [NEW] Server actions for data fetching
│   └── ui/              # [REUSE] Existing shadcn/ui components
└── __tests__/
    └── gallery.test.tsx  # [NEW] Frontend component tests
```

**Structure Decision**: Leverage existing Next.js + FastAPI monorepo. Backend stories module follows established `app/routes/` pattern. Frontend gallery lives under `app/gallery/` route with feature-scoped components in `components/gallery/`. Reuse existing UI library (shadcn/ui: Card, Tabs, Input, Button, Badge) and pagination components where applicable.

## Complexity Tracking

*No constitution violations; this section is N/A.*
