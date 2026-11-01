import React from 'react';
import { Category } from '../../types/catalog';

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string) => void;
  productCountByCategory: Record<string, number>;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  productCountByCategory,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        const count = productCountByCategory[category.id] || 0;

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`group relative h-28 sm:h-32 rounded-2xl overflow-hidden border transition-all duration-300 text-left cursor-pointer active:scale-[0.98] ${
              isSelected
                ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.3)]'
                : 'border-white/10 hover:border-[#D4AF37]/60 shadow-md'
            }`}
          >
            {/* Background photography */}
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Dark gradient for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-0 p-3 flex flex-col justify-end">
              <span className="font-display text-sm sm:text-base font-bold text-[#F8E6C1] group-hover:text-white leading-tight drop-shadow-md">
                {category.name}
              </span>
              <span className="text-[10px] text-[#D4AF37] font-semibold mt-0.5">
                {count} {count === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
