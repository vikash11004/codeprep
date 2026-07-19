import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Shuffle, Sun } from 'lucide-react';

export default function Navbar({ onCommandPalette, onGenerateRandom }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/library';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-[#E3E2E0] flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-[18px] font-bold text-[#111111] tracking-tight">
            CodePrep
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" label="Library" active={isActive('/')} />

        </nav>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-[400px] mx-8">
        <button
          onClick={onCommandPalette}
          className="flex items-center gap-2 w-full bg-[#F7F6F3] border border-[#E3E2E0] rounded-[4px] h-9 px-3
            text-[#9CA3AF] hover:border-[#D1D1CF] focus:border-[#2EAADC] transition-colors cursor-text"
        >
          <Search size={16} className="text-[#9CA3AF] flex-shrink-0" />
          <span className="text-[13px] flex-1 text-left">Search problems, topics, or commands...</span>
          <span className="text-[11px] font-mono text-[#B4B4B4] bg-white px-1.5 py-0.5 rounded-[4px] border border-[#E3E2E0]">⌘K</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
          <button
            onClick={onGenerateRandom}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[13px] font-medium
              text-[#2EAADC] border border-[#2EAADC]
              hover:bg-[#2EAADC] hover:text-white transition-colors"
          >
            <Shuffle size={14} />
            Generate Random
          </button>

        <button 
          onClick={() => {
            document.documentElement.classList.toggle('dark');
            alert('Theme toggled. Note: Full dark mode styling requires additional CSS rules.');
          }}
          className="p-2 rounded-[4px] text-[#9CA3AF] hover:text-[#37352F] transition-colors"
        >
          <Sun size={20} />
        </button>

        <button 
          onClick={() => alert('Profile and settings are coming soon!')}
          className="w-8 h-8 rounded-full bg-[#F7F6F3] flex items-center justify-center text-[12px] font-semibold text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
        >
          A
        </button>
      </div>
    </header>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`relative px-3 py-1.5 text-[14px] font-medium transition-colors rounded-[4px]
        ${active
          ? 'text-[#111111]'
          : 'text-[#9CA3AF] hover:text-[#37352F]'
        }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-[-13px] left-3 right-3 h-[2px] bg-[#2EAADC] rounded-full" />
      )}
    </Link>
  );
}
