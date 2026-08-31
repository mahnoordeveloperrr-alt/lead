import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header.js';
import { AuditHero } from './components/AuditHero.js';
import { LoadingExperience } from './components/LoadingExperience.js';
import { ScoreOverview } from './components/ScoreOverview.js';
import { QuickMetricsBar } from './components/QuickMetricsBar.js';
import { TopProblems } from './components/TopProblems.js';
import { RedesignOpportunities } from './components/RedesignOpportunities.js';
import { StrengthsSection } from './components/StrengthsSection.js';
import { CategoryFindings } from './components/CategoryFindings.js';
import { ExtractedDataInspector } from './components/ExtractedDataInspector.js';
import { ChecklistModal } from './components/ChecklistModal.js';
import { ExportShareModal } from './components/ExportShareModal.js';
import { ErrorDisplay } from './components/ErrorDisplay.js';
import { AnalysisLimitations } from './components/AnalysisLimitations.js';
import type { AuditResult, FindingCategory } from './types/audit.js';
import { ArrowLeft, RefreshCw, Sparkles, Globe } from 'lucide-react';

export function App() {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Modal & Filter States
  const [selectedCategory, setSelectedCategory] = useState<FindingCategory | 'all'>('all');
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentUrl(url);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to complete website audit.');
      }

      setAuditResult(json.data);
      setSelectedCategory('all');

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe ignore
      }

      // Smooth scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Audit Error:', err);
      setError(err.message || 'An unexpected error occurred while analyzing the website.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAuditResult(null);
    setError(null);
    setCurrentUrl('');
    setSelectedCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        onOpenChecklist={() => setIsChecklistOpen(true)}
        onReset={handleReset}
        hasActiveAudit={!!auditResult || isLoading || !!error}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* State 1: Loading In Progress */}
        {isLoading && (
          <div className="py-12">
            <LoadingExperience targetUrl={currentUrl} />
          </div>
        )}

        {/* State 2: Error State */}
        {!isLoading && error && (
          <div className="py-12">
            <ErrorDisplay
              errorMessage={error}
              targetUrl={currentUrl}
              onRetry={() => handleAnalyze(currentUrl)}
              onReset={handleReset}
            />
          </div>
        )}

        {/* State 3: Idle Landing / Hero */}
        {!isLoading && !error && !auditResult && (
          <AuditHero onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}

        {/* State 4: Complete Audit Report Dashboard */}
        {!isLoading && !error && auditResult && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
            {/* Quick Sticky Return Bar */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-zinc-900">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-orange-400" />
                <span>Audit Another URL</span>
              </button>

              <button
                onClick={() => handleAnalyze(currentUrl)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
                <span>Re-run Audit</span>
              </button>
            </div>

            {/* Section A: Score Overview & Category Breakdowns */}
            <ScoreOverview
              auditResult={auditResult}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenInspector={() => setIsInspectorOpen(true)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />

            {/* Section B: Measured Technical Signals Strip */}
            <QuickMetricsBar data={auditResult.extractedData} />

            {/* Section C: High-Priority Issues / Top Problems */}
            <TopProblems issues={auditResult.highPriorityIssues} />

            {/* Section D: Redesign & Agency Pitch Opportunities */}
            <RedesignOpportunities
              opportunities={auditResult.redesignOpportunities}
              domain={auditResult.website.domain}
            />

            {/* Section E: Verified Strengths */}
            <StrengthsSection strengths={auditResult.strengths} />

            {/* Section F: Detailed Filterable Category Findings */}
            <CategoryFindings
              categoryFindings={auditResult.categoryFindings}
              deterministicChecks={auditResult.deterministicChecks}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Section G: Methodology & Scope Notice */}
            <AnalysisLimitations limitations={auditResult.limitations} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#050505] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">AuditorAI</span>
            <span>•</span>
            <span>AI Website Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsChecklistOpen(true)}
              className="text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer uppercase tracking-wider text-[11px]"
            >
              Audit Criteria
            </button>
            <span>•</span>
            <span>Powered by Google Gemini 3.7</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {auditResult && (
        <>
          <ExtractedDataInspector
            data={auditResult.extractedData}
            isOpen={isInspectorOpen}
            onClose={() => setIsInspectorOpen(false)}
          />

          <ExportShareModal
            auditResult={auditResult}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        </>
      )}

      <ChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />
    </div>
  );
}

export default App;
