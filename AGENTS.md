# Repository Guidelines

## Project Structure & Module Organization
The repository is split into `fastapi_backend/` for the FastAPI services and `nextjs-frontend/` for the Next.js UI. Back-end domain logic lives under `fastapi_backend/app`, while reusable CLI utilities sit in `fastapi_backend/commands`. Front-end feature modules follow the `app/` routing tree with shared widgets in `nextjs-frontend/components`. Automated tests reside in `fastapi_backend/tests` and `nextjs-frontend/__tests__`. Reference docs are authored in `docs/`, and Spec Kit assets live under `.specify/` (spec planning) and `.codex/` (agent prompts). Shared fixtures or uploads belong in `local-shared-data/`.

## Build, Test, and Development Commands
- `make start-backend` / `make start-frontend`: launch local FastAPI and Next.js dev servers with hot reload.
- `make test-backend` / `make test-frontend`: run the pytest and Jest suites. Use `make docker-up-test-db` first if tests touch Postgres.
- `uv run python -m commands.generate_openapi_schema`: refresh the OpenAPI contract; follow with `npm run generate-client` (or `pnpm run generate-client`) inside `nextjs-frontend` to sync typed clients.
- `pnpm install` (frontend) and `uv sync` (backend) keep dependencies consistent.

## Coding Style & Naming Conventions
Python code targets 3.12, follows Ruff linting/formatting, and should keep imports explicit. Prefer type hints and async endpoints where possible. TypeScript uses ESLint (Next.js config) and Prettier defaults with 2-space indentation. Name feature branches with the Spec Kit pattern `NNN-short-feature-slug` (e.g., `003-story-filters`) and mirror that slug in spec folders under `specs/`.

## Testing Guidelines
Write pytest modules that mirror the app structure (`tests/api/test_stories.py`) and include async-aware fixtures when touching the database. For the frontend, author Jest/React Testing Library cases under `__tests__` using `ComponentName.test.tsx`. Aim to add or update tests whenever routes, UI states, or schema contracts change. Before opening a PR, run `make test-backend`, `make test-frontend`, and `pnpm run lint` to confirm green checks; use `pnpm run coverage` or `uv run pytest --cov` when changes are high risk.

## Commit & Pull Request Guidelines
Use imperative, scoped commit messages (`feat: add daily ingestion job`) and keep the subject under ~72 characters. Each PR should reference its spec ID, describe behavioral changes, and list manual verification or screenshots for UI tweaks. Include notes on schema or API updates so the typed client can be regenerated. Request review once CI is green and checklist items in the relevant spec folder are satisfied.

## Security & Configuration Tips
Never commit `.env` files or secrets; instead document required variables in `docs/deployment.md`. Rotate backend secrets via Vercel/hosting dashboards and update the Spec Kit constitution if security assumptions change. Review `.specify/templates/` before sharing to ensure no tokens or personal data leak.
