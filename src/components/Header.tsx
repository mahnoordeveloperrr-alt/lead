import React from 'react';
import { FileText, RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenChecklist: () => void;
  onReset?: () => void;
  hasActiveAudit: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenChecklist, onReset, hasActiveAudit }) => {
  return (
    <header className="w-full border-b border-zinc-800/60 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-5 h-5 bg-orange-500 rounded-xs rotate-45 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-90 transition-transform duration-300" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-100">
              Audit<span className="text-orange-500">.AI</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full tracking-widest">
              v2.4 PRO
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-view-checklist"
            onClick={onOpenChecklist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden xs:inline">Checklist</span>
          </button>

          {hasActiveAudit && (
            <button
              id="btn-new-audit-header"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Audit</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900/60 border border-zinc-800/80 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400">AI Agent Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
