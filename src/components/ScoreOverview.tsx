import React, { useState } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Share2,
  Copy,
  Layout,
  Search,
  Zap,
  Eye,
  TrendingUp,
  Code2,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import type { AuditResult, FindingCategory, ScoreBreakdown } from '../types/audit.js';

interface ScoreOverviewProps {
  auditResult: AuditResult;
  selectedCategory: FindingCategory | 'all';
  onSelectCategory: (cat: FindingCategory | 'all') => void;
  onOpenInspector: () => void;
  onOpenShareModal: () => void;
}

function getScoreBadge(score: number): {
  textColor: string;
  barColor: string;
  badgeClass: string;
} {
  if (score >= 90) {
    return {
      textColor: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    };
  }
  if (score >= 80) {
    return {
      textColor: 'text-zinc-200',
      barColor: 'bg-zinc-300',
      badgeClass: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
    };
  }
  if (score >= 65) {
    return {
      textColor: 'text-orange-400',
      barColor: 'bg-orange-500',
      badgeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    };
  }
  return {
    textColor: 'text-red-400',
    barColor: 'bg-red-500',
    badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };
}

export const ScoreOverview: React.FC<ScoreOverviewProps> = ({
  auditResult,
  selectedCategory,
  onSelectCategory,
  onOpenInspector,
  onOpenShareModal,
}) => {
  const { website, scores, summary, extractedData, scoreBreakdown } = auditResult;
  const overallBadge = getScoreBadge(scores.overall);
  const safeGrade = scores.grade || 'F';
  const [copied, setCopied] = React.useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleQuickCopy = () => {
    const text = `AI Website Audit for ${website.domain}
Overall Score: ${scores.overall}/100 (Grade ${safeGrade})
• UX/UI: ${scores.ux}/100
• SEO: ${scores.seo}/100
• Performance: ${scores.performance}/100
• Accessibility: ${scores.accessibility}/100
• Conversion: ${scores.conversion}/100

Summary: ${summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    {
      key: 'ux' as FindingCategory,
      name: 'UX / UI',
      score: scores.ux,
      icon: Layout,
      description: 'Hierarchy, visual dominance & layout balance',
    },
    {
      key: 'seo' as FindingCategory,
      name: 'Technical SEO',
      score: scores.seo,
      icon: Search,
      description: 'Headings outline, meta tags & indexing directives',
    },
    {
      key: 'performance' as FindingCategory,
      name: 'Performance',
      score: scores.performance,
      icon: Zap,
      description: `TTFB Latency (${extractedData.responseTimeMs}ms) & DOM weight`,
    },
    {
      key: 'accessibility' as FindingCategory,
      name: 'Accessibility',
      score: scores.accessibility,
      icon: Eye,
      description: `Alt coverage (${extractedData.images.altCoveragePercent}%) & landmarks`,
    },
    {
      key: 'conversion' as FindingCategory,
      name: 'Conversion',
      score: scores.conversion,
      icon: TrendingUp,
      description: 'Call-to-action prominence & friction reduction',
    },
  ];

  const getBreakdownForCategory = (cat: string): ScoreBreakdown | undefined => {
    return scoreBreakdown?.find((b) => b.category === cat);
  };

  return (
    <div className="w-full space-y-6">
      {/* Target & Executive Card */}
      <div className="bg-[#0A0A0A] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800/60">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
                Target Audit Report
              </span>
              {extractedData.isHttps && (
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  HTTPS Verified
                </span>
              )}
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                {new Date(website.scannedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl font-serif italic text-zinc-100 tracking-normal">
                {website.domain}
              </h2>
              <a
                href={website.finalUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title="Visit website"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-zinc-500 font-mono truncate max-w-xl">
              {website.finalUrl}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-inspect-raw-data"
              onClick={onOpenInspector}
              className="flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Inspect Data</span>
            </button>

            <button
              id="btn-quick-copy-report"
              onClick={handleQuickCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              id="btn-export-share-audit"
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest font-bold text-black bg-white hover:bg-zinc-200 rounded-lg transition-all cursor-pointer shadow-md"
            >
              <Share2 className="w-3.5 h-3.5 text-black" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Overall Score Dial & Summary Row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 lg:col-span-3 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 block mb-2 font-bold">
              Overall Score
            </span>
            <div className="text-6xl font-light text-white mb-1 tracking-tight">
              {scores.overall}
            </div>
            <div className="text-xs text-zinc-400 mb-2 font-mono">/100</div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full ${overallBadge.barColor} transition-all duration-700`}
                style={{ width: `${scores.overall}%` }}
              />
            </div>
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${overallBadge.badgeClass}`}>
              Grade {safeGrade}
            </span>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
              Executive Evaluation
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-light">
              {summary}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px] font-mono text-zinc-500">
              <span className="uppercase tracking-widest text-zinc-400 font-bold">Signals Analyzed:</span>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                {extractedData.headings.totalCount} Headings ({extractedData.headings.h1Count} H1)
              </span>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                {extractedData.links.totalCount} Links
              </span>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                {extractedData.images.totalCount} Images
              </span>
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">
                {extractedData.responseTimeMs}ms TTFB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {categories.map((cat) => {
          const badge = getScoreBadge(cat.score);
          const isSelected = selectedCategory === cat.key;
          const bd = getBreakdownForCategory(cat.key);

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.key)}
              className={`text-left p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-zinc-900/90 border-orange-500/80 shadow-lg shadow-orange-500/5'
                  : 'bg-[#0A0A0A] hover:bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  {cat.name}
                </span>
                <span className={`text-2xl font-light ${badge.textColor}`}>
                  {cat.score}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed min-h-[32px]">
                {cat.description}
              </p>

              <div className="w-full h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full ${badge.barColor} transition-all duration-500`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>

              {bd && (
                <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-zinc-600">
                  <span>{bd.verifiedChecks} pass</span>
                  <span>•</span>
                  <span>{bd.failedChecks} issues</span>
                  {bd.unverifiedChecks > 0 && (
                    <>
                      <span>•</span>
                      <span>{bd.unverifiedChecks} unverified</span>
                    </>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Score Explanation */}
      <div className="bg-[#0A0A0A] border border-zinc-800/80 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-zinc-900/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              How is this score calculated?
            </span>
          </div>
          {showBreakdown ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {showBreakdown && (
          <div className="px-4 pb-4 space-y-4 border-t border-zinc-800/60 pt-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Scores are calculated <strong className="text-zinc-200">programmatically</strong> from verified deterministic checks against the crawled HTML.
              Each check has a weight reflecting its importance. Critical issues carry double penalty.
              Unverified checks are <strong className="text-zinc-200">excluded</strong> from scoring — they do not reduce the score.
              AI recommendations are <strong className="text-zinc-200">separated</strong> from technical checks and do not affect scores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {scoreBreakdown?.map((bd) => {
                const catInfo = categories.find((c) => c.key === bd.category);
                return (
                  <div key={bd.category} className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {catInfo?.name || bd.category}
                      </span>
                      <span className="text-sm font-light text-zinc-200">{bd.rawScore}/{bd.maxPossible}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-zinc-400 rounded-full"
                        style={{ width: `${bd.maxPossible > 0 ? (bd.rawScore / bd.maxPossible) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 flex items-center gap-2">
                      <span>{bd.verifiedChecks} verified</span>
                      <span>•</span>
                      <span>{bd.failedChecks} failed</span>
                      {bd.unverifiedChecks > 0 && (
                        <>
                          <span>•</span>
                          <span>{bd.unverifiedChecks} excluded</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-zinc-500 font-mono">
              Category weights: SEO 22% • UX 22% • Performance 20% • Conversion 18% • Accessibility 18%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
