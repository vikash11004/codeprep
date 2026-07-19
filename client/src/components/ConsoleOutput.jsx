import { useState } from 'react';
import { Check, X, Loader2, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';

function TestRow({ result, index }) {
  const [expanded, setExpanded] = useState(!result.passed);
  
  return (
    <div className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
      <div className="test-result-head" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
        {result.passed ? <Check size={14} className="text-[var(--color-success)]" /> : <X size={14} className="text-[var(--color-danger)]" />}
        <b>Test {index + 1}</b>
        {result.description && <span>{result.description}</span>}
      </div>
      {expanded && (
        <dl>
          <div><dt>Input</dt><dd>{result.input}</dd></div>
          <div><dt>Expected</dt><dd>{result.expectedOutput}</dd></div>
          {!result.passed && <div><dt>Received</dt><dd className="wrong-output">{result.actualOutput}</dd></div>}
          {result.error && <div><dt>Error</dt><dd className="wrong-output">{result.error}</dd></div>}
        </dl>
      )}
    </div>
  );
}

export default function ConsoleOutput({ results, running, error }) {
  if (running) return <div className="console-state"><Loader2 size={18} className="animate-spin" /> Running your tests…</div>;
  if (error) return <div className="console-error"><b>Run failed</b><p>{error}</p></div>;
  if (!results) return <div className="console-state"><PlayCircle size={24} className="opacity-30 mb-2" /><p>Run your code to see test results</p></div>;
  
  const progressPercent = Math.round((results.summary.passed / results.summary.total) * 100) || 0;
  
  return <div className="console-output">
    <div className={`result-summary ${results.allPassed ? 'passed' : 'failed'}`}>
      <div>
        {results.allPassed ? <Check size={17} /> : <X size={17} />}
        <b>{results.allPassed ? 'All tests passed' : `${results.summary.failed} test${results.summary.failed === 1 ? '' : 's'} failed`}</b>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-16 h-1.5 bg-[var(--color-surface-500)] rounded-full overflow-hidden">
          <div className="h-full bg-current transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <span>{results.summary.passed} / {results.summary.total}</span>
      </div>
    </div>
    {results.results.map((result, index) => <TestRow key={index} result={result} index={index} />)}
  </div>;
}
