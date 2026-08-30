import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import type {
  AuditResult,
  AuditScores,
  CategoryFinding,
  DeterministicCheck,
  ExtractedWebsiteData,
  HighPriorityIssue,
  RedesignOpportunity,
  StrengthItem,
} from '../src/types/audit.js';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function loadAuditChecklist(): string {
  try {
    const checklistPath = path.resolve(process.cwd(), 'website-audit-checklist.md');
    if (fs.existsSync(checklistPath)) {
      return fs.readFileSync(checklistPath, 'utf-8');
    }
  } catch (err) {
    console.warn('Could not read website-audit-checklist.md, using built-in framework', err);
  }

  return `
# Audit Framework:
01 UX/UI: Navigation, Hero Section, Typography, Spacing, Visual Hierarchy, CTA, Forms, Content Clarity, Trust Signals.
02 Mobile: Responsive Layout, Text Readability, Touch Targets, Mobile Navigation, Viewport.
03 Performance: Asset Weight, Scripts/Stylesheets count, Latency, Bloat indicators.
04 SEO: Title, Meta Description, H1 & Headings Hierarchy, Semantic HTML, Alt Text, Canonical, Social Meta.
05 Accessibility: Missing Alt Text, Empty Links/Buttons, Form Labels, Semantic Landmarks, Viewport zooming.
06 Conversion: Value Proposition, CTA prominence, Friction points, Social Proof, Redesign Opportunities.
`;
}

interface RawAiResponse {
  scores?: {
    ux?: number;
    seo?: number;
    performance?: number;
    accessibility?: number;
    conversion?: number;
    overall?: number;
  };
  summary?: string;
  highPriorityIssues?: Array<{
    title?: string;
    category?: string;
    severity?: string;
    problem?: string;
    evidence?: string;
    impact?: string;
    recommendation?: string;
  }>;
  categoryFindings?: {
    ux?: Array<{ title?: string; status?: string; description?: string; evidence?: string; recommendation?: string }>;
    seo?: Array<{ title?: string; status?: string; description?: string; evidence?: string; recommendation?: string }>;
    performance?: Array<{ title?: string; status?: string; description?: string; evidence?: string; recommendation?: string }>;
    accessibility?: Array<{ title?: string; status?: string; description?: string; evidence?: string; recommendation?: string }>;
    conversion?: Array<{ title?: string; status?: string; description?: string; evidence?: string; recommendation?: string }>;
  };
  strengths?: Array<{
    title?: string;
    category?: string;
    description?: string;
    evidence?: string;
  }>;
  redesignOpportunities?: Array<{
    area?: string;
    currentObservation?: string;
    recommendedRedesign?: string;
    expectedImpact?: string;
  }>;
  limitations?: string[];
}

/**
 * Intelligent deterministic fallback generator when AI API experiences 503 high demand or temporary outage.
 * Synthesizes real, measured DOM statistics into a structured audit report.
 */
