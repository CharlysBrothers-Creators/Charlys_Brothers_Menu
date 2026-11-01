import React from 'react';
import { Info, X } from 'lucide-react';

interface PendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export const PendingModal: React.FC<PendingModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#1A1A1A] border border-[#D4AF37]/50 p-6 text-stone-100 shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-[#F8E6C1]">
            {title}
          </h3>
        </div>

        <p className="text-sm text-stone-300 leading-relaxed mb-5">
          {description}
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B88E28] text-[#1A1A1A] font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
