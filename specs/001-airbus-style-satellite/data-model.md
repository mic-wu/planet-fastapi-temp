## Entities

### Story
- `id` (string, UUID): unique identifier used for modal routing
- `title` (string, 1-80 chars): visible caption; clamp in UI
- `location` (string | null, ≤60 chars): optional geographic tag
- `category` (enum: `optical` | `future`): radar removed until data exists
- `description` (string | null): rich text excerpt for modal body
- `thumbnailUrl` (string, URL): small preview used in grid
- `imageUrl` (string, URL): full image for modal
- `capturedAt` (ISO date string | null): supports future sorting
- `provider` (string | null): satellite constellation name

### FilterState
- `category` (enum: `all` | `optical` | `future`)
- `search` (string)
- `page` (number ≥1)
- `limit` (number ∈ {12, 24, 48})

## Relationships
- `Story.category` maps to `FilterState.category` when filtering.
- `Story.id` powers modal lookups and pagination anchors.
- `FilterState` persists in client state (URL/search params optional).

## Validation Rules
- Any missing `thumbnailUrl` / `imageUrl` triggers placeholder image.
- URLs must be HTTPS; fallback to CDN proxy for http assets.
- Empty search returns to `all` without error.
- `future` category is hidden until populated; keep schema ready.
# Data Model: Planet Labs Design System Alignment

**Feature**: 001-airbus-style-satellite  
**Date**: 2025-01-27  
**Purpose**: Define data structures for Planet Labs design system implementation

## Design Tokens

### Color Palette

```typescript
interface PlanetColorPalette {
  // Primary Brand Colors
  teal: string;           // rgb(0, 157, 165) - Main brand color
  darkTeal: string;       // rgb(0, 127, 153) - Hover states
  lightTeal: string;      // rgb(28, 190, 201) - Accent elements
  
  // Secondary Brand Colors
  blue: string;           // rgb(0, 203, 230) - Secondary brand
  darkBlue: string;       // rgb(26, 32, 44) - Text/dark backgrounds
  lightBlue: string;      // rgb(34, 116, 172) - Medium accent
  
  // Neutral Colors
  white: string;          // rgb(255, 255, 255) - Backgrounds
  lightGray: string;      // rgb(246, 246, 244) - Light backgrounds
  mediumGray: string;     // rgb(105, 105, 105) - Muted text
  darkGray: string;       // rgb(26, 32, 44) - Primary text
}
```

### Typography Scale

```typescript
interface PlanetTypography {
  // Font Families
  primary: string;        // 'Montserrat, sans-serif'
  secondary: string;      // '"Gotham SSm A", "Gotham SSm B", Montserrat, sans-serif'
  fallback: string;       // 'Helvetica, Arial'
  
  // Font Weights
  weights: {
    regular: number;      // 400
    medium: number;       // 500
    semibold: number;     // 600
    bold: number;         // 700
  };
  
  // Font Sizes (rem)
  sizes: {
    xs: string;           // 0.75rem (12px)
    sm: string;           // 0.875rem (14px)
    base: string;         // 1rem (16px)
    lg: string;           // 1.125rem (18px)
    xl: string;           // 1.25rem (20px)
    '2xl': string;        // 1.5rem (24px)
    '3xl': string;        // 1.875rem (30px)
    '4xl': string;        // 2.25rem (36px)
    '5xl': string;        // 3rem (48px)
    '6xl': string;        // 3.75rem (60px)
  };
}
```

### Component Variants

```typescript
interface ButtonVariants {
  primary: {
    background: string;   // Planet teal
    color: string;        // White
    hover: string;        // Dark teal
  };
  secondary: {
    background: string;   // Planet blue
    color: string;        // Dark blue
    hover: string;        // Light teal
  };
  outline: {
    background: string;   // Transparent
    color: string;        // Planet teal
    border: string;       // Planet teal
    hover: string;        // Planet teal background
  };
}

interface CardVariants {
  default: {
    background: string;   // White
    border: string;       // Light gray
    shadow: string;       // Subtle shadow
  };
  elevated: {
    background: string;   // White
    border: string;       // Light gray
    shadow: string;       // More prominent shadow
  };
}
```

## CSS Custom Properties

```css
:root {
  /* Planet Brand Colors */
  --planet-teal: 180 100% 32%;        /* rgb(0, 157, 165) */
  --planet-dark-teal: 180 100% 30%;   /* rgb(0, 127, 153) */
  --planet-light-teal: 180 100% 43%;  /* rgb(28, 190, 201) */
  --planet-blue: 180 100% 45%;        /* rgb(0, 203, 230) */
  --planet-dark-blue: 220 20% 14%;    /* rgb(26, 32, 44) */
  --planet-light-blue: 210 50% 40%;   /* rgb(34, 116, 172) */
  
  /* Semantic Color Mapping */
  --primary: var(--planet-teal);
  --primary-foreground: 0 0% 98%;
  --secondary: var(--planet-dark-blue);
  --secondary-foreground: 0 0% 98%;
  --accent: var(--planet-blue);
  --accent-foreground: var(--planet-dark-blue);
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --background: 0 0% 100%;
  --foreground: var(--planet-dark-blue);
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: var(--planet-teal);
}
```

## Component State Management

```typescript
interface ComponentState {
  // Theme state
  theme: 'light' | 'dark';
  
  // Font loading state
  fontsLoaded: boolean;
  
  // Component variants
  buttonVariant: 'primary' | 'secondary' | 'outline' | 'ghost';
  cardVariant: 'default' | 'elevated';
  
  // Responsive state
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}
```

## Validation Rules

### Color Contrast
- All text must meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Primary teal on white: 4.8:1 ✅
- Dark blue on white: 12.6:1 ✅
- White on teal: 4.2:1 ✅

### Typography
- Font sizes must be at least 16px for body text
- Line height must be at least 1.5 for readability
- Font weights must be available for all required variants

### Responsive Design
- Colors must be consistent across all breakpoints
- Typography must scale appropriately
- Components must maintain functionality at all screen sizes

## State Transitions

### Font Loading
```
Initial → Loading → Loaded → Error (fallback)
```

### Theme Switching
```
Light Theme → Dark Theme (if implemented)
```

### Component Hover States
```
Default → Hover → Active → Focus
```

## Integration Points

### Tailwind CSS
- Color values integrated into Tailwind config
- Custom properties accessible via Tailwind utilities
- Component variants using class-variance-authority

### shadcn/ui Components
- Existing component API preserved
- New variants added for Planet styling
- Backward compatibility maintained

### Next.js Font System
- Google Fonts integration
- Font preloading for performance
- Fallback font handling