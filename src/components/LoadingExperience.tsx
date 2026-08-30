import React, { useEffect, useState } from 'react';
import { Globe, CheckCircle2, Loader2, Sparkles, Server, Search, ShieldCheck } from 'lucide-react';

interface LoadingExperienceProps {
  targetUrl: string;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Validating URL & Security', detail: 'Running SSRF guard and DNS safety checks', icon: ShieldCheck },
  { id: 2, label: 'Connecting to Target Website', detail: 'Dispatching HTTP crawler & recording latency (TTFB)', icon: Server },
  { id: 3, label: 'Inspecting Page Architecture', detail: 'Parsing headings hierarchy, DOM tree, images, and anchors', icon: Search },
  { id: 4, label: 'Running Deterministic Rules', detail: 'Auditing title, meta description, alt coverage, viewport tags', icon: CheckCircle2 },
  { id: 5, label: 'AI Multi-Factor Evaluation', detail: 'Evaluating UX, SEO, a11y & conversion against checklist', icon: Sparkles },
  { id: 6, label: 'Synthesizing Redesign Strategy', detail: 'Formulating high-priority issues & scoring dashboard', icon: Globe },
];

export const LoadingExperience: React.FC<LoadingExperienceProps> = ({ targetUrl }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);

    return () => clearInterval(stepInterval);
  }, []);

  const progressPercentage = Math.min(95, Math.round(((activeStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="w-full max-w-2xl mx-auto my-12 px-4">
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">
                Auditing Target Website
              </h3>
              <p className="text-xs text-orange-400/90 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                {targetUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400">
            <span>Elapsed: {elapsedSeconds}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            <span>Pipeline Progress</span>
            <span className="text-orange-400 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stage List */}
        <div className="space-y-2.5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-zinc-900/90 border-orange-500/40 shadow-xs'
                    : isDone
                    ? 'bg-zinc-900/30 border-zinc-800/40 opacity-75'
                    : 'bg-transparent border-transparent opacity-30'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/50 flex items-center justify-center animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <Icon className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isCurrent
                          ? 'text-zinc-100'
                          : isDone
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[9px] uppercase font-bold tracking-widest text-orange-400 font-mono animate-pulse">
                        Running
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 font-light">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Footer */}
        <div className="pt-4 border-t border-zinc-800/60 text-center text-xs text-zinc-500 font-mono">
          Crawling live markup & streaming through Gemini 3.7. Takes 5–10s.
        </div>
      </div>
    </div>
  );
};
