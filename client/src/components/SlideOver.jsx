import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideOver({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-[420px] animate-[slide-in-right_0.2s_ease]">
          <div className="flex h-full flex-col bg-white border-l border-[#E3E2E0]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E2E0]">
              <h2 className="text-[16px] font-semibold text-[#111111]">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-[4px] text-[#9CA3AF] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="relative flex-1 px-6 py-6 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
