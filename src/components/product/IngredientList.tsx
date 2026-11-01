import React, { useState } from 'react';
import { Ingredient } from '../../types/productOptions';
import {
  ChevronDown,
  ChevronUp,
  Leaf,
  Beef,
  Sandwich,
  Flame,
  Soup,
  Wheat,
  Fish,
} from 'lucide-react';

interface IngredientListProps {
  ingredients?: Ingredient[];
  initialVisibleCount?: number;
}

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  initialVisibleCount = 6,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(true);

  // Comportamiento 1: Sin ingredientes -> ocultar sección por completo
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  // Ordenar si existe campo order
  const sorted = [...ingredients].sort((a, b) => (a.order || 0) - (b.order || 0));

  const hasManyIngredients = sorted.length > initialVisibleCount;
  const visibleItems = isExpanded || !hasManyIngredients ? sorted : sorted.slice(0, initialVisibleCount);

  // Helper para renderizar iconos temáticos discretos
  const renderIngredientIcon = (iconName?: string) => {
    const iconClass = 'w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0';
    switch (iconName) {
      case 'beef':
        return <Beef className={iconClass} />;
      case 'salad':
      case 'herb':
      case 'pickle':
      case 'onion':
        return <Leaf className={iconClass} />;
      case 'bread':
        return <Wheat className={iconClass} />;
      case 'sauce':
      case 'condiment':
        return <Soup className={iconClass} />;
      case 'bacon':
        return <Flame className={iconClass} />;
      case 'shrimp':
      case 'tuna':
        return <Fish className={iconClass} />;
      case 'cheese':
      default:
        return <Sandwich className={iconClass} />;
    }
  };

  return (
    <div className="w-full bg-[#16120E] border border-white/8 rounded-2xl p-4 shadow-sm select-none transition-all">
      {/* Section Header with toggle */}
      <div
        onClick={() => setIsSectionOpen((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[#D4AF37]" strokeWidth={2.2} />
          <h3 className="font-display text-sm sm:text-base font-semibold text-[#F8E6C1]">
            Ingredientes
          </h3>
          <span className="text-[10px] font-semibold text-stone-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
            {sorted.length}
          </span>
        </div>

        <button
          type="button"
          aria-label={isSectionOpen ? 'Ocultar ingredientes' : 'Mostrar ingredientes'}
          className="p-1 text-stone-400 hover:text-white transition"
        >
          {isSectionOpen ? (
            <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {isSectionOpen && (
        <div className="mt-3.5 space-y-3">
          {/* Flex wrap badge distribution */}
          <div className="flex flex-wrap gap-2">
            {visibleItems.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F1813] border border-white/8 hover:border-[#D4AF37]/40 transition text-xs text-stone-200"
              >
                {renderIngredientIcon(ing.iconName)}
                <span className="font-medium text-[11px] sm:text-xs">
                  {ing.name}
                </span>
              </div>
            ))}
          </div>

          {/* Show more / show less button when more than initial visible */}
          {hasManyIngredients && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-xs font-semibold text-[#D4AF37] hover:text-[#F8E6C1] transition flex items-center gap-1 cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <span>Ver menos ingredientes</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Ver todos los {sorted.length} ingredientes</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
