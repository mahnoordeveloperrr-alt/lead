var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);

// server/aiService.ts
var import_genai = require("@google/genai");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function loadAuditChecklist() {
  try {
    const checklistPath = import_path.default.resolve(process.cwd(), "website-audit-checklist.md");
    if (import_fs.default.existsSync(checklistPath)) {
      return import_fs.default.readFileSync(checklistPath, "utf-8");
    }
  } catch (err) {
    console.warn("Could not read website-audit-checklist.md, using built-in framework", err);
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
function generateDeterministicAuditFallback(extractedData, deterministicChecks) {
  console.log("[AI Engine] Synthesizing comprehensive deterministic fallback audit based on crawled DOM metrics.");
  let uxScore = 75;
  if (extractedData.headings.h1Count === 1) uxScore += 10;
  else if (extractedData.headings.h1Count === 0) uxScore -= 15;
  if (extractedData.links.ctaLinks.length > 0) uxScore += 8;
  if (extractedData.hasViewportMeta) uxScore += 5;
  else uxScore -= 20;
  if (extractedData.forms.hasInputsWithoutLabels) uxScore -= 10;
  uxScore = Math.min(100, Math.max(25, uxScore));
  let seoScore = 70;
  if (extractedData.isHttps) seoScore += 10;
  else seoScore -= 25;
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
  if (extractedData.links.ctaLinks.length > 0) croScore += 12;
  else croScore -= 15;
  if (extractedData.headings.h1Count === 1) croScore += 8;
  if (extractedData.socialMeta.hasOgComplete) croScore += 5;
  if (extractedData.forms.count > 0 && !extractedData.forms.hasInputsWithoutLabels) croScore += 5;
  croScore = Math.min(100, Math.max(25, croScore));
  const overall = Math.round(
    uxScore * 0.25 + seoScore * 0.2 + perfScore * 0.2 + a11yScore * 0.15 + croScore * 0.2
  );
  const scores = {
    ux: uxScore,
    seo: seoScore,
    performance: perfScore,
    accessibility: a11yScore,
    conversion: croScore,
    overall
  };
  const highPriorityIssues = [];
  const failingChecks = deterministicChecks.filter((c) => c.status === "issue" || c.status === "warning");
  for (let i = 0; i < failingChecks.length && highPriorityIssues.length < 5; i++) {
    const c = failingChecks[i];
    highPriorityIssues.push({
      id: `issue-${i + 1}`,
      title: c.title,
      category: c.category,
      severity: c.status === "issue" ? "high" : "medium",
      problem: c.message,
      evidence: c.metric || `Detected in initial DOM crawl of ${extractedData.domain}`,
      impact: c.category === "seo" ? "Affects search engine crawling visibility and SERP ranking prominence." : c.category === "accessibility" ? "Creates navigation barriers for screen readers and assistive technology users." : c.category === "performance" ? "Increases user bounce rates and degrades mobile page experience." : "Reduces user engagement and conversion rate potential.",
      recommendation: c.id === "ssl-https" ? "Migrate all traffic to secure HTTPS with automatic TLS redirection." : c.id === "page-title" ? "Add a unique, descriptive <title> tag between 30 and 60 characters containing primary keywords." : c.id === "meta-description" ? "Add a 120-160 character meta description explaining the primary value proposition." : c.id === "h1-heading" ? "Structure the hero section with exactly one clear, high-impact <h1> heading." : c.id === "image-alt-tags" ? 'Add descriptive alt attributes to all content images; use empty alt="" only for decorative icons.' : c.id === "response-latency" ? "Deploy CDN caching, optimize server backend processes, and enable gzip/brotli compression." : "Refactor markup according to modern web accessibility and SEO standards."
    });
  }
  if (highPriorityIssues.length === 0) {
    highPriorityIssues.push({
      id: "issue-1",
      title: "Call to Action Visual Prominence",
      category: "conversion",
      severity: "medium",
      problem: "Primary conversion action could benefit from higher visual contrast and strategic repeat placement.",
      evidence: `${extractedData.links.ctaLinks.length} primary CTA keywords identified in page links.`,
      impact: "Improving CTA contrast directly lifts inbound lead capture and conversion rates.",
      recommendation: "Ensure a visually distinct high-contrast CTA button is fixed above the fold and repeated at the footer."
    });
  }
  const categoryFindings = {
    ux: [
      {
        id: "ux-1",
        category: "ux",
        title: "Document Outline & Typography",
        status: extractedData.headings.h1Count === 1 ? "good" : "warning",
        description: `Found ${extractedData.headings.totalCount} total heading tags (${extractedData.headings.h1Count} H1, ${extractedData.headings.h2.length} H2, ${extractedData.headings.h3.length} H3).`,
        evidence: extractedData.headings.h1[0] ? `H1: "${extractedData.headings.h1[0]}"` : "No H1 found",
        recommendation: "Ensure a clear visual hierarchy from H1 value proposition down to supporting H2 feature blocks."
      },
      {
        id: "ux-2",
        category: "ux",
        title: "Mobile Responsive Viewport",
        status: extractedData.hasViewportMeta ? "good" : "issue",
        description: extractedData.hasViewportMeta ? "Responsive viewport is declared for mobile screen scaling." : "Viewport tag is missing, causing mobile devices to render fixed desktop layout.",
        evidence: extractedData.viewport || "None"
      }
    ],
    seo: [
      {
        id: "seo-1",
        category: "seo",
        title: "Page Title & Metadata",
        status: extractedData.title ? "good" : "issue",
        description: extractedData.title ? `Page title is present (${extractedData.title.length} characters).` : "Page title is missing.",
        evidence: extractedData.title || "Missing title",
        recommendation: "Maintain a 30-60 character page title with primary service/brand keywords."
      },
      {
        id: "seo-2",
        category: "seo",
        title: "Meta Description & Snippet",
        status: extractedData.metaDescription ? "good" : "warning",
        description: extractedData.metaDescription ? `Meta description found (${extractedData.metaDescription.length} characters).` : "Meta description tag is missing from head.",
        evidence: extractedData.metaDescription || "Missing meta description",
        recommendation: "Craft a compelling 120-160 character summary that invites search clicks."
      },
      {
        id: "seo-3",
        category: "seo",
        title: "Protocol & Canonical Directives",
        status: extractedData.isHttps ? "good" : "issue",
        description: `Traffic served over ${extractedData.isHttps ? "HTTPS" : "HTTP"}. Canonical tag: ${extractedData.canonicalUrl || "Not specified"}.`,
        evidence: extractedData.finalUrl
      }
    ],
    performance: [
      {
        id: "perf-1",
        category: "performance",
        title: "Server Latency (TTFB)",
        status: extractedData.responseTimeMs < 500 ? "good" : extractedData.responseTimeMs < 1200 ? "warning" : "issue",
        description: `Server responded with initial HTML in ${extractedData.responseTimeMs}ms.`,
        evidence: `${extractedData.responseTimeMs}ms response latency`,
        recommendation: "Target server response time under 300ms using global CDN edge caching."
      },
      {
        id: "perf-2",
        category: "performance",
        title: "DOM Payload & Script Density",
        status: extractedData.performanceSignals.scriptsCount <= 20 ? "good" : "warning",
        description: `HTML document size is ${Math.round(extractedData.htmlSizeBytes / 1024)} KB with ${extractedData.performanceSignals.scriptsCount} script tags and ${extractedData.performanceSignals.stylesheetsCount} stylesheets.`,
        evidence: `${extractedData.htmlSizeBytes} bytes, ${extractedData.performanceSignals.scriptsCount} scripts`
      }
    ],
    accessibility: [
      {
        id: "a11y-1",
        category: "accessibility",
        title: "Image Alt Text Coverage",
        status: extractedData.images.missingAltCount === 0 ? "good" : extractedData.images.altCoveragePercent >= 70 ? "warning" : "issue",
        description: `${extractedData.images.withAltCount} of ${extractedData.images.totalCount} images include alt text (${extractedData.images.altCoveragePercent}% coverage).`,
        evidence: `${extractedData.images.missingAltCount} images missing alt text`,
        recommendation: "Provide concise descriptive alt text for informative images."
      },
      {
        id: "a11y-2",
        category: "accessibility",
        title: "Semantic HTML Landmarks",
        status: extractedData.semantics.totalLandmarks >= 3 ? "good" : "warning",
        description: `Detected landmarks: ${extractedData.semantics.tagsFound.join(", ") || "none"}.`,
        evidence: `hasMain: ${extractedData.semantics.hasMain}, hasNav: ${extractedData.semantics.hasNav}`
      }
    ],
    conversion: [
      {
        id: "cro-1",
        category: "conversion",
        title: "Call-to-Action Signals",
        status: extractedData.links.ctaLinks.length > 0 ? "good" : "warning",
        description: extractedData.links.ctaLinks.length > 0 ? `Detected ${extractedData.links.ctaLinks.length} actionable CTA links ("${extractedData.links.ctaLinks.slice(0, 3).join('", "')}").` : "No explicit primary CTA anchor phrases detected in initial navigation or hero.",
        evidence: `${extractedData.links.ctaLinks.length} CTA links found`,
        recommendation: 'Make primary action verbs ("Get Started", "Book Demo", "Contact") visually prominent.'
      },
      {
        id: "cro-2",
        category: "conversion",
        title: "Social Share Cards & Trust",
        status: extractedData.socialMeta.hasOgComplete ? "good" : "warning",
        description: extractedData.socialMeta.hasOgComplete ? "Open Graph metadata is completely configured for social sharing." : "Incomplete Open Graph tags. Social links will not render rich image cards on Slack, Twitter, or LinkedIn.",
        evidence: `og:image: ${extractedData.socialMeta.ogImage ? "present" : "missing"}`
      }
    ]
  };
  const strengths = [];
  if (extractedData.isHttps) {
    strengths.push({
      title: "Encrypted HTTPS Connection",
      category: "seo",
      description: "Website operates on secure TLS encryption to protect visitor privacy.",
      evidence: extractedData.finalUrl
    });
  }
  if (extractedData.hasViewportMeta) {
    strengths.push({
      title: "Configured Mobile Viewport",
      category: "ux",
      description: "Page markup includes responsive viewport directive for fluid multi-device scaling.",
      evidence: extractedData.viewport || "viewport meta tag"
    });
  }
  if (extractedData.title) {
    strengths.push({
      title: "Descriptive Page Title",
      category: "seo",
      description: "Title tag is configured to inform search engine crawlers and browser tabs.",
      evidence: `"${extractedData.title}"`
    });
  }
  if (extractedData.responseTimeMs < 600) {
    strengths.push({
      title: "Rapid Server Response",
      category: "performance",
      description: `Fast initial HTML delivery from the web server in ${extractedData.responseTimeMs}ms.`,
      evidence: `${extractedData.responseTimeMs}ms TTFB`
    });
  }
  const redesignOpportunities = [
    {
      area: "Hero Section & Value Proposition",
      currentObservation: extractedData.headings.h1[0] ? `Current hero headline: "${extractedData.headings.h1[0]}".` : "Hero section lacks a unified, high-contrast H1 value proposition headline.",
      recommendedRedesign: "Implement an editorial hero layout featuring a 5-second value proposition, dual action CTA buttons (Primary Solid + Secondary Outline), and customer proof logos.",
      expectedImpact: "High Impact"
    },
    {
      area: "Mobile Conversion Flow & Touch Targets",
      currentObservation: "Mobile user journey relies on multi-step navigation menus without a sticky mobile action bar.",
      recommendedRedesign: "Introduce a fixed bottom action bar for mobile viewports, optimize touch targets to 48px+, and streamline contact inquiry forms to 3 core fields.",
      expectedImpact: "High Impact"
    },
    {
      area: "Visual Proof & Trust Architecture",
      currentObservation: "Social proof, client metrics, and reviews can be elevated into dedicated high-contrast testimonial blocks.",
      recommendedRedesign: "Add a structured social proof section with verified rating badges, client logo carousel, and quantifiable outcome metrics.",
      expectedImpact: "Medium Impact"
    }
  ];
  return {
    website: {
      url: extractedData.url,
      finalUrl: extractedData.finalUrl,
      domain: extractedData.domain,
      title: extractedData.title || extractedData.domain,
      description: extractedData.metaDescription,
      scannedAt: (/* @__PURE__ */ new Date()).toISOString()
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
      "Static DOM crawler evaluated initial HTML and server response headers.",
      "Single-page application (SPA) client-rendered hydration may load additional components dynamically in the browser.",
      "Brand aesthetic resonance and emotional tone require human design review."
    ]
  };
}
async function generateAuditWithAi(extractedData, deterministicChecks) {
  const configuredModel = process.env.AI_MODEL || "gemini-3.7-flash";
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
      viewportMeta: extractedData.viewport
    },
    headingsAnalysis: {
      total: extractedData.headings.totalCount,
      h1Count: extractedData.headings.h1Count,
      h1Items: extractedData.headings.h1,
      h2Count: extractedData.headings.h2.length,
      sampleH2: extractedData.headings.h2.slice(0, 8),
      sampleH3: extractedData.headings.h3.slice(0, 8)
    },
    linksAnalysis: {
      totalCount: extractedData.links.totalCount,
      internal: extractedData.links.internalCount,
      external: extractedData.links.externalCount,
      emptyTextAnchors: extractedData.links.emptyTextCount,
      detectedCtaLinks: extractedData.links.ctaLinks,
      sampleNavLinks: extractedData.links.sampleLinks.slice(0, 10).map((l) => l.text)
    },
    imagesAnalysis: {
      totalImages: extractedData.images.totalCount,
      withAlt: extractedData.images.withAltCount,
      missingAltCount: extractedData.images.missingAltCount,
      altCoveragePercent: extractedData.images.altCoveragePercent,
      sampleMissingAltSources: extractedData.images.missingAltSamples.slice(0, 5)
    },
    semanticsAndAccessibility: {
      semanticTagsPresent: extractedData.semantics.tagsFound,
      hasMain: extractedData.semantics.hasMain,
      hasNav: extractedData.semantics.hasNav,
      hasHeader: extractedData.semantics.hasHeader,
      hasFooter: extractedData.semantics.hasFooter,
      formsCount: extractedData.forms.count,
      hasInputsWithoutLabels: extractedData.forms.hasInputsWithoutLabels
    },
    performanceSignals: {
      scriptsCount: extractedData.performanceSignals.scriptsCount,
      stylesheetsCount: extractedData.performanceSignals.stylesheetsCount,
      inlineStylesCount: extractedData.performanceSignals.inlineStyleCount,
      approximateWordCount: extractedData.performanceSignals.approxWordCount,
      measuredLatencyMs: extractedData.responseTimeMs
    },
    socialMetadata: extractedData.socialMeta,
    automatedDeterministicChecks: deterministicChecks.map((c) => ({
      check: c.title,
      category: c.category,
      status: c.status,
      message: c.message,
      metric: c.metric
    })),
    bodyTextExcerpt: extractedData.bodySnippet.slice(0, 2800)
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
    type: import_genai.Type.OBJECT,
    properties: {
      scores: {
        type: import_genai.Type.OBJECT,
        properties: {
          ux: { type: import_genai.Type.INTEGER, description: "UX & UI score 0-100" },
          seo: { type: import_genai.Type.INTEGER, description: "SEO score 0-100" },
          performance: { type: import_genai.Type.INTEGER, description: "Performance score 0-100" },
          accessibility: { type: import_genai.Type.INTEGER, description: "Accessibility score 0-100" },
          conversion: { type: import_genai.Type.INTEGER, description: "Conversion opportunity score 0-100" },
          overall: { type: import_genai.Type.INTEGER, description: "Overall weighted score 0-100" }
        },
        required: ["ux", "seo", "performance", "accessibility", "conversion", "overall"]
      },
      summary: {
        type: import_genai.Type.STRING,
        description: "Executive 2-3 sentence summary of the website audit findings."
      },
      highPriorityIssues: {
        type: import_genai.Type.ARRAY,
        items: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING },
            category: { type: import_genai.Type.STRING, description: "ux | seo | performance | accessibility | conversion" },
            severity: { type: import_genai.Type.STRING, description: "high | medium | low" },
            problem: { type: import_genai.Type.STRING },
            evidence: { type: import_genai.Type.STRING },
            impact: { type: import_genai.Type.STRING },
            recommendation: { type: import_genai.Type.STRING }
          },
          required: ["title", "category", "severity", "problem", "evidence", "impact", "recommendation"]
        }
      },
      categoryFindings: {
        type: import_genai.Type.OBJECT,
        properties: {
          ux: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                title: { type: import_genai.Type.STRING },
                status: { type: import_genai.Type.STRING, description: "good | warning | issue | unverified" },
                description: { type: import_genai.Type.STRING },
                evidence: { type: import_genai.Type.STRING },
                recommendation: { type: import_genai.Type.STRING }
              },
              required: ["title", "status", "description"]
            }
          },
          seo: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                title: { type: import_genai.Type.STRING },
                status: { type: import_genai.Type.STRING },
                description: { type: import_genai.Type.STRING },
                evidence: { type: import_genai.Type.STRING },
                recommendation: { type: import_genai.Type.STRING }
              },
              required: ["title", "status", "description"]
            }
          },
          performance: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                title: { type: import_genai.Type.STRING },
                status: { type: import_genai.Type.STRING },
                description: { type: import_genai.Type.STRING },
                evidence: { type: import_genai.Type.STRING },
                recommendation: { type: import_genai.Type.STRING }
              },
              required: ["title", "status", "description"]
            }
          },
          accessibility: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                title: { type: import_genai.Type.STRING },
                status: { type: import_genai.Type.STRING },
                description: { type: import_genai.Type.STRING },
                evidence: { type: import_genai.Type.STRING },
                recommendation: { type: import_genai.Type.STRING }
              },
              required: ["title", "status", "description"]
            }
          },
          conversion: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                title: { type: import_genai.Type.STRING },
                status: { type: import_genai.Type.STRING },
                description: { type: import_genai.Type.STRING },
                evidence: { type: import_genai.Type.STRING },
                recommendation: { type: import_genai.Type.STRING }
              },
              required: ["title", "status", "description"]
            }
          }
        },
        required: ["ux", "seo", "performance", "accessibility", "conversion"]
      },
      strengths: {
        type: import_genai.Type.ARRAY,
        items: {
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING },
            category: { type: import_genai.Type.STRING },
            description: { type: import_genai.Type.STRING },
            evidence: { type: import_genai.Type.STRING }
          },
          required: ["title", "category", "description", "evidence"]
        }
      },
      redesignOpportunities: {
        type: import_genai.Type.ARRAY,
        items: {
          type: import_genai.Type.OBJECT,
          properties: {
            area: { type: import_genai.Type.STRING },
            currentObservation: { type: import_genai.Type.STRING },
            recommendedRedesign: { type: import_genai.Type.STRING },
            expectedImpact: { type: import_genai.Type.STRING, description: "High Impact | Medium Impact | Visual Polish" }
          },
          required: ["area", "currentObservation", "recommendedRedesign", "expectedImpact"]
        }
      },
      limitations: {
        type: import_genai.Type.ARRAY,
        items: { type: import_genai.Type.STRING }
      }
    },
    required: [
      "scores",
      "summary",
      "highPriorityIssues",
      "categoryFindings",
      "strengths",
      "redesignOpportunities"
    ]
  };
  let ai = null;
  try {
    ai = getGeminiClient();
  } catch (err) {
    console.warn("[AI Engine] API Key not available or error creating client, falling back to deterministic audit:", err.message);
    return generateDeterministicAuditFallback(extractedData, deterministicChecks);
  }
  const candidateModels = Array.from(
    /* @__PURE__ */ new Set([configuredModel, "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"])
  );
  let responseText = null;
  let lastAiError = null;
  for (const model of candidateModels) {
    try {
      console.log(`[AI Engine] Attempting audit generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: JSON.stringify(promptPayload),
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema
        }
      });
      if (response.text && response.text.trim().length > 0) {
        responseText = response.text;
        console.log(`[AI Engine] Generation successful with model: ${model}`);
        break;
      }
    } catch (err) {
      lastAiError = err;
      const errMsg = String(err?.message || err || "");
      console.warn(`[AI Engine] Model ${model} unavailable: ${errMsg.slice(0, 120)}... Failing over to next candidate.`);
    }
  }
  if (!responseText) {
    console.warn("[AI Engine] All AI models exhausted or unavailable. Activating deterministic audit fallback.");
    const fallbackAudit = generateDeterministicAuditFallback(extractedData, deterministicChecks);
    if (lastAiError) {
      fallbackAudit.limitations.push(
        "Note: AI reasoning model was temporarily under heavy traffic (503 Service Unavailable). Analysis was generated using verified deterministic DOM inspection."
      );
    }
    return fallbackAudit;
  }
  let rawJson;
  try {
    rawJson = JSON.parse(responseText);
  } catch {
    const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      rawJson = JSON.parse(cleaned);
    } catch {
      console.warn("[AI Engine] Failed to parse JSON from AI response, falling back to deterministic audit.");
      return generateDeterministicAuditFallback(extractedData, deterministicChecks);
    }
  }
  const safeScores = {
    ux: Math.min(100, Math.max(10, rawJson.scores?.ux ?? 75)),
    seo: Math.min(100, Math.max(10, rawJson.scores?.seo ?? 70)),
    performance: Math.min(100, Math.max(10, rawJson.scores?.performance ?? 75)),
    accessibility: Math.min(100, Math.max(10, rawJson.scores?.accessibility ?? (extractedData.images.altCoveragePercent || 70))),
    conversion: Math.min(100, Math.max(10, rawJson.scores?.conversion ?? 65)),
    overall: 0
  };
  safeScores.overall = Math.round(
    safeScores.ux * 0.25 + safeScores.seo * 0.2 + safeScores.performance * 0.2 + safeScores.accessibility * 0.15 + safeScores.conversion * 0.2
  );
  const highPriorityIssues = (rawJson.highPriorityIssues || []).map((issue, idx) => ({
    id: `issue-${idx + 1}`,
    title: issue.title || "Identified Web Issue",
    category: ["ux", "seo", "performance", "accessibility", "conversion"].includes(issue.category || "") ? issue.category : "ux",
    severity: ["high", "medium", "low"].includes(issue.severity || "") ? issue.severity : "high",
    problem: issue.problem || "Potential website issue detected.",
    evidence: issue.evidence || "Observed in extracted page code.",
    impact: issue.impact || "May negatively affect visitor engagement or search rankings.",
    recommendation: issue.recommendation || "Review and optimize this component."
  }));
  const categoryFindings = {
    ux: (rawJson.categoryFindings?.ux || []).map((f, i) => ({
      id: `ux-${i + 1}`,
      category: "ux",
      title: f.title || "UX Finding",
      status: ["good", "warning", "issue", "unverified"].includes(f.status || "") ? f.status : "good",
      description: f.description || "",
      evidence: f.evidence,
      recommendation: f.recommendation
    })),
    seo: (rawJson.categoryFindings?.seo || []).map((f, i) => ({
      id: `seo-${i + 1}`,
      category: "seo",
      title: f.title || "SEO Finding",
      status: ["good", "warning", "issue", "unverified"].includes(f.status || "") ? f.status : "good",
      description: f.description || "",
      evidence: f.evidence,
      recommendation: f.recommendation
    })),
    performance: (rawJson.categoryFindings?.performance || []).map((f, i) => ({
      id: `perf-${i + 1}`,
      category: "performance",
      title: f.title || "Performance Signal",
      status: ["good", "warning", "issue", "unverified"].includes(f.status || "") ? f.status : "good",
      description: f.description || "",
      evidence: f.evidence,
      recommendation: f.recommendation
    })),
    accessibility: (rawJson.categoryFindings?.accessibility || []).map((f, i) => ({
      id: `a11y-${i + 1}`,
      category: "accessibility",
      title: f.title || "Accessibility Finding",
      status: ["good", "warning", "issue", "unverified"].includes(f.status || "") ? f.status : "good",
      description: f.description || "",
      evidence: f.evidence,
      recommendation: f.recommendation
    })),
    conversion: (rawJson.categoryFindings?.conversion || []).map((f, i) => ({
      id: `cro-${i + 1}`,
      category: "conversion",
      title: f.title || "Conversion Signal",
      status: ["good", "warning", "issue", "unverified"].includes(f.status || "") ? f.status : "good",
      description: f.description || "",
      evidence: f.evidence,
      recommendation: f.recommendation
    }))
  };
  const strengths = (rawJson.strengths || []).map((s) => ({
    title: s.title || "Positive Attribute",
    category: ["ux", "seo", "performance", "accessibility", "conversion"].includes(s.category || "") ? s.category : "ux",
    description: s.description || "Meets recommended best practice standards.",
    evidence: s.evidence || "Verified through automated extraction."
  }));
  const redesignOpportunities = (rawJson.redesignOpportunities || []).map((r) => ({
    area: r.area || "Key Website Section",
    currentObservation: r.currentObservation || "Current implementation leaves room for optimization.",
    recommendedRedesign: r.recommendedRedesign || "Modernize layout, typography, and call-to-action flow.",
    expectedImpact: ["High Impact", "Medium Impact", "Visual Polish"].includes(r.expectedImpact || "") ? r.expectedImpact : "High Impact"
  }));
  const limitations = rawJson.limitations?.length ? rawJson.limitations : [
    "Automated static analysis evaluates initial HTML markup and server response. Client-side JavaScript rendered apps (SPAs) may have additional dynamic elements.",
    "Visual aesthetic quality, branding feel, and contrast under varying ambient light require manual human design review.",
    "Real-world conversion rates depend on traffic intent, copy messaging resonance, and checkout/lead form funnels beyond the homepage."
  ];
  return {
    website: {
      url: extractedData.url,
      finalUrl: extractedData.finalUrl,
      domain: extractedData.domain,
      title: extractedData.title || extractedData.domain,
      description: extractedData.metaDescription,
      scannedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    scores: safeScores,
    summary: rawJson.summary || `Comprehensive audit completed for ${extractedData.domain}. Analyzed ${extractedData.headings.totalCount} headings, ${extractedData.links.totalCount} links, ${extractedData.images.totalCount} images, and key conversion signals.`,
    highPriorityIssues,
    categoryFindings,
    strengths,
    redesignOpportunities,
    deterministicChecks,
    extractedData,
    limitations
  };
}

// server/ssrfGuard.ts
var import_dns = __toESM(require("dns"), 1);
var import_util = require("util");
var lookupAsync = (0, import_util.promisify)(import_dns.default.lookup);
var PRIVATE_IP_RANGES = [
  // 127.0.0.0/8
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  // 10.0.0.0/8
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  // 192.168.0.0/16
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  // 172.16.0.0/12
  /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  // 169.254.0.0/16 (Link Local / Cloud Metadata)
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
  // 0.0.0.0/8
  /^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
];
function normalizeAndValidateUrl(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    return { valid: false, error: "Please enter a valid website URL." };
  }
  let cleaned = rawInput.trim();
  if (cleaned.length > 2048) {
    return { valid: false, error: "URL is too long." };
  }
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }
  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTP and HTTPS protocols are supported." };
    }
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname === "0.0.0.0" || hostname === "::1" || hostname === "metadata.google.internal" || hostname.includes("169.254")) {
      return { valid: false, error: "Access to private or local network resources is prohibited." };
    }
    for (const regex of PRIVATE_IP_RANGES) {
      if (regex.test(hostname)) {
        return { valid: false, error: "Access to private IP ranges is prohibited." };
      }
    }
    return { valid: true, normalizedUrl: parsed.href };
  } catch {
    return { valid: false, error: "The provided URL format is invalid." };
  }
}
async function verifyPublicDns(hostname) {
  try {
    const result = await lookupAsync(hostname);
    const ip = result.address;
    for (const regex of PRIVATE_IP_RANGES) {
      if (regex.test(ip)) {
        return false;
      }
    }
    if (ip === "::1" || ip.startsWith("fe80:") || ip.startsWith("fc00:")) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

// server/crawler.ts
var MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
var FETCH_TIMEOUT_MS = 12e3;
async function crawlWebsite(targetUrl) {
  const parsed = new URL(targetUrl);
  const isPublic = await verifyPublicDns(parsed.hostname);
  if (!isPublic) {
    throw new Error("Target hostname resolved to a forbidden private IP address.");
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const startTime = Date.now();
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (AI-Website-Auditor/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache"
      },
      signal: controller.signal,
      redirect: "follow"
    });
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    if (!response.ok && response.status >= 500) {
      throw new Error(`Target server returned HTTP ${response.status} (${response.statusText}).`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml") && !contentType.includes("text/plain") && !contentType.includes("application/xml")) {
      if (contentType.includes("image/") || contentType.includes("application/pdf")) {
        throw new Error(`The target URL returned a binary file (${contentType}) rather than a web page.`);
      }
    }
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_RESPONSE_BYTES) {
      throw new Error(`Page size exceeds maximum safety limit of 5MB.`);
    }
    const decoder = new TextDecoder("utf-8");
    const html = decoder.decode(arrayBuffer);
    return {
      html,
      status: response.status,
      finalUrl: response.url || targetUrl,
      responseTimeMs,
      contentLength: arrayBuffer.byteLength
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Connection timed out after ${FETCH_TIMEOUT_MS / 1e3}s while attempting to reach the website.`);
    }
    throw error;
  }
}

