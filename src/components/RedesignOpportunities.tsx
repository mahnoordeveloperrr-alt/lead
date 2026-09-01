import React from 'react';
import { Sparkles, Lightbulb, Target, AlertTriangle } from 'lucide-react';
import type { RedesignOpportunity } from '../types/audit.js';

interface RedesignOpportunitiesProps {
  opportunities: RedesignOpportunity[];
  domain: string;
}

export const RedesignOpportunities: React.FC<RedesignOpportunitiesProps> = ({
  opportunities,
  domain,
}) => {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 text-zinc-100 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-3">
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>Transformation Blueprint</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif italic tracking-normal text-zinc-100">
            Strategic Redesign Proposals
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl mt-1 font-light">
            Architectural and UX modernizations for <span className="font-semibold text-zinc-200">{domain}</span>.
            Each recommendation includes problem identification, evidence, and prioritized redesign strategy.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>Agency Pitch Ready</span>
        </div>
      </div>

      <div className="relative z-10 space-y-4 pt-2">
        {opportunities.map((opp, idx) => {
          const priorityColor =
            opp.priority === 'High'
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              : opp.priority === 'Medium'
                ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800';

          return (
            <div
              key={idx}
              className="p-5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-600">0{idx + 1}</span>
                  <h4 className="text-sm font-semibold text-zinc-200">
                    {opp.area}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded border ${
                      opp.confidence === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : opp.confidence === 'INFERRED'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {opp.confidence === 'VERIFIED' ? '🔍 VERIFIED' : opp.confidence === 'INFERRED' ? '💡 INFERRED' : '❓ UNVERIFIED'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${priorityColor}`}
                  >
                    {opp.priority} Priority
                  </span>
                </div>
              </div>

              {/* Problem */}
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400/90 mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Problem</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  {opp.problem}
                </p>
              </div>

              {/* Evidence */}
              {opp.evidence && (
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    <Target className="w-3 h-3" />
                    <span>Evidence</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 break-words leading-relaxed">
                    {opp.evidence}
                  </p>
                </div>
              )}

              {/* Impact */}
              {opp.impact && (
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400/80 block mb-1">
                    Impact
                  </span>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {opp.impact}
                  </p>
                </div>
              )}

              {/* Redesign Strategy */}
              <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Redesign Strategy</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light mt-1">
                  {opp.redesignStrategy}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
        <span>
          💡 Use these recommendations in website proposal pitch decks, design sprints, or client discovery meetings.
        </span>
      </div>
    </div>
  );
};
