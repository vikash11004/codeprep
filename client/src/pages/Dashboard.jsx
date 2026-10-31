import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowRight, ClipboardPaste, Globe2, Grid3x3, ArrowLeftRight, PanelLeft, Layers, SearchCode, Link2, GitFork, Network, Triangle, Undo2, Share2, SquareStack, Flag, GanttChart, Shapes, ToggleLeft } from 'lucide-react';
import InputModal from '../components/InputModal';

const CATEGORY_ICONS = {
  'Arrays & Hashing': Grid3x3, 'Two Pointers': ArrowLeftRight, 'Sliding Window': PanelLeft,
  Stack: Layers, 'Binary Search': SearchCode, 'Linked List': Link2, Trees: GitFork, Tries: Network,
  'Heap / Priority Queue': Triangle, Backtracking: Undo2, Graphs: Share2, 'Dynamic Programming': SquareStack,
  Greedy: Flag, Intervals: GanttChart, 'Math & Geometry': Shapes, 'Bit Manipulation': ToggleLeft,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ solved: 0, passRate: 0, weekly: 0, streak: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('text');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getProblems(), api.getStats()])
      .then(([catalog, sessionStats]) => { setProblems(catalog); setStats(sessionStats); })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (location.state?.openModal) {
      setModalMode(location.state.openModal);
      setModalOpen(true);
      // Clean up the state so it doesn't re-open on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const categories = useMemo(() => {
    const grouped = problems.reduce((all, problem) => {
      const group = all[problem.category] || { name: problem.category, problems: [], solved: 0 };
      group.problems.push(problem);
      group.solved += Number(Boolean(problem.solved));
      all[problem.category] = group;
      return all;
    }, {});
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [problems]);

  const continueProblem = useMemo(() => problems.find(p => p.attempts > 0 && !p.solved) || problems[0], [problems]);

  function handleInputSubmit(result) { setModalOpen(false); navigate(`/workspace/${result.id}`); }

  function openImporter(mode) { setModalMode(mode); setModalOpen(true); }

  return (
    <div className="dashboard-page h-full overflow-y-auto">
      <div className="dashboard-shell">
        <div className="dashboard-welcome"><span><i className="status-dot" /> A little practice. A little progress.</span><span>Your personal coding workspace</span></div>
        {error && <div className="error-message" role="alert">{error}<button className="text-button" onClick={() => window.location.reload()}>Retry connection</button></div>}
        <section className="practice-hero">
          <div className="practice-hero-copy">
            <div className="eyebrow">Built for your next breakthrough</div>
            <h1>Less guessing.<br />More <em>“I’ve got this.”</em></h1>
            <p>A quiet space for big ideas. Master the patterns, put your code to the test, and build understanding that stays with you.</p>
            <div className="hero-cta"><button className="button-primary" onClick={() => navigate('/library')}>Find your next challenge <ArrowRight size={15} /></button><button className="button-secondary" onClick={() => openImporter('url')}><Globe2 size={15} /> Import a problem</button></div>
          </div>
          <div className="practice-actions">
            <div className="focus-card"><div className="focus-header"><span>{continueProblem?.attempts ? 'PICK UP WHERE YOU LEFT OFF' : 'A GOOD PLACE TO START'}</span><span className="focus-dots"><i /><i /><i /></span></div><h3>{continueProblem?.title || 'Your next challenge'}</h3><p>{continueProblem?.category || 'Choose a pattern to begin'} · {continueProblem?.difficulty || 'At your own pace'}</p><div className="focus-code"><span>// one thoughtful attempt at a time</span><br />understand → solve → test → reflect</div><button className="focus-start" disabled={!continueProblem} onClick={() => navigate(`/workspace/${continueProblem.id}`)}>{continueProblem?.attempts ? 'Continue practice' : 'Open the workspace'} <ArrowRight size={16} /></button></div>
            <button className="import-link-row" onClick={() => openImporter('text')}><ClipboardPaste size={13} /> Have a problem in mind? Paste the statement <ArrowRight size={12} /></button>
          </div>
        </section>
        <div className="hero-metrics">
              <Metric label="Solved" value={stats.solved} />
              <Metric label="Pass rate" value={`${stats.passRate || 0}%`} />
              <Metric label="This week" value={stats.weekly || 0} />
              <Metric label="Streak" value={stats.streak ? `${stats.streak} days` : 'Start today'} />
        </div>

        <section className="topic-section">
          <div className="section-heading">
            <div><div className="eyebrow dark">Problem library</div><h2>Browse by pattern</h2><p>Build fluency one technique at a time.</p></div>
            <button className="library-link" onClick={() => navigate('/library')}>All {problems.length} problems <ArrowRight size={16} /></button>
          </div>
          {loading ? <div className="topic-grid">{Array.from({ length: 6 }, (_, index) => <div key={index} className="topic-card topic-skeleton" />)}</div> :
            <div className="topic-grid">{categories.map(category => <TopicCard key={category.name} category={category} navigate={navigate} />)}</div>}
        </section>
        <footer className="dashboard-footer"><span>Real compilers. Thoughtful practice. Help when you ask.</span><span>{stats.verifiedProblems || '—'} problems with verified suites · {problems.length} in the library</span></footer>
      </div>
      {modalOpen && <InputModal isOpen onClose={() => setModalOpen(false)} onSubmit={handleInputSubmit} mode={modalMode} />}
    </div>
  );
}

function Metric({ label, value }) { return <div className="hero-metric"><strong>{value}</strong><span>{label}</span></div>; }

function TopicCard({ category, navigate }) {
  const Icon = CATEGORY_ICONS[category.name] || Grid3x3;
  const percent = category.problems.length ? Math.round((category.solved / category.problems.length) * 100) : 0;
  return <button className="topic-card" onClick={() => navigate(`/library?category=${encodeURIComponent(category.name)}`)}>
    <div className="topic-card-top"><div className="topic-icon"><Icon size={20} /></div><span>{category.problems.length} problems</span></div>
    <h3>{category.name}</h3>
    <div className="topic-progress-label"><span>{category.solved} of {category.problems.length} solved</span><b>{percent}%</b></div>
    <div className="topic-progress"><i style={{ width: `${percent}%` }} /></div>
    <div className="topic-preview">{category.problems.slice(0, 3).map(problem => <span key={problem.id}>{problem.title}</span>)}</div>
    <div className="topic-link">Explore pattern <ArrowRight size={15} /></div>
  </button>;
}
