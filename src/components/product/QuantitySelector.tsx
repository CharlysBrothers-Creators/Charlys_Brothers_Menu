import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onChange,
  min = 1,
  max = 20,
}) => {
  const decrease = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 rounded-2xl p-1.5 shadow-inner select-none">
      <button
        type="button"
        onClick={decrease}
        disabled={quantity <= min}
        aria-label="Disminuir cantidad"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
          quantity <= min
            ? 'opacity-40 text-stone-500 cursor-not-allowed'
            : 'bg-black/60 hover:bg-black/80 active:scale-95 text-[#F8E6C1] border border-white/10'
        }`}
      >
        <Minus className="w-4 h-4 stroke-[2.5]" />
      </button>

      <span className="w-8 text-center font-display text-base font-bold text-[#F8E6C1]">
        {quantity}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={quantity >= max}
        aria-label="Aumentar cantidad"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
          quantity >= max
            ? 'opacity-40 text-stone-500 cursor-not-allowed'
            : 'bg-black/60 hover:bg-black/80 active:scale-95 text-[#F8E6C1] border border-white/10'
        }`}
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