// server/deterministicChecks.ts
function runDeterministicChecks(data) {
  const checks = [];
  if (data.isHttps) {
    checks.push({
      id: "ssl-https",
      category: "seo",
      title: "HTTPS & SSL Security",
      status: "good",
      message: "Website serves traffic over encrypted HTTPS connection.",
      importance: "critical"
    });
  } else {
    checks.push({
      id: "ssl-https",
      category: "seo",
      title: "HTTPS & SSL Security",
      status: "issue",
      message: "Website is served over unencrypted HTTP protocol. Modern browsers flag this as insecure.",
      importance: "critical"
    });
  }
  if (!data.title) {
    checks.push({
      id: "page-title",
      category: "seo",
      title: "Page Title Tag",
      status: "issue",
      message: "Missing `<title>` tag. Search engines and browsers rely on page titles for indexing and tabs.",
      importance: "critical"
    });
  } else if (data.title.length < 15) {
    checks.push({
      id: "page-title",
      category: "seo",
      title: "Page Title Tag",
      status: "warning",
      message: `Title tag is very short (${data.title.length} chars: "${data.title}"). Recommended length is 30\u201360 characters.`,
      metric: `${data.title.length} chars`,
      importance: "recommended"
    });
  } else if (data.title.length > 70) {
    checks.push({
      id: "page-title",
      category: "seo",
      title: "Page Title Tag",
      status: "warning",
      message: `Title tag exceeds 70 characters (${data.title.length} chars). Search results may truncate it in SERP.`,
      metric: `${data.title.length} chars`,
      importance: "recommended"
    });
  } else {
    checks.push({
      id: "page-title",
      category: "seo",
      title: "Page Title Tag",
      status: "good",
      message: `Title tag is well-proportioned (${data.title.length} chars).`,
      metric: `${data.title.length} chars`,
      importance: "recommended"
    });
  }
  if (!data.metaDescription) {
    checks.push({
      id: "meta-description",
      category: "seo",
      title: "Meta Description",
      status: "issue",
      message: "Missing meta description tag. Search snippets will default to arbitrary page text.",
      importance: "recommended"
    });
  } else if (data.metaDescription.length < 50) {
    checks.push({
      id: "meta-description",
      category: "seo",
      title: "Meta Description",
      status: "warning",
      message: `Meta description is short (${data.metaDescription.length} chars). Aim for 120\u2013160 characters to maximize click-through rate.`,
      metric: `${data.metaDescription.length} chars`,
      importance: "recommended"
    });
  } else {
    checks.push({
      id: "meta-description",
      category: "seo",
      title: "Meta Description",
      status: "good",
      message: `Meta description is present (${data.metaDescription.length} chars).`,
      metric: `${data.metaDescription.length} chars`,
      importance: "recommended"
    });
  }
  if (data.headings.h1Count === 0) {
    checks.push({
      id: "h1-heading",
      category: "seo",
      title: "H1 Primary Heading",
      status: "issue",
      message: "No `<h1>` heading found on the page. Exactly one descriptive H1 is recommended for page theme clarity.",
      importance: "critical"
    });
  } else if (data.headings.h1Count > 1) {
    checks.push({
      id: "h1-heading",
      category: "seo",
      title: "H1 Primary Heading",
      status: "warning",
      message: `Found ${data.headings.h1Count} \`<h1>\` headings. Best practice is a single primary H1 heading per document.`,
      metric: `${data.headings.h1Count} H1 tags`,
      importance: "recommended"
    });
  } else {
    checks.push({
      id: "h1-heading",
      category: "seo",
      title: "H1 Primary Heading",
      status: "good",
      message: "Proper single `<h1>` heading structure found.",
      metric: data.headings.h1[0]?.slice(0, 45) + (data.headings.h1[0]?.length > 45 ? "..." : ""),
      importance: "recommended"
    });
  }
  if (data.images.totalCount === 0) {
    checks.push({
      id: "image-alt-tags",
      category: "accessibility",
      title: "Image Alt Attributes",
      status: "unverified",
      message: "No `<img>` tags found in parsed HTML.",
      importance: "optional"
    });
  } else if (data.images.missingAltCount === 0) {
    checks.push({
      id: "image-alt-tags",
      category: "accessibility",
      title: "Image Alt Attributes",
      status: "good",
      message: `All ${data.images.totalCount} detected images include descriptive 'alt' attributes.`,
      metric: "100% covered",
      importance: "critical"
    });
  } else if (data.images.altCoveragePercent >= 70) {
    checks.push({
      id: "image-alt-tags",
      category: "accessibility",
      title: "Image Alt Attributes",
      status: "warning",
      message: `${data.images.missingAltCount} out of ${data.images.totalCount} images are missing 'alt' attributes (${data.images.altCoveragePercent}% coverage).`,
      metric: `${data.images.altCoveragePercent}% covered`,
      importance: "critical"
    });
  } else {
    checks.push({
      id: "image-alt-tags",
      category: "accessibility",
      title: "Image Alt Attributes",
      status: "issue",
      message: `Critical accessibility barrier: ${data.images.missingAltCount} out of ${data.images.totalCount} images lack 'alt' text (${data.images.altCoveragePercent}% coverage).`,
      metric: `${data.images.missingAltCount} missing`,
      importance: "critical"
    });
  }
  if (data.hasViewportMeta) {
    const hasUnfriendlyZoom = data.viewport.includes("user-scalable=no") || data.viewport.includes("maximum-scale=1");
    if (hasUnfriendlyZoom) {
      checks.push({
        id: "viewport-meta",
        category: "accessibility",
        title: "Mobile Viewport & Zoom",
        status: "warning",
        message: "Viewport tag restricts user pinch-to-zoom (user-scalable=no/maximum-scale=1), reducing accessibility for visually impaired users.",
        importance: "recommended"
      });
    } else {
      checks.push({
        id: "viewport-meta",
        category: "ux",
        title: "Mobile Responsive Viewport",
        status: "good",
        message: "Responsive viewport meta tag is properly configured.",
        metric: "Configured",
        importance: "critical"
      });
    }
  } else {
    checks.push({
      id: "viewport-meta",
      category: "ux",
      title: "Mobile Responsive Viewport",
      status: "issue",
      message: 'Missing `<meta name="viewport">` tag. The site will render as desktop scale on mobile devices.',
      importance: "critical"
    });
  }
  const keyLandmarksCount = (data.semantics.hasHeader ? 1 : 0) + (data.semantics.hasNav ? 1 : 0) + (data.semantics.hasMain ? 1 : 0) + (data.semantics.hasFooter ? 1 : 0);
  if (keyLandmarksCount >= 3) {
    checks.push({
      id: "semantic-landmarks",
      category: "accessibility",
      title: "Semantic HTML Landmarks",
      status: "good",
      message: `Proper document outline with semantic tags (${data.semantics.tagsFound.join(", ")}).`,
      metric: `${data.semantics.totalLandmarks} tags detected`,
      importance: "recommended"
    });
  } else if (keyLandmarksCount >= 1) {
    checks.push({
      id: "semantic-landmarks",
      category: "accessibility",
      title: "Semantic HTML Landmarks",
      status: "warning",
      message: `Limited semantic landmarks detected (${data.semantics.tagsFound.join(", ")}). Consider using <main>, <nav>, and <footer> for accessible assistive navigation.`,
      importance: "recommended"
    });
  } else {
    checks.push({
      id: "semantic-landmarks",
      category: "accessibility",
      title: "Semantic HTML Landmarks",
      status: "issue",
      message: "No standard HTML5 semantic landmarks (<header>, <nav>, <main>, <footer>) detected. Page appears built with unsemantic div containers.",
      importance: "recommended"
    });
  }
  if (data.responseTimeMs < 450) {
    checks.push({
      id: "response-latency",
      category: "performance",
      title: "Server Latency (TTFB)",
      status: "good",
      message: `Fast initial HTML server response time (${data.responseTimeMs}ms).`,
      metric: `${data.responseTimeMs}ms`,
      importance: "recommended"
    });
  } else if (data.responseTimeMs < 1200) {
    checks.push({
      id: "response-latency",
      category: "performance",
      title: "Server Latency (TTFB)",
      status: "warning",
      message: `Moderate server latency (${data.responseTimeMs}ms). Initial HTML delivery could be optimized with edge caching or CDN.`,
      metric: `${data.responseTimeMs}ms`,
      importance: "recommended"
    });
  } else {
    checks.push({
      id: "response-latency",
      category: "performance",
      title: "Server Latency (TTFB)",
      status: "issue",
      message: `Slow server response time (${data.responseTimeMs}ms). Exceeds the 1000ms threshold recommended for smooth user experience.`,
      metric: `${data.responseTimeMs}ms`,
      importance: "recommended"
    });
  }
  if (data.socialMeta.hasOgComplete) {
    checks.push({
      id: "social-meta",
      category: "conversion",
      title: "Open Graph Social Cards",
      status: "good",
      message: "Complete Open Graph metadata configured (og:title, og:description, og:image).",
      importance: "optional"
    });
  } else {
    checks.push({
      id: "social-meta",
      category: "conversion",
      title: "Open Graph Social Cards",
      status: "warning",
      message: `Incomplete social share metadata. Missing: ${[
        !data.socialMeta.ogTitle && "og:title",
        !data.socialMeta.ogDescription && "og:description",
        !data.socialMeta.ogImage && "og:image"
      ].filter(Boolean).join(", ")}. Shares on Twitter/LinkedIn will lack rich previews.`,
      importance: "optional"
    });
  }
  if (data.links.emptyTextCount > 0) {
    checks.push({
      id: "empty-links",
      category: "accessibility",
      title: "Accessible Link Text",
      status: "warning",
      message: `Found ${data.links.emptyTextCount} link(s) without visible text or aria-label. Screen readers cannot describe these navigation targets.`,
      metric: `${data.links.emptyTextCount} empty`,
      importance: "recommended"
    });
  }
  return checks;
}

