import React from 'react';
import { UtensilsCrossed, ShoppingBag, Bike, Check } from 'lucide-react';
import { OrderModalityConfig, OrderModalityId } from '../../config/orderSettings';

interface ModalitySelectorProps {
  modalities: OrderModalityConfig[];
  selectedModality: OrderModalityId;
  onSelectModality: (modality: OrderModalityId) => void;
}

export const ModalitySelector: React.FC<ModalitySelectorProps> = ({
  modalities,
  selectedModality,
  onSelectModality,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'utensils':
        return <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'bag':
        return <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'bike':
      default:
        return <Bike className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getBriefDescription = (id: OrderModalityId) => {
    switch (id) {
      case 'dine_in':
        return 'Servicio a mesa';
      case 'takeaway':
        return 'Pasa a recoger';
      case 'delivery':
        return 'A tu puerta';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-300">
          ¿Cómo deseas tu pedido?
        </label>
        <span className="text-[10px] text-[#D4AF37] font-medium hidden xs:inline">
          Selecciona una modalidad
        </span>
      </div>

      {/* Exactly 3 columns in a single horizontal row without vertical stacking or horizontal scrolling */}
      <div className="grid grid-cols-3 gap-1.5 min-[380px]:gap-2 sm:gap-2.5">
        {modalities.map((item) => {
          const isSelected = selectedModality === item.id;
          const isDisabled = !item.enabled;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectModality(item.id)}
              className={`relative flex flex-col items-center text-center p-2 min-[360px]:p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer h-full justify-between min-w-0 ${
                isSelected
                  ? 'bg-[#1F1812] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.22)]'
                  : isDisabled
                  ? 'bg-[#15110E]/50 border-white/5 opacity-50 cursor-not-allowed'
                  : 'bg-[#16120E] border-white/8 hover:border-[#D4AF37]/35 text-stone-300'
              }`}
            >
              {/* Visual selection indicator badge in top-right */}
              <div
                className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                    : 'border border-white/20 bg-black/40'
                }`}
              >
                {isSelected && <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3]" />}
              </div>

              {/* Icon */}
              <div
                className={`w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors mb-1 sm:mb-1.5 ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                    : 'bg-white/5 text-[#D4AF37]'
                }`}
              >
                {getIcon(item.icon)}
              </div>

              {/* Short Title */}
              <h3 className="font-display text-[11px] min-[360px]:text-xs sm:text-sm font-bold text-[#F8E6C1] leading-tight w-full truncate mb-0.5">
                {item.title}
              </h3>

              {/* Brief Description adapted to available space */}
              <p className="text-[9px] min-[360px]:text-[10px] sm:text-[11px] text-stone-400 leading-tight w-full line-clamp-2">
                <span className="sm:hidden">{getBriefDescription(item.id)}</span>
                <span className="hidden sm:inline">{item.description}</span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

