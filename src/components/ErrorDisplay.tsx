import React from 'react';
import { AlertOctagon, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
  onReset: () => void;
  targetUrl: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errorMessage,
  onRetry,
  onReset,
  targetUrl,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto my-12 px-4 animate-fade-in">
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-400">
            Audit Failed to Complete
          </h3>
          <p className="text-xs text-orange-400/90 font-mono break-all px-4 mt-1">
            {targetUrl}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left font-mono leading-relaxed">
          {errorMessage}
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-left space-y-2 text-xs text-zinc-400">
          <span className="font-bold text-zinc-300 uppercase tracking-widest text-[9px] block">Diagnosis hints:</span>
          <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-400 font-light">
            <li>The website requires interactive CAPTCHA or bot verification challenge.</li>
            <li>The URL domain does not resolve or failed TLS/SSL handshake.</li>
            <li>The target web server timed out or refused headless crawler connection.</li>
            <li>The URL points to a private intranet or disallowed IP range.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Audit</span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Audit Another Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
