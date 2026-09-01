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
  ScoreBreakdown,
} from '../src/types/audit.js';
import { calculateScores } from './deterministicChecks.js';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
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
    console.warn('Could not read website-audit-checklist.md', err);
  }
  return `# Audit Framework: UX/UI, Mobile, Performance, SEO, Accessibility, Conversion.`;
}

// ─── Anti-Hallucination System Prompt ──────────────────────

function buildSystemPrompt(checklist: string): string {
  return `You are an evidence-grounded website audit analyst and web design strategist.

CRITICAL RULES — READ BEFORE ANALYZING:

1. You are an INTERPRETER, not the source of truth.
   - Measured facts are provided to you by the crawling system.
   - You MUST NOT invent, fabricate, or assume any measurements.
   - Never claim something was "tested" or "measured" unless the evidence data explicitly shows it.

2. NEVER invent these things:
   - Performance metrics not supplied (Lighthouse, Core Web Vitals, LCP, CLS, INP)
   - Mobile interaction behavior (touch targets, navigation usability, scroll behavior, sticky nav)
   - Business metrics (conversion rates, bounce rates, visitor counts, revenue)
   - Visual rendering details (contrast ratios, color choices, font sizes, layout pixels)
   - User behavior patterns (users leave, visitors are confused, high bounce rate)
   - Customer reviews, testimonials, ratings, or third-party scores
   - Technology stack details not explicitly in the evidence
   - A/B test results or analytics data
   - Screen reader behavior or keyboard navigation testing
   - WCAG compliance status

3. SOURCE LABELS — Every finding MUST be labeled:
   - "crawled" if it references a specific number/count/measurement from the supplied data
   - "ai-analysis" if it is your interpretation or recommendation based on the data
   - "inferred" if it is a reasonable conclusion that goes beyond direct measurement
   - "unverified" if you cannot determine the answer from available data
   - NEVER present ai-analysis or inferred findings as crawled/verified facts

4. DO NOT PROVIDE SCORES.
   - Scores are calculated programmatically from verified checks.
   - Do not include any "scores" or "ratings" in your response.

5. For each finding, you MUST:
   - Reference specific evidence from the extracted data
   - Use exact numbers, counts, or measurements from the evidence
   - Clearly separate what was measured (VERIFIED) vs what you recommend
   - If a deterministic finding already exists for the same issue, INTERPRET it — do NOT create a duplicate

6. For the Transformation Blueprint:
   - Each recommendation must have: Problem, Evidence, Impact, Redesign Strategy, Priority
   - Set confidence: "VERIFIED" if directly backed by crawl data, "INFERRED" if reasonable interpretation
   - Never invent business metrics or guaranteed improvements
   - Use language like "potential improvement" not "will increase by X%"
   - Never recommend fake testimonials, fake logos, fake reviews, or fabricated social proof

7. STRENGTHS must be evidence-backed:
   - Only list genuinely verified positives (HTTPS, viewport, H1, canonical, etc.)
   - Do not use exaggerated language ("beautiful design", "excellent UX")
   - Use neutral, factual wording

8. Be honest about limitations:
   - If something cannot be verified, label it UNVERIFIED
   - If a check is ambiguous, label it UNVERIFIED
   - Quality over completeness
   - Separate PASS from OPTIMIZATION OPPORTUNITY (a check can pass while still having AI recommendations)

Evaluation Checklist:
${checklist}`;
}

// ─── Response Schema ──────────────────────────────────────

function getResponseSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: '2-3 sentence executive summary of findings.' },
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
                status: { type: Type.STRING, description: 'pass | warning | critical | unverified' },
                description: { type: Type.STRING },
                evidence: { type: Type.STRING },
                recommendation: { type: Type.STRING },
              },
              required: ['title', 'status', 'description', 'evidence'],
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
              required: ['title', 'status', 'description', 'evidence'],
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
              required: ['title', 'status', 'description', 'evidence'],
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
              required: ['title', 'status', 'description', 'evidence'],
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
              required: ['title', 'status', 'description', 'evidence'],
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
            problem: { type: Type.STRING },
            evidence: { type: Type.STRING },
            impact: { type: Type.STRING },
            redesignStrategy: { type: Type.STRING },
            priority: { type: Type.STRING, description: 'High | Medium | Low' },
            confidence: { type: Type.STRING, description: 'VERIFIED | INFERRED | UNVERIFIED' },
          },
          required: ['area', 'problem', 'evidence', 'impact', 'redesignStrategy', 'priority'],
        },
      },
      limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['summary', 'highPriorityIssues', 'categoryFindings', 'strengths', 'redesignOpportunities'],
  };
}

// ─── Deterministic Fallback ────────────────────────────────

