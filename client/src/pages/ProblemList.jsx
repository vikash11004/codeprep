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
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-8">

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#2EAADC] hover:underline mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to all topics
        </button>

        {/* Title */}
        <h1 className="text-[24px] font-bold text-[#111111] mb-1">
          {categoryFilter || 'All Problems'}
        </h1>
        <p className="text-[14px] text-[#9CA3AF] mb-6">
          {totalCount} problems · {solvedCount} solved
        </p>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter problems..."
              className="pl-8 pr-3 py-1.5 text-[13px] border border-[#E3E2E0] rounded-[4px] bg-white
                focus:outline-none focus:border-[#2EAADC] transition-colors w-[200px]"
            />
          </div>

          <div className="h-4 w-px bg-[#E3E2E0]" />

          {/* Difficulty Pills */}
          <div className="flex items-center gap-1">
            {DIFFICULTIES.map(d => (
              <TogglePill key={d} label={d} active={difficulty === d} onClick={() => setDifficulty(d)} />
            ))}
          </div>

          <div className="h-4 w-px bg-[#E3E2E0]" />

          {/* Status Pills */}
          <div className="flex items-center gap-1">
            {STATUSES.map(s => (
              <TogglePill key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
            ))}
          </div>
        </div>

        {/* Problem Table */}
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-pulse h-14 mb-px" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16">
            <Search size={48} className="text-[#E3E2E0] mb-4" />
            <p className="text-[14px] text-[#9CA3AF] mb-2">No problems match your filters</p>
            <button
              onClick={clearFilters}
              className="text-[13px] font-medium text-[#2EAADC] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="border border-[#E3E2E0] rounded-[4px] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_100px_200px_120px] items-center bg-white border-b-2 border-[#E3E2E0] sticky top-14 z-10">
              <div className="py-3 px-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.05em]" />
              <div className="py-3 px-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.05em]">Title</div>
              <div className="py-3 px-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.05em]">Difficulty</div>
              <div className="py-3 px-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.05em] hidden lg:block">Tags</div>
              <div className="py-3 px-4 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.05em] hidden md:block">Last Attempted</div>
            </div>

            {/* Rows */}
            {filtered.map(problem => (
              <div
                key={problem.id}
                onClick={() => navigate(`/workspace/${problem.id}`)}
                className="grid grid-cols-[40px_1fr_100px_200px_120px] items-center border-b border-[#E3E2E0] last:border-b-0
                  hover:bg-[#F7F6F3] cursor-pointer transition-colors group h-14"
              >
                {/* Status */}
                <div className="px-3 flex items-center justify-center">
                  {problem.solved ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#10B981] flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  ) : problem.attempts > 0 ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#E3E2E0] bg-white" />
                  )}
                </div>

                {/* Title */}
                <div className="px-4 py-3 min-w-0">
                  <p className="text-[14px] font-medium text-[#37352F] group-hover:text-[#2EAADC] transition-colors truncate">
                    {problem.title}
                  </p>
                  {!categoryFilter && (
                    <p className="text-[12px] text-[#9CA3AF] truncate">{problem.category}</p>
                  )}
                </div>

                {/* Difficulty */}
                <div className="px-4">
                  <span className={`text-[13px] font-medium ${
                    problem.difficulty === 'Easy' ? 'text-[#10B981]' :
                    problem.difficulty === 'Medium' ? 'text-[#F59E0B]' :
                    'text-[#EF4444]'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>

                {/* Tags */}
                <div className="px-4 hidden lg:flex items-center gap-1 overflow-hidden">
                  {(problem.tags || []).slice(0, 2).map(t => (
                    <span key={t} className="text-[11px] text-[#9CA3AF] bg-[#F7F6F3] px-1.5 py-0.5 rounded-[4px] flex-shrink-0">
                      {t}
                    </span>
                  ))}
                  {(problem.tags || []).length > 2 && (
                    <span className="text-[11px] text-[#B4B4B4]">+{problem.tags.length - 2}</span>
                  )}
                </div>

                {/* Last Attempted */}
                <div className="px-4 hidden md:flex items-center justify-between">
                  <span className="text-[13px] text-[#9CA3AF]">
                    {problem.attempts > 0 ? 'Attempted' : 'Never'}
                  </span>
                  <ArrowRight size={14} className="text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Toggle Pill Component ── */
function TogglePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-[13px] font-medium px-3 py-1.5 rounded-[4px] transition-colors
        ${active
          ? 'bg-[#37352F] text-white'
          : 'bg-white text-[#37352F] border border-[#E3E2E0] hover:bg-[#F7F6F3]'
        }`}
    >
      {label}
    </button>
  );
}
