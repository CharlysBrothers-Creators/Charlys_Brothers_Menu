import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const EmptyCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none py-12">
      <div className="w-16 h-16 rounded-full bg-[#18130E] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] mb-4 shadow-[0_4px_20px_rgba(212,175,55,0.15)]">
        <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
      </div>

      <h2 className="font-display text-lg sm:text-xl font-bold text-[#F8E6C1] mb-1.5">
        Tu pedido está vacío
      </h2>

      <p className="text-xs text-stone-400 max-w-xs mb-6 leading-relaxed">
        Explora las especialidades de D’Batule y agrega tus platos favoritos para armar tu pedido.
      </p>

      <button
        type="button"
        onClick={() => navigate('/menu')}
        className="px-5 py-2.5 rounded-xl gold-button-gradient text-[#1A1A1A] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
      >
        <span>Explorar el Menú</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
