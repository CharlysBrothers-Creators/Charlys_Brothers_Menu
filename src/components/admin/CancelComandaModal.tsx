import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Comanda } from '../../types/comanda';

interface CancelComandaModalProps {
  comanda: Comanda | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (comandaId: string, reason: string) => Promise<void>;
}

export const CancelComandaModal: React.FC<CancelComandaModalProps> = ({
  comanda,
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen || !comanda) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setError('Por favor indica un motivo de cancelación (mínimo 3 caracteres).');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onConfirmCancel(comanda.id, reason.trim());
      setReason('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cancelar la comanda');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#18130E] border border-[#E63946]/50 p-4 sm:p-5 max-h-[92vh] overflow-y-auto shadow-2xl text-stone-100 space-y-4">
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

        {/* Warning Icon & Title */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/20 border border-[#E63946]/40 flex items-center justify-center text-[#E63946] flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 id="cancel-modal-title" className="font-display text-base font-bold text-[#F8E6C1]">
              Cancelar Comanda {comanda.code}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Esta acción es irreversible y anulará los productos pendientes de preparación.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Motivo de la cancelación <span className="text-[#E63946]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. El cliente se retiró de la mesa, falta de stock de un ingrediente crítico..."
              className="w-full px-3 py-2 rounded-xl bg-[#120F0D] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#E63946] transition resize-none"
            />
            {error && (
              <p className="text-[11px] text-[#E63946] font-medium mt-1">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#E63946]/90 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