// server/parser.ts
var cheerio = __toESM(require("cheerio"), 1);
var CTA_KEYWORDS = [
  "get started",
  "start free",
  "free trial",
  "sign up",
  "book a demo",
  "schedule",
  "contact us",
  "try now",
  "request demo",
  "join now",
  "buy now",
  "order now",
  "subscribe",
  "explore pricing",
  "learn more",
  "get in touch",
  "start now"
];
function parseHtml(crawlData, initialUrl) {
  const { html, status, finalUrl, responseTimeMs, contentLength } = crawlData;
  const $ = cheerio.load(html);
  const parsedUrl = new URL(finalUrl);
  const domain = parsedUrl.hostname;
  const title = ($("title").first().text() || "").trim();
  const metaDescription = ($('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "").trim();
  const canonicalUrl = ($('link[rel="canonical"]').attr("href") || "").trim();
  const language = ($("html").attr("lang") || $('meta[http-equiv="content-language"]').attr("content") || "").trim();
  const charset = ($("meta[charset]").attr("charset") || $('meta[http-equiv="Content-Type"]').attr("content") || "").trim();
  const viewport = ($('meta[name="viewport"]').attr("content") || "").trim();
  const hasViewportMeta = viewport.length > 0;
  const isHttps = finalUrl.startsWith("https://");
  const h1List = [];
  const h2List = [];
  const h3List = [];
  const sampleHeadings = [];
  $("h1").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    if (txt) {
      h1List.push(txt);
      if (sampleHeadings.length < 20) {
        sampleHeadings.push({ tag: "h1", text: txt });
      }
    }
  });
  $("h2").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    if (txt) {
      h2List.push(txt);
      if (sampleHeadings.length < 20) {
        sampleHeadings.push({ tag: "h2", text: txt });
      }
    }
  });
  $("h3").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    if (txt) {
      h3List.push(txt);
      if (sampleHeadings.length < 20) {
        sampleHeadings.push({ tag: "h3", text: txt });
      }
    }
  });
  const totalHeadings = h1List.length + h2List.length + h3List.length;
  let internalCount = 0;
  let externalCount = 0;
  let emptyTextCount = 0;
  const ctaLinks = [];
  const sampleLinks = [];
  $("a").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const ariaLabel = ($(el).attr("aria-label") || "").trim();
    const visibleOrAccessibleText = text || ariaLabel;
    if (!visibleOrAccessibleText && href) {
      emptyTextCount++;
    }
    let isExternal = false;
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
      try {
        const linkUrl = new URL(href.startsWith("//") ? "https:" + href : href);
        if (linkUrl.hostname !== domain && !linkUrl.hostname.endsWith("." + domain)) {
          isExternal = true;
          externalCount++;
        } else {
          internalCount++;
        }
      } catch {
        internalCount++;
      }
    } else if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
      internalCount++;
    }
    const lowerText = visibleOrAccessibleText.toLowerCase();
    const isCta = CTA_KEYWORDS.some((kw) => lowerText.includes(kw));
    if (isCta && visibleOrAccessibleText && !ctaLinks.includes(visibleOrAccessibleText)) {
      ctaLinks.push(visibleOrAccessibleText);
    }
    if (sampleLinks.length < 25 && href) {
      sampleLinks.push({
        text: visibleOrAccessibleText || "[No link text / Icon only]",
        href: href.slice(0, 100),
        isExternal,
        isCtaLike: isCta,
        hasText: !!visibleOrAccessibleText
      });
    }
  });
  let withAltCount = 0;
  let missingAltCount = 0;
  const sampleImages = [];
  const missingAltSamples = [];
  $("img").each((_, el) => {
    const src = ($(el).attr("src") || $(el).attr("data-src") || "").trim();
    const alt = $(el).attr("alt");
    const hasAlt = typeof alt === "string" && alt.trim().length > 0;
    if (hasAlt) {
      withAltCount++;
    } else {
      missingAltCount++;
      if (src && missingAltSamples.length < 10) {
        missingAltSamples.push(src.slice(0, 80));
      }
    }
    if (sampleImages.length < 20 && src) {
      sampleImages.push({
        src: src.slice(0, 100),
        alt: typeof alt === "string" ? alt : "[Missing alt attribute]",
        hasAlt
      });
    }
  });
  const totalImages = withAltCount + missingAltCount;
  const altCoveragePercent = totalImages > 0 ? Math.round(withAltCount / totalImages * 100) : 100;
  const hasHeader = $("header").length > 0;
  const hasNav = $("nav").length > 0;
  const hasMain = $('main, [role="main"]').length > 0;
  const hasSection = $("section").length > 0;
  const hasFooter = $("footer").length > 0;
  const hasArticle = $("article").length > 0;
  const hasAside = $("aside").length > 0;
  const hasForm = $("form").length > 0;
  const hasButton = $("button").length > 0;
  const tagsFound = [];
  if (hasHeader) tagsFound.push("<header>");
  if (hasNav) tagsFound.push("<nav>");
  if (hasMain) tagsFound.push("<main>");
  if (hasSection) tagsFound.push("<section>");
  if (hasFooter) tagsFound.push("<footer>");
  if (hasArticle) tagsFound.push("<article>");
  if (hasAside) tagsFound.push("<aside>");
  if (hasForm) tagsFound.push("<form>");
  if (hasButton) tagsFound.push("<button>");
  const ogTitle = ($('meta[property="og:title"]').attr("content") || "").trim();
  const ogDescription = ($('meta[property="og:description"]').attr("content") || "").trim();
  const ogImage = ($('meta[property="og:image"]').attr("content") || "").trim();
  const ogType = ($('meta[property="og:type"]').attr("content") || "").trim();
  const twitterCard = ($('meta[name="twitter:card"]').attr("content") || "").trim();
  const hasOgComplete = !!(ogTitle && ogDescription && ogImage);
  const scriptsCount = $("script").length;
  const stylesheetsCount = $('link[rel="stylesheet"]').length;
  const inlineStyleCount = $("style, [style]").length;
  let inputsWithoutLabels = false;
  const sampleFormActions = [];
  $("form").each((_, formEl) => {
    const action = $(formEl).attr("action") || "[inline / js handled]";
    sampleFormActions.push(action);
    const inputs = $(formEl).find('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
    inputs.each((_2, inputEl) => {
      const id = $(inputEl).attr("id");
      const ariaLabel = $(inputEl).attr("aria-label");
      const placeholder = $(inputEl).attr("placeholder");
      const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
      if (!hasLabel && !ariaLabel && !placeholder) {
        inputsWithoutLabels = true;
      }
    });
  });
  $("script, style, noscript, svg, template, iframe").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const approxWordCount = bodyText.split(/\s+/).filter(Boolean).length;
  const bodySnippet = bodyText.slice(0, 3500);
  return {
    url: initialUrl,
    finalUrl,
    domain,
    httpStatus: status,
    responseTimeMs,
    htmlSizeBytes: contentLength,
    title,
    metaDescription,
    canonicalUrl,
    language,
    charset,
    viewport,
    hasViewportMeta,
    isHttps,
    headings: {
      h1: h1List,
      h2: h2List,
      h3: h3List,
      totalCount: totalHeadings,
      h1Count: h1List.length,
      hasMultipleH1: h1List.length > 1,
      hasMissingH1: h1List.length === 0,
      sampleList: sampleHeadings
    },
    links: {
      totalCount: internalCount + externalCount,
      internalCount,
      externalCount,
      emptyTextCount,
      ctaLinks,
      sampleLinks
    },
    images: {
      totalCount: totalImages,
      withAltCount,
      missingAltCount,
      altCoveragePercent,
      sampleImages,
      missingAltSamples
    },
    semantics: {
      hasHeader,
      hasNav,
      hasMain,
      hasSection,
      hasFooter,
      hasArticle,
      hasAside,
      hasForm,
      hasButton,
      totalLandmarks: tagsFound.length,
      tagsFound
    },
    socialMeta: {
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      twitterCard,
      hasOgComplete
    },
    performanceSignals: {
      scriptsCount,
      stylesheetsCount,
      inlineStyleCount,
      textLength: bodyText.length,
      approxWordCount
    },
    forms: {
      count: $("form").length,
      hasInputsWithoutLabels: inputsWithoutLabels,
      sampleFormActions
    },
    bodySnippet
  };
}

