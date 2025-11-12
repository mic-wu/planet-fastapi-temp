# Tasks: Planet Labs Design System Alignment

**Feature**: 001-airbus-style-satellite  
**Branch**: `001-airbus-style-satellite`  
**Date**: 2025-01-27  
**Spec**: `/specs/001-airbus-style-satellite/spec.md`  
**Plan**: `/specs/001-airbus-style-satellite/plan.md`

## Summary

Implement Planet Labs design system alignment by updating colors, typography, and component styling while maintaining existing satellite image gallery functionality. This is a UI-only change that preserves all current features while applying Planet Labs' signature teal/blue color palette and Montserrat typography.

## Implementation Strategy

**MVP Scope**: Complete design system implementation across all existing gallery components
**Approach**: Incremental UI updates maintaining existing functionality
**Testing**: Visual regression testing and accessibility validation

## Phase 1: Setup & Infrastructure

### T001: Update Tailwind Configuration ✅
**File**: `nextjs-frontend/tailwind.config.js`  
**Description**: Extend Tailwind config with Planet Labs color palette and typography settings  
**Dependencies**: None  
**Acceptance**: Planet colors available as Tailwind utilities, typography configured

### T002: Update Global CSS Variables ✅
**File**: `nextjs-frontend/app/globals.css`  
**Description**: Add Planet Labs color palette as CSS custom properties  
**Dependencies**: T001  
**Acceptance**: All Planet colors defined as CSS variables, semantic color mapping complete

### T003: Add Font Files and Configuration ✅
**File**: `nextjs-frontend/app/fonts/` (new directory)  
**Description**: Download and configure Montserrat and Gotham font files  
**Dependencies**: None  
**Acceptance**: Font files available locally, font configuration ready

## Phase 2: Foundational Typography & Color System

### T004: Update Root Layout with Planet Typography ✅
**File**: `nextjs-frontend/app/layout.tsx`  
**Description**: Implement Montserrat and Gotham fonts with proper preloading  
**Dependencies**: T003  
**Acceptance**: Fonts load correctly, no layout shift, fallbacks working

### T005: Update Homepage Hero Section ✅
**File**: `nextjs-frontend/app/page.tsx`  
**Description**: Apply Planet Labs styling to hero section with gradient background  
**Dependencies**: T002, T004  
**Acceptance**: Hero section matches Planet Labs design, typography correct

## Phase 3: User Story 1 - Browse Image Gallery (P1)

**Goal**: Apply Planet Labs styling to the core gallery browsing experience  
**Independent Test**: Load gallery page and verify Planet Labs colors, typography, and responsive grid

### T006: Update Gallery Grid Component ✅
**File**: `nextjs-frontend/components/gallery/gallery-grid.tsx`  
**Description**: Apply Planet Labs styling to main gallery grid layout  
**Dependencies**: T002, T004  
**Acceptance**: Gallery grid uses Planet colors, maintains responsive behavior

### T007: Update Story Card Component ✅
**File**: `nextjs-frontend/components/gallery/story-card.tsx`  
**Description**: Apply Planet Labs styling to individual story cards  
**Dependencies**: T002, T004  
**Acceptance**: Story cards match Planet Labs design, hover states correct

### T008: Update Gallery Pagination Component ✅
**File**: `nextjs-frontend/components/gallery/gallery-pagination.tsx`  
**Description**: Apply Planet Labs styling to pagination controls  
**Dependencies**: T002, T004  
**Acceptance**: Pagination uses Planet colors, maintains functionality

### T009: Update Gallery Page Size Component ✅
**File**: `nextjs-frontend/components/gallery/gallery-page-size.tsx`  
**Description**: Apply Planet Labs styling to page size selector  
**Dependencies**: T002, T004  
**Acceptance**: Page size selector matches Planet design

**Checkpoint**: User Story 1 complete - Gallery browsing with Planet Labs styling

## Phase 4: User Story 2 - Filter by Category Tabs (P1)

**Goal**: Apply Planet Labs styling to category filtering functionality  
**Independent Test**: Switch between All/Optical/Radar tabs and verify Planet styling

### T010: Update Story Filters Component ✅
**File**: `nextjs-frontend/components/gallery/story-filters.tsx`  
**Description**: Apply Planet Labs styling to category tabs and filter controls  
**Dependencies**: T002, T004  
**Acceptance**: Filter tabs use Planet colors, active states correct

**Checkpoint**: User Story 2 complete - Category filtering with Planet Labs styling

## Phase 5: User Story 3 - Search by Text (P2)

**Goal**: Apply Planet Labs styling to search functionality  
**Independent Test**: Use search field and verify Planet styling maintained

### T011: Update Search Input Styling ✅
**File**: `nextjs-frontend/components/gallery/story-filters.tsx`  
**Description**: Apply Planet Labs styling to search input field  
**Dependencies**: T010  
**Acceptance**: Search input matches Planet design, focus states correct

