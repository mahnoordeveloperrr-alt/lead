import type {
  DeterministicCheck,
  ExtractedWebsiteData,
  AuditScores,
  ScoreBreakdown,
  FindingCategory,
  ScoreGrade,
} from '../src/types/audit.js';

/**
 * Score weights per category — used to calculate overall score.
 * Weights are tuned so that critical categories (SEO, Performance) have more influence.
 */
const CATEGORY_WEIGHTS: Record<FindingCategory, number> = {
  seo: 0.22,
  performance: 0.20,
  ux: 0.22,
  accessibility: 0.18,
  conversion: 0.18,
};

function gradeFromScore(score: number): ScoreGrade {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Run all deterministic checks against extracted website data.
 * Every check has: status (pass/warning/critical/unverified), evidence (measured fact), source (crawled).
 */
export function runDeterministicChecks(data: ExtractedWebsiteData): DeterministicCheck[] {
  const checks: DeterministicCheck[] = [];

  // ─── SEO CHECKS ────────────────────────────────────────────

  // 1. HTTPS
  checks.push({
    id: 'ssl-https',
    category: 'seo',
    title: 'HTTPS & SSL Security',
    status: data.isHttps ? 'pass' : 'critical',
    message: data.isHttps
      ? 'Website serves traffic over encrypted HTTPS connection.'
      : 'Website is served over unencrypted HTTP. Modern browsers flag this as insecure and it blocks many SEO features.',
    evidence: `Protocol: ${data.isHttps ? 'HTTPS' : 'HTTP'} | URL: ${data.finalUrl}`,
    source: 'crawled',
    importance: 'critical',
    weight: 10,
  });

  // 2. Title Tag — Presence
  checks.push({
    id: 'title-presence',
    category: 'seo',
    title: 'Page Title — Presence',
    status: data.title ? 'pass' : 'critical',
    message: data.title
      ? `Page title is present: "${data.title}"`
      : 'Missing <title> tag. Search engines and browsers rely on page titles for indexing and tab labels.',
    evidence: data.title ? `Title: "${data.title}" (${data.title.length} chars)` : 'No <title> tag found in <head>.',
    source: 'crawled',
    importance: 'critical',
    weight: 9,
  });

  // 3. Title Tag — Length
  if (data.title) {
    checks.push({
      id: 'title-length',
      category: 'seo',
      title: 'Page Title — Length',
      status: data.title.length >= 30 && data.title.length <= 60
        ? 'pass'
        : data.title.length > 60
          ? 'warning'
          : 'warning',
      message: data.title.length > 60
        ? `Title is ${data.title.length} characters. Search results may truncate titles longer than 60 characters.`
        : data.title.length < 30
          ? `Title is only ${data.title.length} characters. Titles of 30-60 characters tend to perform better in search results.`
          : `Title length is optimal at ${data.title.length} characters.`,
      evidence: `Title length: ${data.title.length} chars (recommended: 30-60 chars)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 6,
    });
  }

  // 4. Meta Description — Presence
  checks.push({
    id: 'meta-desc-presence',
    category: 'seo',
    title: 'Meta Description — Presence',
    status: data.metaDescription ? 'pass' : 'critical',
    message: data.metaDescription
      ? 'Meta description tag is present.'
      : 'Missing meta description. Search engines will auto-generate snippets from page text, often poorly.',
    evidence: data.metaDescription
      ? `Meta description: "${data.metaDescription.slice(0, 80)}${data.metaDescription.length > 80 ? '...' : ''}" (${data.metaDescription.length} chars)`
      : 'No <meta name="description"> tag found.',
    source: 'crawled',
    importance: 'recommended',
    weight: 7,
  });

  // 5. Meta Description — Length
  if (data.metaDescription) {
    checks.push({
      id: 'meta-desc-length',
      category: 'seo',
      title: 'Meta Description — Length',
      status: data.metaDescription.length >= 120 && data.metaDescription.length <= 160
        ? 'pass'
        : 'warning',
      message: data.metaDescription.length > 160
        ? `Meta description is ${data.metaDescription.length} characters. Descriptions over 160 characters are typically truncated in search results.`
        : data.metaDescription.length < 120
          ? `Meta description is ${data.metaDescription.length} characters. Descriptions of 120-160 characters tend to maximize click-through rate.`
          : `Meta description length is optimal at ${data.metaDescription.length} characters.`,
      evidence: `Description length: ${data.metaDescription.length} chars (recommended: 120-160 chars)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 5,
    });
  }

  // 6. H1 — Presence
  checks.push({
    id: 'h1-presence',
    category: 'seo',
    title: 'H1 Primary Heading — Presence',
    status: data.headings.h1Count >= 1 ? 'pass' : 'critical',
    message: data.headings.h1Count >= 1
      ? `H1 heading found: "${data.headings.h1[0]?.slice(0, 60)}${(data.headings.h1[0]?.length || 0) > 60 ? '...' : ''}"`
      : 'No <h1> heading found. Search engines use H1 to understand the primary topic of the page.',
    evidence: data.headings.h1Count >= 1
      ? `H1: "${data.headings.h1[0]}" | Total H1 count: ${data.headings.h1Count}`
      : 'No H1 elements found in page HTML.',
    source: 'crawled',
    importance: 'critical',
    weight: 8,
  });

  // 7. H1 — Count (multiple H1s)
  if (data.headings.h1Count > 1) {
    checks.push({
      id: 'h1-multiple',
      category: 'seo',
      title: 'H1 Heading Count',
      status: 'warning',
      message: `Found ${data.headings.h1Count} H1 headings. Best practice is exactly one H1 per page for clear topic signaling.`,
      evidence: `H1 headings: ${data.headings.h1.map(h => `"${h.slice(0, 40)}"`).join(', ')}`,
      source: 'crawled',
      importance: 'recommended',
      weight: 5,
    });
  }

  // 8. Heading Hierarchy
  const hasSkippedLevels = data.headings.h1Count > 0 && data.headings.h2.length === 0 && data.headings.h3.length > 0;
  checks.push({
    id: 'heading-hierarchy',
    category: 'seo',
    title: 'Heading Hierarchy',
    status: hasSkippedLevels ? 'warning' : 'pass',
    message: hasSkippedLevels
      ? 'Heading hierarchy skips levels (H3 appears without H2). This can confuse screen readers and crawlers.'
      : `Heading structure: ${data.headings.h1Count} H1, ${data.headings.h2.length} H2, ${data.headings.h3.length} H3.`,
    evidence: `H1: ${data.headings.h1Count}, H2: ${data.headings.h2.length}, H3: ${data.headings.h3.length} | Total: ${data.headings.totalCount}`,
    source: 'crawled',
    importance: 'recommended',
    weight: 3,
  });

  // 9. Canonical URL
  checks.push({
    id: 'canonical-url',
    category: 'seo',
    title: 'Canonical URL',
    status: data.canonicalUrl ? 'pass' : 'warning',
    message: data.canonicalUrl
      ? `Canonical URL is set: ${data.canonicalUrl}`
      : 'No canonical URL specified. Without canonical tags, search engines may index duplicate versions of the page.',
    evidence: data.canonicalUrl
      ? `Canonical: ${data.canonicalUrl}`
      : 'No <link rel="canonical"> tag found.',
    source: 'crawled',
    importance: 'recommended',
    weight: 4,
  });

  // 10. Open Graph
  checks.push({
    id: 'og-metadata',
    category: 'seo',
    title: 'Open Graph Social Metadata',
    status: data.socialMeta.hasOgComplete ? 'pass' : 'warning',
    message: data.socialMeta.hasOgComplete
      ? 'Complete Open Graph metadata configured (og:title, og:description, og:image).'
      : `Incomplete social metadata. Missing: ${[
          !data.socialMeta.ogTitle && 'og:title',
          !data.socialMeta.ogDescription && 'og:description',
          !data.socialMeta.ogImage && 'og:image',
        ].filter(Boolean).join(', ') || 'og:title, og:description, og:image'}.`,
    evidence: `og:title: ${data.socialMeta.ogTitle ? 'present' : 'missing'} | og:description: ${data.socialMeta.ogDescription ? 'present' : 'missing'} | og:image: ${data.socialMeta.ogImage ? 'present' : 'missing'}`,
    source: 'crawled',
    importance: 'optional',
    weight: 3,
  });

  // 11. Robots Meta
  if (data.hasRobotsMeta) {
    const isNoindex = data.robotsMeta.toLowerCase().includes('noindex');
    checks.push({
      id: 'robots-meta',
      category: 'seo',
      title: 'Robots Meta Directive',
      status: isNoindex ? 'critical' : 'pass',
      message: isNoindex
        ? `Page contains "noindex" directive: "${data.robotsMeta}". This prevents search engines from indexing the page.`
        : `Robots meta configured: "${data.robotsMeta}".`,
      evidence: `Robots meta: "${data.robotsMeta}"`,
      source: 'crawled',
      importance: isNoindex ? 'critical' : 'recommended',
      weight: isNoindex ? 8 : 2,
    });
  }

  // 12. Image Alt Text
  if (data.images.totalCount === 0) {
    checks.push({
      id: 'image-alt-text',
      category: 'accessibility',
      title: 'Image Alt Text Coverage',
      status: 'unverified',
      message: 'No <img> elements found in parsed HTML. Unable to evaluate image accessibility.',
      evidence: '0 images detected in page HTML.',
      source: 'crawled',
      importance: 'critical',
      weight: 0,
    });
  } else if (data.images.missingAltCount === 0) {
    checks.push({
      id: 'image-alt-text',
      category: 'accessibility',
      title: 'Image Alt Text Coverage',
      status: 'pass',
      message: `All ${data.images.totalCount} images include descriptive alt attributes.`,
      evidence: `${data.images.totalCount}/${data.images.totalCount} images have alt text (100% coverage).`,
      source: 'crawled',
      importance: 'critical',
      weight: 10,
    });
  } else {
    const coverageStatus = data.images.altCoveragePercent >= 70 ? 'warning' : 'critical';
    checks.push({
      id: 'image-alt-text',
      category: 'accessibility',
      title: 'Image Alt Text Coverage',
      status: coverageStatus,
      message: `${data.images.missingAltCount} of ${data.images.totalCount} images are missing alt attributes (${data.images.altCoveragePercent}% coverage).`,
      evidence: `${data.images.missingAltCount} images missing alt text. Sample sources: ${data.images.missingAltSamples.slice(0, 3).join(', ') || 'N/A'}`,
      source: 'crawled',
      importance: 'critical',
      weight: 10,
    });
  }

  // 13. Viewport Meta
  const hasUnfriendlyZoom = data.viewport.includes('user-scalable=no') || data.viewport.includes('maximum-scale=1');
  if (!data.hasViewportMeta) {
    checks.push({
      id: 'viewport-meta',
      category: 'accessibility',
      title: 'Mobile Viewport Meta',
      status: 'critical',
      message: 'Missing viewport meta tag. The site will render as desktop scale on all mobile devices.',
      evidence: 'No <meta name="viewport"> tag found.',
      source: 'crawled',
      importance: 'critical',
      weight: 9,
    });
  } else if (hasUnfriendlyZoom) {
    checks.push({
      id: 'viewport-meta',
      category: 'accessibility',
      title: 'Mobile Viewport — Zoom Restriction',
      status: 'warning',
      message: 'Viewport restricts pinch-to-zoom (user-scalable=no or maximum-scale=1). This reduces accessibility for visually impaired users.',
      evidence: `Viewport: "${data.viewport}"`,
      source: 'crawled',
      importance: 'recommended',
      weight: 4,
    });
  } else {
    checks.push({
      id: 'viewport-meta',
      category: 'accessibility',
      title: 'Mobile Viewport Meta',
      status: 'pass',
      message: 'Responsive viewport meta tag is properly configured.',
      evidence: `Viewport: "${data.viewport}"`,
      source: 'crawled',
      importance: 'critical',
      weight: 9,
    });
  }

  // 14. Semantic Landmarks
  const keyLandmarks =
    (data.semantics.hasHeader ? 1 : 0) +
    (data.semantics.hasNav ? 1 : 0) +
    (data.semantics.hasMain ? 1 : 0) +
    (data.semantics.hasFooter ? 1 : 0);

  checks.push({
    id: 'semantic-landmarks',
    category: 'accessibility',
    title: 'Semantic HTML Landmarks',
    status: keyLandmarks >= 3 ? 'pass' : keyLandmarks >= 1 ? 'warning' : 'critical',
    message: keyLandmarks >= 3
      ? `Proper semantic document structure detected (${data.semantics.tagsFound.join(', ')}).`
      : keyLandmarks >= 1
        ? `Limited semantic landmarks (${data.semantics.tagsFound.join(', ')}). Consider adding <main>, <nav>, and <footer>.`
        : 'No HTML5 semantic landmarks detected. Page relies entirely on unsemantic containers.',
    evidence: `Landmarks found: ${data.semantics.tagsFound.join(', ') || 'none'} (${data.semantics.totalLandmarks} total)`,
    source: 'crawled',
    importance: 'recommended',
    weight: 5,
  });

  // 15. Empty Links
  if (data.links.emptyTextCount > 0) {
    checks.push({
      id: 'empty-links',
      category: 'accessibility',
      title: 'Accessible Link Text',
      status: data.links.emptyTextCount > 5 ? 'critical' : 'warning',
      message: `${data.links.emptyTextCount} link(s) have no visible text or aria-label. Screen readers cannot describe these navigation targets.`,
      evidence: `${data.links.emptyTextCount} links without accessible text detected.`,
      source: 'crawled',
      importance: 'recommended',
      weight: 5,
    });
  } else {
    checks.push({
      id: 'empty-links',
      category: 'accessibility',
      title: 'Accessible Link Text',
      status: 'pass',
      message: 'All links have accessible text content.',
      evidence: `0 empty link text anchors found across ${data.links.totalCount} total links.`,
      source: 'crawled',
      importance: 'recommended',
      weight: 5,
    });
  }

  // 16. Empty Buttons
  if (data.links.emptyButtonCount > 0) {
    checks.push({
      id: 'empty-buttons',
      category: 'accessibility',
      title: 'Accessible Button Names',
      status: data.links.emptyButtonCount > 3 ? 'critical' : 'warning',
      message: `${data.links.emptyButtonCount} button(s) lack accessible names (no text, aria-label, or title).`,
      evidence: `${data.links.emptyButtonCount} buttons without accessible names.`,
      source: 'crawled',
      importance: 'recommended',
      weight: 4,
    });
  }

  // 17. Form Labels
  if (data.forms.count > 0 && data.forms.hasInputsWithoutLabels) {
    checks.push({
      id: 'form-labels',
      category: 'accessibility',
      title: 'Form Input Labels',
      status: 'warning',
      message: `${data.forms.inputsWithoutLabels} of ${data.forms.totalInputs} form inputs lack associated labels, aria-labels, or placeholders.`,
      evidence: `${data.forms.inputsWithoutLabels}/${data.forms.totalInputs} inputs without labels across ${data.forms.count} form(s).`,
      source: 'crawled',
      importance: 'recommended',
      weight: 5,
    });
  }

  // 18. TTFB
  if (data.responseTimeMs < 300) {
    checks.push({
      id: 'ttfb',
      category: 'performance',
      title: 'Server Latency (TTFB)',
      status: 'pass',
      message: `Fast server response in ${data.responseTimeMs}ms.`,
      evidence: `TTFB: ${data.responseTimeMs}ms (target: under 300ms)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 8,
    });
  } else if (data.responseTimeMs < 800) {
    checks.push({
      id: 'ttfb',
      category: 'performance',
      title: 'Server Latency (TTFB)',
      status: 'warning',
      message: `Moderate server latency at ${data.responseTimeMs}ms. Could benefit from edge caching or CDN.`,
      evidence: `TTFB: ${data.responseTimeMs}ms (target: under 300ms)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 8,
    });
  } else {
    checks.push({
      id: 'ttfb',
      category: 'performance',
      title: 'Server Latency (TTFB)',
      status: 'critical',
      message: `Slow server response at ${data.responseTimeMs}ms. Exceeds 800ms threshold for acceptable user experience.`,
      evidence: `TTFB: ${data.responseTimeMs}ms (target: under 300ms)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 8,
    });
  }

  // 19. HTML Size
  const htmlSizeKB = Math.round(data.htmlSizeBytes / 1024);
  if (htmlSizeKB > 500) {
    checks.push({
      id: 'html-size',
      category: 'performance',
      title: 'HTML Document Size',
      status: 'warning',
      message: `HTML payload is ${htmlSizeKB} KB. Large HTML increases parse time and memory usage.`,
      evidence: `HTML size: ${htmlSizeKB} KB (${data.htmlSizeBytes} bytes)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 4,
    });
  } else if (htmlSizeKB > 1000) {
    checks.push({
      id: 'html-size',
      category: 'performance',
      title: 'HTML Document Size',
      status: 'critical',
      message: `HTML payload is ${htmlSizeKB} KB. Extremely large HTML document.`,
      evidence: `HTML size: ${htmlSizeKB} KB (${data.htmlSizeBytes} bytes)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 6,
    });
  } else {
    checks.push({
      id: 'html-size',
      category: 'performance',
      title: 'HTML Document Size',
      status: 'pass',
      message: `HTML payload is ${htmlSizeKB} KB — within acceptable range.`,
      evidence: `HTML size: ${htmlSizeKB} KB (${data.htmlSizeBytes} bytes)`,
      source: 'crawled',
      importance: 'recommended',
      weight: 4,
    });
  }

  // 20. Script Count
  if (data.performanceSignals.scriptsCount > 20) {
    checks.push({
      id: 'script-count',
      category: 'performance',
      title: 'External Scripts',
      status: 'warning',
      message: `${data.performanceSignals.scriptsCount} <script> tags detected. Excessive scripts increase page load time and execution overhead.`,
      evidence: `${data.performanceSignals.scriptsCount} script tags found in HTML.`,
      source: 'crawled',
      importance: 'recommended',
      weight: 5,
    });
  } else {
    checks.push({
      id: 'script-count',
      category: 'performance',
      title: 'External Scripts',
      status: 'pass',
      message: `${data.performanceSignals.scriptsCount} script tags — reasonable script count.`,
      evidence: `${data.performanceSignals.scriptsCount} script tags found in HTML.`,
      source: 'crawled',
      importance: 'recommended',
      weight: 5,
    });
  }

  // 21. Stylesheet Count
  if (data.performanceSignals.stylesheetsCount > 10) {
    checks.push({
      id: 'stylesheet-count',
      category: 'performance',
      title: 'Stylesheet Count',
      status: 'warning',
      message: `${data.performanceSignals.stylesheetsCount} external stylesheets detected. Many stylesheets increase HTTP requests.`,
      evidence: `${data.performanceSignals.stylesheetsCount} <link rel="stylesheet"> tags.`,
      source: 'crawled',
      importance: 'optional',
      weight: 3,
    });
  }

  // 22. CTA Links
  checks.push({
    id: 'cta-presence',
    category: 'conversion',
    title: 'Call-to-Action Links',
    status: data.links.ctaLinks.length > 0 ? 'pass' : 'warning',
    message: data.links.ctaLinks.length > 0
      ? `${data.links.ctaLinks.length} CTA-like link(s) detected: "${data.links.ctaLinks.slice(0, 3).join('", "')}"`
      : 'No explicit CTA anchor text detected. Primary conversion actions may not be clear to visitors.',
    evidence: data.links.ctaLinks.length > 0
      ? `CTAs found: ${data.links.ctaLinks.join(', ')}`
      : 'No CTA phrases (e.g., "Get Started", "Contact Us", "Sign Up") detected in link text.',
    source: 'crawled',
    importance: 'recommended',
    weight: 7,
  });

  // 23. Form Presence
  if (data.forms.count === 0) {
    checks.push({
      id: 'form-presence',
      category: 'conversion',
      title: 'Contact/Lead Form',
      status: 'warning',
      message: 'No <form> elements detected. Visitors may have no direct way to submit inquiries.',
      evidence: '0 forms found in page HTML.',
      source: 'crawled',
      importance: 'recommended',
      weight: 4,
    });
  } else {
    checks.push({
      id: 'form-presence',
      category: 'conversion',
      title: 'Contact/Lead Form',
      status: 'pass',
      message: `${data.forms.count} form(s) detected on the page.`,
      evidence: `${data.forms.count} form(s) with actions: ${data.forms.sampleFormActions.join(', ')}`,
      source: 'crawled',
      importance: 'recommended',
      weight: 4,
    });
  }

  // 24. Page Language
  checks.push({
    id: 'page-language',
    category: 'accessibility',
    title: 'Page Language Declaration',
    status: data.language ? 'pass' : 'warning',
    message: data.language
      ? `Page language declared as "${data.language}".`
      : 'No lang attribute on <html>. Screen readers cannot determine the correct pronunciation.',
    evidence: data.language ? `lang="${data.language}"` : 'No lang attribute found on <html>.',
    source: 'crawled',
    importance: 'recommended',
    weight: 3,
  });

  return checks;
}

/**
 * Calculate category scores purely from deterministic findings.
 * This is the authoritative scoring mechanism — AI scores are ONLY used as suggestions
 * and are overridden by this calculation.
 */
export function calculateScores(checks: DeterministicCheck[], data: ExtractedWebsiteData): {
  scores: AuditScores;
  breakdown: ScoreBreakdown[];
} {
  const categories: FindingCategory[] = ['seo', 'performance', 'ux', 'accessibility', 'conversion'];
  const breakdown: ScoreBreakdown[] = [];

  for (const cat of categories) {
    const catChecks = checks.filter((c) => c.category === cat);
    let rawScore = 0;
    let maxPossible = 0;
    let verifiedChecks = 0;
    let failedChecks = 0;
    let unverifiedChecks = 0;

    for (const check of catChecks) {
      if (check.status === 'unverified') {
        unverifiedChecks++;
        // Unverified checks do NOT reduce the score — they are excluded from maxPossible
        continue;
      }

      maxPossible += check.weight;

      if (check.status === 'pass') {
        rawScore += check.weight;
        verifiedChecks++;
      } else if (check.status === 'warning') {
        rawScore += check.weight * 0.5; // Warnings lose half the weight
        failedChecks++;
      } else if (check.status === 'critical') {
        // Critical issues have double penalty
        rawScore += check.weight * 0.2;
        failedChecks++;
      }
    }

    // If no checks exist for a category, default to 75 (neutral estimate)
    const score = maxPossible > 0
      ? Math.round(Math.min(100, Math.max(10, (rawScore / maxPossible) * 100)))
      : 75;

    breakdown.push({
      category: cat,
      rawScore,
      maxPossible,
      grade: gradeFromScore(score),
      verifiedChecks,
      failedChecks,
      unverifiedChecks,
    });
  }

  // Calculate weighted overall score
  let overallWeighted = 0;
  let totalWeight = 0;
  for (const b of breakdown) {
    const w = CATEGORY_WEIGHTS[b.category];
    overallWeighted += b.rawScore / Math.max(b.maxPossible, 1) * 100 * w;
    totalWeight += w;
  }
  const overall = totalWeight > 0
    ? Math.round(Math.min(100, Math.max(10, overallWeighted / totalWeight)))
    : 75;

  const scores: AuditScores = {
    ux: breakdown.find((b) => b.category === 'ux')?.rawScore !== undefined
      ? Math.round((breakdown.find((b) => b.category === 'ux')!.rawScore / Math.max(breakdown.find((b) => b.category === 'ux')!.maxPossible, 1)) * 100) || 75
      : 75,
    seo: Math.round((breakdown.find((b) => b.category === 'seo')!.rawScore / Math.max(breakdown.find((b) => b.category === 'seo')!.maxPossible, 1)) * 100) || 75,
    performance: Math.round((breakdown.find((b) => b.category === 'performance')!.rawScore / Math.max(breakdown.find((b) => b.category === 'performance')!.maxPossible, 1)) * 100) || 75,
    accessibility: Math.round((breakdown.find((b) => b.category === 'accessibility')!.rawScore / Math.max(breakdown.find((b) => b.category === 'accessibility')!.maxPossible, 1)) * 100) || 75,
    conversion: Math.round((breakdown.find((b) => b.category === 'conversion')!.rawScore / Math.max(breakdown.find((b) => b.category === 'conversion')!.maxPossible, 1)) * 100) || 75,
    overall,
    grade: gradeFromScore(overall),
  };

  // Clamp all scores
  scores.ux = Math.min(100, Math.max(10, scores.ux));
  scores.seo = Math.min(100, Math.max(10, scores.seo));
  scores.performance = Math.min(100, Math.max(10, scores.performance));
  scores.accessibility = Math.min(100, Math.max(10, scores.accessibility));
  scores.conversion = Math.min(100, Math.max(10, scores.conversion));

  // Recalculate overall with clamped scores
  scores.overall = Math.round(
    scores.ux * 0.22 +
    scores.seo * 0.22 +
    scores.performance * 0.20 +
    scores.accessibility * 0.18 +
    scores.conversion * 0.18
  );
  scores.grade = gradeFromScore(scores.overall);

  return { scores, breakdown };
}
