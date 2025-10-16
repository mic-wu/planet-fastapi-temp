# GitHub Copilot Instructions for Planet Story Explorer

## Project Overview

Planet Story Explorer is an interactive web portal that transforms a static gallery of stories into a living, intelligent, and contextualized atlas of global change. The application provides a dynamic resource that updates daily with AI-generated captions and geospatial context.

## Technical Stack

### Frontend
- Framework: Next.js (React 18+)
- Language: TypeScript (strict mode)
- Routing: App Router with file-based routes in `app/`
- Components:
  - Prefer React Server Components by default
  - Mark Client Components explicitly with `"use client"`
- Data Fetching:
  - Use `fetch`/server actions where applicable
  - Use a data fetching library (e.g., React Query) for client-side server state where needed
- Styling: Template default (e.g., Tailwind CSS); follow the template’s lint/config
- Lint/Format: ESLint + Prettier (use template configs)
- Environment variables:
  - Public variables must be prefixed with `NEXT_PUBLIC_`
  - Keep `.env.local` untracked for local-only secrets
- Dev URLs (default):
  - Web: http://localhost:3000

### Backend
- Framework: FastAPI
- Language: Python 3.10+
- Async-first endpoints with type hints
- Schemas: Pydantic (v2) models for requests/responses
- Project structure: split into `routers/`, `schemas/`, `services/`, `core/`, `deps/`, `utils/`
- Server: Uvicorn/Gunicorn as configured by the template
- Dev URLs (default):
  - API: http://localhost:8000
- OpenAPI/Docs: Auto-generated at `/docs` and `/openapi.json`

### Infrastructure/Dev Experience
- Containerization: Docker + Docker Compose (web, api, and optional db/cache services as defined in the template)
- Task runners/shortcuts: Use Makefile/dev scripts provided by the template
- Pre-commit: Enable hooks (lint/format/security checks) where configured

### AI/ML Components
- Visual LLM for image analysis and caption generation
- Contextual enrichment via external research APIs
- Handle model/API responses with robust error handling and timeouts
- Implement retry/backoff for external calls

## Coding Standards

### General
- Prefer clear, maintainable, and well-documented code
- Type annotations:
  - TypeScript: enable `strict` and fix type errors proactively
  - Python: add type hints; enforce with mypy/pyright if configured
- Use meaningful names and small, focused functions
- Keep code consistent with template lint rules (ESLint, Ruff/Flake8, Black/Prettier)

### Frontend (Next.js)
- Organize by feature and co-locate components, hooks, and tests
- Server Components by default; Client Components only when necessary
- Extract reusable logic into custom hooks
- Avoid global state unless justified; prefer server data + localized state
- Follow accessibility best practices (semantics, ARIA as needed)

### Backend (FastAPI)
- Keep routers small and cohesive; separate business logic into services
- Use Pydantic models for validation and serialization
- Return precise HTTP status codes and structured error responses
- Async I/O for DB/API calls
- Configuration via environment variables (12-factor)

### API Design
- Base path: `/api/v1/...`
- Consistent resource naming
- Pagination for list endpoints
- Error responses include machine-readable codes and helpful messages
- Document endpoints via FastAPI (tags, descriptions, examples)

## Testing

### Frontend
- Unit tests: Vitest or Jest (as per template) + React Testing Library
- E2E tests: Playwright (recommended)
- Aim for meaningful coverage and test critical flows

### Backend
- Unit/integration tests: pytest
- HTTP layer tests: httpx/AsyncClient with FastAPI TestClient
- Use factories/fixtures for data; isolate external services

## Security
- Never commit secrets; use `.env` files and secret managers
- Validate and sanitize inputs on both client and server
- Configure CORS via the reverse proxy/API settings as per template
- Rate limit sensitive endpoints where appropriate
- Use HTTPS in all non-local environments

## Performance
- Next.js: leverage Image Optimization and caching headers
- Avoid unnecessary client-side JS; prefer RSC/SSR/SSG where appropriate
- Backend: index queries, avoid N+1, add caching for hot paths
- Monitor logs and metrics; track latency and error rates

## Data Pipeline
Automated enrichment pipeline:
1. Daily ingest of new stories
2. AI-generated captions
3. Geospatial context augmentation
4. Data store update

Guidelines:
- Idempotent operations
- Structured logging and trace IDs
- Retry with exponential backoff; dead-letter on persistent failures
- Data quality checks and alerts

## Team Collaboration
- Feature branches from `main`
- Descriptive, scoped commits
- Small, focused pull requests with clear context
- Request reviews from relevant owners
- Update documentation as part of changes

## Dependencies
- Keep dependencies up to date via template’s toolchain
  - JavaScript: lockfile maintained (npm/yarn/pnpm as per template)
  - Python: Poetry/pip-tools or requirements.txt (as per template)
- Document rationale for new dependencies
- Use virtual environments (Python) and node version managers as needed

## Documentation
- Keep README.md updated (setup, run, deploy)
- Document API endpoints via OpenAPI and usage examples
- Include environment setup and onboarding steps
- Add inline comments for complex logic
- Maintain CHANGELOG or rely on release notes per template workflow