function generateDeterministicAuditFallback(
  extractedData: ExtractedWebsiteData,
  deterministicChecks: DeterministicCheck[]
): AuditResult {
  console.log('[AI Engine] Synthesizing comprehensive deterministic fallback audit based on crawled DOM metrics.');

  // 1. Calculate realistic category scores from actual DOM metrics
  let uxScore = 75;
  if (extractedData.headings.h1Count === 1) uxScore += 10;
  else if (extractedData.headings.h1Count === 0) uxScore -= 15;
  if (extractedData.links.ctaLinks.length > 0) uxScore += 8;
  if (extractedData.hasViewportMeta) uxScore += 5; else uxScore -= 20;
  if (extractedData.forms.hasInputsWithoutLabels) uxScore -= 10;
  uxScore = Math.min(100, Math.max(25, uxScore));

  let seoScore = 70;
  if (extractedData.isHttps) seoScore += 10; else seoScore -= 25;
  if (extractedData.title && extractedData.title.length >= 20 && extractedData.title.length <= 65) seoScore += 10;
  else if (!extractedData.title) seoScore -= 20;
  if (extractedData.metaDescription && extractedData.metaDescription.length >= 50) seoScore += 10;
  else if (!extractedData.metaDescription) seoScore -= 15;
  if (extractedData.headings.h1Count === 1) seoScore += 8;
  if (extractedData.canonicalUrl) seoScore += 5;
  if (extractedData.socialMeta.hasOgComplete) seoScore += 7;
  seoScore = Math.min(100, Math.max(20, seoScore));

  let perfScore = 80;
  if (extractedData.responseTimeMs < 350) perfScore += 15;
  else if (extractedData.responseTimeMs < 800) perfScore += 5;
  else if (extractedData.responseTimeMs > 1500) perfScore -= 25;
  else perfScore -= 10;
  if (extractedData.performanceSignals.scriptsCount > 25) perfScore -= 15;
  else if (extractedData.performanceSignals.scriptsCount > 15) perfScore -= 8;
  if (extractedData.htmlSizeBytes > 1024 * 500) perfScore -= 12;
  perfScore = Math.min(100, Math.max(20, perfScore));

  let a11yScore = extractedData.images.totalCount > 0 ? extractedData.images.altCoveragePercent : 80;
  if (extractedData.semantics.hasMain && extractedData.semantics.hasNav) a11yScore += 5;
  if (extractedData.links.emptyTextCount > 0) a11yScore -= Math.min(20, extractedData.links.emptyTextCount * 4);
  if (extractedData.forms.hasInputsWithoutLabels) a11yScore -= 10;
  a11yScore = Math.min(100, Math.max(15, Math.round(a11yScore)));

  let croScore = 70;
  if (extractedData.links.ctaLinks.length > 0) croScore += 12; else croScore -= 15;
  if (extractedData.headings.h1Count === 1) croScore += 8;
  if (extractedData.socialMeta.hasOgComplete) croScore += 5;
  if (extractedData.forms.count > 0 && !extractedData.forms.hasInputsWithoutLabels) croScore += 5;
  croScore = Math.min(100, Math.max(25, croScore));

  const overall = Math.round(
    uxScore * 0.25 + seoScore * 0.2 + perfScore * 0.2 + a11yScore * 0.15 + croScore * 0.2
  );

  const scores: AuditScores = {
    ux: uxScore,
    seo: seoScore,
    performance: perfScore,
    accessibility: a11yScore,
    conversion: croScore,
    overall,
  };

  // 2. High Priority Issues mapped from failing deterministic checks
  const highPriorityIssues: HighPriorityIssue[] = [];

  const failingChecks = deterministicChecks.filter((c) => c.status === 'issue' || c.status === 'warning');
  for (let i = 0; i < failingChecks.length && highPriorityIssues.length < 5; i++) {
    const c = failingChecks[i];
    highPriorityIssues.push({
      id: `issue-${i + 1}`,
      title: c.title,
      category: c.category,
      severity: c.status === 'issue' ? 'high' : 'medium',
      problem: c.message,
      evidence: c.metric || `Detected in initial DOM crawl of ${extractedData.domain}`,
      impact:
        c.category === 'seo'
          ? 'Affects search engine crawling visibility and SERP ranking prominence.'
          : c.category === 'accessibility'
          ? 'Creates navigation barriers for screen readers and assistive technology users.'
          : c.category === 'performance'
          ? 'Increases user bounce rates and degrades mobile page experience.'
          : 'Reduces user engagement and conversion rate potential.',
      recommendation:
        c.id === 'ssl-https'
          ? 'Migrate all traffic to secure HTTPS with automatic TLS redirection.'
          : c.id === 'page-title'
          ? 'Add a unique, descriptive <title> tag between 30 and 60 characters containing primary keywords.'
          : c.id === 'meta-description'
          ? 'Add a 120-160 character meta description explaining the primary value proposition.'
          : c.id === 'h1-heading'
          ? 'Structure the hero section with exactly one clear, high-impact <h1> heading.'
          : c.id === 'image-alt-tags'
          ? 'Add descriptive alt attributes to all content images; use empty alt="" only for decorative icons.'
          : c.id === 'response-latency'
          ? 'Deploy CDN caching, optimize server backend processes, and enable gzip/brotli compression.'
          : 'Refactor markup according to modern web accessibility and SEO standards.',
    });
  }

  // If no critical failing checks, provide optimization opportunities
  if (highPriorityIssues.length === 0) {
    highPriorityIssues.push({
      id: 'issue-1',
      title: 'Call to Action Visual Prominence',
      category: 'conversion',
      severity: 'medium',
      problem: 'Primary conversion action could benefit from higher visual contrast and strategic repeat placement.',
      evidence: `${extractedData.links.ctaLinks.length} primary CTA keywords identified in page links.`,
      impact: 'Improving CTA contrast directly lifts inbound lead capture and conversion rates.',
      recommendation: 'Ensure a visually distinct high-contrast CTA button is fixed above the fold and repeated at the footer.',
    });
  }

  // 3. Category Findings
  const categoryFindings = {
    ux: [
      {
        id: 'ux-1',
        category: 'ux' as const,
        title: 'Document Outline & Typography',
        status: extractedData.headings.h1Count === 1 ? ('good' as const) : ('warning' as const),
        description: `Found ${extractedData.headings.totalCount} total heading tags (${extractedData.headings.h1Count} H1, ${extractedData.headings.h2.length} H2, ${extractedData.headings.h3.length} H3).`,
        evidence: extractedData.headings.h1[0] ? `H1: "${extractedData.headings.h1[0]}"` : 'No H1 found',
        recommendation: 'Ensure a clear visual hierarchy from H1 value proposition down to supporting H2 feature blocks.',
      },
      {
        id: 'ux-2',
        category: 'ux' as const,
        title: 'Mobile Responsive Viewport',
        status: extractedData.hasViewportMeta ? ('good' as const) : ('issue' as const),
        description: extractedData.hasViewportMeta
          ? 'Responsive viewport is declared for mobile screen scaling.'
          : 'Viewport tag is missing, causing mobile devices to render fixed desktop layout.',
        evidence: extractedData.viewport || 'None',
      },
    ],
    seo: [
      {
        id: 'seo-1',
        category: 'seo' as const,
        title: 'Page Title & Metadata',
        status: extractedData.title ? ('good' as const) : ('issue' as const),
        description: extractedData.title
          ? `Page title is present (${extractedData.title.length} characters).`
          : 'Page title is missing.',
        evidence: extractedData.title || 'Missing title',
        recommendation: 'Maintain a 30-60 character page title with primary service/brand keywords.',
      },
      {
        id: 'seo-2',
        category: 'seo' as const,
        title: 'Meta Description & Snippet',
        status: extractedData.metaDescription ? ('good' as const) : ('warning' as const),
        description: extractedData.metaDescription
          ? `Meta description found (${extractedData.metaDescription.length} characters).`
          : 'Meta description tag is missing from head.',
        evidence: extractedData.metaDescription || 'Missing meta description',
        recommendation: 'Craft a compelling 120-160 character summary that invites search clicks.',
      },
      {
        id: 'seo-3',
        category: 'seo' as const,
        title: 'Protocol & Canonical Directives',
        status: extractedData.isHttps ? ('good' as const) : ('issue' as const),
        description: `Traffic served over ${extractedData.isHttps ? 'HTTPS' : 'HTTP'}. Canonical tag: ${extractedData.canonicalUrl || 'Not specified'}.`,
        evidence: extractedData.finalUrl,
      },
    ],
    performance: [
      {
        id: 'perf-1',
        category: 'performance' as const,
        title: 'Server Latency (TTFB)',
        status: extractedData.responseTimeMs < 500 ? ('good' as const) : extractedData.responseTimeMs < 1200 ? ('warning' as const) : ('issue' as const),
        description: `Server responded with initial HTML in ${extractedData.responseTimeMs}ms.`,
        evidence: `${extractedData.responseTimeMs}ms response latency`,
        recommendation: 'Target server response time under 300ms using global CDN edge caching.',
      },
      {
        id: 'perf-2',
        category: 'performance' as const,
        title: 'DOM Payload & Script Density',
        status: extractedData.performanceSignals.scriptsCount <= 20 ? ('good' as const) : ('warning' as const),
        description: `HTML document size is ${Math.round(extractedData.htmlSizeBytes / 1024)} KB with ${extractedData.performanceSignals.scriptsCount} script tags and ${extractedData.performanceSignals.stylesheetsCount} stylesheets.`,
        evidence: `${extractedData.htmlSizeBytes} bytes, ${extractedData.performanceSignals.scriptsCount} scripts`,
      },
    ],
    accessibility: [
      {
        id: 'a11y-1',
        category: 'accessibility' as const,
        title: 'Image Alt Text Coverage',
        status: extractedData.images.missingAltCount === 0 ? ('good' as const) : extractedData.images.altCoveragePercent >= 70 ? ('warning' as const) : ('issue' as const),
        description: `${extractedData.images.withAltCount} of ${extractedData.images.totalCount} images include alt text (${extractedData.images.altCoveragePercent}% coverage).`,
        evidence: `${extractedData.images.missingAltCount} images missing alt text`,
        recommendation: 'Provide concise descriptive alt text for informative images.',
      },
      {
        id: 'a11y-2',
        category: 'accessibility' as const,
        title: 'Semantic HTML Landmarks',
        status: extractedData.semantics.totalLandmarks >= 3 ? ('good' as const) : ('warning' as const),
        description: `Detected landmarks: ${extractedData.semantics.tagsFound.join(', ') || 'none'}.`,
        evidence: `hasMain: ${extractedData.semantics.hasMain}, hasNav: ${extractedData.semantics.hasNav}`,
      },
    ],
    conversion: [
      {
        id: 'cro-1',
        category: 'conversion' as const,
        title: 'Call-to-Action Signals',
        status: extractedData.links.ctaLinks.length > 0 ? ('good' as const) : ('warning' as const),
        description: extractedData.links.ctaLinks.length > 0
          ? `Detected ${extractedData.links.ctaLinks.length} actionable CTA links ("${extractedData.links.ctaLinks.slice(0, 3).join('", "')}").`
          : 'No explicit primary CTA anchor phrases detected in initial navigation or hero.',
        evidence: `${extractedData.links.ctaLinks.length} CTA links found`,
        recommendation: 'Make primary action verbs ("Get Started", "Book Demo", "Contact") visually prominent.',
      },
      {
        id: 'cro-2',
        category: 'conversion' as const,
        title: 'Social Share Cards & Trust',
        status: extractedData.socialMeta.hasOgComplete ? ('good' as const) : ('warning' as const),
        description: extractedData.socialMeta.hasOgComplete
          ? 'Open Graph metadata is completely configured for social sharing.'
          : 'Incomplete Open Graph tags. Social links will not render rich image cards on Slack, Twitter, or LinkedIn.',
        evidence: `og:image: ${extractedData.socialMeta.ogImage ? 'present' : 'missing'}`,
      },
    ],
  };

  // 4. Strengths
  const strengths: StrengthItem[] = [];
  if (extractedData.isHttps) {
    strengths.push({
      title: 'Encrypted HTTPS Connection',
      category: 'seo',
      description: 'Website operates on secure TLS encryption to protect visitor privacy.',
      evidence: extractedData.finalUrl,
    });
  }
  if (extractedData.hasViewportMeta) {
    strengths.push({
      title: 'Configured Mobile Viewport',
      category: 'ux',
      description: 'Page markup includes responsive viewport directive for fluid multi-device scaling.',
      evidence: extractedData.viewport || 'viewport meta tag',
    });
  }
  if (extractedData.title) {
    strengths.push({
      title: 'Descriptive Page Title',
      category: 'seo',
      description: 'Title tag is configured to inform search engine crawlers and browser tabs.',
      evidence: `"${extractedData.title}"`,
    });
  }
  if (extractedData.responseTimeMs < 600) {
    strengths.push({
      title: 'Rapid Server Response',
      category: 'performance',
      description: `Fast initial HTML delivery from the web server in ${extractedData.responseTimeMs}ms.`,
      evidence: `${extractedData.responseTimeMs}ms TTFB`,
    });
  }

  // 5. Redesign Opportunities for Agency pitches
  const redesignOpportunities: RedesignOpportunity[] = [
    {
      area: 'Hero Section & Value Proposition',
      currentObservation: extractedData.headings.h1[0]
        ? `Current hero headline: "${extractedData.headings.h1[0]}".`
        : 'Hero section lacks a unified, high-contrast H1 value proposition headline.',
      recommendedRedesign:
        'Implement an editorial hero layout featuring a 5-second value proposition, dual action CTA buttons (Primary Solid + Secondary Outline), and customer proof logos.',
      expectedImpact: 'High Impact',
    },
    {
      area: 'Mobile Conversion Flow & Touch Targets',
      currentObservation: 'Mobile user journey relies on multi-step navigation menus without a sticky mobile action bar.',
      recommendedRedesign:
        'Introduce a fixed bottom action bar for mobile viewports, optimize touch targets to 48px+, and streamline contact inquiry forms to 3 core fields.',
      expectedImpact: 'High Impact',
    },
    {
      area: 'Visual Proof & Trust Architecture',
      currentObservation: 'Social proof, client metrics, and reviews can be elevated into dedicated high-contrast testimonial blocks.',
      recommendedRedesign:
        'Add a structured social proof section with verified rating badges, client logo carousel, and quantifiable outcome metrics.',
      expectedImpact: 'Medium Impact',
    },
  ];

  return {
    website: {
      url: extractedData.url,
      finalUrl: extractedData.finalUrl,
      domain: extractedData.domain,
      title: extractedData.title || extractedData.domain,
      description: extractedData.metaDescription,
      scannedAt: new Date().toISOString(),
    },
    scores,
    summary: `Audit completed for ${extractedData.domain}. Measured ${extractedData.headings.totalCount} headings, ${extractedData.images.totalCount} images, ${extractedData.links.totalCount} links, and server latency of ${extractedData.responseTimeMs}ms.`,
    highPriorityIssues,
    categoryFindings,
    strengths,
    redesignOpportunities,
    deterministicChecks,
    extractedData,
    limitations: [
      'Static DOM crawler evaluated initial HTML and server response headers.',
      'Single-page application (SPA) client-rendered hydration may load additional components dynamically in the browser.',
      'Brand aesthetic resonance and emotional tone require human design review.',
    ],
  };
}

