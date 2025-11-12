# Product Research Brief: Satellite Image Gallery Competitors

**Goal**: Identify best-in-class features from competing satellite image gallery products that we can learn from and incorporate into PlanetStoryExplorer

---

## Research Objectives

Analyze 5-8 similar satellite image gallery/geospatial visualization platforms and document:

1. **Core UI/UX patterns** - How they present and organize imagery
2. **Filtering & Search capabilities** - What options exist beyond basic category tabs
3. **Image presentation** - Modal/lightbox behaviors, zoom capabilities, image quality
4. **Performance optimizations** - Loading strategies, lazy loading, responsiveness
5. **Additional features** - Download flows, metadata displays, map integrations
6. **Mobile experience** - Responsive design patterns
7. **Overall UX polish** - Micro-interactions, animations, visual hierarchy

**Output**: A research document with screenshots, feature comparisons, and prioritized recommendations for our MVP.

---

## Target Products to Analyze

### Primary Competitors (Must Analyze)

1. **Airbus Space Solutions** - [space-solutions.airbus.com/resources/satellite-image-gallery](https://space-solutions.airbus.com/resources/satellite-image-gallery)
   - Reference: Our primary design inspiration
   - Focus: UI layout, category filtering, modal interactions

2. **Maxar Intelligence** - Search for their image gallery/examples platform
   - Known for: High-quality satellite imagery
   - Focus: Image quality, metadata presentation

3. **Planet Explorer** - [explorer.planet.com](https://explorer.planet.com) (if accessible)
   - Reason: Related to our data source
   - Focus: How they present Planet imagery, search functionality

4. **Sentinel Hub Browser** - Search for "Sentinel Hub EO Browser"
   - Known for: Open geospatial data browsing
   - Focus: Technical imagery presentation, layer controls

### Secondary/Indirect Competitors (Analyze 2-3)

5. **NASA Worldview** - [worldview.earthdata.nasa.gov](https://worldview.earthdata.nasa.gov)
   - Reason: Public satellite imagery browsing
   - Focus: Temporal browsing, timeline controls

6. **ESA Sentinel Playground** - Search for ESA Sentinel Hub
   - Reason: European satellite data portal
   - Focus: Search UX, metadata organization

7. **Google Earth Studio** or **Google Earth Timelapse**
   - Reason: Familiar UX patterns for masses
   - Focus: Accessibility, intuitive controls

8. **Any image-heavy gallery product** (Unsplash, Pinterest, Adobe Stock)
   - Reason: Proven gallery UX patterns
   - Focus: Grid layouts, loading states, modal behaviors

---

## Features to Document for Each Product

### 1. Gallery View / Grid Presentation (Priority: P1)

**Questions to answer:**

- How many columns/grid items visible at once? How does it respond to screen size?
- Do they use masonry, fixed-grid, or adaptive layouts?
- What metadata is visible on hover vs. always visible?
- How do they handle image aspect ratios?
- Loading states: skeletons? blur-ups? spinner?

**Capture:**

- Screenshot of default grid view (desktop)
- Mobile view screenshot
- Note grid behavior (columns, spacing)

### 2. Filtering & Search (Priority: P1)

**Questions to answer:**

- What filter options exist? (categories, dates, resolution, location, satellite type)
- How is search implemented? (real-time? debounced? autocomplete?)
- UI controls: tabs? dropdowns? sliders? checkboxes?
- Can users combine multiple filters?
- Do filters persist in URL?

**Capture:**

- Screenshot of filter UI
- Document all available filters
- Test search responsiveness

### 3. Image Detail Modal/Lightbox (Priority: P1)

**Questions to answer:**

- Does clicking open modal or navigate to new page?
- What information is shown in detail view? (location, coordinates, date, resolution, satellite, description)
- Can users zoom? Pan around large images?
- Is there image navigation (prev/next)?
- How to close? (X button, ESC key, click outside)
- Desktop vs mobile modal behavior

**Capture:**

- Screenshot of open modal
- Document visible metadata fields
- Document keyboard shortcuts

### 4. Pagination & Navigation (Priority: P2)

**Questions to answer:**

- How many items per page?
- Pagination controls: numbered? prev/next only? infinite scroll?
- URL structure: query params? hash? clean URLs?
- Is total count visible?
- Smooth scrolling behavior?

**Capture:**

- Screenshot of pagination controls
- Note URL structure
- Document total item count display

### 5. Performance & Loading (Priority: P2)

**Questions to answer:**

- Page load time (first contentful paint)
- Image loading strategy: lazy load? progressive? blur placeholders?
- Does scrolling feel smooth?
- Are there loading indicators?
- Mobile performance?

**Capture:**

- Use browser DevTools to measure:
  - Initial page load time
  - Time to interactive
  - Image loading approach

### 6. Mobile Experience (Priority: P2)

**Questions to answer:**

- Responsive grid on mobile?
- Touch-friendly controls?
- Modal behavior on small screens?
- Search/filter UI adaptation?
- Performance on mobile

**Capture:**

- Mobile screenshots
- Document any mobile-specific features

### 7. Additional Features (Priority: P3 - Document if present)

**Optional features to note:**

- Download/share buttons
- Map view integration
- Timelapse/date range controls
- Comparison mode (before/after)
- Collections/favorites
- Fullscreen mode
- Export metadata
- Share URLs
- Embed codes

**Capture:**

- Screenshots of any advanced features
- Brief description of functionality

---

## Documentation Format

Create a **Google Doc/Notion page or Markdown document** with the following structure:

### For Each Product

```markdown
## Product Name: [Name]
**URL**: [link]  
**Accessibility**: Public / Requires signup / Partial  
**Date Analyzed**: [date]  

### Overall Impression
[2-3 sentences: What's good? What's unique?]

### Screenshots
[Gallery view]  
[Modal/Detail view]  
[Mobile view]  
[Filter/search UI]

### Feature Analysis

#### Gallery Grid
- Columns: [X on desktop / Y on mobile]
- Layout: [fixed-grid / masonry / adaptive]
- Items per page: [number]
- Metadata visible: [title, location, date, etc.]
- Loading strategy: [lazy load / all at once / progressive]

#### Filtering & Search
- Available filters: [list]
- Search type: [text search / autocomplete / none]
- UI pattern: [tabs / dropdowns / sidebar]
- URL state: [query params / hash / none]

#### Modal/Lightbox
- Opens: [modal / new page]
- Visible metadata: [list]
- Features: [zoom / pan / prev-next / keyboard shortcuts]
- Close method: [X button / ESC / click outside]

#### Performance
- Load time: [approximate seconds]
- Image strategy: [approach used]
- Responsive: [Yes / No / Partial]

#### Mobile Experience
- Responsive: [Yes / No / Poor]
- Touch-friendly: [Yes / No]
- Performance: [Good / Slow / Poor]

#### Additional Features
[Brief list of extra features]

### What We Can Learn
- [Actionable insight 1]
- [Actionable insight 2]
- [Actionable insight 3]

### What We Should NOT Copy
- [Poor UX pattern / outdated approach]
```

---

### Summary Comparison Table

After analyzing all products, create a comparison table:

| Feature | Airbus | Maxar | Planet Explorer | NASA Worldview | ESA | Google Earth | Recommendation for MVP |
|---------|--------|-------|----------------|----------------|-----|--------------|------------------------|
| Grid Layout | | | | | | | |
| Mobile Responsive | | | | | | | |
| Search Capability | | | | | | | |
| Modal/Detail View | | | | | | | |
| Filter Options | | | | | | | |
| Loading Strategy | | | | | | | |
| URL State Management | | | | | | | |

---

## Prioritized Recommendations

### Must-Have for MVP (Extract from research)

Based on findings, list top 3-5 features that:

1. **Appear in 3+ competitors** - Industry standard expectations
2. **Significantly improve UX** - Based on your testing
3. **Are technically feasible** - For our stack (React + FastAPI)

**Format**:

```markdown
### Recommendation 1: [Feature Name]
**Why**: [Appears in 4/6 competitors, significantly improves discoverability]
**Implementation**: [Brief technical approach]
**Priority**: P1 / P2

### Recommendation 2: [Feature Name]
...
```

### Nice-to-Have for Future Iterations

List features that:

- Appear in 1-2 competitors but are promising
- Could differentiate us in the future
- Are complex but valuable

---

## Tools Needed

- **Screenshots**: Browser DevTools, SnagIt, or similar
- **Performance**: Chrome DevTools Network/Performance tabs
- **Mobile Testing**: Browser responsive mode or actual mobile device
- **Documentation**: Google Docs, Notion, or markdown files
- **Comparison**: Excel/Sheets for comparison table

---

## Success Criteria

The research is complete when:

- [ ] 5-8 products analyzed with full documentation
- [ ] Screenshots captured for each major UI pattern
- [ ] Comparison table populated
- [ ] Top 3-5 actionable recommendations extracted
- [ ] Research shared in team meeting/discussion document
- [ ] Recommendations inform product roadmap decisions

---

## Questions?

If you encounter:

- Login/signup barriers
- Geographic restrictions
- Confusing interfaces
- Technical issues

**Document it** and move to the next product. Not all products will be accessible or perfect.

---

## Timeline

- **Week 1**: Focus on Primary Competitors (Airbus, Maxar, Planet, Sentinel Hub)
- **Week 2**: Secondary competitors + synthesize findings + create recommendations

---

## Deliverables

1. Research document (Google Doc/Notion with screenshots and analysis)
2. Short presentation (5-10 slides) highlighting top 3 insights
3. Recommendations document with priority rankings
