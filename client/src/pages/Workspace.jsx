import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Play, Loader2, ArrowLeft, Code2, ChevronDown, CheckCircle2, Moon, Sun } from 'lucide-react';
import { api } from '../utils/api';
import CodeEditor from '../components/CodeEditor';
import ProblemPanel from '../components/ProblemPanel';
import ConsoleOutput from '../components/ConsoleOutput';
import CoachingPanel from '../components/CoachingPanel';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'C'];
const FILE_EXTENSIONS = { JavaScript: 'js', Python: 'py', Java: 'java', 'C++': 'cpp', C: 'c' };

export default function Workspace() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(true);
  const [problemError, setProblemError] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [language, setLanguage] = useState('C++');
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchStarterCode = useCallback(async (currentProblem, currentLanguage) => {
    const saved = localStorage.getItem(`codeprep:${currentProblem.id}:${currentLanguage}`);
    if (saved) return setCode(saved);
    try { setCode((await api.getStarterCode(currentProblem, currentLanguage)).starterCode); }
    catch (error) { console.error('Failed to get starter code:', error); }
  }, []);

  const generateTestCases = useCallback(async (currentProblem) => {
    setTestsLoading(true);
    try { setTestCases((await api.generateTests(currentProblem)).testCases || []); }
    catch (error) {
      console.error('Failed to generate tests:', error);
      setTestCases((currentProblem.examples || []).map(example => ({ input: example.input, expectedOutput: example.output, description: example.explanation || 'Problem example', aiGenerated: false })));
    } finally { setTestsLoading(false); }
  }, []);

  useEffect(() => {
    async function loadProblem() {
      setProblemLoading(true); setProblemError(''); setResults(null); setDiagnosis(null); setHintShown(false);
      try {
        const currentProblem = problemId === 'custom'
          ? JSON.parse(sessionStorage.getItem('codeprep-custom-problem') || 'null')
          : await api.getProblem(problemId);
        if (!currentProblem) return navigate('/');
        setProblem(currentProblem);
        await Promise.all([generateTestCases(currentProblem), fetchStarterCode(currentProblem, language)]);
      } catch (error) { setProblemError(error.message); }
      finally { setProblemLoading(false); }
    }
    loadProblem();
  }, [problemId, navigate, language, generateTestCases, fetchStarterCode]);

  useEffect(() => {
    if (problem && code) localStorage.setItem(`codeprep:${problem.id}:${language}`, code);
  }, [code, language, problem]);

  const handleLanguageChange = (event) => setLanguage(event.target.value);
  const handleRunCode = useCallback(async () => {
    if (!code.trim() || !testCases.length) return;
    setRunning(true); setRunError(''); setResults(null); setDiagnosis(null);
    try {
      const data = await api.runCode(code, language, testCases);
      setResults(data);
      if (!data.allPassed && data.results.some(result => !result.passed)) await handleDiagnose(data.results);
    } catch (error) { setRunError(error.message); }
    finally { setRunning(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language, testCases]);

  useEffect(() => {
    const shortcut = event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); handleRunCode(); } };
    window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
  }, [handleRunCode]);

  async function handleDiagnose(testResults) {
    if (!problem) return;
    setDiagnosing(true);
    try { 
      setDiagnosis(await api.diagnose(problem, code, language, testResults)); 
      setHintShown(true); 
    }
    catch (error) { console.error('Diagnosis failed:', error); }
    finally { setDiagnosing(false); }
  }

  if (problemLoading) return <div className="workspace-loading"><Loader2 size={28} className="animate-spin" /> Loading workspace</div>;
  if (problemError) return <div className="workspace-loading"><div><b>Couldn’t open this problem</b><p>{problemError}</p><button onClick={() => navigate('/')}>Back to library</button></div></div>;

  const isRemote = ['Java', 'C++', 'C'].includes(language);
  return <div className="ide-shell">
    <header className="ide-header">
      <div className="ide-breadcrumb"><button onClick={() => navigate('/')} title="Back to library"><ArrowLeft size={18} /></button><span>Practice</span><i>/</i><strong>{problem?.title}</strong></div>
      <div className="ide-header-actions">
        <span className={`difficulty-pill ${problem?.difficulty?.toLowerCase()}`}>{problem?.difficulty}</span>
        <span className="save-state"><CheckCircle2 size={14} /> Saved</span>
        <label className="language-picker"><Code2 size={15} /><select value={language} onChange={handleLanguageChange}>{LANGUAGES.map(item => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={13} /></label>
        <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle" title="Toggle dark mode">
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="run-button" onClick={handleRunCode} disabled={running || testsLoading || !code.trim() || !testCases.length}>{running ? <Loader2 size={15} className="animate-spin" /> : <Play size={14} fill="currentColor" />} {running ? 'Running' : 'Run code'}</button>
      </div>
    </header>
    <div className="ide-statusbar"><span>{testCases.length} test cases</span>{testsLoading && <span><Loader2 size={12} className="animate-spin" /> Preparing tests</span>}</div>
    <main className="ide-layout">
      <Group direction="horizontal">
        <Panel defaultSize={30} minSize={20} className="ide-problem-pane">
          <div className="ide-pane-label">Problem</div>
          <div className="ide-pane-scroll"><ProblemPanel problem={problem} onRecalibrate={() => generateTestCases(problem)} loading={testsLoading} /></div>
        </Panel>
        <ResizeHandle />
        <Panel defaultSize={45} minSize={30} className="ide-editor-pane">
          <div className="editor-tab">solution.{FILE_EXTENSIONS[language]}</div>
          <CodeEditor value={code} onChange={setCode} language={language} />
          <div className="editor-footer">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-white/70 mr-auto"><kbd className="font-sans font-medium">Ctrl</kbd> + <kbd className="font-sans font-medium">↵</kbd> to run</div>
            <span>{language}</span><span>Spaces: 2</span><span>UTF-8</span>
          </div>
        </Panel>
        <ResizeHandle />
        <Panel defaultSize={25} minSize={20} className="ide-output-pane">
          <Group direction="vertical">
            <Panel defaultSize={55} minSize={20} className="ide-output-section">
              <div className="ide-pane-label">Console</div>
              <div className="ide-pane-scroll">
                <ConsoleOutput results={results} running={running} error={runError} />
              </div>
            </Panel>
            <ResizeHandle horizontal />
            <Panel defaultSize={45} minSize={20} className="ide-output-section coach-section">
              <div className="ide-pane-label"><span className="flex items-center gap-2"><i className={diagnosis ? "coach-live" : ""} /> AI Coach</span></div>
              <div className="ide-pane-scroll">
                <CoachingPanel problem={problem} diagnosis={diagnosis} hintShown={hintShown} language={language} code={code} />
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </main>
  </div>;
}

function ResizeHandle({ horizontal = false }) { return <Separator className={`ide-resize ${horizontal ? 'ide-resize-horizontal' : ''}`}><span /></Separator>; }