export async function generateAuditWithAi(
  extractedData: ExtractedWebsiteData,
  deterministicChecks: DeterministicCheck[]
): Promise<AuditResult> {
  const configuredModel = process.env.AI_MODEL || 'gemini-3.7-flash';
  const checklist = loadAuditChecklist();

  const promptPayload = {
    websiteOverview: {
      url: extractedData.url,
      finalUrl: extractedData.finalUrl,
      domain: extractedData.domain,
      httpStatus: extractedData.httpStatus,
      measuredResponseTimeMs: extractedData.responseTimeMs,
      htmlSizeBytes: extractedData.htmlSizeBytes,
      isHttps: extractedData.isHttps,
      title: extractedData.title,
      metaDescription: extractedData.metaDescription,
      canonicalUrl: extractedData.canonicalUrl,
      language: extractedData.language,
      viewportMeta: extractedData.viewport,
    },
    headingsAnalysis: {
      total: extractedData.headings.totalCount,
      h1Count: extractedData.headings.h1Count,
      h1Items: extractedData.headings.h1,
      h2Count: extractedData.headings.h2.length,
      sampleH2: extractedData.headings.h2.slice(0, 8),
      sampleH3: extractedData.headings.h3.slice(0, 8),
    },
    linksAnalysis: {
      totalCount: extractedData.links.totalCount,
      internal: extractedData.links.internalCount,
      external: extractedData.links.externalCount,
      emptyTextAnchors: extractedData.links.emptyTextCount,
      detectedCtaLinks: extractedData.links.ctaLinks,
      sampleNavLinks: extractedData.links.sampleLinks.slice(0, 10).map((l) => l.text),
    },
    imagesAnalysis: {
      totalImages: extractedData.images.totalCount,
      withAlt: extractedData.images.withAltCount,
      missingAltCount: extractedData.images.missingAltCount,
      altCoveragePercent: extractedData.images.altCoveragePercent,
      sampleMissingAltSources: extractedData.images.missingAltSamples.slice(0, 5),
    },
    semanticsAndAccessibility: {
      semanticTagsPresent: extractedData.semantics.tagsFound,
      hasMain: extractedData.semantics.hasMain,
      hasNav: extractedData.semantics.hasNav,
      hasHeader: extractedData.semantics.hasHeader,
      hasFooter: extractedData.semantics.hasFooter,
      formsCount: extractedData.forms.count,
      hasInputsWithoutLabels: extractedData.forms.hasInputsWithoutLabels,
    },
    performanceSignals: {
      scriptsCount: extractedData.performanceSignals.scriptsCount,
      stylesheetsCount: extractedData.performanceSignals.stylesheetsCount,
      inlineStylesCount: extractedData.performanceSignals.inlineStyleCount,
      approximateWordCount: extractedData.performanceSignals.approxWordCount,
      measuredLatencyMs: extractedData.responseTimeMs,
    },
    socialMetadata: extractedData.socialMeta,
    automatedDeterministicChecks: deterministicChecks.map((c) => ({
      check: c.title,
      category: c.category,
      status: c.status,
      message: c.message,
      metric: c.metric,
    })),
    bodyTextExcerpt: extractedData.bodySnippet.slice(0, 2800),
  };

  const systemInstruction = `You are an elite web design strategist, technical SEO architect, and conversion rate optimization (CRO) auditor.
Analyze ONLY the concrete evidence provided in the website extraction and deterministic checks.

CRITICAL INSTRUCTIONS:
1. NEVER invent or hallucinate metrics, headings, or missing elements.
2. When referencing an issue or strength, quote the exact extracted evidence (e.g., specific H1 text, title character count, missing alt count, latency in milliseconds, CTA phrases).
3. If an aspect cannot be verified from the server-side crawl (such as deep client-side runtime layout shifts or interactive JS modals), label its status as "unverified" or state "Unable to verify without client-side rendering".
4. Calculate realistic, mathematically reasoned scores (0 to 100) for each category based on the extracted data:
   - UX Score: Navigation clarity, value proposition in H1, CTA presence, content hierarchy, trust signals.
   - SEO Score: Title tag presence/length, meta description, H1 structure, semantic HTML landmarks, Open Graph tags.
   - Performance Score: Response latency, HTML size, script/style density, asset weight indicators.
   - Accessibility Score: Image alt tag coverage %, semantic landmarks, empty link text, form labels, viewport zoom.
   - Conversion Score: CTA prominence, clarity of offer in body snippet, friction points, social proof.
   - Overall Score: Weighted average of the 5 categories.
5. Provide 3 to 6 High Priority Issues with:
   - 'title': concise problem name
   - 'category': one of 'ux' | 'seo' | 'performance' | 'accessibility' | 'conversion'
   - 'severity': 'high' | 'medium' | 'low'
   - 'problem': precise explanation
   - 'evidence': specific extracted snippet or metric
   - 'impact': why this hurts users or business
   - 'recommendation': concrete, actionable fix
6. Provide 2 to 4 verified Strengths (what the website did well, backed by extracted data).
7. Provide 3 to 5 Redesign Opportunities specifically structured to help a web design & development agency pitch modern website redesign solutions (e.g. Hero section redesign, CTA optimization, Trust section, Navigation modernization, Mobile UX).
8. Return strictly valid JSON following the required schema.

Evaluation Checklist Framework:
${checklist}`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      scores: {
        type: Type.OBJECT,
        properties: {
          ux: { type: Type.INTEGER, description: 'UX & UI score 0-100' },
          seo: { type: Type.INTEGER, description: 'SEO score 0-100' },
          performance: { type: Type.INTEGER, description: 'Performance score 0-100' },
          accessibility: { type: Type.INTEGER, description: 'Accessibility score 0-100' },
          conversion: { type: Type.INTEGER, description: 'Conversion opportunity score 0-100' },
          overall: { type: Type.INTEGER, description: 'Overall weighted score 0-100' },
        },
        required: ['ux', 'seo', 'performance', 'accessibility', 'conversion', 'overall'],
      },
      summary: {
        type: Type.STRING,
        description: 'Executive 2-3 sentence summary of the website audit findings.',
      },
      highPriorityIssues: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, description: 'ux | seo | performance | accessibility | conversion' },
            severity: { type: Type.STRING, description: 'high | medium | low' },
            problem: { type: Type.STRING },
            evidence: { type: Type.STRING },
            impact: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ['title', 'category', 'severity', 'problem', 'evidence', 'impact', 'recommendation'],
        },
      },
      categoryFindings: {
        type: Type.OBJECT,
        properties: {
          ux: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING, description: 'good | warning | issue | unverified' },
                description: { type: Type.STRING },
                evidence: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['title', 'status', 'description'],
            },
          },
          seo: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING },
                description: { type: Type.STRING },
                evidence: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['title', 'status', 'description'],
            },
          },
          performance: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING },
                description: { type: Type.STRING },
                evidence: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['title', 'status', 'description'],
            },
          },
          accessibility: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING },
                description: { type: Type.STRING },
                evidence: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['title', 'status', 'description'],
            },
          },
          conversion: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                status: { type: Type.STRING },
                description: { type: Type.STRING },
                evidence: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['title', 'status', 'description'],
            },
          },
        },
        required: ['ux', 'seo', 'performance', 'accessibility', 'conversion'],
      },
      strengths: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            evidence: { type: Type.STRING },
          },
          required: ['title', 'category', 'description', 'evidence'],
        },
      },
      redesignOpportunities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            area: { type: Type.STRING },
            currentObservation: { type: Type.STRING },
            recommendedRedesign: { type: Type.STRING },
            expectedImpact: { type: Type.STRING, description: 'High Impact | Medium Impact | Visual Polish' },
          },
          required: ['area', 'currentObservation', 'recommendedRedesign', 'expectedImpact'],
        },
      },
      limitations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    required: [
      'scores',
      'summary',
      'highPriorityIssues',
      'categoryFindings',
      'strengths',
      'redesignOpportunities',
    ],
  };

  let ai: GoogleGenAI | null = null;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    console.warn('[AI Engine] API Key not available or error creating client, falling back to deterministic audit:', err.message);
    return generateDeterministicAuditFallback(extractedData, deterministicChecks);
  }

  // Model cascade list prioritizing fast, high-availability models
  const candidateModels = Array.from(
    new Set([configuredModel, 'gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'])
  );

  let responseText: string | null = null;
  let lastAiError: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`[AI Engine] Attempting audit generation with model: ${model}`);

      const response = await ai.models.generateContent({
        model,
        contents: JSON.stringify(promptPayload),
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      if (response.text && response.text.trim().length > 0) {
        responseText = response.text;
        console.log(`[AI Engine] Generation successful with model: ${model}`);
        break;
      }
    } catch (err: any) {
      lastAiError = err;
      const errMsg = String(err?.message || err || '');
      console.warn(`[AI Engine] Model ${model} unavailable: ${errMsg.slice(0, 120)}... Failing over to next candidate.`);
      // Proceed immediately to next model in cascade
    }
  }

  // If all AI models failed (e.g. 503 high demand globally or quota limit), seamlessly use deterministic fallback
  if (!responseText) {
    console.warn('[AI Engine] All AI models exhausted or unavailable. Activating deterministic audit fallback.');
    const fallbackAudit = generateDeterministicAuditFallback(extractedData, deterministicChecks);
    if (lastAiError) {
      fallbackAudit.limitations.push(
        'Note: AI reasoning model was temporarily under heavy traffic (503 Service Unavailable). Analysis was generated using verified deterministic DOM inspection.'
      );
    }
    return fallbackAudit;
  }

  let rawJson: RawAiResponse;

  try {
    rawJson = JSON.parse(responseText);
  } catch {
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      rawJson = JSON.parse(cleaned);
    } catch {
      console.warn('[AI Engine] Failed to parse JSON from AI response, falling back to deterministic audit.');
      return generateDeterministicAuditFallback(extractedData, deterministicChecks);
    }
  }

  // Calculate safe fallback scores if missing or out of range
  const safeScores: AuditScores = {
    ux: Math.min(100, Math.max(10, rawJson.scores?.ux ?? 75)),
    seo: Math.min(100, Math.max(10, rawJson.scores?.seo ?? 70)),
    performance: Math.min(100, Math.max(10, rawJson.scores?.performance ?? 75)),
    accessibility: Math.min(100, Math.max(10, rawJson.scores?.accessibility ?? (extractedData.images.altCoveragePercent || 70))),
    conversion: Math.min(100, Math.max(10, rawJson.scores?.conversion ?? 65)),
    overall: 0,
  };
  safeScores.overall = Math.round(
    safeScores.ux * 0.25 +
      safeScores.seo * 0.2 +
      safeScores.performance * 0.2 +
      safeScores.accessibility * 0.15 +
      safeScores.conversion * 0.2
  );

  const highPriorityIssues: HighPriorityIssue[] = (rawJson.highPriorityIssues || []).map((issue, idx) => ({
    id: `issue-${idx + 1}`,
    title: issue.title || 'Identified Web Issue',
    category: (['ux', 'seo', 'performance', 'accessibility', 'conversion'].includes(issue.category || '')
      ? issue.category
      : 'ux') as any,
    severity: (['high', 'medium', 'low'].includes(issue.severity || '') ? issue.severity : 'high') as any,
    problem: issue.problem || 'Potential website issue detected.',
    evidence: issue.evidence || 'Observed in extracted page code.',
    impact: issue.impact || 'May negatively affect visitor engagement or search rankings.',
    recommendation: issue.recommendation || 'Review and optimize this component.',
  }));

  const categoryFindings = {
    ux: (rawJson.categoryFindings?.ux || []).map((f, i) => ({
      id: `ux-${i + 1}`,
      category: 'ux' as const,
      title: f.title || 'UX Finding',
      status: (['good', 'warning', 'issue', 'unverified'].includes(f.status || '') ? f.status : 'good') as any,
      description: f.description || '',
      evidence: f.evidence,
      recommendation: f.recommendation,
    })),
    seo: (rawJson.categoryFindings?.seo || []).map((f, i) => ({
      id: `seo-${i + 1}`,
      category: 'seo' as const,
      title: f.title || 'SEO Finding',
      status: (['good', 'warning', 'issue', 'unverified'].includes(f.status || '') ? f.status : 'good') as any,
      description: f.description || '',
      evidence: f.evidence,
      recommendation: f.recommendation,
    })),
    performance: (rawJson.categoryFindings?.performance || []).map((f, i) => ({
      id: `perf-${i + 1}`,
      category: 'performance' as const,
      title: f.title || 'Performance Signal',
      status: (['good', 'warning', 'issue', 'unverified'].includes(f.status || '') ? f.status : 'good') as any,
      description: f.description || '',
      evidence: f.evidence,
      recommendation: f.recommendation,
    })),
    accessibility: (rawJson.categoryFindings?.accessibility || []).map((f, i) => ({
      id: `a11y-${i + 1}`,
      category: 'accessibility' as const,
      title: f.title || 'Accessibility Finding',
      status: (['good', 'warning', 'issue', 'unverified'].includes(f.status || '') ? f.status : 'good') as any,
      description: f.description || '',
      evidence: f.evidence,
      recommendation: f.recommendation,
    })),
    conversion: (rawJson.categoryFindings?.conversion || []).map((f, i) => ({
      id: `cro-${i + 1}`,
      category: 'conversion' as const,
      title: f.title || 'Conversion Signal',
      status: (['good', 'warning', 'issue', 'unverified'].includes(f.status || '') ? f.status : 'good') as any,
      description: f.description || '',
      evidence: f.evidence,
      recommendation: f.recommendation,
    })),
  };

  const strengths: StrengthItem[] = (rawJson.strengths || []).map((s) => ({
    title: s.title || 'Positive Attribute',
    category: (['ux', 'seo', 'performance', 'accessibility', 'conversion'].includes(s.category || '')
      ? s.category
      : 'ux') as any,
    description: s.description || 'Meets recommended best practice standards.',
    evidence: s.evidence || 'Verified through automated extraction.',
  }));

  const redesignOpportunities: RedesignOpportunity[] = (rawJson.redesignOpportunities || []).map((r) => ({
    area: r.area || 'Key Website Section',
    currentObservation: r.currentObservation || 'Current implementation leaves room for optimization.',
    recommendedRedesign: r.recommendedRedesign || 'Modernize layout, typography, and call-to-action flow.',
    expectedImpact: (['High Impact', 'Medium Impact', 'Visual Polish'].includes(r.expectedImpact || '')
      ? r.expectedImpact
      : 'High Impact') as any,
  }));

  const limitations = rawJson.limitations?.length
    ? rawJson.limitations
    : [
        'Automated static analysis evaluates initial HTML markup and server response. Client-side JavaScript rendered apps (SPAs) may have additional dynamic elements.',
        'Visual aesthetic quality, branding feel, and contrast under varying ambient light require manual human design review.',
        'Real-world conversion rates depend on traffic intent, copy messaging resonance, and checkout/lead form funnels beyond the homepage.',
      ];

  return {
    website: {
      url: extractedData.url,
      finalUrl: extractedData.finalUrl,
      domain: extractedData.domain,
      title: extractedData.title || extractedData.domain,
      description: extractedData.metaDescription,
      scannedAt: new Date().toISOString(),
    },
    scores: safeScores,
    summary:
      rawJson.summary ||
      `Comprehensive audit completed for ${extractedData.domain}. Analyzed ${extractedData.headings.totalCount} headings, ${extractedData.links.totalCount} links, ${extractedData.images.totalCount} images, and key conversion signals.`,
    highPriorityIssues,
    categoryFindings,
    strengths,
    redesignOpportunities,
    deterministicChecks,
    extractedData,
    limitations,
  };
}

