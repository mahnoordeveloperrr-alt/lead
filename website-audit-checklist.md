# Website Audit Checklist & Evaluation Framework

This document defines the structured evaluation framework for the AI Website Auditor.

---

## 01 — UX / UI (User Experience & Interface)
- **Navigation & Clarity**: Is navigation concise, logically grouped, and easily accessible? Are menu labels clear and descriptive?
- **Hero Section & Value Proposition**: Is the primary purpose immediately understandable within 5 seconds? Is there a clear, high-contrast headline and supporting subtitle?
- **Typography & Hierarchy**: Is there a logical step scale (H1 -> H2 -> H3)? Is body text readable (minimum 16px, proper line-height)?
- **Spacing & Layout Rhythm**: Is padding and whitespace balanced without awkward dead zones or cluttered element clusters?
- **Visual Hierarchy & Flow**: Does the layout guide the eye naturally down the page toward conversion points?
- **Primary Call to Action (CTA)**: Is there a clear, visually dominant primary action button above the fold and repeated logically?
- **Forms & Inputs**: If forms exist, are fields clear with visible labels, minimal friction, and sensible placeholders?
- **Content Clarity & Scannability**: Is content broken into digestible chunks with subheadings, bullet points, and cards?
- **Trust Signals & Social Proof**: Are testimonials, client logos, ratings, case studies, security badges, or company credentials present?

---

## 02 — Mobile Experience
- **Responsive Layout**: Is there a viewport meta tag configured properly? Does the structure adapt fluidly without horizontal scroll?
- **Touch Targets & Hit Areas**: Are buttons and interactive elements sized for touch (minimum 44x44px target area)?
- **Mobile Navigation**: Is there evidence of a mobile-friendly menu structure or compact navigation bar?
- **Mobile CTA Stacking**: Are actions easily tap-able on one hand / thumb zone?
- **Text Readability on Small Screens**: Does font size avoid shrinking into unreadable sizes?

---

## 03 — Performance & Technical Efficiency
- **Asset Weight & Images**: Total count of images, presence of dimensions/responsive formatting, risk of uncompressed assets.
- **Resource Footprint**: Number of external scripts, stylesheets, fonts, and inline assets.
- **Measured Response Latency**: Server Time to First Byte (TTFB) and initial HTML payload size.
- **Layout Stability & Bloat Indicators**: Excessive DOM node depth, heavy inline styles, or blocking resources.

---

## 04 — SEO (Search Engine Optimization)
- **Page Title Tag**: Present, descriptive, optimal character length (30-60 characters), contains target keywords.
- **Meta Description**: Present, informative, enticing click-through summary (120-160 characters).
- **Heading Hierarchy**: Exactly one clear `<h1>` per page, followed by logical sequential `<h2>` and `<h3>` tags without skipping levels.
- **Semantic HTML**: Usage of `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` instead of unsemantic `<div>` soup.
- **Open Graph & Social Metadata**: Presence of `og:title`, `og:description`, `og:image`, `og:url` for rich social preview rendering.
- **Canonical URL & Indexing Directives**: Presence of canonical link tag and robots meta tags.
- **Image Alt Attributes**: Every image has an informative, non-empty `alt` attribute for search indexing.

---

## 05 — Accessibility (a11y)
- **Image Alternative Text**: No missing `alt` attributes or empty images that convey meaning.
- **Accessible Interactive Elements**: Buttons and links have non-empty accessible text or aria-labels (no icon-only empty buttons).
- **Form Controls & Labels**: Form inputs have associated `<label>` tags or `aria-label` attributes.
- **Semantic Landmarks**: Screen reader landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`) present.
- **Heading Outline**: Logical reading order and accessible document outline.
- **Viewport Constraints**: Viewport tag allows user pinch-to-zoom (no `user-scalable=no` or `maximum-scale=1.0`).

---

## 06 — Conversion Optimization (CRO) & Redesign Opportunities
- **Friction Points**: Unclear value propositions, cluttered decision paths, or missing next steps.
- **CTA Optimization**: Copywriting on buttons (action-oriented vs generic "Click here"), visual contrast, and sticky/repeated placement.
- **Proof & Validation**: Placement of social proof near high-friction action points.
- **Redesign Opportunities**: Specific modern UI/UX redesign recommendations for hero, navigation, trust building, and visual polish.
