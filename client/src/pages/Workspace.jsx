import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Loader2, ArrowLeft, Code2, CheckCircle2, FileText, Terminal, Lightbulb, Braces } from 'lucide-react';
import { api } from '../utils/api';
import { cn } from '../utils/cn';
import CodeEditor from '../components/CodeEditor';
import ProblemPanel from '../components/ProblemPanel';
import ConsoleOutput from '../components/ConsoleOutput';
import CoachingPanel from '../components/CoachingPanel';
const LANGUAGES = ['JavaScript', 'Python', 'C++', 'Java', 'C'];
const EXT = { JavaScript: 'js', Python: 'py', 'C++': 'cpp', Java: 'java', C: 'c' };
export default function Workspace() {
  const { problemId } = useParams(); const navigate = useNavigate();
  const [problem, setProblem] = useState(null); const [error, setError] = useState(''); const [health, setHealth] = useState(null);
  const [language, setLanguage] = useState('JavaScript'); const [code, setCode] = useState(''); const [ready, setReady] = useState(false); const [saveError, setSaveError] = useState('');
  const [results, setResults] = useState(null); const [running, setRunning] = useState(false); const [runError, setRunError] = useState('');
  const [tab, setTab] = useState('results'); const [mobileTab, setMobileTab] = useState('problem'); const [stdinExample, setStdinExample] = useState(''); const [attemptKey, setAttemptKey] = useState(0);
  const [customCases, setCustomCases] = useState([]); const [customInput, setCustomInput] = useState(''); const [customOutput, setCustomOutput] = useState('');
  const generation = useRef(0); const runningRef = useRef(false);
  const invalidate = useCallback(() => { generation.current++; }, []);
  useEffect(() => { api.getHealth().then(setHealth).catch(() => {}); }, []);
  useEffect(() => {
    let cancelled = false; generation.current++; setProblem(null); setError(''); setReady(false); setCustomCases([]); setCustomInput(''); setCustomOutput('');
    api.getProblem(problemId).then(p => { if (!cancelled) setProblem(p); }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; invalidate(); };
  }, [problemId, invalidate]);
  useEffect(() => {
    if (!problem) return;
    let cancelled = false; generation.current++; runningRef.current = false; setReady(false); setCode(''); setResults(null); setRunning(false); setRunError(''); setAttemptKey(k => k + 1);
    api.getStarterCode(problem, language).then(data => {
      if (cancelled) return;
      let draft; try { draft = localStorage.getItem(`codeprep:v3:${problem.id}:${language}`); } catch { setSaveError('Browser storage unavailable'); }
      setCode(draft ?? data.starterCode); setStdinExample(data.stdinExample); setReady(true);
    }).catch(e => { if (!cancelled) setRunError(e.message); });
    return () => { cancelled = true; invalidate(); };
  }, [problem, language, invalidate]);
  const runtime = health?.runtimes?.find(r => r.language === language);
  const canRun = ready && !running && code.trim() && (problem?.testCount > 0 || customCases.length > 0) && runtime?.available !== false;
  const run = useCallback(async () => {
    if (!canRun || runningRef.current) return;
    const ticket = generation.current; runningRef.current = true; setRunning(true); setResults(null); setRunError(''); setTab('results'); setMobileTab('code'); setAttemptKey(k => k + 1);
    try { const data = await api.runCode(code, language, problem, customCases); if (ticket === generation.current) setResults(data); }
    catch (e) { if (ticket === generation.current) setRunError(e.message); }
    finally { if (ticket === generation.current) { setRunning(false); runningRef.current = false; } }
  }, [canRun, code, language, problem, customCases]);
  useEffect(() => { const shortcut = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } }; window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut); }, [run]);
  function edit(value) {
    setCode(value); setResults(null); setAttemptKey(k => k + 1);
    try { localStorage.setItem(`codeprep:v3:${problem.id}:${language}`, value); setSaveError(''); } catch { setSaveError('Draft could not be saved'); }
  }
  if (error) return <div className="workspace-loading"><h2>Couldn’t open this problem</h2><p>{error}</p><button className="button-primary" onClick={() => navigate('/library')}>Back to library</button></div>;
  if (!problem) return <div className="workspace-loading" role="status"><Loader2 className="animate-spin" size={26} /><p>Opening your workspace…</p></div>;
  const stdinMode = language === 'C' || problem.contract.mode === 'stdin';
  return <div className="ide-shell">
    <header className="ide-header"><div className="ide-breadcrumb"><button className="icon-button" onClick={() => navigate('/library')} aria-label="Back to problem library"><ArrowLeft size={18} /></button><Code2 size={19} className="accent" /><span>Practice</span><i>/</i><strong>{problem.title}</strong></div><div className="ide-header-actions"><span className="save-state"><CheckCircle2 size={13} />{saveError || 'Draft saved locally'}</span><button className="button-primary run-button" onClick={run} disabled={!canRun}>{running ? <Loader2 size={15} className="animate-spin" /> : <Play size={14} fill="currentColor" />}{running ? 'Running…' : 'Run tests'}<kbd>Ctrl ↵</kbd></button></div></header>
    <div className="mobile-tabs"><button aria-pressed={mobileTab === 'problem'} onClick={() => setMobileTab('problem')}>Problem</button><button aria-pressed={mobileTab === 'code'} onClick={() => setMobileTab('code')}>Code & results</button></div>
    <main className="ide-layout"><section className={cn('ide-problem-pane', mobileTab !== 'problem' && 'mobile-hidden')}><div className="ide-pane-label"><span><FileText size={14} /> The challenge</span><span>{problem.coverage === 'verified' ? `${problem.testCount} verified tests` : 'Sample checks'}</span></div><div className="ide-pane-scroll"><ProblemPanel problem={problem} /></div></section>
      <div className={cn('ide-work-pane', mobileTab !== 'code' && 'mobile-hidden')}><section className="ide-editor-pane"><div className="editor-toolbar"><span><Code2 size={14} /> solution.{EXT[language]}</span><label className="language-picker"><span className="sr-only">Programming language</span><select value={language} disabled={running} onChange={e => setLanguage(e.target.value)}>{LANGUAGES.map(l => <option key={l} value={l} disabled={health?.runtimes?.find(r => r.language === l)?.available === false}>{l}{health?.runtimes?.find(r => r.language === l)?.available === false ? ' (not installed)' : ''}</option>)}</select></label></div>
        {ready ? <CodeEditor key={`${problem.id}:${language}`} value={code} onChange={edit} language={language} readOnly={running} /> : <div className="console-state"><Loader2 size={20} className="animate-spin" /><p>Preparing editor…</p></div>}
        <div className="editor-footer"><span><i className="status-dot" /> {runtime?.available ? runtime.version : language}</span><span>{stdinMode ? 'Standard input / output' : 'Return from solution()'} · UTF-8</span></div></section>
        <section className="ide-output-section"><div className="output-tabs"><button aria-pressed={tab === 'results'} onClick={() => setTab('results')}><Terminal size={14} /> Results {results && <span className={cn('tab-count', results.allPassed && 'success')}>{results.summary.passed}/{results.summary.total}</span>}</button><button aria-pressed={tab === 'contract'} onClick={() => setTab('contract')}><Braces size={14} /> I/O & tests</button><button aria-pressed={tab === 'coach'} onClick={() => setTab('coach')}><Lightbulb size={14} /> Learning coach {results && !results.allPassed && <i className="status-dot" />}</button></div>
          <div className="ide-pane-scroll">{tab === 'results' && <ConsoleOutput results={results} running={running} error={runError} onHelp={() => setTab('coach')} />}
            {tab === 'contract' && <div className="contract-content"><h3>{stdinMode ? 'Read stdin. Write stdout.' : 'One function. Every test.'}</h3><p>{stdinMode ? 'Write a complete program. Each test starts a fresh process. For structured examples, each argument is JSON on its own line; print a JSON answer. For raw input, preserve the statement’s format.' : 'Use the provided solution function. Return the result; the runner supplies arguments and checks the value. C++ and Java use class Solution. No main function is needed.'}</p><div className="example-card"><b>First test {stdinMode ? 'stdin' : 'arguments'}</b><pre>{stdinExample || '(add a test below)'}</pre></div><p className="muted">{problem.judgeNote}</p>{runtime?.reason && <p className="notice">{runtime.reason}</p>}
              <h3>Add a test of your own</h3><p>Use trusted expected answers. Custom cases supplement the suite; they never replace its checks.</p><form onSubmit={e => { e.preventDefault(); setCustomCases(c => [...c, { input: customInput, expectedOutput: customOutput }]); setCustomInput(''); setCustomOutput(''); setResults(null); }}><label className="field-label" htmlFor="custom-input">Input {problem.contract.mode === 'function' && '(JSON arguments, separated by commas)'}</label><textarea id="custom-input" rows={2} value={customInput} onChange={e => setCustomInput(e.target.value)} /><label className="field-label" htmlFor="custom-output">Expected output</label><textarea id="custom-output" rows={2} value={customOutput} onChange={e => setCustomOutput(e.target.value)} /><button className="button-secondary" disabled={running || customCases.length >= 50 || !customOutput.trim()}>Add case ({customCases.length}/50)</button></form>{customCases.map((t, i) => <div className="example-card" key={i}><pre>{t.input} → {t.expectedOutput}</pre><button className="text-button" disabled={running} onClick={() => { setCustomCases(c => c.filter((_, n) => n !== i)); setResults(null); }}>Remove case {i + 1}</button></div>)}
            </div>}
            {tab === 'coach' && <CoachingPanel key={attemptKey} problem={problem} language={language} code={code} failed={Boolean(results && !results.allPassed)} aiAvailable={health?.aiAvailable} />}
          </div></section></div>
    </main><footer className="ide-statusbar"><span><i className="status-dot" /> Real execution · No AI grading</span><span>{problem.coverage === 'verified' ? 'Reference-checked test suite' : 'Published examples · limited coverage'}</span></footer>
  </div>;
}
