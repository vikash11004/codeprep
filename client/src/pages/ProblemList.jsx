import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowLeft, ArrowRight, Search, Check } from 'lucide-react';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const STATUSES = ['All', 'Solved', 'Unsolved', 'In Progress'];

export default function ProblemList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const data = await api.getProblems();
      setProblems(data);
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return problems.filter(p => {
      // Category filter
      if (categoryFilter && p.category !== categoryFilter) return false;

      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch = p.title.toLowerCase().includes(q)
          || p.category.toLowerCase().includes(q)
          || (p.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Difficulty
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;

      // Status
      if (status === 'Solved' && !p.solved) return false;
      if (status === 'Unsolved' && (p.solved || p.attempts > 0)) return false;
      if (status === 'In Progress' && (!p.attempts || p.attempts === 0 || p.solved)) return false;

      return true;
    });
  }, [problems, categoryFilter, search, difficulty, status]);

  const solvedCount = useMemo(() => {
    const pool = categoryFilter ? problems.filter(p => p.category === categoryFilter) : problems;
    return pool.filter(p => p.solved).length;
  }, [problems, categoryFilter]);

  const totalCount = useMemo(() => {
    return categoryFilter ? problems.filter(p => p.category === categoryFilter).length : problems.length;
  }, [problems, categoryFilter]);

  const clearFilters = () => {
    setSearch('');
    setDifficulty('All');
    setStatus('All');
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--color-bg-secondary)', width: '100%' }}>
      <div className="pl-container">
        
        {/* Back link */}
        <button onClick={() => navigate('/')} className="pl-back-link">
          <ArrowLeft size={16} />
          Back to all topics
        </button>

        {/* Title */}
        <div className="pl-header-top">
          <h1 className="pl-main-title">
            {categoryFilter || 'Problem Library'}
          </h1>
          <p className="pl-subtitle">
            <strong>{solvedCount}</strong> solved out of {totalCount} total problems
          </p>
        </div>

        {/* Premium Filter Bar (Centered) */}
        <div className="pl-filter-bar">
          {/* Search */}
          <div className="pl-search">
            <Search className="pl-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="pl-search-input"
            />
          </div>

          <div className="pl-divider sm-show" />

          {/* Difficulty Pills */}
          <div className="pl-pill-group">
            {DIFFICULTIES.map(d => (
              <TogglePill key={d} label={d} active={difficulty === d} onClick={() => setDifficulty(d)} />
            ))}
          </div>

          <div className="pl-divider md-show" />

          {/* Status Pills */}
          <div className="pl-pill-group">
            {STATUSES.map(s => (
              <TogglePill key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
            ))}
          </div>
        </div>

        {/* Problem Table */}
        <div style={{ width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-pulse" style={{ height: '64px', width: '100%', borderRadius: '16px' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="pl-empty-state">
              <div className="pl-empty-icon">
                <Search size={28} />
              </div>
              <h3 className="pl-empty-title">No problems found</h3>
              <p className="pl-empty-desc">We couldn't find any problems matching your current filter criteria.</p>
              <button onClick={clearFilters} className="pl-empty-btn">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="pl-table-container">
              {/* Header */}
              <div className="pl-table-header">
                <div className="pl-header-cell" />
                <div className="pl-header-cell">Title</div>
                <div className="pl-header-cell">Difficulty</div>
                <div className="pl-header-cell lg-hide">Tags</div>
                <div className="pl-header-cell md-hide">Last Attempted</div>
              </div>

              {/* Rows */}
              <div className="pl-table-rows">
                {filtered.map(problem => (
                  <div
                    key={problem.id}
                    onClick={() => navigate(`/workspace/${problem.id}`)}
                    className="pl-table-row"
                  >
                    {/* Status */}
                    <div className="pl-status-wrapper">
                      <div className={`pl-status-icon ${problem.solved ? 'solved' : problem.attempts > 0 ? 'attempted' : 'unattempted'}`}>
                        {problem.solved && <Check size={14} strokeWidth={3.5} />}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="pl-row-cell">
                      <p className="pl-title">{problem.title}</p>
                      {!categoryFilter && (
                        <p className="pl-category">{problem.category}</p>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="pl-row-cell">
                      <span className={`pl-diff-pill ${problem.difficulty.toLowerCase()}`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="pl-row-cell lg-hide pl-tags-container">
                      {(problem.tags || []).slice(0, 3).map(t => (
                        <span key={t} className="pl-tag">{t}</span>
                      ))}
                      {(problem.tags || []).length > 3 && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                          +{problem.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Last Attempted */}
                    <div className="pl-row-cell md-hide">
                      <span className="pl-last-attempt">
                        {problem.attempts > 0 ? 'Attempted' : 'Unattempted'}
                      </span>
                      <div className="pl-arrow-btn">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Toggle Pill Component ── */
function TogglePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pl-pill ${active ? 'active' : ''}`}
    >
      {label}
    </button>
  );
}
