import React from 'react';
import { CheckCircle, ThumbsUp } from 'lucide-react';
import type { StrengthItem } from '../types/audit.js';

interface StrengthsSectionProps {
  strengths: StrengthItem[];
}

export const StrengthsSection: React.FC<StrengthsSectionProps> = ({ strengths }) => {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-500">
            Validated Strengths
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Elements, conventions, and practices performing well on this page.
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <ThumbsUp className="w-4 h-4" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {strengths.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
                {item.category}
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>

            <h4 className="font-semibold text-sm text-zinc-200">
              {item.title}
            </h4>

            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              {item.description}
            </p>

            {item.evidence && (
              <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                <span className="text-emerald-400 font-bold uppercase text-[9px] block mb-0.5">Verified Signal:</span>
                {item.evidence}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
