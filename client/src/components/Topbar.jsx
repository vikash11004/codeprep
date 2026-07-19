import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';

export default function Topbar({ onCommandPalette, onToggleSidebar, onRunCode, isRunning, onGenerateRandom }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isWorkspace = location.pathname.startsWith('/workspace');
  const isAnalytics = location.pathname.startsWith('/analytics');
  
  let breadcrumb = 'Library';
  if (isWorkspace) {
    breadcrumb = 'Workspace > Problem';
  } else if (isAnalytics) {
    breadcrumb = 'Analytics';
  }

  return (
    <header className="h-12 flex-shrink-0 bg-white border-b border-surface-500 flex items-center justify-between px-4 z-10">
      {/* Left: Breadcrumbs & Toggle */}
      <div className="flex items-center text-sm">
        <button 
          onClick={onToggleSidebar} 
          className="mr-3 p-1.5 rounded text-text-muted hover:bg-surface-500 hover:text-text-primary transition-colors"
        >
          <Menu size={18} />
        </button>
        <span className="text-text-muted cursor-pointer hover:text-text-primary transition-colors" onClick={() => navigate('/')}>
          {breadcrumb.split(' > ')[0]}
        </span>
        {breadcrumb.includes(' > ') && (
          <>
            <span className="text-surface-500 mx-2">/</span>
            <span className="text-text-primary font-medium">{breadcrumb.split(' > ')[1]}</span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {isWorkspace ? (
          <>
            <div className="flex items-center gap-2 mr-2">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
              <span className="text-xs text-text-muted">In Progress</span>
            </div>
            {/* The run button is handled primarily in Workspace, but if we want it global, we can trigger it here */}
          </>
        ) : (
          <>
            {/* Global Search / Command trigger */}
            <button 
              onClick={onCommandPalette}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary bg-surface-950 border border-surface-500 px-3 py-1.5 rounded w-64 transition-colors"
            >
              <Search size={14} />
              <span className="text-xs flex-1 text-left">Search problems...</span>
              <span className="text-[10px] font-mono border border-surface-500 px-1 rounded bg-white">Cmd+K</span>
            </button>
            <button 
              onClick={onGenerateRandom}
              className="px-3 py-1.5 rounded text-sm font-medium bg-primary text-text-inverse hover:bg-primary-light transition-colors duration-200"
            >
              Generate Random
            </button>
          </>
        )}
      </div>
    </header>
  );
}
