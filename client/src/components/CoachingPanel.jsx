import { useState } from 'react';
import { Lightbulb, LockKeyhole, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
export default function CoachingPanel({ problem, language, code, failed, aiAvailable }) {
  const [hint, setHint] = useState(null); const [solution, setSolution] = useState(null); const [loading, setLoading] = useState(''); const [error, setError] = useState(''); const [confirm, setConfirm] = useState(false);
  const unavailable = aiAvailable === false && problem.coverage !== 'verified';
  async function request(kind) {
    setLoading(kind); setError('');
    try { if (kind === 'hint') setHint(await api.diagnose(problem, code, language)); else setSolution(await api.getSolution(problem, language, code)); }
    catch (e) { setError(e.message); } finally { setLoading(''); }
  }
  if (!failed) return <div className="coach-empty"><span className="empty-icon"><LockKeyhole size={22} /></span><h3>Your thinking comes first.</h3><p>Try the problem on your own. After a failed run, you can choose a small hint or a full explanation.</p><span className="quiet-label">No automatic AI requests</span></div>;
  return <div className="coach-content"><div className="coach-intro"><Lightbulb size={20} /><div><h3>A failed test is a useful clue.</h3><p>Keep working, ask for a nudge, or choose to see the approach.</p></div></div>
    {aiAvailable === false && <p className="notice">{unavailable ? 'This problem needs a valid Groq API key for AI coaching. Your tests and compiler work independently.' : 'Offline hints and JavaScript reference explanations are available. Configure AI for explanations in your selected language.'}</p>}
    <div className="coach-actions"><button className="button-secondary" disabled={!!loading || unavailable} onClick={() => request('hint')}>{loading === 'hint' ? <Loader2 size={15} className="animate-spin" /> : <Lightbulb size={15} />} Give me a hint</button><button className="button-secondary" disabled={!!loading || unavailable} onClick={() => setConfirm(true)}><BookOpen size={15} /> See solution</button></div>
    {error && <p role="alert" className="error-message">{error}</p>}
    {hint && <div className="help-card"><span className="eyebrow">{hint.aiGenerated === false ? 'Offline practice hint' : 'A nudge, not a spoiler'}</span>{hint.providerNotice && <p className="notice">{hint.providerNotice}</p>}<p>{hint.hint}</p><p className="muted">{hint.explanation}</p><blockquote>{hint.followUpQuestion}</blockquote></div>}
    {confirm && !solution && <div className="help-card"><h3>Reveal the full solution?</h3><p>This shows the code, why the approach works, a walkthrough, and learning tips. You can still try another attempt first.</p><div className="coach-actions"><button className="button-secondary" onClick={() => setConfirm(false)}>Keep trying</button><button className="button-primary" disabled={!!loading} onClick={() => request('solution')}>{loading === 'solution' ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />} Reveal & explain</button></div></div>}
    {solution && <div className="solution-content"><p className="quiet-label">{solution.notice || 'AI explanation · run the code to verify it'}</p>{solution.providerNotice && <p className="notice">{solution.providerNotice}</p>}{solution.mistakeExplanation && <section><h3>What went wrong</h3><p>{solution.mistakeExplanation}</p>{solution.mistakeCode && <pre>{solution.mistakeCode}</pre>}</section>}<section><h3>The approach</h3><p>{solution.solutionExplanation}</p></section><section><h3>Why this works</h3><p>{solution.whyThisApproach || solution.keyInsight}</p></section><section><h3>Walk through an example</h3><p>{solution.walkthrough}</p></section><section><h3>Reference code · {solution.referenceLanguage || language}</h3><pre>{solution.solutionCode}</pre></section><section><h3>Little things to remember</h3><p>{solution.keyInsight}</p><ul>{Array.isArray(solution.tricks) && solution.tricks.map((t, i) => <li key={i}>{t}</li>)}</ul></section><div className="complexity"><span>Time <b>{solution.timeComplexity}</b></span><span>Space <b>{solution.spaceComplexity}</b></span></div></div>}
  </div>;
}
