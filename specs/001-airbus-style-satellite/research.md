# Research: Airbus‑style Satellite Image Gallery MVP

**Feature**: 001-airbus-style-satellite  
**Phase**: 0 (Outline & Research)  
**Date**: 2025-10-21

## Purpose

Resolve technical unknowns and document technology choices, best practices, and patterns for implementing the satellite image gallery MVP.

## Research Tasks Completed

### 1. Frontend Framework & Component Strategy

**Decision**: Use Next.js 15 (App Router) with React 19 Server Components + Client Components hybrid

**Rationale**:

- Already established in the project (see `nextjs-frontend/package.json`)
- Server Components for initial data fetching (gallery page load) provide optimal performance
- Client Components for interactive elements (search, filters, pagination, modal)
- Built-in routing, image optimization, and TypeScript support

**Alternatives Considered**:

- Pure client-side React (rejected: worse SEO, slower initial load)
- Static site generation only (rejected: requires rebuild for content updates)

**Best Practices**:

- Use `next/image` for automatic image optimization and lazy loading
- Implement search/filter state with `useState` + `useCallback` to prevent re-renders
- Debounce search input (300ms) to reduce API calls
- Server Actions for data fetching (type-safe, no separate API client needed)

---

### 2. UI Component Library & Styling

**Decision**: Reuse existing shadcn/ui (Radix UI primitives) + TailwindCSS

**Rationale**:

- Already integrated in the project (`components/ui/` directory)
- Provides Card, Tabs, Input, Button, Badge components needed for gallery
- Radix UI ensures accessibility (keyboard nav, ARIA, focus management)
- TailwindCSS enables rapid responsive design with utility classes

**Alternatives Considered**:

- Material-UI (rejected: heavier bundle, different design language)
- Build from scratch (rejected: reinventing accessibility, slower)

**Best Practices**:

- Use `Card` for story items with hover states
- Use `Tabs` for category filters (All/Optical/Radar)
- Use `Input` with search icon for text search
- Implement modal with Radix `Dialog` or simple portal overlay
- Mobile-first responsive: Tailwind breakpoints `sm:`, `md:`, `lg:`

---

### 3. Backend API Design & Data Storage

**Decision**: FastAPI REST API with PostgreSQL storage, following existing backend patterns

**Rationale**:

- FastAPI already established (`fastapi_backend/app/main.py`)
- PostgreSQL database configured (`fastapi_backend/app/database.py`)
- REST over GraphQL for simplicity (CRUD operations, no complex relationships)
- SQLAlchemy ORM for type-safe database access

**API Pattern**:

- `GET /api/stories/?page=1&limit=12&search=tokyo&category=optical`
- Returns `{ data: Story[], total: number, page: number, limit: number, has_more: boolean }`
- Uses query parameters for filtering, search, pagination (standard REST pattern)

**Alternatives Considered**:

- GraphQL (rejected: overkill for simple CRUD, adds complexity)
- Direct database access from frontend (rejected: security, no separation of concerns)

**Best Practices**:

- Use Pydantic schemas for request/response validation
- Implement pagination with offset/limit (standard pattern)
- Use SQL ILIKE for case-insensitive search (title, location, description)
- Add database indexes on `category` and `created_at` for filter performance
- Return 404 for missing stories, 400 for invalid parameters

---

### 4. Image Handling & Placeholders

**Decision**: Store URLs (thumbnail + full image), use Next.js Image component with fallback

**Rationale**:

- MVP uses placeholder images (Unsplash or similar)
- Storing URLs (not binary data) keeps database lightweight
- Next.js `<Image>` handles optimization, lazy loading, responsive sizing
- Graceful degradation with `onError` handler → placeholder image

**Best Practices**:

- Use `next/image` with `fill` prop for flexible aspect ratios
- Provide `placeholder="blur"` or skeleton while loading
- Store separate `thumbnail_url` (400x300) and `image_url` (1200x800+)
- Use `object-cover` CSS for consistent card sizing
- Fallback to `/images/placeholder.jpg` on error (no layout shift)

---

### 5. State Management & Data Fetching

**Decision**: React Server Components for initial load + Client Components with local state for interactions

**Rationale**:

- Server Components fetch initial data (12 stories on page load)
- Client Components manage filter/search/pagination state (`useState`)
- Server Actions for subsequent data fetches (type-safe, no separate API client)
- No need for Redux/Zustand for this simple use case

**Data Flow**:

1. Gallery page (Server Component) → fetch initial stories → pass to client component
2. Client component manages `{ search, category, page, limit }` state
3. State changes → call Server Action → update local state with new data

**Best Practices**:

- Use `useCallback` for filter/search handlers to prevent re-renders
- Debounce search input with `useEffect` + `setTimeout`
- Show loading spinner during filter changes
- Preserve scroll position after pagination (native browser behavior)

---

### 6. Modal Implementation

**Decision**: Client Component modal with portal overlay, triggered by card click

**Rationale**:

- Simple modal (image + metadata) doesn't require routing
- Radix UI `Dialog` or custom portal overlay with focus trap
- Escape key + close button for accessibility
- Prevents body scroll when open

**Best Practices**:

- Use `createPortal` to render modal at document root (avoid z-index issues)
- Trap focus within modal while open
- Restore focus to trigger element on close
- Use `next/image` for larger image with priority loading
- Add transition animation (fade in/out) for polish

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | Next.js | 15.5.0 | Server/Client rendering, routing |
| Frontend Library | React | 19.1.1 | UI components |
| UI Components | shadcn/ui (Radix) | Latest | Accessible primitives |
| Styling | TailwindCSS | 3.4.x | Utility-first CSS |
| Backend Framework | FastAPI | Latest | REST API |
| Database | PostgreSQL | 17 | Story persistence |
| ORM | SQLAlchemy | 2.0 | Type-safe DB access |
| Testing (Frontend) | Jest + RTL | 29.x | Component tests |
| Testing (Backend) | pytest | Latest | API tests |

---

## Open Questions Resolved

| Question | Answer | Rationale |
|----------|--------|-----------|
| Should modal be route-based or overlay? | Overlay (simpler, no routing needed) | MVP simplicity; routing can be added later for deep-linking |
| How to handle missing images? | Placeholder image with `onError` | Graceful degradation, no layout shift |
| Client-side or server-side pagination? | Server-side (API returns paginated data) | Scales better, reduces client bundle size |
| Use existing pagination components? | Yes, adapt if needed | Reuse `PagePagination` and `PageSizeSelector` with callback props |

---

## Next Steps

- Proceed to **Phase 1**: Create `data-model.md` and `/contracts/` OpenAPI schemas
- Generate TypeScript client from OpenAPI schema
- Update agent context with technology decisions

