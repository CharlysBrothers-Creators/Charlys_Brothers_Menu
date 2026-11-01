import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface RestoreDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const RestoreDemoModal: React.FC<RestoreDemoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-demo-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#18130E] border border-amber-500/40 p-5 shadow-2xl text-stone-100 space-y-4">
        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={isSubmitting}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-stone-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 id="restore-demo-title" className="font-display text-base font-bold text-[#F8E6C1]">
              ¿Restaurar datos oficiales de demostración?
            </h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Esta acción restablecerá los 29 productos oficiales, sus precios iniciales, categorías, mesas y configuraciones por defecto.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-stone-300 space-y-1">
          <strong className="text-[#F8E6C1] block">Protección de comandas:</strong>
          <p>
            El historial de comandas ya registradas se conservará intacto con sus instantáneas originales.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#1A1A1A] bg-amber-500 hover:bg-amber-400 transition cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Restaurando...' : 'Sí, restaurar datos oficiales'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
