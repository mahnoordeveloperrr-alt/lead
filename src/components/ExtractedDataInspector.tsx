import React, { useState } from 'react';
import { X, Heading, Image as ImageIcon, Link2, FileCode, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import type { ExtractedWebsiteData } from '../types/audit.js';

interface ExtractedDataInspectorProps {
  data: ExtractedWebsiteData;
  isOpen: boolean;
  onClose: () => void;
}

export const ExtractedDataInspector: React.FC<ExtractedDataInspectorProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'headings' | 'images' | 'links' | 'meta' | 'raw'>('headings');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">
                Crawled DOM Architecture
              </h3>
              <p className="text-xs text-zinc-500 font-mono truncate max-w-md mt-0.5">
                {data.finalUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 overflow-x-auto text-xs font-semibold bg-zinc-950">
          {[
            { key: 'headings', label: `Headings (${data.headings.totalCount})`, icon: Heading },
            { key: 'images', label: `Images (${data.images.totalCount})`, icon: ImageIcon },
            { key: 'links', label: `Links (${data.links.totalCount})`, icon: Link2 },
            { key: 'meta', label: 'Meta & Social', icon: FileCode },
            { key: 'raw', label: 'Raw Payload & Metrics', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                  isActive
                    ? 'border-orange-500 text-orange-400 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono bg-[#050505]">
          {activeTab === 'headings' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400">
                <span className="text-zinc-500 uppercase tracking-widest text-[10px]">H1 Count: </span>
                <span className={data.headings.h1Count === 1 ? 'text-emerald-400 font-bold' : 'text-orange-400 font-bold'}>
                  {data.headings.h1Count}
                </span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase tracking-widest text-[10px]">H2: </span><span className="text-zinc-200">{data.headings.h2.length}</span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase tracking-widest text-[10px]">H3: </span><span className="text-zinc-200">{data.headings.h3.length}</span>
              </div>

              <div className="space-y-2">
                {data.headings.sampleList.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-zinc-800/80 flex items-start gap-3 bg-zinc-900/30"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        h.tag === 'h1'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : h.tag === 'h2'
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {h.tag}
                    </span>
                    <span className="text-zinc-300 break-words font-sans">{h.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400">
                <span className="text-zinc-500 uppercase text-[10px]">Total: </span><span className="text-zinc-200">{data.images.totalCount}</span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase text-[10px]">With Alt: </span><span className="text-emerald-400 font-bold">{data.images.withAltCount}</span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase text-[10px]">Missing Alt: </span><span className="text-red-400 font-bold">{data.images.missingAltCount}</span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase text-[10px]">Coverage: </span><span className="text-orange-400 font-bold">{data.images.altCoveragePercent}%</span>
              </div>

              <div className="space-y-2">
                {data.images.sampleImages.map((img, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 truncate max-w-sm text-[11px]">{img.src}</span>
                      {img.hasAlt ? (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          Has Alt
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] text-red-400 font-bold uppercase tracking-wider">
                          <AlertCircle className="w-3 h-3" />
                          Missing Alt
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400">
                      <span className="text-zinc-600 uppercase text-[10px]">alt: </span>
                      <span className="text-zinc-300 font-sans">{img.alt || '[empty]'}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400">
                <span className="text-zinc-500 uppercase text-[10px]">Total: </span><span className="text-zinc-200">{data.links.totalCount}</span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase text-[10px]">Internal: </span><span className="text-zinc-200">{data.links.internalCount}</span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase text-[10px]">External: </span><span className="text-zinc-200">{data.links.externalCount}</span>
                <span className="mx-2 text-zinc-700">•</span>
                <span className="text-zinc-500 uppercase text-[10px]">Empty Text: </span><span className="text-orange-400">{data.links.emptyTextCount}</span>
              </div>

              <div className="space-y-2">
                {data.links.sampleLinks.map((link, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-200 truncate font-sans text-xs">{link.text || '[Empty anchor text]'}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{link.href}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {link.isCtaLike && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold uppercase tracking-wider">
                          CTA
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-zinc-400 uppercase">
                        {link.isExternal ? 'Ext' : 'Int'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Page Title:</span>
                  <p className="text-zinc-200 font-sans mt-0.5">{data.title || '[None]'}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Meta Description:</span>
                  <p className="text-zinc-300 font-sans mt-0.5 font-light">{data.metaDescription || '[None]'}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Canonical URL:</span>
                  <p className="text-zinc-400 mt-0.5">{data.canonicalUrl || '[None]'}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Viewport:</span>
                  <p className="text-zinc-400 mt-0.5">{data.viewport || '[None]'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                <span className="text-orange-400 font-bold uppercase tracking-widest text-[10px] block">Open Graph & Social Cards:</span>
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">og:title:</span>
                  <p className="text-zinc-200 font-sans mt-0.5">{data.socialMeta.ogTitle || '[None]'}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">og:description:</span>
                  <p className="text-zinc-300 font-sans mt-0.5 font-light">{data.socialMeta.ogDescription || '[None]'}</p>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">og:image:</span>
                  <p className="text-zinc-400 mt-0.5 truncate">{data.socialMeta.ogImage || '[None]'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div><span className="text-zinc-500 uppercase text-[9px] block">HTTP Status</span><span className="text-emerald-400 font-bold">{data.httpStatus}</span></div>
                <div><span className="text-zinc-500 uppercase text-[9px] block">Latency</span><span className="text-zinc-200">{data.responseTimeMs}ms</span></div>
                <div><span className="text-zinc-500 uppercase text-[9px] block">Payload Size</span><span className="text-zinc-200">{data.htmlSizeBytes} bytes</span></div>
                <div><span className="text-zinc-500 uppercase text-[9px] block">Scripts</span><span className="text-zinc-200">{data.performanceSignals.scriptsCount}</span></div>
                <div><span className="text-zinc-500 uppercase text-[9px] block">Stylesheets</span><span className="text-zinc-200">{data.performanceSignals.stylesheetsCount}</span></div>
                <div><span className="text-zinc-500 uppercase text-[9px] block">Word Count</span><span className="text-zinc-200">{data.performanceSignals.approxWordCount}</span></div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
                <span className="text-zinc-500 uppercase tracking-widest text-[9px] block">Extracted Body Text Snippet:</span>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-light">
                  {data.bodySnippet}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
