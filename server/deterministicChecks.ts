import type { DeterministicCheck, ExtractedWebsiteData } from '../src/types/audit.js';

export function runDeterministicChecks(data: ExtractedWebsiteData): DeterministicCheck[] {
  const checks: DeterministicCheck[] = [];

  // 1. SSL / HTTPS
  if (data.isHttps) {
    checks.push({
      id: 'ssl-https',
      category: 'seo',
      title: 'HTTPS & SSL Security',
      status: 'good',
      message: 'Website serves traffic over encrypted HTTPS connection.',
      importance: 'critical',
    });
  } else {
    checks.push({
      id: 'ssl-https',
      category: 'seo',
      title: 'HTTPS & SSL Security',
      status: 'issue',
      message: 'Website is served over unencrypted HTTP protocol. Modern browsers flag this as insecure.',
      importance: 'critical',
    });
  }

  // 2. Title Tag
  if (!data.title) {
    checks.push({
      id: 'page-title',
      category: 'seo',
      title: 'Page Title Tag',
      status: 'issue',
      message: 'Missing `<title>` tag. Search engines and browsers rely on page titles for indexing and tabs.',
      importance: 'critical',
    });
  } else if (data.title.length < 15) {
    checks.push({
      id: 'page-title',
      category: 'seo',
      title: 'Page Title Tag',
      status: 'warning',
      message: `Title tag is very short (${data.title.length} chars: "${data.title}"). Recommended length is 30–60 characters.`,
      metric: `${data.title.length} chars`,
      importance: 'recommended',
    });
  } else if (data.title.length > 70) {
    checks.push({
      id: 'page-title',
      category: 'seo',
      title: 'Page Title Tag',
      status: 'warning',
      message: `Title tag exceeds 70 characters (${data.title.length} chars). Search results may truncate it in SERP.`,
      metric: `${data.title.length} chars`,
      importance: 'recommended',
    });
  } else {
    checks.push({
      id: 'page-title',
      category: 'seo',
      title: 'Page Title Tag',
      status: 'good',
      message: `Title tag is well-proportioned (${data.title.length} chars).`,
      metric: `${data.title.length} chars`,
      importance: 'recommended',
    });
  }

  // 3. Meta Description
  if (!data.metaDescription) {
    checks.push({
      id: 'meta-description',
      category: 'seo',
      title: 'Meta Description',
      status: 'issue',
      message: 'Missing meta description tag. Search snippets will default to arbitrary page text.',
      importance: 'recommended',
    });
  } else if (data.metaDescription.length < 50) {
    checks.push({
      id: 'meta-description',
      category: 'seo',
      title: 'Meta Description',
      status: 'warning',
      message: `Meta description is short (${data.metaDescription.length} chars). Aim for 120–160 characters to maximize click-through rate.`,
      metric: `${data.metaDescription.length} chars`,
      importance: 'recommended',
    });
  } else {
    checks.push({
      id: 'meta-description',
      category: 'seo',
      title: 'Meta Description',
      status: 'good',
      message: `Meta description is present (${data.metaDescription.length} chars).`,
      metric: `${data.metaDescription.length} chars`,
      importance: 'recommended',
    });
  }

  // 4. H1 Heading Structure
  if (data.headings.h1Count === 0) {
    checks.push({
      id: 'h1-heading',
      category: 'seo',
      title: 'H1 Primary Heading',
      status: 'issue',
      message: 'No `<h1>` heading found on the page. Exactly one descriptive H1 is recommended for page theme clarity.',
      importance: 'critical',
    });
  } else if (data.headings.h1Count > 1) {
    checks.push({
      id: 'h1-heading',
      category: 'seo',
      title: 'H1 Primary Heading',
      status: 'warning',
      message: `Found ${data.headings.h1Count} ` + '`<h1>`' + ` headings. Best practice is a single primary H1 heading per document.`,
      metric: `${data.headings.h1Count} H1 tags`,
      importance: 'recommended',
    });
  } else {
    checks.push({
      id: 'h1-heading',
      category: 'seo',
      title: 'H1 Primary Heading',
      status: 'good',
      message: 'Proper single `<h1>` heading structure found.',
      metric: data.headings.h1[0]?.slice(0, 45) + (data.headings.h1[0]?.length > 45 ? '...' : ''),
      importance: 'recommended',
    });
  }

  // 5. Image Alt Attributes
  if (data.images.totalCount === 0) {
    checks.push({
      id: 'image-alt-tags',
      category: 'accessibility',
      title: 'Image Alt Attributes',
      status: 'unverified',
      message: 'No `<img>` tags found in parsed HTML.',
      importance: 'optional',
    });
  } else if (data.images.missingAltCount === 0) {
    checks.push({
      id: 'image-alt-tags',
      category: 'accessibility',
      title: 'Image Alt Attributes',
      status: 'good',
      message: `All ${data.images.totalCount} detected images include descriptive 'alt' attributes.`,
      metric: '100% covered',
      importance: 'critical',
    });
  } else if (data.images.altCoveragePercent >= 70) {
    checks.push({
      id: 'image-alt-tags',
      category: 'accessibility',
      title: 'Image Alt Attributes',
      status: 'warning',
      message: `${data.images.missingAltCount} out of ${data.images.totalCount} images are missing 'alt' attributes (${data.images.altCoveragePercent}% coverage).`,
      metric: `${data.images.altCoveragePercent}% covered`,
      importance: 'critical',
    });
  } else {
    checks.push({
      id: 'image-alt-tags',
      category: 'accessibility',
      title: 'Image Alt Attributes',
      status: 'issue',
      message: `Critical accessibility barrier: ${data.images.missingAltCount} out of ${data.images.totalCount} images lack 'alt' text (${data.images.altCoveragePercent}% coverage).`,
      metric: `${data.images.missingAltCount} missing`,
      importance: 'critical',
    });
  }

  // 6. Viewport Meta Tag (Mobile Readiness)
  if (data.hasViewportMeta) {
    const hasUnfriendlyZoom =
      data.viewport.includes('user-scalable=no') || data.viewport.includes('maximum-scale=1');
    if (hasUnfriendlyZoom) {
      checks.push({
        id: 'viewport-meta',
        category: 'accessibility',
        title: 'Mobile Viewport & Zoom',
        status: 'warning',
        message: 'Viewport tag restricts user pinch-to-zoom (user-scalable=no/maximum-scale=1), reducing accessibility for visually impaired users.',
        importance: 'recommended',
      });
    } else {
      checks.push({
        id: 'viewport-meta',
        category: 'ux',
        title: 'Mobile Responsive Viewport',
        status: 'good',
        message: 'Responsive viewport meta tag is properly configured.',
        metric: 'Configured',
        importance: 'critical',
      });
    }
  } else {
    checks.push({
      id: 'viewport-meta',
      category: 'ux',
      title: 'Mobile Responsive Viewport',
      status: 'issue',
      message: 'Missing `<meta name="viewport">` tag. The site will render as desktop scale on mobile devices.',
      importance: 'critical',
    });
  }

  // 7. Semantic HTML Landmarks
  const keyLandmarksCount =
    (data.semantics.hasHeader ? 1 : 0) +
    (data.semantics.hasNav ? 1 : 0) +
    (data.semantics.hasMain ? 1 : 0) +
    (data.semantics.hasFooter ? 1 : 0);

  if (keyLandmarksCount >= 3) {
    checks.push({
      id: 'semantic-landmarks',
      category: 'accessibility',
      title: 'Semantic HTML Landmarks',
      status: 'good',
      message: `Proper document outline with semantic tags (${data.semantics.tagsFound.join(', ')}).`,
      metric: `${data.semantics.totalLandmarks} tags detected`,
      importance: 'recommended',
    });
  } else if (keyLandmarksCount >= 1) {
    checks.push({
      id: 'semantic-landmarks',
      category: 'accessibility',
      title: 'Semantic HTML Landmarks',
      status: 'warning',
      message: `Limited semantic landmarks detected (${data.semantics.tagsFound.join(', ')}). Consider using <main>, <nav>, and <footer> for accessible assistive navigation.`,
      importance: 'recommended',
    });
  } else {
    checks.push({
      id: 'semantic-landmarks',
      category: 'accessibility',
      title: 'Semantic HTML Landmarks',
      status: 'issue',
      message: 'No standard HTML5 semantic landmarks (<header>, <nav>, <main>, <footer>) detected. Page appears built with unsemantic div containers.',
      importance: 'recommended',
    });
  }

  // 8. Server Response Latency (TTFB)
  if (data.responseTimeMs < 450) {
    checks.push({
      id: 'response-latency',
      category: 'performance',
      title: 'Server Latency (TTFB)',
      status: 'good',
      message: `Fast initial HTML server response time (${data.responseTimeMs}ms).`,
      metric: `${data.responseTimeMs}ms`,
      importance: 'recommended',
    });
  } else if (data.responseTimeMs < 1200) {
    checks.push({
      id: 'response-latency',
      category: 'performance',
      title: 'Server Latency (TTFB)',
      status: 'warning',
      message: `Moderate server latency (${data.responseTimeMs}ms). Initial HTML delivery could be optimized with edge caching or CDN.`,
      metric: `${data.responseTimeMs}ms`,
      importance: 'recommended',
    });
  } else {
    checks.push({
      id: 'response-latency',
      category: 'performance',
      title: 'Server Latency (TTFB)',
      status: 'issue',
      message: `Slow server response time (${data.responseTimeMs}ms). Exceeds the 1000ms threshold recommended for smooth user experience.`,
      metric: `${data.responseTimeMs}ms`,
      importance: 'recommended',
    });
  }

  // 9. Open Graph & Social Cards
  if (data.socialMeta.hasOgComplete) {
    checks.push({
      id: 'social-meta',
      category: 'conversion',
      title: 'Open Graph Social Cards',
      status: 'good',
      message: 'Complete Open Graph metadata configured (og:title, og:description, og:image).',
      importance: 'optional',
    });
  } else {
    checks.push({
      id: 'social-meta',
      category: 'conversion',
      title: 'Open Graph Social Cards',
      status: 'warning',
      message: `Incomplete social share metadata. Missing: ${[
        !data.socialMeta.ogTitle && 'og:title',
        !data.socialMeta.ogDescription && 'og:description',
        !data.socialMeta.ogImage && 'og:image',
      ]
        .filter(Boolean)
        .join(', ')}. Shares on Twitter/LinkedIn will lack rich previews.`,
      importance: 'optional',
    });
  }

  // 10. Empty Link Anchors
  if (data.links.emptyTextCount > 0) {
    checks.push({
      id: 'empty-links',
      category: 'accessibility',
      title: 'Accessible Link Text',
      status: 'warning',
      message: `Found ${data.links.emptyTextCount} link(s) without visible text or aria-label. Screen readers cannot describe these navigation targets.`,
      metric: `${data.links.emptyTextCount} empty`,
      importance: 'recommended',
    });
  }

  return checks;
}
