import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Layout,
  Search,
  Zap,
  Eye,
  TrendingUp,
} from 'lucide-react';
import type {
  CategoryFinding,
  DeterministicCheck,
  FindingCategory,
  FindingStatus,
} from '../types/audit.js';

interface CategoryFindingsProps {
  categoryFindings: {
    ux: CategoryFinding[];
    seo: CategoryFinding[];
    performance: CategoryFinding[];
    accessibility: CategoryFinding[];
    conversion: CategoryFinding[];
  };
  deterministicChecks: DeterministicCheck[];
  selectedCategory: FindingCategory | 'all';
  onSelectCategory: (cat: FindingCategory | 'all') => void;
}

export const CategoryFindings: React.FC<CategoryFindingsProps> = ({
  categoryFindings,
  deterministicChecks,
  selectedCategory,
  onSelectCategory,
}) => {
  const [statusFilter, setStatusFilter] = useState<FindingStatus | 'all'>('all');

  const categories: Array<{ key: FindingCategory; name: string; icon: React.ElementType }> = [
    { key: 'ux', name: 'UX / UI', icon: Layout },
    { key: 'seo', name: 'SEO', icon: Search },
    { key: 'performance', name: 'Performance', icon: Zap },
    { key: 'accessibility', name: 'Accessibility', icon: Eye },
    { key: 'conversion', name: 'Conversion', icon: TrendingUp },
  ];

  const allItems: Array<{
    id: string;
    category: FindingCategory;
    title: string;
    status: FindingStatus;
    description: string;
    evidence?: string;
    recommendation?: string;
    source: 'crawled' | 'ai-analysis' | 'unverified';
  }> = [];

  // Deterministic checks
  deterministicChecks.forEach((dc) => {
    allItems.push({
      id: `det-${dc.id}`,
      category: dc.category,
      title: dc.title,
      status: dc.status,
      description: dc.message,
      evidence: dc.evidence,
      source: 'crawled',
    });
  });

  // AI findings
  (Object.keys(categoryFindings) as FindingCategory[]).forEach((cat) => {
    const list = categoryFindings[cat] || [];
    list.forEach((f) => {
      allItems.push({
        id: f.id,
        category: cat,
        title: f.title,
        status: f.status,
        description: f.description,
        evidence: f.evidence,
        recommendation: f.recommendation,
        source: f.source || 'ai-analysis',
      });
    });
  });

  const filteredItems = allItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'pass':
        return {
          icon: CheckCircle2,
          text: 'Passed',
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          text: 'Warning',
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        };
      case 'critical':
        return {
          icon: AlertCircle,
          text: 'Critical',
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      case 'unverified':
      default:
        return {
          icon: HelpCircle,
          text: 'Unverified',
          badge: 'bg-zinc-900 text-zinc-400 border-zinc-800',
        };
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === 'crawled') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (source === 'ai-analysis') {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    if (source === 'inferred') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    return 'bg-zinc-900 text-zinc-500 border-zinc-800';
  };

  const getSourceLabel = (source: string) => {
    if (source === 'crawled') return '🔍 CRAWLED';
    if (source === 'ai-analysis') return '✨ AI ANALYSIS';
    if (source === 'inferred') return '💡 INFERRED';
    return '❓ UNVERIFIED';
  };

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
        <div>
          <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-500">
            Category Findings & Checks
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Comprehensive audit criteria evaluated across UX, SEO, speed, accessibility, and conversion.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-auto p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          {(['all', 'critical', 'warning', 'pass', 'unverified'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-black shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-lg border transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-zinc-800 border-zinc-700 text-white shadow-xs'
              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          All ({allItems.length})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = allItems.filter((i) => i.category === cat.key).length;

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/40 shadow-xs'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Findings List */}
      <div className="space-y-3 pt-2">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-mono">
            No audit findings matching the selected filters.
          </div>
        ) : (
          filteredItems.map((item) => {
            const badgeInfo = getStatusBadge(item.status);
            const StatusIcon = badgeInfo.icon;

            return (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${badgeInfo.badge}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {badgeInfo.text}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                      {item.category}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${getSourceBadge(
                      item.source
                    )}`}
                  >
                    {getSourceLabel(item.source)}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-zinc-200">
                  {item.title}
                </h4>

                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  {item.description}
                </p>

                {item.evidence && (
                  <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">
                      Evidence:
                    </span>
                    <p className="text-xs font-mono text-zinc-400 break-words leading-relaxed">
                      {item.evidence}
                    </p>
                  </div>
                )}

                {item.recommendation && (
                  <div className="pt-1 text-xs text-orange-400/90 font-light">
                    <span className="font-semibold text-orange-400">Recommendation: </span>
                    {item.recommendation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
