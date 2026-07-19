import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, BarChart2, Zap, Settings, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { api } from '../utils/api';

export default function Sidebar({ isOpen, onCommandPalette }) {
  const [recent, setRecent] = useState([]);
  const location = useLocation();

  useEffect(() => {
    api.getSessionSummary().then(data => {
      if (data && data.problemHistory) {
        setRecent(data.problemHistory.slice(0, 5));
      }
    }).catch(console.error);
  }, [location.pathname]);

  const isWorkspace = location.pathname.startsWith('/workspace');
  const navActive = (path) => {
    if (path === '/') return !isWorkspace;
    return false;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'implementation_bug': return 'text-primary';
      case 'wrong_approach': return 'text-danger';
      case 'misread_problem': return 'text-warning';
      default: return 'text-text-muted';
    }
  };

  return (
    <aside 
      className={`${isOpen ? 'w-60' : 'w-0'} flex-shrink-0 ${isOpen ? 'border-r' : 'border-none'} border-surface-500 
        flex flex-col transition-all duration-300 h-screen overflow-hidden z-20`}
      style={{ backgroundColor: '#F7F6F3' }}
    >
      <div className="h-12 flex items-center px-3 mb-4 mt-2 whitespace-nowrap">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded border border-surface-500 flex items-center justify-center flex-shrink-0 bg-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-primary" stroke="currentColor" strokeWidth="2">
              <polyline points="16,18 22,12 16,6" />
              <polyline points="8,6 2,12 8,18" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            CodePrep
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-2 space-y-1 min-w-[240px]">
        <NavItem 
          icon={<LayoutGrid size={16} />} 
          label="Library" 
          to="/" 
          active={navActive('/')} 
        />

        <button
          onClick={onCommandPalette}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-text-secondary hover:bg-[#EAE9E5] transition-colors group"
        >
          <Zap size={16} className="text-text-muted group-hover:text-text-primary flex-shrink-0" />
          <div className="flex flex-1 items-center justify-between overflow-hidden">
            <span className="whitespace-nowrap">Quick Action</span>
            <span className="text-[10px] font-mono border border-surface-500 bg-white px-1 rounded text-text-muted">Cmd+K</span>
          </div>
        </button>

        <div className="h-px bg-surface-500 my-4 mx-2" />
        <div className="px-2 mb-2">
          <span className="text-xs font-semibold text-text-muted">Recent Problems</span>
        </div>
        {recent.map((prob, i) => (
          <Link
            key={i}
            to={`/workspace/${prob.id || 'custom'}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-[13px] text-text-secondary hover:bg-[#EAE9E5] transition-colors"
          >
            <Circle size={8} className={`${prob.solved ? 'text-accent fill-accent' : getStatusColor(prob.lastClassification)} flex-shrink-0`} />
            <span className="truncate">{prob.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-surface-500 min-w-[240px]">
        <div 
          onClick={() => alert('Profile and settings are coming soon!')}
          className="flex items-center gap-2 px-2 py-2 mb-1 cursor-pointer hover:bg-[#EAE9E5] rounded transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-medium text-xs">
            A
          </div>
          <span className="text-[13px] font-medium text-text-primary truncate flex-1">Alex Developer</span>
          <button className="text-text-muted hover:text-text-primary" onClick={(e) => { e.stopPropagation(); alert('Profile and settings are coming soon!'); }}>
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, to, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-2 py-1.5 rounded text-[14px] font-medium transition-colors
        ${active 
          ? 'bg-[#EAE9E5] text-text-primary font-semibold' 
          : 'text-text-secondary hover:bg-[#EAE9E5] hover:text-text-primary'
        }`}
    >
      <span className={`${active ? 'text-text-primary' : 'text-text-muted'} flex-shrink-0`}>
        {icon}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
