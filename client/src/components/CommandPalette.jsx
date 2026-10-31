import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import SlideOver from './SlideOver';
import { api } from '../utils/api';
export default function CommandPalette({ isOpen, onClose, onGenerateRandom, onPasteCustom }) {
  const navigate = useNavigate(); const [query, setQuery] = useState(''); const [problems, setProblems] = useState([]); const [error, setError] = useState('');
  useEffect(() => { if (isOpen) api.getProblems().then(setProblems).catch(e => setError(e.message)); }, [isOpen]);
  return <SlideOver isOpen={isOpen} onClose={onClose} title="Find your next challenge"><label className="field-label" htmlFor="quick-search">Search by problem or pattern</label><div className="search-field"><Search size={17} /><input id="quick-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Try two sum or sliding window" /></div>{error && <p role="alert" className="error-message">{error}</p>}<div className="search-results">{problems.filter(p => `${p.title} ${p.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 15).map(p => <button key={p.id} onClick={() => { navigate(`/workspace/${p.id}`); onClose(); }}><span>{p.title}<small>{p.category}</small></span><ArrowUpRight size={16} /></button>)}</div><div className="dialog-actions"><button className="button-secondary" onClick={onPasteCustom}>Paste a problem</button><button className="button-primary" onClick={() => { onGenerateRandom(); onClose(); }}>Surprise me</button></div></SlideOver>;
}
