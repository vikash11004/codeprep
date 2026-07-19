import { useState } from 'react';
import { Edit2, RotateCw, Check, X, Terminal, ChevronRight } from 'lucide-react';

export default function ProblemPanel({ problem, onRecalibrate, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  if (!problem) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-white/50">
        <div className="text-center text-slate-400 text-[15px] font-medium">
          Select a problem to begin
        </div>
      </div>
    );
  }

  const data = isEditing ? editData : problem;

  const handleEdit = () => {
    setEditData({ ...problem });
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // EditData would be passed upstream if needed
  };

  const handleCancel = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200/60';
      case 'Hard': return 'text-rose-700 bg-rose-50 border-rose-200/60';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="h-full overflow-y-auto px-8 lg:px-12 py-12 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-5">
            <span className={`text-[12px] font-bold px-3 py-1.5 rounded-md border shadow-sm tracking-wide ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty || 'Medium'}
            </span>
            {problem.source && (
              <span className="text-[12px] font-bold px-3 py-1.5 rounded-md border border-slate-200/80 bg-slate-50 text-slate-600 shadow-sm tracking-wide">
                {problem.source}
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-3xl lg:text-4xl font-extrabold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:outline-none focus:border-blue-500 w-full tracking-tight pb-2"
            />
          ) : (
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{data.title}</h1>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-6 mt-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors" title="Save">
                <Check size={20} strokeWidth={2.5} />
              </button>
              <button onClick={handleCancel} className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors" title="Cancel">
                <X size={20} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                <Edit2 size={20} />
              </button>
              <button 
                onClick={onRecalibrate} 
                disabled={loading}
                className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40" 
                title="Recalibrate / Try Again"
              >
                <RotateCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-14 text-[16px] lg:text-[17px] leading-[1.8] lg:leading-[2] text-slate-700 font-medium tracking-wide">
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={10}
            className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm font-medium leading-[1.8]"
          />
        ) : (
          <p className="whitespace-pre-wrap">{data.description}</p>
        )}
      </div>

      {/* Constraints */}
      {data.constraints?.length > 0 && (
        <div className="mb-14">
          <h3 className="text-[17px] font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <ChevronRight size={20} className="text-blue-500" strokeWidth={3} />
            Constraints
          </h3>
          <ul className="space-y-4 list-none ml-2 text-[15px] text-slate-600">
            {data.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-3 leading-[1.8]">
                <span className="text-blue-400 mt-1 font-bold">•</span>
                <code className="font-mono text-[14px] font-bold tracking-wide bg-slate-100 border border-slate-200/80 text-slate-800 px-2.5 py-1 rounded-lg shadow-sm">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      {data.examples?.length > 0 && (
        <div className="pb-8">
          <h3 className="text-[17px] font-extrabold text-slate-900 mb-8 flex items-center gap-2">
            <Terminal size={20} className="text-blue-500" strokeWidth={2.5} />
            Examples
          </h3>
          <div className="space-y-10">
            {data.examples.map((ex, i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/80 rounded-l-2xl"></div>
                <p className="text-[14px] font-extrabold text-slate-400 mb-6 uppercase tracking-[0.15em]">Example {i + 1}</p>
                <div className="space-y-5">
                  <div className="text-[15px] font-mono break-all text-slate-300 leading-relaxed">
                    <span className="text-blue-400 font-sans font-bold mr-3 select-none tracking-wide">Input:</span> 
                    {ex.input}
                  </div>
                  <div className="text-[15px] font-mono break-all text-slate-300 leading-relaxed">
                    <span className="text-emerald-400 font-sans font-bold mr-3 select-none tracking-wide">Output:</span> 
                    <span className="text-white font-semibold">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-[15px] text-slate-400 mt-6 pt-6 border-t border-slate-800/60 leading-[1.8] font-sans">
                      <strong className="text-slate-200 font-bold mr-2 tracking-wide">Explanation:</strong> 
                      {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