function generateDeterministicFallback(
  extractedData: ExtractedWebsiteData,
  deterministicChecks: DeterministicCheck[],
  scores: AuditScores,
  scoreBreakdown: ScoreBreakdown[]
): AuditResult {
  console.log('[AI Engine] Generating deterministic fallback audit.');

  const highPriorityIssues: HighPriorityIssue[] = [];
  const failingChecks = deterministicChecks
    .filter((c) => c.status === 'critical' || c.status === 'warning')
    .sort((a, b) => b.weight - a.weight);

  for (let i = 0; i < Math.min(failingChecks.length, 5); i++) {
    const c = failingChecks[i];
    highPriorityIssues.push({
      id: `issue-${i + 1}`,
      title: c.title,
      category: c.category,
      severity: c.status === 'critical' ? 'high' : 'medium',
      problem: c.message,
      evidence: c.evidence,
      impact:
        c.category === 'seo'
          ? 'Affects search engine indexing and ranking visibility.'
          : c.category === 'accessibility'
            ? 'Creates barriers for assistive technology users.'
            : c.category === 'performance'
              ? 'Increases page load time and user frustration.'
              : 'May reduce visitor engagement and conversion.',
      recommendation:
        c.id === 'ssl-https'
          ? 'Migrate to HTTPS with automatic TLS certificate and server-side redirect.'
          : c.id === 'title-presence'
            ? 'Add a descriptive <title> tag of 30-60 characters.'
            : c.id === 'meta-desc-presence'
              ? 'Write a compelling 120-160 character meta description.'
              : c.id === 'h1-presence'
                ? 'Add exactly one clear H1 heading as the primary page topic.'
                : `Address: ${c.message}`,
      source: 'crawled',
    });
  }

  // Build category findings from deterministic checks
  const buildCategoryFindings = (cat: string): CategoryFinding[] => {
    return deterministicChecks
      .filter((c) => c.category === cat)
      .map((c, i) => ({
        id: `${cat}-${i + 1}`,
        category: c.category as any,
        title: c.title,
        status: c.status as any,
        description: c.message,
        evidence: c.evidence,
        source: 'crawled' as const,
      }));
  };

  // Strengths from passing checks
  const strengths: StrengthItem[] = [];
  const passingChecks = deterministicChecks.filter((c) => c.status === 'pass');
  for (const c of passingChecks) {
    strengths.push({
      title: c.title,
      category: c.category,
      description: c.message,
      evidence: c.evidence,
      source: 'crawled',
    });
  }

  // Redesign opportunities based on findings
  const redesignOpportunities: RedesignOpportunity[] = [
    {
      area: 'Hero Section & Value Proposition',
      problem: extractedData.headings.h1[0]
        ? `Current H1: "${extractedData.headings.h1[0].slice(0, 60)}"`
        : 'No H1 heading to anchor the value proposition.',
      evidence: `${extractedData.headings.h1Count} H1 tag(s) detected. Body word count: ${extractedData.performanceSignals.approxWordCount}.`,
      impact: 'A weak or missing hero headline reduces immediate clarity of purpose.',
      redesignStrategy: 'Create a bold, benefit-driven H1 with supporting subtitle and primary CTA button above the fold.',
      priority: 'High',
      confidence: 'VERIFIED' as const,
    },
    {
      area: 'Mobile Experience',
      problem: extractedData.hasViewportMeta ? 'Viewport is configured but mobile rendering was not tested.' : 'Viewport meta tag is missing.',
      evidence: `Viewport: "${extractedData.viewport || 'not set'}" | Scripts: ${extractedData.performanceSignals.scriptsCount} | HTML: ${Math.round(extractedData.htmlSizeBytes / 1024)} KB.`,
      impact: 'Mobile visitors may experience layout issues or slow loading.',
      redesignStrategy: 'Test responsive behavior across breakpoints, optimize touch targets to 48px+, and streamline mobile navigation.',
      priority: 'High',
      confidence: 'INFERRED' as const,
    },
    {
      area: 'Conversion Path Optimization',
      problem: `${extractedData.links.ctaLinks.length} CTA-like links detected. ${extractedData.forms.count} form(s) on page.`,
      evidence: `CTAs: ${extractedData.links.ctaLinks.slice(0, 3).join(', ') || 'none detected'} | Forms: ${extractedData.forms.count}.`,
      impact: 'Unclear or absent primary conversion actions reduce lead capture potential.',
      redesignStrategy: 'Establish a single dominant primary CTA, repeat it at strategic scroll points, and simplify form fields to essentials.',
      priority: 'Medium',
      confidence: 'INFERRED' as const,
    },
  ];

  const limitations: string[] = [
    'This audit used a static HTML crawler to evaluate initial server-rendered markup.',
    'Client-side rendered content (SPAs, dynamic loading) may contain additional elements not captured here.',
    'Visual design quality, color contrast, and interaction behavior require manual review.',
    'Mobile-specific visual and interaction testing was not performed.',
    'Performance metrics reflect initial HTML response only — not full page load with assets.',
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
    scoreBreakdown,
    summary: `Audit completed for ${extractedData.domain}. Analyzed ${extractedData.headings.totalCount} headings, ${extractedData.images.totalCount} images, ${extractedData.links.totalCount} links. Server latency: ${extractedData.responseTimeMs}ms. HTML size: ${Math.round(extractedData.htmlSizeBytes / 1024)} KB.`,
    highPriorityIssues,
    categoryFindings: {
      ux: buildCategoryFindings('ux'),
      seo: buildCategoryFindings('seo'),
      performance: buildCategoryFindings('performance'),
      accessibility: buildCategoryFindings('accessibility'),
      conversion: buildCategoryFindings('conversion'),
    },
    strengths,
    redesignOpportunities,
    deterministicChecks,
    extractedData,
    limitations,
  };
}

