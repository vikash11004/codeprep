import { useState } from 'react';
import { api } from '../utils/api';
import { Lightbulb, ChevronDown, ChevronRight, Lock, Unlock, AlertTriangle, XCircle, Bug, SearchCode, CheckCircle2 } from 'lucide-react';

const CLASSIFICATION_CONFIG = {
  misread_problem: {
    label: 'Misread Problem',
    color: 'warning',
    icon: <AlertTriangle size={16} />,
  },
  wrong_approach: {
    label: 'Wrong Approach',
    color: 'danger',
    icon: <XCircle size={16} />,
  },
  implementation_bug: {
    label: 'Implementation Bug',
    color: 'primary',
    icon: <Bug size={16} />,
  },
};

export default function CoachingPanel({ problem, diagnosis, hintShown, language, code }) {
  const [solution, setSolution] = useState(null);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [solutionError, setSolutionError] = useState('');
  const [reasoningExpanded, setReasoningExpanded] = useState(false);

  const handleRevealSolution = async () => {
    if (!hintShown || !problem) return;
    setSolutionLoading(true);
    setSolutionError('');

    try {
      const data = await api.getSolution(problem, language, code);
      setSolution(data);
    } catch (err) {
      if (err.status === 403) {
        setSolutionError('You must receive at least one hint before viewing the solution.');
      } else {
        setSolutionError(err.message);
      }
    } finally {
      setSolutionLoading(false);
    }
  };

  if (!diagnosis && !solution) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] text-[13px] p-6 text-center gap-3 min-h-[150px]">
        <SearchCode size={24} className="opacity-30" />
        <p>Run your code to receive AI feedback.</p>
      </div>
    );
  }

  const config = diagnosis ? CLASSIFICATION_CONFIG[diagnosis.classification] || CLASSIFICATION_CONFIG.implementation_bug : null;
  
  const colorClasses = config ? {
    warning: { borderLeft: 'border-l-[var(--color-warning)]', text: 'text-[var(--color-warning)]', bg: 'bg-[rgba(217,135,39,0.05)]' },
    danger: { borderLeft: 'border-l-[var(--color-danger)]', text: 'text-[var(--color-danger)]', bg: 'bg-[rgba(235,87,87,0.05)]' },
    primary: { borderLeft: 'border-l-[var(--color-primary)]', text: 'text-[var(--color-primary)]', bg: 'bg-[rgba(46,170,220,0.05)]' },
  }[config.color] : null;

  return (
    <div className="space-y-4 max-w-full p-4">
      {/* 1. Diagnosis Block */}
      {diagnosis && config && colorClasses && (
        <div className={`rounded-md border border-[var(--color-border)] border-l-4 ${colorClasses.borderLeft} overflow-hidden bg-[var(--color-bg-primary)]`}>
          <div className={`px-4 py-3 flex items-center gap-3 ${colorClasses.bg}`}>
            <div className={colorClasses.text}>{config.icon}</div>
            <span className={`text-[13px] font-semibold ${colorClasses.text}`}>{config.label}</span>
          </div>
        </div>
      )}

      {/* 2. Hint Card & Thinking Question */}
      {diagnosis && (
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] overflow-hidden">
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Hint</h4>
              <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed">{diagnosis.hint}</p>
            </div>

            {diagnosis.followUpQuestion && (
              <div className="pl-3 border-l-2 border-[var(--color-warning)] py-1">
                <p className="text-[13px] text-[var(--color-text-secondary)] italic leading-relaxed">
                  {diagnosis.followUpQuestion}
                </p>
              </div>
            )}
          </div>

          {/* 3. Reasoning Toggle */}
          {diagnosis.explanation && (
            <div className="border-t border-[var(--color-border)]">
              <button
                onClick={() => setReasoningExpanded(!reasoningExpanded)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-900)] transition-colors"
              >
                {reasoningExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                How I got here
              </button>
              {reasoningExpanded && (
                <div className="px-4 pb-4 pt-1">
                  <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed">{diagnosis.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Solution Gate */}
      <div className={`rounded-md border p-5 transition-colors ${solution ? 'bg-[var(--color-bg-primary)] border-[var(--color-border)]' : 'border-dashed border-[var(--color-border-hover)] bg-[var(--color-bg-secondary)]'}`}>
        {!solution ? (
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Reference Solution</h4>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                {hintShown ? 'Available now.' : 'Run your code first to unlock.'}
              </p>
            </div>
            <button
              onClick={handleRevealSolution}
              disabled={!hintShown || solutionLoading}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5
                ${hintShown
                  ? 'bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-700)] cursor-pointer shadow-sm'
                  : 'bg-transparent text-[var(--color-text-muted)] cursor-not-allowed opacity-60'
                }`}
            >
              {hintShown ? <Unlock size={14} /> : <Lock size={14} />}
              {solutionLoading ? 'Loading...' : hintShown ? 'Reveal' : 'Locked'}
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <h4 className="text-[13px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[var(--color-success)]" /> Reference Solution
            </h4>

            {solution.mistakeCode && (
              <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
                <div className="px-3 py-2 bg-[rgba(235,87,87,0.05)] border-b border-[var(--color-border)] text-[11px] font-mono text-[var(--color-danger)] font-semibold flex items-center gap-2">
                  <XCircle size={14} /> Your Mistake
                </div>
                <pre className="p-4 text-[13px] font-mono text-[var(--color-danger)] overflow-x-auto leading-relaxed whitespace-pre-wrap bg-[var(--color-bg-primary)]">
                  <code>{solution.mistakeCode}</code>
                </pre>
              </div>
            )}

            <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
              <div className="px-3 py-2 bg-[rgba(15,123,108,0.05)] border-b border-[var(--color-border)] text-[11px] font-mono text-[var(--color-success)] font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} /> Correction
              </div>
              <pre className="p-4 text-[13px] font-mono text-[var(--color-success)] overflow-x-auto leading-relaxed whitespace-pre-wrap bg-[var(--color-bg-primary)]">
                <code>{solution.solutionCode}</code>
              </pre>
            </div>
            {solution.explanation && (
              <div className="p-4 rounded-md bg-[var(--color-surface-900)] border border-[var(--color-border)]">
                <h4 className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Key Insight</h4>
                <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed">{solution.explanation}</p>
                
                {(solution.timeComplexity || solution.spaceComplexity) && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-3 flex-wrap">
                    {solution.timeComplexity && (
                      <span className="text-[12px] font-mono bg-[var(--color-bg-primary)] border border-[var(--color-border)] px-2 py-1 rounded-md text-[var(--color-text-secondary)]">
                        ⏱ Time: <strong className="text-[var(--color-text-primary)]">{solution.timeComplexity}</strong>
                      </span>
                    )}
                    {solution.spaceComplexity && (
                      <span className="text-[12px] font-mono bg-[var(--color-bg-primary)] border border-[var(--color-border)] px-2 py-1 rounded-md text-[var(--color-text-secondary)]">
                        💾 Space: <strong className="text-[var(--color-text-primary)]">{solution.spaceComplexity}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {solutionError && (
          <p className="text-[12px] text-[var(--color-danger)] mt-3">{solutionError}</p>
        )}
      </div>
    </div>
  );
}
