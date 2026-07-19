import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, BarChart2, Shuffle, FileText } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setActiveIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  const actions = [
    { id: 'lib', label: 'Go to Library', icon: <LayoutGrid size={16} />, onClick: () => { navigate('/'); onClose(); } },
    { id: 'stat', label: 'Go to Analytics', icon: <BarChart2 size={16} />, onClick: () => { navigate('/analytics'); onClose(); } },
    { id: 'all', label: 'View All Problems', icon: <Search size={16} />, onClick: () => { navigate('/library'); onClose(); } },
    { id: 'rand', label: 'Generate Random Problem', icon: <Shuffle size={16} />, onClick: () => { onClose(); } },
    { id: 'paste', label: 'Paste Custom Problem', icon: <FileText size={16} />, onClick: () => { onClose(); } },
  ];

  const filtered = query
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].onClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative w-full max-w-[600px] bg-white border border-[#E3E2E0] rounded-[4px] overflow-hidden animate-[fade-in_0.1s_ease]">
        {/* Search input */}
        <div className="flex items-center px-4 py-3 border-b border-[#E3E2E0]">
          <Search size={18} className="text-[#9CA3AF] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            placeholder="Search problems, topics, or commands..."
            className="flex-1 bg-transparent border-none text-[#37352F] focus:outline-none text-[15px] placeholder:text-[#B4B4B4]"
          />
          <span className="text-[10px] font-mono text-[#B4B4B4] bg-white px-1.5 py-0.5 rounded-[4px] border border-[#E3E2E0]">ESC</span>
        </div>

        {/* Results */}
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.05em]">Commands</div>
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-[13px] text-[#9CA3AF] text-center">No matching commands</div>
          )}
          {filtered.map((action, i) => (
            <button
              key={action.id}
              onClick={action.onClick}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-left transition-colors
                ${i === activeIndex ? 'bg-[#F7F6F3] text-[#111111]' : 'text-[#37352F] hover:bg-[#F7F6F3]'}`}
            >
              <div className="text-[#9CA3AF]">{action.icon}</div>
              <span className="text-[14px] font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
