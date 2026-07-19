import { AlertTriangle, X } from 'lucide-react';

export default function WarningModal({ isOpen, onClose, title, message, suggestion }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative bg-white border border-[#E3E2E0] rounded-[4px] w-full max-w-md p-6 animate-[slide-up_0.15s_ease]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-[4px] text-[#9CA3AF] hover:bg-[#F7F6F3] hover:text-[#37352F] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center pt-2">
          <div className="w-12 h-12 rounded-full border border-[#E3E2E0] bg-[#FFF9E6] text-[#F59E0B] flex items-center justify-center mb-5">
            <AlertTriangle size={24} />
          </div>

          <h3 className="text-[16px] font-semibold text-[#111111] text-center mb-2">{title}</h3>
          <p className="text-[14px] text-[#9CA3AF] text-center leading-relaxed mb-6">{message}</p>

          {suggestion && (
            <div className="w-full p-3 rounded-[4px] bg-[#F7F6F3] border border-[#E3E2E0] text-[#37352F] text-[13px] text-center mb-6 leading-relaxed">
              {suggestion}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-[4px] text-[14px] font-medium bg-[#37352F] text-white
              hover:bg-black transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
