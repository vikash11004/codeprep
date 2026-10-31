import { ExternalLink, CheckCheck, FileText } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputModal from './InputModal';
export default function ProblemPanel({ problem }) {
  const [importing, setImporting] = useState(false); const navigate = useNavigate();
  if (!problem) return null;
  return <article className="problem-content"><div className="problem-tags"><span className={`difficulty-pill ${problem.difficulty?.toLowerCase()}`}>{problem.difficulty || 'Imported'}</span><span>{problem.category || 'Custom practice'}</span></div>
    <h1>{problem.title}</h1>
    <div className="problem-source"><FileText size={13} /> {problem.source || 'CodePrep library'} {problem.sourceUrl && <a href={problem.sourceUrl} target="_blank" rel="noreferrer">Original <ExternalLink size={12} /></a>}</div>
    {problem.importWarning && <p className="notice">{problem.importWarning}</p>}
    <p className="statement-text">{problem.description}</p>
    <div className="coverage-card"><CheckCheck size={18} /><div><b>{problem.testCount} {problem.coverage === 'verified' ? 'verified cases' : 'sample checks'}</b><p>{problem.judgeNote}</p></div></div>
    <h2>Examples</h2>{problem.examples?.length ? problem.examples.map((ex, i) => <div className="example-card" key={i}><div className="example-label">Example {String(i + 1).padStart(2, '0')}</div><dl><dt>Input</dt><dd>{ex.input}</dd><dt>Output</dt><dd>{ex.output}</dd></dl>{ex.explanation && <p>{ex.explanation}</p>}</div>) : <div className="notice">No public examples are available for this entry. Paste the complete statement or add trusted cases in I/O & tests.<button className="text-button" onClick={() => setImporting(true)}>Paste a complete statement →</button></div>}
    {problem.constraints?.length > 0 && <><h2>Constraints</h2><ul className="constraints">{problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}</ul></>}
    {importing && <InputModal isOpen mode="text" onClose={() => setImporting(false)} onSubmit={p => { setImporting(false); navigate(`/workspace/${p.id}`); }} />}
  </article>;
}
