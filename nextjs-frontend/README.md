# Frontend Overview

## Stories Mock Mode

- The gallery and related components read story data through `lib/services/stories`.
- By default `NEXT_PUBLIC_API_MODE` falls back to `mock`, so the UI renders the curated fixtures in `lib/mocks/stories`.
- Static assets for the mock cards live under `public/images/mock`.
- Switch to the real API later by setting `NEXT_PUBLIC_API_MODE=live` and providing `API_BASE_URL` (see `lib/clientConfig.ts`).
- The same service surface works on both server and client components, so the swap only requires the env changes.

## Local Tasks

- Install dependencies: `pnpm install`
- Run linting: `pnpm lint`
- Execute the gallery-focused tests: `pnpm test -- gallery`
