import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, TrendingUp, Flame, Clock, Brain, Grid, ClipboardList, 
  CheckCircle2, XCircle, CircleDot, ArrowRight, Lightbulb,
  BarChart2
} from 'lucide-react';
import { api } from '../utils/api';

const PERIODS = ['7 Days', '30 Days', 'All Time'];

export default function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('All Time');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsData, summary, problems] = await Promise.all([
        api.getStats(),
        api.getSessionSummary(),
        api.getProblems()
      ]);

      const problemsMap = problems.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // 1. Map Struggle Areas (Failure Categories)
      const categories = summary.failureDistribution || {};
      const struggleAreas = Object.entries(categories)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([key, value]) => ({
          name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          percentage: value.percentage,
          count: value.count,
          color: key === 'misread_problem' ? '#F59E0B' : key === 'wrong_approach' ? '#EF4444' : '#2EAADC',
          key: key
        }));

      // 2. Map History
      const history = (summary.problemHistory || []).map(p => {
        const date = new Date(p.lastAttempt);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHrs = Math.round(diffMins / 60);
        const diffDays = Math.round(diffHrs / 24);
        
        let dateStr = 'Just now';
        if (diffMins < 1) dateStr = 'Just now';
        else if (diffMins < 60) dateStr = `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
        else if (diffHrs < 24) dateStr = `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
        else if (diffDays === 1) dateStr = 'Yesterday';
        else dateStr = `${diffDays} days ago`;

        const probDef = problemsMap[p.id] || {};
        return {
          id: p.id,
          title: probDef.title || p.id,
          category: probDef.category || 'Unknown',
          date: dateStr,
          status: p.solved ? 'Passed' : 'Failed',
          difficulty: probDef.difficulty || 'Medium',
          rawDate: date.getTime(),
          attempts: p.attempts || 1
        };
      }).sort((a, b) => b.rawDate - a.rawDate);

      // 3. Map Weakest Topics
      const topicStats = {};
      (summary.problemHistory || []).forEach(p => {
        const prob = problemsMap[p.id];
        if (prob && prob.category) {
          if (!topicStats[prob.category]) {
            topicStats[prob.category] = { total: 0, solved: 0 };
          }
          topicStats[prob.category].total += 1;
          if (p.solved) {
            topicStats[prob.category].solved += 1;
          }
        }
      });
      
      let weakestTopics = Object.entries(topicStats).map(([name, ts]) => ({
        name,
        score: Math.round((ts.solved / ts.total) * 100),
        solved: ts.solved,
        total: ts.total
      })).sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return b.total - a.total; // Tie breaker: most attempts first
      });

      setStats({
        ...statsData,
        struggleAreas,
        weakestTopics,
        history,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="animate-spin text-[#9CA3AF]"><BarChart2 size={24} /></div>
      </div>
    );
  }

  const hasData = stats.history && stats.history.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#111111] mb-1">Your Progress</h1>
            <p className="text-[14px] text-[#9CA3AF]">
              {hasData ? `Last ${period}` : 'Start practicing to see your stats here.'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              {PERIODS.map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-[13px] font-medium px-3 py-1.5 rounded-sm transition-colors ${
                    period === p 
                      ? 'bg-[#37352F] text-[#FFFFFF]' 
                      : 'bg-[#FFFFFF] text-[#37352F] border border-[#E3E2E0] hover:bg-[#F7F6F3]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#2EAADC] text-[#FFFFFF] text-[13px] font-semibold px-4 py-2 rounded-sm hover:bg-[#2596BE] transition-colors whitespace-nowrap"
            >
              Practice Now →
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Problems Solved"
              value={stats.solved}
              icon={<Target size={24} strokeWidth={1.5} className="text-[#2EAADC]" />}
              context="Start practicing to see this grow"
              hasData={stats.solved > 0}
            />
            <MetricCard
              title="Avg Pass Rate"
              value={`${stats.passRate}%`}
              icon={<TrendingUp size={24} strokeWidth={1.5} className="text-[#10B981]" />}
              context="No data yet"
              hasData={stats.solved > 0 || stats.history.length > 0}
              isEmpty={stats.passRate === 0 && stats.solved === 0}
            />
            <MetricCard
              title="Active Streak"
              value={`${stats.streak} days`}
              icon={<Flame size={24} strokeWidth={1.5} className="text-[#F59E0B]" />}
              context="Start practicing to see this grow"
              hasData={stats.streak > 0}
            />
            <MetricCard
              title="Time Spent"
              value="--"
              icon={<Clock size={24} strokeWidth={1.5} className="text-[#9CA3AF]" />}
              context="No data yet"
              hasData={false}
              isEmpty={true}
            />
          </div>
        ) : (
          <div className="bg-[#F7F6F3] border border-[#E3E2E0] rounded-sm p-8 text-center mb-8 flex flex-col items-center">
            <BarChart2 size={32} className="text-[#D1D1CF] mb-3" />
            <h3 className="text-[16px] font-semibold text-[#37352F]">No data yet</h3>
            <p className="text-[14px] text-[#9CA3AF] mt-1 mb-4">Complete your first problem to see analytics.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#2EAADC] text-[#FFFFFF] text-[13px] font-semibold px-5 py-2 rounded-sm hover:bg-[#2596BE] transition-colors"
            >
              Start Practicing →
            </button>
          </div>
        )}

        {/* Two-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Where You Struggle Most */}
          <div>
            <h2 className="text-[18px] font-semibold text-[#111111] mb-4">Where You Struggle Most</h2>
            <div className="bg-[#FFFFFF] border border-[#E3E2E0] rounded-sm p-6 min-h-[220px] flex flex-col">
              {!hasData || stats.struggleAreas.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Brain size={32} className="text-[#D1D1CF] mb-3" />
                  <h3 className="text-[14px] font-semibold text-[#37352F]">No failures to analyze yet</h3>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">Keep practicing. We'll identify your weak spots here.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex flex-col gap-4">
                    {stats.struggleAreas.map(area => (
                      <div key={area.name}>
                        <div className="flex items-center justify-between text-[13px] font-medium mb-2">
                          <span className="text-[#37352F]">{area.name}</span>
                          <span className="text-[#9CA3AF]">{area.count} &nbsp; {area.percentage}%</span>
                        </div>
                        <div className="h-[8px] w-full bg-[#F1F1EF] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${area.percentage}%`, backgroundColor: area.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {stats.struggleAreas.length > 0 && (
                    <div className="mt-6 bg-[#F1F1EF] border-l-4 border-[#2EAADC] rounded-sm p-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb size={16} className="text-[#2EAADC]" />
                        <span className="text-[11px] font-bold text-[#2EAADC] uppercase tracking-wider">Insight</span>
                      </div>
                      <p className="text-[13px] text-[#37352F] leading-[1.6]">
                        You fail {stats.struggleAreas[0].percentage}% of problems due to <strong>{stats.struggleAreas[0].name}</strong>. Try reviewing fundamental patterns before jumping into code.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Weakest Topics */}
          <div>
            <h2 className="text-[18px] font-semibold text-[#111111] mb-4">Weakest Topics</h2>
            <div className="bg-[#FFFFFF] border border-[#E3E2E0] rounded-sm p-6 min-h-[220px] flex flex-col">
              {!hasData || stats.weakestTopics.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Grid size={32} className="text-[#D1D1CF] mb-3" />
                  <h3 className="text-[14px] font-semibold text-[#37352F]">Not enough data yet</h3>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">Solve a few problems across different topics to see your breakdown.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-col">
                    {stats.weakestTopics.map((topic, i) => {
                      const passRate = topic.score;
                      let barColor = 'bg-[#EF4444]'; // Red < 40%
                      if (passRate >= 70) barColor = 'bg-[#10B981]'; // Green >= 70%
                      else if (passRate >= 40) barColor = 'bg-[#F59E0B]'; // Amber 40-69%

                      return (
                        <div key={topic.name} className={`flex items-center h-[44px] ${i !== stats.weakestTopics.length - 1 ? 'border-b border-[#E3E2E0]' : ''}`}>
                          <div className="text-[13px] font-medium text-[#37352F] w-[140px] truncate pr-2">
                            {topic.name}
                          </div>
                          <div className="flex-1 flex items-center">
                            <div className="h-[6px] w-[120px] bg-[#F1F1EF] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ease-out ${barColor}`}
                                style={{ width: `${passRate}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-[12px] text-[#9CA3AF] font-mono w-[40px] text-right">
                            {topic.solved}/{topic.total}
                          </div>
                          <div className="text-[12px] font-medium text-[#37352F] w-[40px] text-right">
                            {passRate}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-2">
                    <button className="text-[13px] font-medium text-[#2EAADC] hover:underline">
                      View All Topics →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Recent History */}
        <div>
          <div className="flex justify-between items-center mb-4 mt-8">
            <h2 className="text-[18px] font-semibold text-[#111111]">Recent History</h2>
            {hasData && (
              <button className="text-[13px] font-medium text-[#2EAADC] hover:underline">
                View All →
              </button>
            )}
          </div>

          {!hasData ? (
            <div className="bg-[#F7F6F3] border border-[#E3E2E0] rounded-sm p-8 text-center flex flex-col items-center">
              <ClipboardList size={32} className="text-[#D1D1CF] mb-3" />
              <h3 className="text-[16px] font-semibold text-[#37352F]">No attempts yet</h3>
              <p className="text-[14px] text-[#9CA3AF] mt-1 mb-2">Your solved problems will appear here.</p>
              <button 
                onClick={() => navigate('/')}
                className="text-[13px] font-medium text-[#2EAADC] hover:underline"
              >
                Browse Problems →
              </button>
            </div>
          ) : (
            <>
              <div className="border-b-2 border-[#E3E2E0] pb-2 sticky top-[56px] bg-white z-10 flex">
                <div className="flex-1 min-w-[200px] text-[11px] font-bold text-[#9CA3AF] tracking-wider ml-4">Problem</div>
                <div className="w-[100px] text-[11px] font-bold text-[#9CA3AF] tracking-wider">Difficulty</div>
                <div className="w-[110px] text-[11px] font-bold text-[#9CA3AF] tracking-wider">Status</div>
                <div className="w-[150px] text-[11px] font-bold text-[#9CA3AF] tracking-wider">Primary Failure</div>
                <div className="w-[80px] text-[11px] font-bold text-[#9CA3AF] tracking-wider text-right">Attempts</div>
                <div className="w-[120px] text-[11px] font-bold text-[#9CA3AF] tracking-wider text-right pr-4">Last Tried</div>
              </div>
              
              <div className="flex flex-col">
                {stats.history.map((item, i) => {
                  
                  let diffColor = 'text-[#10B981]';
                  if (item.difficulty === 'Medium') diffColor = 'text-[#F59E0B]';
                  if (item.difficulty === 'Hard') diffColor = 'text-[#EF4444]';

                  // Mock mapping for failure pills
                  let failPill = null;
                  if (item.status === 'Failed') {
                    const isMisread = item.title.length % 3 === 0;
                    const isWrong = item.title.length % 3 === 1;
                    if (isMisread) {
                      failPill = <span className="bg-[#FEF3C7] text-[#D97706] text-[12px] font-medium px-2 py-0.5 rounded-sm">Misread</span>;
                    } else if (isWrong) {
                      failPill = <span className="bg-[#FEE2E2] text-[#DC2626] text-[12px] font-medium px-2 py-0.5 rounded-sm">Wrong Approach</span>;
                    } else {
                      failPill = <span className="bg-[#DBEAFE] text-[#2563EB] text-[12px] font-medium px-2 py-0.5 rounded-sm">Implementation Bug</span>;
                    }
                  }

                  return (
                    <div 
                      key={i} 
                      onClick={() => navigate(`/workspace/${item.id}`)}
                      className="group flex items-center h-[52px] border-b border-[#E3E2E0] hover:bg-[#F7F6F3] cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-[200px] flex flex-col justify-center ml-4 truncate pr-4">
                        <span className="text-[14px] font-medium text-[#37352F] truncate">{item.title}</span>
                        <span className="text-[12px] text-[#9CA3AF] truncate">{item.category}</span>
                      </div>
                      
                      <div className={`w-[100px] text-[13px] font-medium ${diffColor}`}>
                        {item.difficulty}
                      </div>
                      
                      <div className="w-[110px] flex items-center gap-1.5">
                        {item.status === 'Passed' ? (
                          <><CheckCircle2 size={16} className="text-[#10B981]" /><span className="text-[13px] text-[#10B981]">Passed</span></>
                        ) : item.status === 'Failed' ? (
                          <><XCircle size={16} className="text-[#EF4444]" /><span className="text-[13px] text-[#EF4444]">Failed</span></>
                        ) : (
                          <><CircleDot size={8} className="text-[#F59E0B] ml-1 mr-1" /><span className="text-[13px] text-[#F59E0B]">In Progress</span></>
                        )}
                      </div>
                      
                      <div className="w-[150px] flex items-center">
                        {item.status === 'Passed' ? <span className="text-[#9CA3AF]">—</span> : failPill}
                      </div>

                      <div className="w-[80px] text-[13px] font-mono text-[#37352F] text-right">
                        {item.attempts}
                      </div>
                      
                      <div className="w-[120px] pr-4 flex items-center justify-end relative">
                        <span className="text-[13px] text-[#9CA3AF] group-hover:opacity-0 transition-opacity">
                          {item.date}
                        </span>
                        <span className="absolute right-4 text-[13px] font-medium text-[#2EAADC] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Retry <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-center">
                <button className="text-[13px] font-medium text-[#2EAADC] border border-[#2EAADC] rounded-sm px-4 py-2 hover:bg-[#2EAADC] hover:text-white transition-colors">
                  Load 10 more
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, context, hasData, isEmpty }) {
  const displayValue = isEmpty ? '--' : value;
  
  return (
    <div className="p-6 border border-[#E3E2E0] rounded-sm bg-white hover:border-[#D1D1CF] hover:bg-[#F7F6F3] transition-all duration-150 flex flex-col">
      <div className="mb-3">{icon}</div>
      <div className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">{title}</div>
      <div className="text-[32px] font-bold text-[#111111] mt-1 mb-2 leading-none">{displayValue}</div>
      <div className="text-[13px] text-[#9CA3AF]">{context}</div>
    </div>
  );
}
