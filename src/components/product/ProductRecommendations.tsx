import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/catalog';
import { Star } from 'lucide-react';

interface ProductRecommendationsProps {
  products: Product[];
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  products,
}) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-3 pt-2 select-none">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]/30" strokeWidth={2.2} />
        <h3 className="font-display text-base font-bold text-[#F8E6C1]">
          También te puede gustar
        </h3>
      </div>

      {/* Recommended Products Grid / Scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {products.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              navigate(`/menu/producto/${item.id}`);
              // Scroll to top
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative bg-[#16120E] hover:bg-[#1F1914] active:bg-[#251E18] border border-white/6 hover:border-[#D4AF37]/40 rounded-2xl p-2.5 text-left transition-all duration-200 cursor-pointer shadow-md overflow-hidden flex flex-col justify-between"
          >
            {/* Thumbnail */}
            <div className="relative aspect-[16/11] w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-2">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Title & Price */}
            <div>
              <h4 className="font-display text-xs sm:text-sm font-bold text-[#F8E6C1] group-hover:text-white line-clamp-1 leading-snug">
                {item.name}
              </h4>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xs sm:text-sm font-bold text-[#D4AF37]">
                  ${item.price.toLocaleString('es-CU')}
                </span>
                <span className="text-[9px] font-semibold text-[#F8E6C1]/70">
                  CUP
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
