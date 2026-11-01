import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, AlertTriangle, X, ClipboardList, ShoppingBag } from 'lucide-react';
import { Comanda } from '../../types/comanda';

interface CheckoutCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPersisted?: boolean;
  comanda?: Comanda | null;
}

export const CheckoutCompleteModal: React.FC<CheckoutCompleteModalProps> = ({
  isOpen,
  onClose,
  isPersisted = true,
  comanda,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-[#18130E] border border-[#D4AF37]/50 p-4 sm:p-5 max-h-[92vh] overflow-y-auto shadow-2xl text-stone-100 space-y-4">
        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-stone-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon & Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-14 h-14 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-3 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <CheckCircle className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h3
            id="demo-complete-title"
            className="font-display text-lg font-bold text-[#F8E6C1]"
          >
            {comanda ? `Comanda Local ${comanda.code}` : 'Simulación Local de Pedido'}
          </h3>

          <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest mt-0.5">
            Registrada en Dispositivo DEMO
          </span>
        </div>

        {/* Informative Explanation */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 text-xs text-stone-300 space-y-2.5 leading-relaxed">
          {comanda && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-white/10 text-[11px]">
              <span className="text-stone-400">Referencia interna:</span>
              <span className="font-mono font-bold text-[#F8E6C1]">{comanda.id}</span>
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-black/40 border border-[#D4AF37]/25 text-[11px] text-stone-300 space-y-1">
            <strong className="text-[#F8E6C1] block">Aviso de simulación interna:</strong>
            <p>
              La comanda fue guardada en el almacenamiento local del dispositivo (IndexedDB).{' '}
              <span className="text-[#D4AF37] font-semibold">NO ha sido enviada</span> a un restaurante real ni por WhatsApp, ni se han procesado cobros.
            </p>
          </div>

          <p className="text-[11px] text-stone-400">
            Los productos siguen disponibles en tu carrito por si deseas continuar navegando o realizar nuevas pruebas.
          </p>

          {!isPersisted && (
            <div className="flex items-start gap-1.5 pt-1 text-amber-400 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Los datos se conservan temporalmente en la sesión activa, pero no se pudieron almacenar de forma persistente.
              </span>
            </div>
          )}
        </div>

        {/* Navigation Action Buttons (Public customer only) */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/menu');
              }}
              className="py-3 px-3 rounded-xl gold-button-gradient text-[#1A1A1A] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs hover:brightness-110 active:scale-95"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Ir a la Carta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/carrito');
              }}
              className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ver Carrito</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-center text-stone-400 hover:text-stone-200 text-[11px] transition cursor-pointer"
          >
            Cerrar este diálogo
          </button>
        </div>
      </div>
    </div>
  );
};