**Checkpoint**: User Story 3 complete - Search functionality with Planet Labs styling

## Phase 6: User Story 4 - Pagination Controls (P2)

**Goal**: Ensure pagination maintains Planet Labs styling  
**Independent Test**: Navigate through pages and verify consistent Planet styling

### T012: Verify Pagination Styling Consistency ✅
**File**: `nextjs-frontend/components/gallery/gallery-pagination.tsx`  
**Description**: Ensure pagination controls maintain Planet styling across all states  
**Dependencies**: T008  
**Acceptance**: All pagination states use Planet colors, disabled states correct

**Checkpoint**: User Story 4 complete - Pagination with consistent Planet Labs styling

## Phase 7: User Story 5 - View Item Detail Modal (P2)

**Goal**: Apply Planet Labs styling to modal overlay functionality  
**Independent Test**: Open modal and verify Planet styling applied

### T013: Update Story Preview Modal ✅
**File**: `nextjs-frontend/components/gallery/story-preview-modal.tsx`  
**Description**: Apply Planet Labs styling to modal overlay and content  
**Dependencies**: T002, T004  
**Acceptance**: Modal uses Planet colors, typography correct, close button styled

**Checkpoint**: User Story 5 complete - Modal functionality with Planet Labs styling

## Phase 8: Core UI Components Update

**Goal**: Update all shadcn/ui components with Planet Labs styling  
**Independent Test**: Verify all UI components use Planet color scheme

### T014: Update Button Component ✅
**File**: `nextjs-frontend/components/ui/button.tsx`  
**Description**: Implement Planet Labs button variants (primary, secondary, outline)  
**Dependencies**: T002  
**Acceptance**: All button variants use Planet colors, hover states correct

### T015: Update Card Component ✅
**File**: `nextjs-frontend/components/ui/card.tsx`  
**Description**: Apply Planet Labs styling to card components  
**Dependencies**: T002  
**Acceptance**: Cards use Planet colors, shadows and borders correct

### T016: Update Input Component ✅
**File**: `nextjs-frontend/components/ui/input.tsx`  
**Description**: Apply Planet Labs styling to input fields  
**Dependencies**: T002  
**Acceptance**: Inputs use Planet colors, focus states correct

### T017: Update Select Component ✅
**File**: `nextjs-frontend/components/ui/select.tsx`  
**Description**: Apply Planet Labs styling to select dropdowns  
**Dependencies**: T002  
**Acceptance**: Select components use Planet colors, dropdown styling correct

### T018: Update Badge Component ✅
**File**: `nextjs-frontend/components/ui/badge.tsx`  
**Description**: Apply Planet Labs styling to badge components  
**Dependencies**: T002  
**Acceptance**: Badges use Planet colors, variants correct

### T019: Update Table Component
**File**: `nextjs-frontend/components/ui/table.tsx`  
**Description**: Apply Planet Labs styling to table components  
**Dependencies**: T002  
**Acceptance**: Tables use Planet colors, borders and spacing correct

### T020: Update Tabs Component ✅
**File**: `nextjs-frontend/components/ui/tabs.tsx`  
**Description**: Apply Planet Labs styling to tab components  
**Dependencies**: T002  
**Acceptance**: Tabs use Planet colors, active states correct

### T021: Update Form Components
**File**: `nextjs-frontend/components/ui/form.tsx`  
**Description**: Apply Planet Labs styling to form components  
**Dependencies**: T002  
**Acceptance**: Forms use Planet colors, validation states correct

### T022: Update Dropdown Menu Component
**File**: `nextjs-frontend/components/ui/dropdown-menu.tsx`  
**Description**: Apply Planet Labs styling to dropdown menus  
**Dependencies**: T002  
**Acceptance**: Dropdowns use Planet colors, hover states correct

### T023: Update Breadcrumb Component
**File**: `nextjs-frontend/components/ui/breadcrumb.tsx`  
**Description**: Apply Planet Labs styling to breadcrumb navigation  
**Dependencies**: T002  
**Acceptance**: Breadcrumbs use Planet colors, links styled correctly

### T024: Update Avatar Component
**File**: `nextjs-frontend/components/ui/avatar.tsx`  
**Description**: Apply Planet Labs styling to avatar components  
**Dependencies**: T002  
**Acceptance**: Avatars use Planet colors, fallback styling correct

## Phase 9: Authentication Pages Update

**Goal**: Apply Planet Labs styling to login and registration pages  
**Independent Test**: Navigate to auth pages and verify Planet styling

### T025: Update Login Page
**File**: `nextjs-frontend/app/login/page.tsx`  
**Description**: Apply Planet Labs styling to login page  
**Dependencies**: T014, T015, T016, T021  
**Acceptance**: Login page uses Planet colors and typography

### T026: Update Registration Page
**File**: `nextjs-frontend/app/register/page.tsx`  
**Description**: Apply Planet Labs styling to registration page  
**Dependencies**: T014, T015, T016, T021  
**Acceptance**: Registration page uses Planet colors and typography

