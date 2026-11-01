import React, { useState } from 'react';
import { Product } from '../../types/catalog';
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles, Info } from 'lucide-react';

interface ProductInformationProps {
  product: Product;
  categoryName?: string;
  description?: string;
  allergens?: string;
  isDemoData?: boolean;
  allergensUnverifiedDisclaimer?: boolean;
}

export const ProductInformation: React.FC<ProductInformationProps> = ({
  product,
  categoryName,
  description,
  allergens,
  isDemoData,
  allergensUnverifiedDisclaimer = true,
}) => {
  const [isAllergensOpen, setIsAllergensOpen] = useState(false);

  return (
    <div className="w-full space-y-3.5 select-none">
      {/* Notice Banner when viewing DEMO data */}
      {isDemoData && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#F8E6C1] text-xs">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-semibold text-[#D4AF37] text-[11px] tracking-wide">
              Información DEMO
            </span>
          </div>
          <span className="text-[10px] text-stone-300">
            • Opciones de muestra para validar la interfaz
          </span>
        </div>
      )}

      {/* Name, Category and Official Price */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#F8E6C1] leading-tight drop-shadow-sm break-words">
            {product.name}
          </h1>

          {categoryName && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase">
                {categoryName}
              </span>
            </div>
          )}
        </div>

        {/* Official Price in CUP */}
        <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-1 flex-shrink-0 pt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#D4AF37] tracking-tight">
              ${product.price.toLocaleString('es-CU')}
            </span>
            <span className="text-xs font-semibold text-[#F8E6C1]/80">
              CUP
            </span>
          </div>
          <span className="text-[10px] text-stone-400">
            Precio oficial
          </span>
        </div>
      </div>

      {/* Description (only rendered if present) */}
      {description && (
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
          {description}
        </p>
      )}

      {/* Allergens Collapsible Section (only if registered) */}
      {allergens && (
        <div className="w-full bg-[#16120E] border border-white/8 rounded-2xl p-3.5 shadow-xs">
          <div
            onClick={() => setIsAllergensOpen((prev) => !prev)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E63946]" strokeWidth={2.2} />
              <h4 className="font-display text-xs sm:text-sm font-semibold text-[#F8E6C1]">
                Información de Alérgenos
              </h4>
            </div>

            <button
              type="button"
              aria-label={isAllergensOpen ? 'Ocultar alérgenos' : 'Ver alérgenos'}
              className="p-1 text-stone-400 hover:text-white transition"
            >
              {isAllergensOpen ? (
                <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
              )}
            </button>
          </div>

          {isAllergensOpen && (
            <div className="mt-2.5 pl-6 space-y-1.5">
              <p className="text-xs text-stone-300 leading-relaxed">
                {allergens}
              </p>
              {allergensUnverifiedDisclaimer && (
                <div className="flex items-start gap-1.5 pt-1 text-[10px] text-stone-400 italic">
                  <Info className="w-3 h-3 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>
                    Aviso: Información de demostración no verificada por el restaurante. No debe utilizarse como advertencia alimentaria médica real.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
