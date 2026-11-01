import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/catalog';
import { ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categoryName,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/menu/producto/${product.id}`);
    }
  };

  return (
    <article
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative bg-[#15110E] hover:bg-[#1D1713] active:bg-[#231C17] border border-white/6 hover:border-[#D4AF37]/50 active:border-[#D4AF37]/70 rounded-2xl p-3 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center gap-3.5 select-none cursor-pointer overflow-hidden"
    >
      {/* Product Image Thumbnail with illustrative badge */}
      <div className="relative w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/60 border border-white/10 shadow-inner">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Clear illustrative photo identification pill */}
        {product.isIllustrativePhoto && (
          <div className="absolute bottom-1 left-1 bg-black/85 backdrop-blur-[2px] px-1.5 py-0.5 rounded-sm border border-white/10">
            <span className="text-[8px] font-medium text-[#F8E6C1]/90 tracking-tight leading-none block">
              Foto ilustrativa
            </span>
          </div>
        )}
      </div>

      {/* Product Information & Price */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold text-[#F8E6C1] group-hover:text-white leading-snug line-clamp-2">
            {product.name}
          </h3>

          {categoryName && (
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase block mt-1">
              {categoryName}
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-[#D4AF37] tracking-tight">
              ${product.price.toLocaleString('es-CU')}
            </span>
            <span className="text-[10px] font-semibold text-[#F8E6C1]/80">
              CUP
            </span>
          </div>

          {(product as any).available === false && (
            <span className="text-[9px] font-bold text-red-300 bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 rounded-md flex-shrink-0">
              No disponible
            </span>
          )}
        </div>
      </div>

      {/* Right chevron indicator */}
      <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-[#D4AF37] flex-shrink-0 transition-colors ml-1 stroke-[2]" />
    </article>
  );
};
