import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { HighPriorityIssue } from '../types/audit.js';

interface TopProblemsProps {
  issues: HighPriorityIssue[];
}

export const TopProblems: React.FC<TopProblemsProps> = ({ issues }) => {
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
        <h3 className="font-bold text-base text-zinc-200">No Critical Issues Detected</h3>
        <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
          The automated audit did not identify any high-priority blockers. Check category findings for optimization recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-500">
              Top Priorities
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Prioritized issues holding back performance, conversion, SEO, or UX.
          </p>
        </div>
        <span className="text-[10px] text-zinc-500 italic font-mono">
          {issues.length} issues found
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {issues.map((issue, idx) => {
          const isHigh = issue.severity === 'high';
          const isMedium = issue.severity === 'medium';

          return (
            <div
              key={issue.id || idx}
              className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all"
            >
              {/* Header tags */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isHigh
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isMedium
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {isHigh ? 'Critical' : isMedium ? 'Warning' : 'Minor'}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                    {issue.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">#{idx + 1}</span>
              </div>

              {/* Title & Problem */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-200 mb-1.5">
                  {issue.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  <span className="font-semibold text-zinc-300">Problem: </span>
                  {issue.problem}
                </p>
              </div>

              {/* Evidence Quote */}
              {issue.evidence && (
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    <AlertCircle className="w-3 h-3 text-orange-400" />
                    <span>Evidence from Crawled HTML:</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 break-words leading-relaxed">
                    {issue.evidence}
                  </p>
                </div>
              )}

              {/* Impact & Recommendation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400/90 block mb-1">
                    Why it matters (Impact)
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {issue.impact}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 block mb-1">
                    Recommended Fix
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {issue.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
