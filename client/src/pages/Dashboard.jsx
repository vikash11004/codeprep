import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowRight, ClipboardPaste, Globe2, Grid3x3, ArrowLeftRight, PanelLeft, Layers, SearchCode, Link2, GitFork, Network, Triangle, Undo2, Share2, SquareStack, Flag, GanttChart, Shapes, ToggleLeft } from 'lucide-react';
import InputModal from '../components/InputModal';
import WarningModal from '../components/WarningModal';

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
  const [warningModal, setWarningModal] = useState(null);

  useEffect(() => {
    Promise.all([api.getProblems(), api.getStats()])
      .then(([catalog, sessionStats]) => { setProblems(catalog); setStats(sessionStats); })
      .catch((error) => console.error('Failed to load dashboard:', error))
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

  async function handleInputSubmit(value, mode) {
    try {
      const result = mode === 'url' ? await api.interpretUrl(value) : await api.interpretText(value);
      if (!result.isValidProblem) throw new Error('We could not identify a coding problem in that content.');
      sessionStorage.setItem('codeprep-custom-problem', JSON.stringify(result));
      setModalOpen(false);
      navigate('/workspace/custom');
    } catch (error) {
      if (error.data?.suggestion) {
        setModalOpen(false);
        setWarningModal({ title: 'Import needs your help', message: error.data.error || error.message, suggestion: error.data.suggestion });
      }
      throw error;
    }
  }

  function openImporter(mode) { setModalMode(mode); setModalOpen(true); }

  return (
    <div className="dashboard-page h-full overflow-y-auto">
      <div className="dashboard-shell">
        <section className="practice-hero">
          <div className="practice-hero-copy">
            <div className="eyebrow">CodePrep workspace</div>
            <h1>Practice with a clearer path.</h1>
            <p>Choose a pattern, solve intentionally, and get instant feedback in one focused space.</p>
            <div className="hero-metrics">
              <Metric label="Solved" value={stats.solved} />
              <Metric label="Pass rate" value={`${stats.passRate || 0}%`} />
              <Metric label="This week" value={stats.weekly || 0} />
              <Metric label="Streak" value={stats.streak ? `${stats.streak} days` : 'Start today'} />
            </div>
          </div>
          <div className="practice-actions">
            {continueProblem && <button className="action-primary" onClick={() => navigate(`/workspace/${continueProblem.id}`)}>Continue <span>{continueProblem.title}</span><ArrowRight size={17} /></button>}
            <button className="action-secondary" onClick={() => openImporter('text')}><ClipboardPaste size={17} /> Paste a problem</button>
            <button className="action-secondary" onClick={() => openImporter('url')}><Globe2 size={17} /> Import public URL</button>
          </div>
        </section>

        <section className="topic-section">
          <div className="section-heading">
            <div><div className="eyebrow dark">Problem library</div><h2>Browse by pattern</h2><p>Build fluency one technique at a time.</p></div>
            <button className="library-link" onClick={() => navigate('/library')}>All {problems.length} problems <ArrowRight size={16} /></button>
          </div>
          {loading ? <div className="topic-grid">{Array.from({ length: 6 }, (_, index) => <div key={index} className="topic-card topic-skeleton" />)}</div> :
            <div className="topic-grid">{categories.map(category => <TopicCard key={category.name} category={category} navigate={navigate} />)}</div>}
        </section>
      </div>
      <InputModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleInputSubmit} mode={modalMode} />
      {warningModal && <WarningModal isOpen onClose={() => setWarningModal(null)} {...warningModal} />}
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
