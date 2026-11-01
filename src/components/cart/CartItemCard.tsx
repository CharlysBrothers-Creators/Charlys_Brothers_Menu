import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../../types/cart';
import { formatCUP } from '../../services/cartCalculations';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0;

  return (
    <article
      aria-label={`Producto en carrito: ${item.productName}`}
      className="relative flex flex-col bg-[#16120E] border border-white/8 hover:border-[#D4AF37]/30 rounded-2xl p-3 sm:p-3.5 transition-all shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Local Photographic Thumbnail */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#1D1713] flex-shrink-0 border border-white/5">
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>

        {/* Info & Options Breakdown */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xs sm:text-base font-semibold text-[#F8E6C1] leading-snug truncate">
                {item.productName}
              </h3>

              {item.isDemoData && (
                <span className="inline-block text-[9px] font-semibold text-[#D4AF37] px-1.5 py-0.5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30 mt-0.5">
                  DEMO (Prueba)
                </span>
              )}
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Eliminar ${item.productName} del carrito`}
              className="p-1.5 text-stone-400 hover:text-[#E63946] active:scale-90 transition rounded-lg hover:bg-white/5 cursor-pointer flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* Unit Price Breakdown */}
          <div className="flex flex-wrap items-baseline gap-1 mt-1 text-xs">
            <span className="text-[#D4AF37] font-semibold">
              {formatCUP(item.unitFinalPrice)}
            </span>
            {item.unitExtrasTotal > 0 && (
              <span className="text-[10px] text-stone-400">
                (Base: ${item.unitBasePrice.toLocaleString('es-CU')} + Extras: ${item.unitExtrasTotal.toLocaleString('es-CU')})
              </span>
            )}
          </div>

          {/* Selected Customizations & Options List */}
          {hasOptions && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Personalizaciones:
              </span>
              <ul className="text-xs text-stone-300 space-y-0.5">
                {item.selectedOptions.map((opt) => (
                  <li key={`${item.id}_opt_${opt.id}`} className="flex items-center justify-between text-[11px] gap-1">
                    <span className="text-stone-300 truncate">
                      {opt.type === 'remove' ? `• Sin ${opt.name.replace(/^Sin\s+/i, '')}` : `• ${opt.name}`}
                    </span>
                    {opt.priceAdjustment > 0 && (
                      <span className="text-[10px] font-semibold text-[#D4AF37] ml-2 flex-shrink-0">
                        +${opt.priceAdjustment.toLocaleString('es-CU')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls: Quantity selector and Line Subtotal */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
        {/* Quantity Controls (no negative or zero quantities) */}
        <div className="flex items-center gap-1.5 bg-[#1F1813] border border-white/10 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label={`Disminuir cantidad de ${item.productName}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <span
            className="w-7 text-center font-display text-xs font-bold text-[#F8E6C1]"
            aria-label={`Cantidad actual: ${item.quantity}`}
          >
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label={`Aumentar cantidad de ${item.productName}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#D4AF37] hover:text-[#e4be42] hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Line Subtotal */}
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block uppercase tracking-wider">
            Subtotal línea
          </span>
          <span className="font-display text-sm font-bold text-[#F8E6C1]">
            {formatCUP(item.lineTotal)}
          </span>
        </div>
      </div>
    </article>
  );
};
