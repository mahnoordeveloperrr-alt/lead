import React from 'react';
import {
  Zap,
  HardDrive,
  Heading,
  Image as ImageIcon,
  Link2,
  FileCode,
} from 'lucide-react';
import type { ExtractedWebsiteData } from '../types/audit.js';

interface QuickMetricsBarProps {
  data: ExtractedWebsiteData;
}

export const QuickMetricsBar: React.FC<QuickMetricsBarProps> = ({ data }) => {
  const kbSize = (data.htmlSizeBytes / 1024).toFixed(1);

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
          Measured Technical Signals
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Empirical Crawl Telemetry</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Latency */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Latency</span>
          </div>
          <span className="text-xl font-light text-zinc-100">
            {data.responseTimeMs}ms
          </span>
          <span className="text-[10px] font-mono text-zinc-500 mt-2">
            {data.responseTimeMs < 500 ? '✓ Fast TTFB' : data.responseTimeMs < 1200 ? '⚠️ Moderate' : '🚨 High Latency'}
          </span>
        </div>

        {/* HTML Size */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Payload</span>
          </div>
          <span className="text-xl font-light text-zinc-100">
            {kbSize} KB
          </span>
          <span className="text-[10px] font-mono text-zinc-500 mt-2">
            {data.htmlSizeBytes < 100000 ? '✓ Lightweight' : '⚠️ Heavy DOM'}
          </span>
        </div>

        {/* Headings */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <Heading className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Headings</span>
          </div>
          <span className="text-xl font-light text-zinc-100">
            {data.headings.h1Count} <span className="text-xs text-zinc-500 font-mono">H1</span> • {data.headings.totalCount} <span className="text-xs text-zinc-500 font-mono">Tot</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-500 mt-2">
            {data.headings.h1Count === 1 ? '✓ Single H1' : data.headings.h1Count === 0 ? '🚨 Missing H1' : '⚠️ Multiple H1s'}
          </span>
        </div>

        {/* Images & Alt */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Alt Coverage</span>
          </div>
          <span className="text-xl font-light text-zinc-100">
            {data.images.altCoveragePercent}%
          </span>
          <span className="text-[10px] font-mono text-zinc-500 mt-2">
            {data.images.missingAltCount === 0
              ? `All ${data.images.totalCount} have alt`
              : `${data.images.missingAltCount}/${data.images.totalCount} missing`}
          </span>
        </div>

        {/* Links */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <Link2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Links</span>
          </div>
          <span className="text-xl font-light text-zinc-100">
            {data.links.totalCount}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 mt-2">
            {data.links.internalCount} int • {data.links.externalCount} ext
          </span>
        </div>

        {/* Semantics */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
            <FileCode className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[11px] uppercase tracking-wider text-zinc-500">Landmarks</span>
          </div>
          <span className="text-xl font-light text-zinc-100">
            {data.semantics.totalLandmarks}/8
          </span>
          <span className="text-[10px] font-mono text-zinc-500 mt-2">
            {data.semantics.hasMain ? '✓ <main> present' : '⚠️ Missing <main>'}
          </span>
        </div>
      </div>
    </div>
  );
};
