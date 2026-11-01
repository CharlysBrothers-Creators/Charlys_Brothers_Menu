import React from 'react';
import { Category } from '../../types/catalog';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  totalProductsCount: number;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  totalProductsCount,
}) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1 flex items-center gap-2 px-1 select-none">
      {/* "Todas" tab */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
          selectedCategoryId === null
            ? 'gold-button-gradient text-[#1A1A1A] shadow-[0_2px_10px_rgba(212,175,55,0.4)]'
            : 'bg-[#1A1A1A] text-[#F8E6C1]/80 border border-white/10 hover:border-[#D4AF37]/50'
        }`}
      >
        Todas ({totalProductsCount})
      </button>

      {/* Individual category tabs */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'gold-button-gradient text-[#1A1A1A] shadow-[0_2px_10px_rgba(212,175,55,0.4)]'
                : 'bg-[#1A1A1A] text-[#F8E6C1]/80 border border-white/10 hover:border-[#D4AF37]/50'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
