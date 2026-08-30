import React from 'react';
import { Info } from 'lucide-react';

export const AnalysisLimitations: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl p-5 text-xs text-zinc-500 space-y-2 font-mono">
      <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-zinc-400 text-[10px]">
        <Info className="w-3.5 h-3.5 text-orange-400" />
        <span>Audit Scope & Methodology Notice</span>
      </div>
      <p className="leading-relaxed font-sans text-xs text-zinc-400 font-light">
        This audit is performed by executing a live server-side HTTP crawl of the submitted landing page, extracting DOM hierarchies, meta tags, heading outlines, link networks, and response latency, followed by automated deterministic rule checks and structured AI evaluation via Google Gemini 3.7. Client-side Single Page Applications (SPAs) rendered entirely via runtime JavaScript without server-side rendering (SSR) may have limited initial DOM markup evaluated.
      </p>
    </div>
  );
};
