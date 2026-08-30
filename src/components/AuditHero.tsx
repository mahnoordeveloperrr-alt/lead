import React, { useState } from 'react';
import { Globe, ArrowRight, AlertCircle } from 'lucide-react';

interface AuditHeroProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const SAMPLE_WEBSITES = [
  { name: 'stripe.com', url: 'https://stripe.com' },
  { name: 'linear.app', url: 'https://linear.app' },
  { name: 'github.com', url: 'https://github.com' },
  { name: 'news.ycombinator.com', url: 'https://news.ycombinator.com' },
  { name: 'wikipedia.org', url: 'https://wikipedia.org' },
];

export const AuditHero: React.FC<AuditHeroProps> = ({ onAnalyze, isLoading }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();

    if (!trimmed) {
      setValidationError('Please enter a website URL to begin analysis.');
      return;
    }

    if (trimmed.length > 2000) {
      setValidationError('The entered URL is too long.');
      return;
    }

    setValidationError(null);
    onAnalyze(trimmed);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
    setValidationError(null);
    onAnalyze(sampleUrl);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-[#050505] text-zinc-100 overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Diamond Micro-Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 shadow-xs">
          <div className="w-2 h-2 bg-orange-500 rounded-xs rotate-45" />
          <span>Full-Stack Web Intelligence Engine</span>
        </div>

        {/* Main Serif Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic font-normal tracking-tight text-zinc-100 leading-[1.08] mb-6">
          Find what's holding <br className="hidden sm:inline" />
          <span className="text-white not-italic font-sans font-light">your website back.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Live server-side DOM crawling, performance benchmarking, semantic accessibility, and Gemini multi-factor intelligence in one unified report.
        </p>

        {/* Form Container */}
        <div className="w-full max-w-2xl mx-auto mb-6">
          <form
            onSubmit={handleSubmit}
            className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-[#0A0A0A] rounded-xl border border-zinc-800 focus-within:border-zinc-700 shadow-2xl transition-all"
          >
            <div className="relative flex-1 flex items-center min-w-0 pl-3">
              <Globe className="w-4 h-4 text-zinc-500 shrink-0 mr-3" />
              <input
                id="url-audit-input"
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isLoading}
                placeholder="https://example.com or modern-saas.io"
                className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none disabled:opacity-60 pr-2 font-mono"
                autoComplete="off"
                spellCheck="false"
              />
              {inputUrl && !isLoading && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="p-1 text-xs text-zinc-500 hover:text-zinc-300 mr-2 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              id="btn-analyze-website"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-black font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-md"
            >
              <span>{isLoading ? 'Analyzing...' : 'Generate Report'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Validation Error Feedback */}
          {validationError && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Websites */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-xs text-zinc-500">
          <span className="text-[10px] uppercase tracking-widest text-zinc-600 mr-1">Quick Target:</span>
          {SAMPLE_WEBSITES.map((sample) => (
            <button
              key={sample.name}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSample(sample.url)}
              className="px-3 py-1 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 rounded-md text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            >
              {sample.name}
            </button>
          ))}
        </div>

        {/* Categories Strip */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] uppercase tracking-[0.2em] text-zinc-500 pt-6 border-t border-zinc-800/50">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            UX / UI
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            SEO
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Performance
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            Accessibility
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Conversion
          </span>
        </div>
      </div>
    </div>
  );
};