### T027: Update Password Recovery Pages
**File**: `nextjs-frontend/app/password-recovery/`  
**Description**: Apply Planet Labs styling to password recovery pages  
**Dependencies**: T014, T015, T016, T021  
**Acceptance**: Password recovery pages use Planet colors and typography

## Phase 10: Dashboard Pages Update

**Goal**: Apply Planet Labs styling to dashboard pages  
**Independent Test**: Navigate to dashboard and verify Planet styling

### T028: Update Dashboard Layout
**File**: `nextjs-frontend/app/dashboard/`  
**Description**: Apply Planet Labs styling to dashboard pages  
**Dependencies**: T014, T015, T016, T019, T020  
**Acceptance**: Dashboard uses Planet colors and typography

## Phase 11: Polish & Cross-Cutting Concerns

**Goal**: Final polish and ensure consistency across all components  
**Independent Test**: Full application walkthrough with Planet styling

### T029: Verify Color Contrast Accessibility
**File**: Multiple files  
**Description**: Test all color combinations for WCAG AA compliance  
**Dependencies**: All previous tasks  
**Acceptance**: All text meets 4.5:1 contrast ratio, large text meets 3:1

### T030: Verify Responsive Design
**File**: Multiple files  
**Description**: Test Planet styling across all breakpoints (mobile, tablet, desktop)  
**Dependencies**: All previous tasks  
**Acceptance**: Design consistent across all screen sizes

### T031: Performance Validation
**File**: Multiple files  
**Description**: Ensure Planet styling doesn't impact performance  
**Dependencies**: All previous tasks  
**Acceptance**: Page load times maintained, font loading optimized

### T032: Visual Regression Testing
**File**: Multiple files  
**Description**: Capture and validate visual changes  
**Dependencies**: All previous tasks  
**Acceptance**: All visual changes documented and approved

### T033: Update Documentation
**File**: `nextjs-frontend/README.md`  
**Description**: Update documentation with Planet Labs design system information  
**Dependencies**: All previous tasks  
**Acceptance**: Documentation reflects new design system

## Dependencies

### User Story Completion Order
1. **User Story 1** (P1): Browse image gallery - Foundation for all other stories
2. **User Story 2** (P1): Filter by category tabs - Depends on gallery foundation
3. **User Story 3** (P2): Search by text - Depends on filter foundation
4. **User Story 4** (P2): Pagination controls - Depends on gallery foundation
5. **User Story 5** (P2): View item detail modal - Depends on gallery foundation

### Parallel Execution Opportunities

**Phase 1-2**: T001, T003 can run in parallel with T002
**Phase 3**: T006, T007, T008, T009 can run in parallel after T002, T004
**Phase 8**: T014-T024 can run in parallel after T002
**Phase 9**: T025, T026, T027 can run in parallel after Phase 8
**Phase 11**: T029, T030, T031 can run in parallel

### Critical Path
T001 → T002 → T004 → T005 → T006-T009 (US1) → T010 (US2) → T011 (US3) → T012 (US4) → T013 (US5) → T014-T024 (UI Components) → T025-T028 (Pages) → T029-T033 (Polish)

## Implementation Notes

### Color System
- All Planet Labs colors implemented as CSS custom properties
- Semantic color mapping maintains existing component APIs
- Dark mode support prepared for future implementation

### Typography
- Montserrat as primary font with proper fallbacks
- Gotham for headings and emphasis
- Font preloading prevents layout shift

### Component Strategy
- Gradual migration preserving existing functionality
- All components maintain TypeScript type safety
- Backward compatibility maintained

### Testing Strategy
- Visual regression testing for all components
- Accessibility testing for color contrast
- Performance testing for font loading
- Cross-browser compatibility testing

## Success Criteria

- All components use Planet Labs color palette
- Typography matches Planet's design system
- Performance maintained or improved (<2s load, <1s interactions)
- All existing tests pass
- Responsive design preserved across all breakpoints
- Accessibility standards maintained (WCAG AA)
- Visual consistency across all pages and components

## Risk Mitigation

- **Font Loading Issues**: Implement preloading and fallbacks
- **Color Contrast Problems**: Test all combinations for accessibility
- **Performance Impact**: Monitor bundle size and load times
- **Component Breakage**: Gradual migration with comprehensive testing
- **Browser Compatibility**: Test across target browsers

## Total Task Count: 33

- **Setup & Infrastructure**: 3 tasks
- **Foundational**: 2 tasks  
- **User Story 1**: 4 tasks
- **User Story 2**: 1 task
- **User Story 3**: 1 task
- **User Story 4**: 1 task
- **User Story 5**: 1 task
- **UI Components**: 11 tasks
- **Pages**: 4 tasks
- **Polish**: 5 tasks

**Parallel Opportunities**: 15+ tasks can run in parallel
**Independent Test Criteria**: Each user story has clear acceptance criteria
**MVP Scope**: Complete design system implementation across all existing functionality