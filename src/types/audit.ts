export type IssueSeverity = 'high' | 'medium' | 'low';
export type FindingCategory = 'ux' | 'seo' | 'performance' | 'accessibility' | 'conversion';
export type FindingStatus = 'pass' | 'warning' | 'critical' | 'unverified';
export type FindingSource = 'crawled' | 'ai-analysis' | 'inferred' | 'unverified';
export type ScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface HeadingItem {
  tag: 'h1' | 'h2' | 'h3';
  text: string;
}

export interface ImageAuditItem {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export interface LinkAuditItem {
  text: string;
  href: string;
  isExternal: boolean;
  isCtaLike: boolean;
  hasText: boolean;
}

export interface ExtractedWebsiteData {
  url: string;
  finalUrl: string;
  domain: string;
  httpStatus: number;
  responseTimeMs: number;
  htmlSizeBytes: number;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  language: string;
  charset: string;
  viewport: string;
  hasViewportMeta: boolean;
  isHttps: boolean;

  // Headings
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    totalCount: number;
    h1Count: number;
    hasMultipleH1: boolean;
    hasMissingH1: boolean;
    sampleList: HeadingItem[];
  };

  // Links
  links: {
    totalCount: number;
    internalCount: number;
    externalCount: number;
    emptyTextCount: number;
    emptyButtonCount: number;
    ctaLinks: string[];
    sampleLinks: LinkAuditItem[];
  };

  // Images
  images: {
    totalCount: number;
    withAltCount: number;
    missingAltCount: number;
    altCoveragePercent: number;
    sampleImages: ImageAuditItem[];
    missingAltSamples: string[];
  };

  // Semantics
  semantics: {
    hasHeader: boolean;
    hasNav: boolean;
    hasMain: boolean;
    hasSection: boolean;
    hasFooter: boolean;
    hasArticle: boolean;
    hasAside: boolean;
    hasForm: boolean;
    hasButton: boolean;
    totalLandmarks: number;
    tagsFound: string[];
  };

  // Open Graph & Social
  socialMeta: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogType: string;
    twitterCard: string;
    hasOgComplete: boolean;
  };

  // Performance Signals
  performanceSignals: {
    scriptsCount: number;
    stylesheetsCount: number;
    inlineStyleCount: number;
    textLength: number;
    approxWordCount: number;
  };

  // Forms
  forms: {
    count: number;
    hasInputsWithoutLabels: boolean;
    sampleFormActions: string[];
    totalInputs: number;
    inputsWithoutLabels: number;
  };

  // Robots
  robotsMeta: string;
  hasRobotsMeta: boolean;

  // Content Preview
  bodySnippet: string;
}

export interface DeterministicCheck {
  id: string;
  category: FindingCategory;
  title: string;
  status: FindingStatus;
  message: string;
  evidence: string;
  source: FindingSource;
  metric?: string;
  importance: 'critical' | 'recommended' | 'optional';
  weight: number; // 0-10 scoring weight
}

export interface AuditScores {
  ux: number;
  seo: number;
  performance: number;
  accessibility: number;
  conversion: number;
  overall: number;
  grade: ScoreGrade;
}

export interface ScoreBreakdown {
  category: FindingCategory;
  rawScore: number;
  maxPossible: number;
  grade: ScoreGrade;
  verifiedChecks: number;
  failedChecks: number;
  unverifiedChecks: number;
}

export interface HighPriorityIssue {
  id: string;
  title: string;
  category: FindingCategory;
  severity: IssueSeverity;
  problem: string;
  evidence: string;
  impact: string;
  recommendation: string;
  source: FindingSource;
}

export interface CategoryFinding {
  id: string;
  category: FindingCategory;
  title: string;
  status: FindingStatus;
  description: string;
  evidence: string;
  source: FindingSource;
  recommendation?: string;
}

export interface StrengthItem {
  title: string;
  category: FindingCategory;
  description: string;
  evidence: string;
  source: FindingSource;
}

export interface RedesignOpportunity {
  area: string;
  problem: string;
  evidence: string;
  impact: string;
  redesignStrategy: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: 'VERIFIED' | 'INFERRED' | 'UNVERIFIED';
}

export interface AuditResult {
  website: {
    url: string;
    finalUrl: string;
    domain: string;
    title: string;
    description: string;
    scannedAt: string;
  };
  scores: AuditScores;
  scoreBreakdown: ScoreBreakdown[];
  summary: string;
  highPriorityIssues: HighPriorityIssue[];
  categoryFindings: {
    ux: CategoryFinding[];
    seo: CategoryFinding[];
    performance: CategoryFinding[];
    accessibility: CategoryFinding[];
    conversion: CategoryFinding[];
  };
  strengths: StrengthItem[];
  redesignOpportunities: RedesignOpportunity[];
  deterministicChecks: DeterministicCheck[];
  extractedData: ExtractedWebsiteData;
  limitations: string[];
}

export interface AuditAnalysisRequest {
  url: string;
}
