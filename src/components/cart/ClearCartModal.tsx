import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ClearCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearCartModal: React.FC<ClearCartModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-cart-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-[#18130E] border border-[#D4AF37]/40 p-5 shadow-2xl text-stone-100 space-y-4">
        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-stone-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E63946]/15 border border-[#E63946]/30 flex items-center justify-center text-[#E63946] flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="clear-cart-title"
              className="font-display text-base font-bold text-[#F8E6C1]"
            >
              ¿Vaciar el carrito?
            </h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Esta acción eliminará todos los platos y personalizaciones agregadas a tu pedido.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#E63946] hover:bg-[#d62838] transition cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sí, vaciar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
