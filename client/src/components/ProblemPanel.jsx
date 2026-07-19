import { useState } from 'react';
import { Edit2, RotateCw, Check, X } from 'lucide-react';

export default function ProblemPanel({ problem, onRecalibrate, loading }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  if (!problem) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-white">
        <div className="text-center text-text-muted text-[15px]">
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
      case 'Easy': return 'text-primary bg-primary/10 border-primary/20';
      case 'Medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'Hard': return 'text-danger bg-danger/10 border-danger/20';
      default: return 'text-text-secondary bg-surface-500 border-surface-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-10 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty || 'Medium'}
            </span>
            {problem.source && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-surface-500 bg-[#FBFBFA] text-text-secondary">
                {problem.source}
              </span>
            )}
          </div>
          {isEditing ? (
            <input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-xl lg:text-2xl font-bold text-text-primary bg-transparent border-b border-surface-500 focus:outline-none focus:border-text-primary w-full tracking-tight"
            />
          ) : (
            <h1 className="text-xl lg:text-2xl font-bold text-text-primary tracking-tight">{data.title}</h1>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-4 mt-1">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="p-1.5 rounded text-[#2EAADC] hover:bg-[#FBFBFA] transition-colors" title="Save">
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="p-1.5 rounded text-danger hover:bg-[#FBFBFA] transition-colors" title="Cancel">
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-[#FBFBFA] transition-colors" title="Edit">
                <Edit2 size={16} />
              </button>
              <button 
                onClick={onRecalibrate} 
                disabled={loading}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-[#FBFBFA] transition-colors disabled:opacity-40" 
                title="Recalibrate / Try Again"
              >
                <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-10 text-[15px] leading-relaxed text-[#37352F]">
        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={8}
            className="w-full p-3 rounded bg-[#FBFBFA] border border-surface-500 text-text-primary resize-none focus:outline-none focus:border-text-primary"
          />
        ) : (
          <p className="whitespace-pre-wrap">{data.description}</p>
        )}
      </div>

      {/* Constraints */}
      {data.constraints?.length > 0 && (
        <div className="mb-10">
          <h3 className="text-[14px] font-semibold text-text-primary mb-3">Constraints</h3>
          <ul className="space-y-1.5 list-inside list-disc text-[14px] text-text-secondary">
            {data.constraints.map((c, i) => (
              <li key={i}>
                <code className="font-mono text-[13px] bg-[#F7F6F3] text-[#37352F] px-1.5 py-0.5 rounded">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      {data.examples?.length > 0 && (
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Examples</h3>
          <div className="space-y-6">
            {data.examples.map((ex, i) => (
              <div key={i} className="rounded bg-[#FBFBFA] border border-surface-500 p-4">
                <p className="text-[13px] font-semibold text-text-primary mb-3">Example {i + 1}</p>
                <div className="space-y-2">
                  <p className="text-[13px] font-mono text-text-primary break-all">
                    <span className="text-text-muted font-sans font-medium mr-1">Input:</span> 
                    {ex.input}
                  </p>
                  <p className="text-[13px] font-mono text-text-primary break-all">
                    <span className="text-text-muted font-sans font-medium mr-1">Output:</span> 
                    {ex.output}
                  </p>
                  {ex.explanation && (
                    <p className="text-[13px] text-text-secondary mt-2 pt-2 border-t border-surface-500">
                      {ex.explanation}
                    </p>
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


