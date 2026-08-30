import React, { useEffect, useState } from 'react';
import { X, FileText } from 'lucide-react';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({ isOpen, onClose }) => {
  const [, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/checklist')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent(data.content);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">
                Audit Checklist Framework
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                website-audit-checklist.md
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-zinc-300 bg-[#050505]">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs">Loading checklist...</div>
          ) : (
            <div className="space-y-4">
              {/* Section 1 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px] font-mono font-bold">01</span>
                  UX / UI (User Experience & Interface)
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-zinc-400 pl-2 font-light">
                  <li><strong className="text-zinc-300">Navigation & Clarity:</strong> Concise, grouped, intuitive labels.</li>
                  <li><strong className="text-zinc-300">Hero & Value Prop:</strong> Understandable in 5 seconds with high-contrast headline.</li>
                  <li><strong className="text-zinc-300">Typography & Hierarchy:</strong> Logical scale (H1 → H2 → H3) and readable body text.</li>
                  <li><strong className="text-zinc-300">Primary CTA:</strong> Visually dominant action button above the fold.</li>
                  <li><strong className="text-zinc-300">Trust Signals:</strong> Testimonials, client proof, security badges.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold">02</span>
                  Mobile Experience & Responsiveness
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-zinc-400 pl-2 font-light">
                  <li><strong className="text-zinc-300">Responsive Viewport:</strong> Configured properly without horizontal overflow.</li>
                  <li><strong className="text-zinc-300">Touch Targets:</strong> Buttons sized for finger taps (min 44x44px).</li>
                  <li><strong className="text-zinc-300">Mobile CTA:</strong> Easily tap-able in one-handed thumb zone.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-mono font-bold">03</span>
                  Performance & Technical Speed
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-zinc-400 pl-2 font-light">
                  <li><strong className="text-zinc-300">Server Latency (TTFB):</strong> Initial HTML delivery time in milliseconds.</li>
                  <li><strong className="text-zinc-300">DOM Weight:</strong> HTML payload size and external script/stylesheet counts.</li>
                  <li><strong className="text-zinc-300">Asset Indicators:</strong> Image counts and unoptimized asset risks.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-mono font-bold">04</span>
                  Technical Search Engine Optimization (SEO)
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-zinc-400 pl-2 font-light">
                  <li><strong className="text-zinc-300">Title & Meta Description:</strong> Presence, optimal length, keyword relevance.</li>
                  <li><strong className="text-zinc-300">Heading Structure:</strong> Single descriptive H1 tag with semantic H2/H3 outline.</li>
                  <li><strong className="text-zinc-300">Open Graph & Social:</strong> og:title, og:description, og:image configuration.</li>
                  <li><strong className="text-zinc-300">Canonical Directive:</strong> Canonical URL declared for crawl indexing.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-mono font-bold">05</span>
                  Accessibility (a11y)
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-zinc-400 pl-2 font-light">
                  <li><strong className="text-zinc-300">Image Alt Attributes:</strong> Non-empty descriptive alt text on images.</li>
                  <li><strong className="text-zinc-300">Accessible Links & Buttons:</strong> Visible or aria-label text on interactive elements.</li>
                  <li><strong className="text-zinc-300">Semantic Landmarks:</strong> Proper {'<main>'}, {'<nav>'}, {'<header>'}, and {'<footer>'} tags.</li>
                  <li><strong className="text-zinc-300">Zoom Permissions:</strong> Viewport allows user pinch-to-zoom.</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px] font-mono font-bold">06</span>
                  Conversion Optimization & Redesign Blueprint
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-zinc-400 pl-2 font-light">
                  <li><strong className="text-zinc-300">Friction Points:</strong> Unclear propositions or cluttered layouts.</li>
                  <li><strong className="text-zinc-300">Action Prominence:</strong> Button contrast, phrasing, and repeat placement.</li>
                  <li><strong className="text-zinc-300">Redesign Blueprint:</strong> Specific structural recommendations for web agencies.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
          >
            Close Framework
          </button>
        </div>
      </div>
    </div>
  );
};