// ─── Main AI Audit Function ───────────────────────────────

interface RawAiResponse {
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
  strengths?: Array<{ title?: string; category?: string; description?: string; evidence?: string }>;
  redesignOpportunities?: Array<{
    area?: string;
    problem?: string;
    evidence?: string;
    impact?: string;
    redesignStrategy?: string;
    priority?: string;
  }>;
  limitations?: string[];
}

export async function generateAuditWithAi(
  extractedData: ExtractedWebsiteData,
  deterministicChecks: DeterministicCheck[]
): Promise<AuditResult> {
  const configuredModel = process.env.AI_MODEL || 'gemini-3.7-flash';
  const checklist = loadAuditChecklist();

  // Step 1: Calculate deterministic scores FIRST — these are authoritative
  const { scores, breakdown } = calculateScores(deterministicChecks, extractedData);
  console.log('[Scoring] Deterministic scores calculated:', scores);

  // Build prompt payload with all evidence
  const promptPayload = {
    websiteOverview: {
      url: extractedData.url,
      finalUrl: extractedData.finalUrl,
      domain: extractedData.domain,
      httpStatus: extractedData.httpStatus,
      measuredResponseTimeMs: extractedData.responseTimeMs,
      htmlSizeBytes: extractedData.htmlSizeBytes,
      htmlSizeKB: Math.round(extractedData.htmlSizeBytes / 1024),
      isHttps: extractedData.isHttps,
      title: extractedData.title,
      titleLength: extractedData.title.length,
      metaDescription: extractedData.metaDescription,
      metaDescriptionLength: extractedData.metaDescription.length,
      canonicalUrl: extractedData.canonicalUrl,
      language: extractedData.language,
      viewportMeta: extractedData.viewport,
      robotsMeta: extractedData.robotsMeta,
    },
    headingsAnalysis: {
      total: extractedData.headings.totalCount,
      h1Count: extractedData.headings.h1Count,
      h1Items: extractedData.headings.h1,
      h2Count: extractedData.headings.h2.length,
      h3Count: extractedData.headings.h3.length,
      sampleH2: extractedData.headings.h2.slice(0, 8),
      sampleH3: extractedData.headings.h3.slice(0, 8),
      hasMissingH1: extractedData.headings.hasMissingH1,
      hasMultipleH1: extractedData.headings.hasMultipleH1,
    },
    linksAnalysis: {
      totalCount: extractedData.links.totalCount,
      internal: extractedData.links.internalCount,
      external: extractedData.links.externalCount,
      emptyTextAnchors: extractedData.links.emptyTextCount,
      emptyButtons: extractedData.links.emptyButtonCount,
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
      totalInputs: extractedData.forms.totalInputs,
      inputsWithoutLabels: extractedData.forms.inputsWithoutLabels,
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
    preCalculatedDeterministicChecks: deterministicChecks.map((c) => ({
      check: c.title,
      category: c.category,
      status: c.status,
      message: c.message,
      evidence: c.evidence,
      weight: c.weight,
    })),
    bodyTextExcerpt: extractedData.bodySnippet.slice(0, 2800),
  };

  const systemInstruction = buildSystemPrompt(checklist);

  // Try AI models
  let ai: GoogleGenAI | null = null;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    console.warn('[AI Engine] API Key not available, using deterministic fallback:', err.message);
    return generateDeterministicFallback(extractedData, deterministicChecks, scores, breakdown);
  }

  const candidateModels = Array.from(
    new Set([configuredModel, 'gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'])
  );

  let responseText: string | null = null;
  let lastAiError: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`[AI Engine] Attempting with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: JSON.stringify(promptPayload),
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: getResponseSchema(),
        },
      });
      if (response.text && response.text.trim().length > 0) {
        responseText = response.text;
        console.log(`[AI Engine] Success with model: ${model}`);
        break;
      }
    } catch (err: any) {
      lastAiError = err;
      console.warn(`[AI Engine] Model ${model} failed: ${String(err?.message || '').slice(0, 120)}`);
    }
  }

  if (!responseText) {
    console.warn('[AI Engine] All models exhausted. Using deterministic fallback.');
    const fallback = generateDeterministicFallback(extractedData, deterministicChecks, scores, breakdown);
    if (lastAiError) {
      fallback.limitations.push(
        'AI analysis service was temporarily unavailable. Results are based on verified deterministic checks only.'
      );
    }
    return fallback;
  }

  // Parse and validate AI response
  let rawJson: RawAiResponse;
  try {
    rawJson = JSON.parse(responseText);
  } catch {
    const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      rawJson = JSON.parse(cleaned);
    } catch {
      console.warn('[AI Engine] Failed to parse AI JSON, using deterministic fallback.');
      return generateDeterministicFallback(extractedData, deterministicChecks, scores, breakdown);
    }
  }

  // Process AI results — ALWAYS override scores with deterministic values
  const VALID_CATEGORIES = ['ux', 'seo', 'performance', 'accessibility', 'conversion'];
  const VALID_STATUSES = ['pass', 'warning', 'critical', 'unverified'];

  const highPriorityIssues: HighPriorityIssue[] = (rawJson.highPriorityIssues || []).slice(0, 6).map((issue, idx) => ({
    id: `issue-${idx + 1}`,
    title: issue.title || 'Identified Issue',
    category: VALID_CATEGORIES.includes(issue.category || '') ? (issue.category as any) : 'ux',
    severity: (['high', 'medium', 'low'].includes(issue.severity || '') ? issue.severity : 'medium') as any,
    problem: issue.problem || '',
    evidence: issue.evidence || 'Observed in page analysis.',
    impact: issue.impact || '',
    recommendation: issue.recommendation || '',
    source: 'ai-analysis',
  }));

  const mapFindings = (items: Array<Record<string, any>> | undefined, prefix: string): CategoryFinding[] => {
    return (items || []).map((f, i) => ({
      id: `${prefix}-${i + 1}`,
      category: prefix as any,
      title: f.title || `${prefix} finding`,
      status: VALID_STATUSES.includes(f.status || '') ? f.status : 'unverified',
      description: f.description || '',
      evidence: f.evidence || '',
      recommendation: f.recommendation,
      source: 'ai-analysis',
    }));
  };

  const strengths: StrengthItem[] = (rawJson.strengths || []).map((s) => ({
    title: s.title || 'Positive Attribute',
    category: VALID_CATEGORIES.includes(s.category || '') ? (s.category as any) : 'ux',
    description: s.description || '',
    evidence: s.evidence || 'Observed during automated crawl.',
    source: 'ai-analysis' as const,
  }));

  const redesignOpportunities: RedesignOpportunity[] = (rawJson.redesignOpportunities || []).map((r) => ({
    area: r.area || 'Website Area',
    problem: r.problem || '',
    evidence: r.evidence || '',
    impact: r.impact || '',
    redesignStrategy: r.redesignStrategy || '',
    priority: (['High', 'Medium', 'Low'].includes(r.priority || '') ? r.priority : 'Medium') as any,
    confidence: 'INFERRED' as const,
  }));

  const limitations = [
    'This audit uses a static HTML crawler — client-rendered content may not be captured.',
    'Mobile visual rendering and interaction behavior were not directly tested.',
    'Accessibility evaluation covers automated checks only and does not replace manual keyboard/screen-reader testing.',
    'Performance metrics reflect initial server response, not full page lifecycle.',
    'Business outcomes (conversion rates, bounce rates) depend on many factors beyond website design.',
    ...(rawJson.limitations || []),
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
    // Scores are ALWAYS from deterministic calculation — AI cannot override
    scores,
    scoreBreakdown: breakdown,
    summary:
      rawJson.summary ||
      `Audit completed for ${extractedData.domain}. Analyzed ${extractedData.headings.totalCount} headings, ${extractedData.images.totalCount} images, ${extractedData.links.totalCount} links.`,
    highPriorityIssues,
    categoryFindings: {
      ux: mapFindings(rawJson.categoryFindings?.ux, 'ux'),
      seo: mapFindings(rawJson.categoryFindings?.seo, 'seo'),
      performance: mapFindings(rawJson.categoryFindings?.performance, 'perf'),
      accessibility: mapFindings(rawJson.categoryFindings?.accessibility, 'a11y'),
      conversion: mapFindings(rawJson.categoryFindings?.conversion, 'cro'),
    },
    strengths,
    redesignOpportunities,
    deterministicChecks,
    extractedData,
    limitations,
  };
}