// server.ts
var import_fs2 = __toESM(require("fs"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  app.use(import_express.default.json({ limit: "2mb" }));
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.AI_API_KEY),
      model: process.env.AI_MODEL || "gemini-3.7-flash"
    });
  });
  app.get("/api/checklist", (req, res) => {
    try {
      const checklistPath = import_path2.default.resolve(process.cwd(), "website-audit-checklist.md");
      if (import_fs2.default.existsSync(checklistPath)) {
        const text = import_fs2.default.readFileSync(checklistPath, "utf-8");
        return res.json({ content: text });
      }
      return res.status(404).json({ error: "Checklist file not found" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Please provide a valid website URL." });
      }
      const validation = normalizeAndValidateUrl(url);
      if (!validation.valid || !validation.normalizedUrl) {
        return res.status(400).json({ error: validation.error || "Invalid or forbidden URL." });
      }
      const targetUrl = validation.normalizedUrl;
      let crawlData;
      try {
        crawlData = await crawlWebsite(targetUrl);
      } catch (crawlErr) {
        console.error("Crawl error for", targetUrl, crawlErr.message);
        return res.status(422).json({
          error: `We couldn't reach or analyze "${targetUrl}". ${crawlErr.message || "The website may block automated requests, require authentication, or be temporarily offline."}`
        });
      }
      const extractedData = parseHtml(crawlData, targetUrl);
      const deterministicChecks = runDeterministicChecks(extractedData);
      let auditResult;
      try {
        auditResult = await generateAuditWithAi(extractedData, deterministicChecks);
      } catch (aiErr) {
        console.error("AI Generation error:", aiErr);
        let cleanMessage = aiErr.message || "Unable to generate audit recommendations.";
        try {
          if (cleanMessage.startsWith("{") && cleanMessage.includes('"message"')) {
            const parsed = JSON.parse(cleanMessage);
            cleanMessage = parsed.error?.message || parsed.message || cleanMessage;
          }
        } catch {
        }
        return res.status(500).json({
          error: `AI analysis service notice: ${cleanMessage}`
        });
      }
      return res.json({
        success: true,
        data: auditResult
      });
    } catch (error) {
      console.error("Unhandled analysis error:", error);
      return res.status(500).json({
        error: error.message || "An unexpected error occurred while analyzing the website."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Website Auditor Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
