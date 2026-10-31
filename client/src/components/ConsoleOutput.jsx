import { useState } from 'react';
import { Check, X, Loader2, Terminal } from 'lucide-react';
export default function ConsoleOutput({ results, running, error, onHelp }) {
  const [filter, setFilter] = useState('failed'); const [limit, setLimit] = useState(20);
  if (running) return <div className="console-state" role="status"><Loader2 size={22} className="animate-spin" /><h3>Putting your code to the test</h3><p>Compiling and executing against the problem’s test suite.</p></div>;
  if (error) return <div className="error-message" role="alert"><b>Unable to run</b><p>{error}</p></div>;
  if (!results) return <div className="console-state"><Terminal size={24} /><h3>Make your first move.</h3><p>Write your solution, then run it against the tests.</p><kbd>Ctrl + Enter</kbd></div>;
  const visible = results.results.filter(r => filter === 'all' || !r.passed);
  return <div className="console-output" aria-live="polite"><div className={`result-summary ${results.allPassed ? 'passed' : 'failed'}`}><div>{results.allPassed ? <Check size={20} /> : <X size={20} />}<b>{results.accepted ? 'Accepted' : results.allPassed ? 'Samples passed · not fully verified' : 'Keep going'}</b></div><span>{results.summary.passed} / {results.summary.total} passed</span></div><div className="result-meta"><span>{results.runner}</span><span>{results.durationMs} ms</span></div>
    {results.executionError && <pre className="error-message">{results.executionError}</pre>}
    {!results.allPassed && <div className="help-prompt"><span>A test failed. Want a hint or an explanation?</span><button className="text-button" onClick={onHelp}>Choose help →</button></div>}
    {results.coverage !== 'verified' && <p className="notice">{results.note}</p>}
    <div className="test-filters"><button aria-pressed={filter === 'failed'} onClick={() => { setFilter('failed'); setLimit(20); }}>Failed ({results.summary.failed})</button><button aria-pressed={filter === 'all'} onClick={() => { setFilter('all'); setLimit(20); }}>All cases ({results.summary.total})</button></div>
    {visible.slice(0, limit).map((r, i) => <details key={i} className={`test-result ${r.passed ? 'passed' : 'failed'}`}><summary>{r.passed ? <Check size={14} /> : <X size={14} />}<b>Case {results.results.indexOf(r) + 1}</b><span>{r.description}</span></summary><dl><dt>Input</dt><dd>{r.input}</dd><dt>Expected</dt><dd>{r.expectedOutput}</dd><dt>Received</dt><dd>{r.actualOutput || '(no output)'}</dd>{r.error && <><dt>Error</dt><dd className="wrong-output">{r.error}</dd></>}</dl></details>)}
    {visible.length > limit && <button className="text-button" onClick={() => setLimit(limit + 30)}>Show 30 more cases</button>}
    {results.logs && <details className="debug-output"><summary>Debug output</summary><pre>{results.logs}</pre></details>}
  </div>;
}
