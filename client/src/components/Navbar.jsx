import { Link } from 'react-router-dom';
import { Search, Shuffle, Code2 } from 'lucide-react';

export default function Navbar({ onCommandPalette, onGenerateRandom }) {
  return (
    <header className="h-[72px] flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-center sticky top-0 z-50">
      <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
        
        {/* Left: Search */}
        <div className="flex-1 flex items-center justify-start">
          <button
            onClick={onCommandPalette}
            className="flex items-center gap-2.5 w-full max-w-[280px] bg-slate-100 hover:bg-slate-200/70 border border-slate-200/60 rounded-full h-[42px] px-4 transition-all duration-200 group cursor-text"
          >
            <Search size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-[14px] flex-1 text-left text-slate-500 font-medium">Search problems...</span>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-slate-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <Code2 size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[22px] font-extrabold text-slate-900 tracking-tight">
              CodePrep
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex justify-end items-center">
          <button
            onClick={onGenerateRandom}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold
              text-[#2EAADC] hover:bg-[#2EAADC]/10 transition-all duration-200"
          >
            <Shuffle size={16} strokeWidth={2.5} />
            Random Problem
          </button>
        </div>
        
      </div>
    </header>
  );
}
