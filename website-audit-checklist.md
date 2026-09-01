# Website Audit Checklist & Evaluation Framework

This document defines the structured evaluation framework for the AI Website Auditor.

**Core Principle:** Deterministic checks measure facts. AI interprets those facts.
The AI must NEVER invent technical evidence — only interpret what was crawled.

---

## 01 — UX / UI (User Experience & Interface)

### Navigation
- Is navigation concise, logically grouped, and easily accessible?
- Are menu labels clear and descriptive?
- Can users find key pages within 2 clicks?

### Hero Section & Value Proposition
- Is the primary purpose immediately understandable within 5 seconds?
- Is there a clear, high-contrast headline (H1) and supporting subtitle?
- Is the value proposition specific rather than generic?

### Typography & Hierarchy
- Is there a logical heading step scale (H1 → H2 → H3)?
- Is body text readable (minimum 16px, proper line-height)?
- Is there clear visual distinction between headings and body text?

### Spacing & Layout Rhythm
- Is padding and whitespace balanced?
- Are elements grouped logically with consistent spacing?
- No awkward dead zones or cluttered clusters?

### Visual Hierarchy & Flow
- Does the layout guide the eye naturally down the page?
- Are conversion points placed at natural stopping points?
- Is there clear visual distinction between primary and secondary content?

### Primary Call to Action (CTA)
- Is there a clear, visually dominant primary action button above the fold?
- Is the CTA repeated at logical scroll points?
- Does the CTA text use action-oriented language?

### Forms & Inputs
- If forms exist, are fields clear with visible labels?
- Are form fields minimal and sensible?
- Is the form submission process obvious?

### Content Clarity & Scannability
- Is content broken into digestible chunks?
- Are subheadings, bullet points, and cards used effectively?
- Is key information above the fold?

### Trust Signals & Social Proof
- Are testimonials, client logos, or ratings present?
- Are security badges or credentials visible?
- Is company information (about, contact) accessible?

---

## 02 — Mobile Experience

### Responsive Layout
- Is there a viewport meta tag configured properly?
- Does the structure adapt fluidly without horizontal scroll?
- Are fixed widths avoided in layout containers?

### Text Readability on Small Screens
- Does font size avoid shrinking into unreadable sizes?
- Is line length appropriate for mobile reading?

### Touch Targets & Hit Areas
- Are buttons and interactive elements sized for touch (minimum 44x44px)?
- Are clickable elements spaced adequately apart?

### Mobile Navigation
- Is there evidence of a mobile-friendly menu structure?
- Can navigation be accessed with one hand?

### Mobile CTA
- Are primary actions easily tap-able in the thumb zone?
- Is there a sticky or fixed mobile action element?

### Images on Mobile
- Are images responsive and appropriately sized?
- Do images avoid causing horizontal overflow?

---

## 03 — Performance & Technical Efficiency

### Server Response Time (TTFB)
- Measured Time to First Byte (TTFB) — server response latency.
- Excellent: under 200ms. Good: 200-500ms. Moderate/Needs Improvement: 500-800ms. Poor: over 800ms.

### HTML Document Size
- Total HTML payload size in KB.
- Large HTML increases parse time and memory usage.

### Resource Footprint
- Number of external scripts, stylesheets, and inline assets.
- Excessive scripts indicate potential optimization opportunity.

### Image Optimization
- Total image count, presence of responsive formatting.
- Risk of uncompressed or oversized assets.

### Layout Stability Indicators
- Heavy inline styles, excessive DOM depth.
- Blocking resources that may delay rendering.

---

## 04 — SEO (Search Engine Optimization)

### Page Title Tag
- **Presence:** Is a `<title>` tag present?
- **Length:** Optimal 30-60 characters. Too short or too long reduces effectiveness.
- **Content:** Descriptive, contains primary keywords, unique per page.

### Meta Description
- **Presence:** Is a `<meta name="description">` tag present?
- **Length:** Optimal 120-160 characters. Under 120 may be too brief. Over 160 may be truncated.
- **Content:** Compelling, describes the page value proposition.

### H1 Primary Heading
- **Presence:** Exactly one `<h1>` per page is recommended.
- **Content:** Should describe the primary topic of the page.
- **Multiple H1s:** May confuse search engines about page topic.

### Heading Hierarchy
- Logical sequential structure: H1 → H2 → H3 without skipping levels.
- Skipped levels can confuse screen readers and crawlers.

### Canonical URL
- Is a `<link rel="canonical">` tag specified?
- Without canonical, search engines may index duplicate versions.

### Open Graph Metadata
- Are og:title, og:description, and og:image present?
- Incomplete social metadata prevents rich previews on social platforms.

### Robots Meta
- Is a robots meta tag present?
- Does it contain noindex (which would prevent indexing)?

### Image Alt Attributes
- Do all images have descriptive `alt` attributes?
- Alt text is critical for image search indexing and accessibility.

### Semantic HTML
- Usage of `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Proper semantic structure aids search engine content understanding.

---

## 05 — Accessibility (a11y)

### Image Alternative Text
- No missing `alt` attributes on meaningful images.
- Decorative images should use empty `alt=""`.
- Coverage percentage should be reported.

### Accessible Interactive Elements
- Links have non-empty text or aria-labels.
- Buttons have accessible names (text, aria-label, or title).
- No icon-only empty buttons or links.

### Form Controls & Labels
- Form inputs have associated `<label>` tags, `aria-label`, or placeholder text.
- Required fields are clearly indicated.

### Semantic Landmarks
- Screen reader landmarks present: `<main>`, `<nav>`, `<header>`, `<footer>`.
- Minimum 3 landmarks recommended for proper assistive navigation.

### Heading Outline
- Logical reading order and accessible document outline.
- Heading levels should not skip.

### Viewport Accessibility
- Viewport tag allows user pinch-to-zoom.
- No `user-scalable=no` or `maximum-scale=1.0` restrictions.

### Page Language
- Is `lang` attribute present on `<html>`?
- Screen readers need this for correct pronunciation.

---

## 06 — Conversion Optimization (CRO)

### Primary CTA
- Is a primary conversion action clearly identifiable?
- Is CTA text action-oriented (not generic "Click here")?
- How many CTA-like links are detected?

### Forms
- Are contact/lead forms present?
- Do forms have appropriate labels and minimal fields?
- Is the form action clear?

### Contact Methods
- Are phone links, email links, or booking links present?
- Multiple contact pathways reduce friction.

### User Journey
- Is the path from landing to conversion obvious?
- Are there unnecessary friction points?

### Trust Signals
- Social proof near conversion points?
- Testimonials, ratings, or case studies visible?

### Social Metadata
- Complete Open Graph tags for social sharing.
- Consistent brand messaging across platforms.

---

## Methodology Notes

- **CRAWLED/VERIFIED** findings are based on direct HTML inspection and server response measurement.
- **AI ANALYSIS** findings are interpretations of crawled data by the AI model.
- **UNVERIFIED** findings indicate aspects that could not be reliably determined.
- Scores are calculated programmatically from deterministic findings — not assigned by AI.
- Unverified checks do not reduce scores.
- This audit does NOT measure: Core Web Vitals, Lighthouse scores, real user analytics, or visual rendering quality.
