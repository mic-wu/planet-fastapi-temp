# Implementation Plan: Airbus-style Satellite Image Gallery MVP

**Branch**: `001-gallery-alignment` | **Date**: 2025-11-04 | **Spec**: [`specs/001-airbus-style-satellite/spec.md`](spec.md)
**Input**: Feature specification from `/specs/001-airbus-style-satellite/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a Planet-branded gallery landing page that surfaces imagery immediately
and mirrors the Airbus reference experience. The page must show the grid at the
top, expose streamlined filters (All/Optical only for now), maintain search,
pagination, and modal details, and hit the responsiveness targets defined in
the spec.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, Next.js app router (React 19)  
**Primary Dependencies**: Next.js 15.5, Tailwind CSS 3.4, Radix UI primitives  
**Storage**: Static mock data via `lib/services/stories/mock` (no backend call)  
**Testing**: Jest + React Testing Library, ESLint (`pnpm run lint`)  
**Target Platform**: Responsive Planet Story Explorer web frontend  
**Project Type**: Web monorepo (focus on `nextjs-frontend`)  
**Performance Goals**: SC-001 ≤2s initial load, SC-002 ≤1s filter response  
**Constraints**: Maintain responsive grid, adhere to updated Planet palette  
**Scale/Scope**: Tens of stories per page, MVP breadth per spec

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- `.specify/memory/constitution.md` is a placeholder with unnamed principles.
- No enforceable gates are documented; proceed with standard QA practices.
- Status: PASS (flag to revisit when constitution gains content).
- Post-design check: no new constraints introduced; PASS reaffirmed.

## Project Structure

### Documentation (this feature)

```text
specs/001-airbus-style-satellite/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md (Phase 2 via /speckit.tasks)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
fastapi_backend/
└── app/
    └── ... (API services; unchanged by this feature)

nextjs-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── gallery/
│       └── page.tsx
├── components/
│   ├── gallery/
│   └── ui/
├── lib/
│   ├── services/stories/
│   └── mocks/
├── public/
└── __tests__/
```

**Structure Decision**: Work is concentrated in `nextjs-frontend`, adjusting
`app/` layout and hero, gallery components, Tailwind config, and shared UI
primitives. Backend remains untouched.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
