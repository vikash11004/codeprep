import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from './utils/api';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';

import ProblemList from './pages/ProblemList';

function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isWorkspace = location.pathname.startsWith('/workspace');

  const handleGenerateRandom = async () => {
    try {
      const problems = await api.getProblems();
      if (!problems || problems.length === 0) return;
      const unsolved = problems.filter(p => !p.solved);
      const pool = unsolved.length > 0 ? unsolved : problems;
      const random = pool[Math.floor(Math.random() * pool.length)];
      navigate(`/workspace/${random.id}`);
    } catch (err) {
      console.error('Failed to pick random problem:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Navbar: hidden on workspace */}
      {!isWorkspace && (
        <Navbar
          onCommandPalette={() => setCmdOpen(true)}
          onGenerateRandom={handleGenerateRandom}
        />
      )}

      <main className="flex-1 relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<ProblemList />} />
          <Route path="/workspace/:problemId" element={<Workspace />} />

        </Routes>
      </main>

      <CommandPalette 
        isOpen={cmdOpen} 
        onClose={() => setCmdOpen(false)}
        onGenerateRandom={handleGenerateRandom}
        onPasteCustom={() => {
          setCmdOpen(false);
          navigate('/', { state: { openModal: 'text' } });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
