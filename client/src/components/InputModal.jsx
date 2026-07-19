import { useState } from 'react';
import SlideOver from './SlideOver';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function InputModal({ isOpen, onClose, onSubmit, mode }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      await onSubmit(value.trim(), mode);
    } catch (err) {
      setError(err.data?.suggestion || err.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const isUrl = mode === 'url';
  const title = isUrl ? 'Import a public problem URL' : 'Paste Problem Text';

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="text-[14px] text-text-secondary mb-6 leading-relaxed">
          {isUrl 
            ? 'Paste a public problem URL. We use the page first, then a public-reader fallback where available. Pages requiring sign-in or CAPTCHA must be pasted manually.' 
            : 'Paste the statement in any format. For best results, include the title, constraints, and at least one Input / Output example.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {isUrl ? (
            <input
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://leetcode.com/problems/two-sum/"
              className="w-full px-4 py-3 rounded bg-[#FBFBFA] border border-surface-500 
                text-text-primary placeholder:text-text-muted font-mono text-[13px]
                focus:outline-none focus:border-text-primary transition-colors"
              autoFocus
            />
          ) : (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste the problem description here...&#10;&#10;Example:&#10;Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
              rows={12}
              className="w-full px-4 py-3 rounded bg-[#FBFBFA] border border-surface-500 
                text-text-primary placeholder:text-text-muted text-[14px] leading-relaxed resize-none
                focus:outline-none focus:border-text-primary transition-colors"
              autoFocus
            />
          )}

          {error && (
            <div className="mt-4 p-4 rounded bg-[#FCECEB] border border-[#EBA9A6] text-[#EB5757] text-[13px]">
              {error}
            </div>
          )}

          {!isUrl && !error && (
            <div className="mt-4 flex gap-2 text-[12px] leading-relaxed text-[#64748B]">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#0EA5A4]" />
              <span>Works without AI for standard pasted statements. AI only improves the structure when it is available.</span>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-[14px] font-medium text-text-secondary hover:bg-[#FBFBFA] hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim() || loading}
              className="px-4 py-2 rounded text-[14px] font-medium bg-[#37352F] text-white
                hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Importing...' : isUrl ? 'Import & Parse' : 'Parse Problem'}
            </button>
          </div>
        </form>
      </div>
    </SlideOver>
  );
}
