import { useState } from 'react';
import { Loader2, Link2, ClipboardPaste, ArrowRight, CheckCircle2 } from 'lucide-react';
import SlideOver from './SlideOver';
import { api } from '../utils/api';
export default function InputModal({ isOpen, onClose, onSubmit, mode: initialMode }) {
  const [mode, setMode] = useState(initialMode);
  const [url, setUrl] = useState(''); const [text, setText] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [preview, setPreview] = useState(null);
  async function importProblem(e) {
    e.preventDefault(); setLoading(true); setError('');
    try { setPreview(mode === 'url' ? await api.interpretUrl(url.trim()) : await api.interpretText(text.trim())); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  return <SlideOver isOpen={isOpen} onClose={onClose} title={preview ? 'Review your problem' : 'Bring your own challenge'}>
    {preview ? <div className="import-preview">
      <span className="eyebrow">Ready to practice</span><h2>{preview.title}</h2><p className="muted">{preview.source}</p>
      {preview.importWarning && <p className="notice">{preview.importWarning}</p>}
      <p className="statement-text">{preview.description}</p>
      <div className="coverage-card"><CheckCircle2 size={18} /><div><b>{preview.testCount} {preview.coverage === 'verified' ? 'verified test cases' : 'published examples'}</b><p>{preview.judgeNote}</p></div></div>
      {preview.examples?.map((ex, i) => <div className="example-card" key={i}><b>Example {i + 1}</b><pre>Input: {ex.input}</pre><pre>Output: {ex.output}</pre></div>)}
      <div className="dialog-actions"><button className="button-secondary" onClick={() => setPreview(null)}>Back to import</button><button className="button-primary" onClick={() => onSubmit(preview)}>Open workspace <ArrowRight size={16} /></button></div>
    </div> : <>
      <p className="muted">A link, a statement, a fresh start. Import from LeetCode, GeeksforGeeks, or another public problem page.</p>
      <div className="segmented" aria-label="Import method"><button aria-pressed={mode === 'url'} onClick={() => { setMode('url'); setError(''); }}><Link2 size={15} /> From a link</button><button aria-pressed={mode === 'text'} onClick={() => { setMode('text'); setError(''); }}><ClipboardPaste size={15} /> Paste text</button></div>
      <form onSubmit={importProblem}>
        <label className="field-label" htmlFor="problem-input">{mode === 'url' ? 'Problem URL' : 'Problem statement'}</label>
        {mode === 'url' ? <input id="problem-input" type="url" required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://leetcode.com/problems/two-sum/" /> : <textarea id="problem-input" required rows={12} value={text} onChange={e => setText(e.target.value)} placeholder={'Add the title, description, constraints, and examples.\n\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]'} />}
        <p className="field-help">{mode === 'url' ? 'Structured data → public page → browser rendering. Sign-in and CAPTCHA pages may need pasted text.' : 'No AI needed. Input / Output examples become runnable sample checks.'}</p>
        {error && <div className="error-message" role="alert">{error}{mode === 'url' && <button type="button" className="text-button" onClick={() => { setMode('text'); setError(''); }}>Paste the statement instead <ArrowRight size={14} /></button>}</div>}
        <div className="dialog-actions"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button className="button-primary" disabled={loading || !(mode === 'url' ? url : text).trim()}>{loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}{loading ? 'Reading the problem…' : 'Import & review'}</button></div>
        {loading && <p className="field-help" role="status">Dynamic pages can take up to a minute. You can keep this window open while we try each method.</p>}
      </form>
    </>}
  </SlideOver>;
}
