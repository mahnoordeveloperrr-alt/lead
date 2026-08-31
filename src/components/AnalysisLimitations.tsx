import React from 'react';
import { Info } from 'lucide-react';

interface AnalysisLimitationsProps {
  limitations?: string[];
}

export const AnalysisLimitations: React.FC<AnalysisLimitationsProps> = ({ limitations }) => {
  const defaultLimitations = [
    'This audit uses a static HTML crawler — client-rendered content (SPAs) may have additional dynamic elements not captured.',
    'Mobile visual rendering and interaction behavior were not directly tested.',
    'Accessibility evaluation covers automated checks only and does not replace manual keyboard/screen-reader/contrast testing.',
    'Performance metrics reflect initial server response time, not full page lifecycle with all assets.',
    'Business outcomes depend on many factors beyond website design alone.',
  ];

  const items = limitations && limitations.length > 0 ? limitations : defaultLimitations;

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-5 text-xs text-zinc-500 space-y-3 font-mono">
      <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-zinc-400 text-[10px]">
        <Info className="w-3.5 h-3.5 text-orange-400" />
        <span>Audit Scope & Limitations</span>
      </div>
      <ul className="space-y-1.5 font-sans text-xs text-zinc-400 font-light">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-zinc-600 mt-0.5 shrink-0">•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
