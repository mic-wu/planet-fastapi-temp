## Research Findings

### Decision: Slim hero in favor of immediate gallery visibility
- **Rationale**: The current Planet Stories page keeps a compact top bar with
  immediate access to the grid, prioritising browsing speed and reducing bounce
  risk.
- **Alternatives considered**: Retaining the marketing hero with highlight
  tiles was rejected because it hides content above the fold and conflicts with
  mentor feedback about oversized headers.

### Decision: Replace Radar tab with future-ready placeholder category
- **Rationale**: Mentor clarified that radar data is unavailable, so showing a
  radar option would mislead users. We will reserve the layout slot for future
  data categories.
- **Alternatives considered**: Keeping Radar but disabling it was declined to
  avoid confusing inactive controls and to keep the UI focused on available
  data.

### Decision: Use Planet Insights palette tokens via Tailwind CSS
- **Rationale**: Aligning Tailwind tokens with the Planet Insights design
  system keeps parity with the reference gallery and supports broader brand
  reuse.
- **Alternatives considered**: Ad-hoc colour overrides were dismissed because
  they increase maintenance burden and drift from the approved palette.
# Research: Planet Labs Design System Alignment

**Feature**: 001-airbus-style-satellite  
**Date**: 2025-01-27  
**Purpose**: Resolve technical clarifications for implementing Planet Labs design system

## Research Tasks

### 1. Planet Labs Color Palette Analysis

**Task**: Research Planet Labs' exact color specifications and CSS implementation

**Decision**: Use Planet Labs' signature teal/blue color palette with precise RGB/HSL values

**Rationale**: 
- Primary Teal: `rgb(0, 157, 165)` - Main brand color for primary actions
- Dark Teal: `rgb(0, 127, 153)` - Hover states and emphasis
- Light Teal: `rgb(28, 190, 201)` - Accent elements and highlights
- Primary Blue: `rgb(0, 203, 230)` - Secondary brand color
- Dark Blue: `rgb(26, 32, 44)` - Text and dark backgrounds
- Light Blue: `rgb(34, 116, 172)` - Medium accent color

**Alternatives considered**: 
- Generic teal colors (rejected - doesn't match Planet's exact brand)
- Custom color palette (rejected - loses brand alignment)

### 2. Typography Implementation

**Task**: Research Montserrat and Gotham font implementation in Next.js

**Decision**: Use Montserrat as primary font with Gotham as secondary, implemented via Google Fonts

**Rationale**:
- Montserrat: Clean, modern sans-serif matching Planet's typography
- Gotham: Professional secondary font for headings and emphasis
- Google Fonts: Reliable CDN, good performance, easy Next.js integration
- Fallback to system fonts for performance

**Alternatives considered**:
- Local font files (rejected - larger bundle size, maintenance overhead)
- Other font combinations (rejected - doesn't match Planet's brand)

### 3. Tailwind CSS Color System Integration

**Task**: Research best practices for integrating custom color palettes with Tailwind CSS

**Decision**: Extend Tailwind config with Planet color variables using CSS custom properties

**Rationale**:
- CSS custom properties enable theme switching and maintainability
- Tailwind's color system supports HSL values for better color manipulation
- Maintains existing shadcn/ui component compatibility
- Enables dark/light mode support if needed

**Alternatives considered**:
- Hardcoded colors in Tailwind config (rejected - less flexible)
- CSS-in-JS solution (rejected - adds complexity, not needed for this scope)

### 4. Component Styling Strategy

**Task**: Research approach for updating shadcn/ui components with Planet styling

**Decision**: Override component variants using class-variance-authority and custom CSS

**Rationale**:
- Preserves existing component functionality and API
- Allows gradual migration of components
- Maintains TypeScript type safety
- Enables component-specific customizations

**Alternatives considered**:
- Complete component replacement (rejected - too much work, breaks existing code)
- CSS-only overrides (rejected - less maintainable, harder to manage variants)

### 5. Performance Considerations

**Task**: Research performance impact of font loading and color system changes

**Decision**: Implement font preloading and optimize color system for minimal performance impact

**Rationale**:
- Font preloading reduces layout shift and improves perceived performance
- CSS custom properties have minimal runtime cost
- Color changes don't affect JavaScript bundle size
- Maintains existing performance targets (<2s load, <1s interactions)

**Alternatives considered**:
- Synchronous font loading (rejected - causes layout shift)
- Inline critical CSS (rejected - not needed for color/font changes)

### 6. Responsive Design Considerations

**Task**: Research responsive design patterns for Planet Labs' visual style

**Decision**: Maintain existing responsive grid system with Planet's spacing and typography scales

**Rationale**:
- Planet's design is inherently responsive and mobile-first
- Existing grid system works well with new color palette
- Typography scales naturally across breakpoints
- Maintains accessibility standards

**Alternatives considered**:
- Complete responsive redesign (rejected - out of scope, existing system works)
- Desktop-only design (rejected - violates accessibility requirements)

## Technical Implementation Summary

### Color System
- Implement Planet's teal/blue palette as CSS custom properties
- Extend Tailwind config to use Planet colors
- Update all UI components to use new color variants

### Typography
- Add Montserrat and Gotham fonts via Google Fonts
- Update font families in layout.tsx
- Implement font preloading for performance

### Components
- Update button variants with Planet color scheme
- Modify card components with Planet styling
- Ensure all components maintain accessibility and functionality

### Testing
- Maintain existing test coverage
- Add visual regression tests for color changes
- Verify responsive behavior across breakpoints

## Dependencies

- Google Fonts API (for Montserrat and Gotham)
- Existing Tailwind CSS and shadcn/ui setup
- No new external dependencies required

## Risks and Mitigations

**Risk**: Font loading causing layout shift
**Mitigation**: Implement font preloading and fallback fonts

**Risk**: Color contrast issues affecting accessibility
**Mitigation**: Test all color combinations for WCAG compliance

**Risk**: Breaking existing component functionality
**Mitigation**: Gradual migration with comprehensive testing

## Success Criteria

- All components use Planet Labs color palette
- Typography matches Planet's design system
- Performance maintained or improved
- All existing tests pass
- Responsive design preserved
- Accessibility standards maintained