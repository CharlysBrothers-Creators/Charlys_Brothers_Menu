import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Category } from '../../types/catalog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCircleTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryCircleTabs: React.FC<CategoryCircleTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Comprobar límites de scroll para mostrar u ocultar flechas de navegación
  const updateScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const atStart = el.scrollLeft <= 4;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 6;

    setCanScrollLeft(!atStart);
    setCanScrollRight(!atEnd);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollBounds();
    el.addEventListener('scroll', updateScrollBounds, { passive: true });
    window.addEventListener('resize', updateScrollBounds);

    return () => {
      el.removeEventListener('scroll', updateScrollBounds);
      window.removeEventListener('resize', updateScrollBounds);
    };
  }, [updateScrollBounds, categories]);

  // Asegurar que la categoría activa siempre esté visible en el viewport
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const activeBtn = el.querySelector(`[data-category-id="${activeCategoryId}"]`) as HTMLElement;
    if (activeBtn) {
      // Centrar el elemento activo suavemente dentro del contenedor
      const scrollPos = activeBtn.offsetLeft - el.clientWidth / 2 + activeBtn.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
    }
  }, [activeCategoryId]);

  // Funciones de navegación suave con flechas
  const handleScrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -160, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 160, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full select-none group/carousel py-0.5">
      {/* Botón Flecha Izquierda */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={handleScrollLeft}
          aria-label="Desplazar categorías hacia la izquierda"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/85 border border-[#D4AF37]/50 text-[#F8E6C1] shadow-lg flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#1A1A1A] active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Contenedor con scroll horizontal táctil y por teclado */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto scrollbar-none py-1 px-2 flex items-center gap-3 sm:gap-4 scroll-smooth"
        tabIndex={0}
        role="region"
        aria-label="Selector horizontal de categorías"
      >
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              data-category-id={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-col items-center flex-shrink-0 group cursor-pointer transition-all duration-200"
            >
              {/* Avatar circular fotográfico */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden transition-all duration-300 relative ${
                  isActive
                    ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#120F0D] shadow-[0_0_15px_rgba(212,175,55,0.45)] scale-105'
                    : 'border border-white/15 opacity-75 group-hover:opacity-100 group-hover:border-[#D4AF37]/50'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className={`absolute inset-0 bg-black/20 ${
                    isActive ? 'bg-transparent' : 'bg-black/30'
                  }`}
                />
              </div>

              {/* Título de la categoría */}
              <span
                className={`mt-1.5 text-[11px] font-medium leading-tight max-w-[76px] sm:max-w-[84px] text-center transition-colors ${
                  isActive
                    ? 'text-[#D4AF37] font-bold'
                    : 'text-[#F8E6C1]/80 group-hover:text-[#F8E6C1]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Botón Flecha Derecha */}
      {canScrollRight && (
        <button
          type="button"
          onClick={handleScrollRight}
          aria-label="Desplazar categorías hacia la derecha"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/85 border border-[#D4AF37]/50 text-[#F8E6C1] shadow-lg flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#1A1A1A] active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};
