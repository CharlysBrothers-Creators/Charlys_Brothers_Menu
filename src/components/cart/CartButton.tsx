import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartButtonProps {
  className?: string;
}

export const CartButton: React.FC<CartButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { summary } = useCart();
  const count = summary.totalItemsCount;

  return (
    <button
      type="button"
      onClick={() => navigate('/carrito')}
      aria-label={`Ver carrito de compras con ${count} productos`}
      className={`relative flex items-center justify-center p-2 rounded-xl bg-black/60 hover:bg-black/85 active:scale-95 border border-[#D4AF37]/40 text-[#F8E6C1] transition-all cursor-pointer shadow-xs min-w-[40px] min-h-[40px] ${className}`}
    >
      <ShoppingBag className="w-4 h-4 text-[#D4AF37] stroke-[2.2]" />

      {/* Numerical Badge Counter */}
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-in fade-in zoom-in-75 duration-200"
          aria-live="polite"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};
