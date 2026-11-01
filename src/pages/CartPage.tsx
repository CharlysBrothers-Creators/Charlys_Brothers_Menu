import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ArrowRight, ShoppingBag, AlertCircle, Info, Lock } from 'lucide-react';
import { DBATULE_PROFILE } from '../config/business';
import { useCart } from '../context/CartContext';
import { formatCUP } from '../services/cartCalculations';
import { CartItemCard } from '../components/cart/CartItemCard';
import { EmptyCart } from '../components/cart/EmptyCart';
import { ClearCartModal } from '../components/cart/ClearCartModal';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, summary, loading, updateQuantity, removeItem, clearCart } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleBack = () => {
    // Navigate back in history if possible, else go to menu
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/menu');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-stone-400 bg-[#120F0D]">
        <span className="text-sm font-medium">Cargando pedido...</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 shadow-lg">
        <div className="w-full px-3.5 sm:px-4 py-2.5 flex items-center justify-between">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="Volver"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 active:scale-95 border border-[#D4AF37]/35 text-[#F8E6C1] transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2] text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide">Volver</span>
          </button>

          {/* Center Brand / Page Title */}
          <div className="flex flex-col items-center">
            <h1 className="font-display text-base sm:text-lg font-bold tracking-wider gold-gradient-text flex items-center gap-1.5">
              <span>Tu Pedido</span>
              {summary.totalItemsCount > 0 && (
                <span className="text-xs font-sans font-semibold text-[#D4AF37] px-1.5 py-0.2 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                  {summary.totalItemsCount}
                </span>
              )}
            </h1>
            <span className="text-[9px] tracking-[0.25em] text-[#F8E6C1]/70 uppercase">
              {DBATULE_PROFILE.name}
            </span>
          </div>

          {/* Right Action: Clear Cart (if items present) or CUP badge */}
          <div className="min-w-[62px] flex justify-end">
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                aria-label="Vaciar carrito de compras"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-[#E63946]/20 border border-white/10 hover:border-[#E63946]/40 text-stone-300 hover:text-[#E63946] text-xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Vaciar</span>
              </button>
            ) : (
              <span className="text-[10px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                CUP
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-3.5 sm:px-4 py-4 space-y-4 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            {/* DEMO Disclaimer Banner if items contain demo profile data */}
            {summary.hasDemoItems && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#1C1710] border border-[#D4AF37]/30 text-stone-300 text-xs">
                <Info className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-[#F8E6C1] block mb-0.5">
                    Modo Demostración Activo
                  </span>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Uno o más productos incluyen personalizaciones o detalles de prueba (DEMO). Estas opciones sirven para evaluar la interactividad y no generan pedidos comerciales reales.
                  </p>
                </div>
              </div>
            )}

            {/* List of Cart Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Summary & Totals Breakdown Card */}
            <div className="bg-[#16120E] border border-white/8 rounded-2xl p-4 space-y-3 mt-2 shadow-sm">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Resumen del pedido
              </h2>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-stone-300">
                  <span>Subtotal productos base</span>
                  <span>{formatCUP(summary.subtotalBase)}</span>
                </div>

                {summary.subtotalExtras > 0 && (
                  <div className="flex items-center justify-between text-stone-300">
                    <span>Extras y personalizaciones</span>
                    <span className="text-[#D4AF37]">
                      +{formatCUP(summary.subtotalExtras)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/8 flex items-baseline justify-between font-display text-base font-bold text-[#F8E6C1]">
                  <div>
                    <span>Subtotal del pedido</span>
                    {summary.hasDemoItems && (
                      <span className="block text-[10px] text-stone-400 font-sans font-normal">
                        (Incluye importes DEMO de prueba)
                      </span>
                    )}
                  </div>
                  <span className="text-[#D4AF37] text-lg">
                    {formatCUP(summary.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {/* Primary action: "Continuar pedido" - Activated for Fase 4B */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 px-4 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-sm shadow-[0_4px_16px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  <span>Continuar pedido</span>
                  <span className="text-xs font-semibold ml-1">
                    ({formatCUP(summary.grandTotal)})
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <p className="text-[11px] text-stone-400 text-center mt-1.5 flex items-center gap-1 justify-center">
                  <span>Elegir mesa, recogida o entrega a domicilio</span>
                </p>
              </div>

              {/* Secondary action: Continue shopping in catalog */}
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="w-full py-3 px-4 rounded-xl bg-black/50 hover:bg-black/75 border border-[#D4AF37]/35 text-[#F8E6C1] font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Seguir explorando el menú</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      <ClearCartModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearCart}
      />
    </div>
  );
};
