## Quickstart

1. Install dependencies:
   ```sh
   cd nextjs-frontend
   pnpm install
   ```
2. Run the mock-backed gallery:
   ```sh
   pnpm run dev
   ```
3. Visit `http://localhost:3000` to verify the slim hero, filters, and grid.
4. Run lint and tests before shipping:
   ```sh
   pnpm run lint
   pnpm run test
   ```
5. Build for production when ready:
   ```sh
   pnpm run build
   ```
# Quickstart: Planet Labs Design System Implementation

**Feature**: 001-airbus-style-satellite  
**Date**: 2025-01-27  
**Purpose**: Quick implementation guide for Planet Labs design system alignment

## Overview

This guide provides step-by-step instructions for implementing Planet Labs' design system in the PlanetStoryExplorer application. The implementation focuses on color palette, typography, and component styling while maintaining existing functionality.

## Prerequisites

- Node.js 18+ and pnpm installed
- Next.js 14+ project structure
- Tailwind CSS configured
- shadcn/ui components installed

## Implementation Steps

### 1. Update Color System

#### Step 1.1: Update Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Planet Labs Brand Colors
        'planet-teal': 'hsl(180 100% 32%)',        // rgb(0, 157, 165)
        'planet-dark-teal': 'hsl(180 100% 30%)',   // rgb(0, 127, 153)
        'planet-light-teal': 'hsl(180 100% 43%)',  // rgb(28, 190, 201)
        'planet-blue': 'hsl(180 100% 45%)',        // rgb(0, 203, 230)
        'planet-dark-blue': 'hsl(220 20% 14%)',    // rgb(26, 32, 44)
        'planet-light-blue': 'hsl(210 50% 40%)',   // rgb(34, 116, 172)
        
        // Semantic Color Mapping
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
      }
    }
  }
}
```

#### Step 1.2: Update Global CSS

```css
/* app/globals.css */
:root {
  /* Planet Brand Colors */
  --planet-teal: 180 100% 32%;
  --planet-dark-teal: 180 100% 30%;
  --planet-light-teal: 180 100% 43%;
  --planet-blue: 180 100% 45%;
  --planet-dark-blue: 220 20% 14%;
  --planet-light-blue: 210 50% 40%;
  
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

### 2. Update Typography

#### Step 2.1: Add Font Imports

```tsx
// app/layout.tsx
import localFont from 'next/font/local'

const montserrat = localFont({
  src: [
    { path: './fonts/Montserrat-Regular.woff2', weight: '400' },
    { path: './fonts/Montserrat-Medium.woff2', weight: '500' },
    { path: './fonts/Montserrat-SemiBold.woff2', weight: '600' },
    { path: './fonts/Montserrat-Bold.woff2', weight: '700' },
  ],
  variable: '--font-montserrat',
})

const gotham = localFont({
  src: './fonts/GothamSSm-Book.woff2',
  variable: '--font-gotham',
})
```

#### Step 2.2: Update Font Classes

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${gotham.variable} font-montserrat`}>
        {children}
      </body>
    </html>
  )
}
```

### 3. Update Component Styling

#### Step 3.1: Update Button Component

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all",
  {
    variants: {
      variant: {
        primary: "bg-planet-teal text-white hover:bg-planet-dark-teal",
        secondary: "bg-planet-blue text-planet-dark-blue hover:bg-planet-light-teal",
        outline: "border-2 border-planet-teal text-planet-teal hover:bg-planet-teal hover:text-white",
        ghost: "hover:bg-planet-light-teal hover:text-planet-dark-blue",
        link: "text-planet-teal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)
```

#### Step 3.2: Update Card Component

```tsx
// components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-gray-200 bg-white text-planet-dark-blue shadow-sm hover:shadow-md transition-shadow",
        className
      )}
      {...props}
    />
  )
)
```

### 4. Update Hero Section

```tsx
// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-planet-dark-blue via-planet-teal to-planet-blue text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-montserrat">
              Planet Story Explorer
            </h1>
            <p className="text-xl text-planet-light-teal mb-8 font-gotham">
              Discover Earth through satellite imagery
            </p>
            <p className="text-planet-light-teal/80">
              Switch between optical and radar imagery, search by location, and
              explore rich metadata from our satellites.
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <GalleryGrid initialData={initialData} />
      </div>
    </div>
  )
}
```

### 5. Font Preloading

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/Montserrat-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/GothamSSm-Book.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${montserrat.variable} ${gotham.variable} font-montserrat`}>
        {children}
      </body>
    </html>
  )
}
```

## Testing

### Visual Regression Testing

```bash
# Run existing tests
pnpm test

# Run visual regression tests (if configured)
pnpm test:visual

# Check color contrast
pnpm test:accessibility
```

### Manual Testing Checklist

- [ ] All buttons use Planet color scheme
- [ ] Cards have Planet styling
- [ ] Typography matches Planet fonts
- [ ] Hero section has Planet gradient
- [ ] Responsive design maintained
- [ ] Accessibility standards met
- [ ] Performance not degraded

## Troubleshooting

### Common Issues

1. **Fonts not loading**: Check font file paths and preload links
2. **Colors not applying**: Verify Tailwind config and CSS custom properties
3. **Layout shifts**: Ensure font preloading is working
4. **Accessibility issues**: Test color contrast ratios

### Debug Commands

```bash
# Check Tailwind compilation
pnpm build

# Check font loading
pnpm dev
# Open browser dev tools → Network → Fonts

# Check color contrast
# Use browser dev tools accessibility panel
```

## Next Steps

After completing this implementation:

1. Run comprehensive tests
2. Update documentation
3. Deploy to staging environment
4. Conduct user testing
5. Deploy to production

## Resources

- [Planet Labs Website](https://www.planet.com/)
- [Montserrat Font](https://fonts.google.com/specimen/Montserrat)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [shadcn/ui Components](https://ui.shadcn.com/)