import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  searchQuery?: string;
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  onReset,
}) => {
  return (
    <div className="py-12 px-4 flex flex-col items-center text-center select-none animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
        <SearchX className="w-8 h-8 stroke-[1.8]" />
      </div>

      <h3 className="font-display text-lg font-semibold text-[#F8E6C1] mb-1">
        Sin resultados
      </h3>

      <p className="text-xs text-stone-400 max-w-xs mb-5 leading-relaxed">
        {searchQuery
          ? `No encontramos productos que coincidan con «${searchQuery}». Prueba con otro término como «pizza», «arroz» o «sándwich».`
          : 'No hay productos disponibles en esta categoría actualmente.'}
      </p>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/90 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold hover:border-[#D4AF37] active:scale-95 transition cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Restablecer búsqueda</span>
      </button>
    </div>
  );
};
