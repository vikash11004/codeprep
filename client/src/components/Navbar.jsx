import { Link, NavLink } from 'react-router-dom';
import { Search, Shuffle, Code2, ArrowUpRight } from 'lucide-react';
export default function Navbar({ onCommandPalette, onGenerateRandom }) {
  return <header className="navbar"><div className="nav-inner">
    <Link to="/" className="brand"><span className="brand-icon"><Code2 size={22} /></span>codeprep<span className="brand-dot">.</span></Link>
    <nav aria-label="Main navigation"><NavLink to="/" end>Overview</NavLink><NavLink to="/library">Problem library <ArrowUpRight size={13} /></NavLink></nav>
    <div className="nav-actions"><button className="nav-search" onClick={onCommandPalette} aria-label="Search problems"><Search size={16} /><span>Quick search</span><kbd>Ctrl K</kbd></button><button className="icon-button" onClick={onGenerateRandom} aria-label="Open a random problem" title="Random problem"><Shuffle size={18} /></button></div>
  </div></header>;
}
