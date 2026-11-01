import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartToast: React.FC = () => {
  const { toast, dismissToast } = useCart();
  const navigate = useNavigate();

  if (!toast) return null;

  return (
    <aside
      aria-label="Notificación de pedido"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-auto select-none"
    >
      <div className="bg-[#18130E]/95 border border-[#D4AF37]/50 rounded-2xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-between gap-3 text-stone-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#F8E6C1] truncate">
              {toast.title}
            </p>
            {toast.subtext && (
              <p className="text-[11px] text-stone-400 truncate">
                {toast.subtext}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              dismissToast();
              navigate('/carrito');
            }}
            className="px-2.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#c49f2e] text-[#1A1A1A] text-[11px] font-bold cursor-pointer transition active:scale-95"
          >
            Ver
          </button>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Cerrar notificación"
            className="p-1 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
