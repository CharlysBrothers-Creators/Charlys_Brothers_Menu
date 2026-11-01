/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  ShoppingBag,
  Receipt,
  ChefHat,
  ClipboardList,
  Utensils,
  Sliders,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { summary } = useCart();

  const pathname = location.pathname;
  const search = location.search;
  const isAdmin = pathname.startsWith('/admin');

  // ==================== CLIENT NAVIGATION ====================
  if (!isAdmin) {
    const isHomeActive = pathname === '/';
    const isMenuActive = pathname.startsWith('/menu');
    const isCartActive = pathname === '/carrito';
    const isOrderActive = pathname === '/checkout';

    const handleOrderClick = () => {
      if (summary.totalItemsCount > 0) {
        navigate('/checkout');
      } else {
        // If empty cart, route to cart page where friendly empty-state guidance is provided
        navigate('/carrito');
      }
    };

    return (
      <nav
        aria-label="Navegación inferior del cliente"
        className="relative z-30 w-full bg-[#14100D]/95 backdrop-blur-md border-t border-[#2B1F14] px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(0,0,0,0.6)] select-none flex-shrink-0"
      >
        <div className="grid grid-cols-4 max-w-md mx-auto items-center">
          {/* 1. Inicio */}
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Ir a la portada de inicio"
            className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              isHomeActive
                ? 'text-[#F8E6C1]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isHomeActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
              <Home className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide truncate ${isHomeActive ? 'text-[#D4AF37]' : ''}`}>
              Inicio
            </span>
          </button>

          {/* 2. Menú */}
          <button
            type="button"
            onClick={() => navigate('/menu')}
            aria-label="Explorar la carta gastronómica"
            className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              isMenuActive
                ? 'text-[#F8E6C1]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isMenuActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide truncate ${isMenuActive ? 'text-[#D4AF37]' : ''}`}>
              Menú
            </span>
          </button>

          {/* 3. Carrito */}
          <button
            type="button"
            onClick={() => navigate('/carrito')}
            aria-label="Ver productos en el carrito"
            className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer relative ${
              isCartActive
                ? 'text-[#F8E6C1]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${isCartActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              {summary.totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D4AF37] text-stone-950 font-bold text-[9px] flex items-center justify-center shadow-xs">
                  {summary.totalItemsCount > 99 ? '99+' : summary.totalItemsCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold tracking-wide truncate ${isCartActive ? 'text-[#D4AF37]' : ''}`}>
              Carrito
            </span>
          </button>

          {/* 4. Pedido (lleva a checkout si hay productos o a carrito si está vacío) */}
          <button
            type="button"
            onClick={handleOrderClick}
            aria-label="Proceder a la preparación del pedido"
            className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              isOrderActive
                ? 'text-[#F8E6C1]'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isOrderActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
              <Receipt className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] font-bold tracking-wide truncate ${isOrderActive ? 'text-[#D4AF37]' : ''}`}>
              Pedido
            </span>
          </button>
        </div>
      </nav>
    );
  }

  // ==================== ADMIN NAVIGATION ====================
  const isAdminHomeActive = pathname === '/admin';
  const isComandasActive = pathname.startsWith('/admin/comandas');
  const isProductsActive = pathname === '/admin/gestion' && search.includes('tab=products');
  const isGestionActive =
    pathname === '/admin/gestion' && !search.includes('tab=products');

  return (
    <nav
      aria-label="Navegación inferior del personal administrativo"
      className="relative z-30 w-full bg-[#120F0D]/95 backdrop-blur-md border-t border-[#2B1F14] px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(0,0,0,0.7)] select-none flex-shrink-0"
    >
      <div className="grid grid-cols-4 max-w-lg mx-auto items-center">
        {/* 1. Inicio Admin */}
        <button
          type="button"
          onClick={() => navigate('/admin')}
          aria-label="Ir al portal administrativo principal"
          className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
            isAdminHomeActive
              ? 'text-[#F8E6C1]'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${isAdminHomeActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
            <ChefHat className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold tracking-wide truncate ${isAdminHomeActive ? 'text-[#D4AF37]' : ''}`}>
            Inicio
          </span>
        </button>

        {/* 2. Comandas KDS */}
        <button
          type="button"
          onClick={() => navigate('/admin/comandas')}
          aria-label="Ver panel de comandas y cocina"
          className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
            isComandasActive
              ? 'text-[#F8E6C1]'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${isComandasActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
            <ClipboardList className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold tracking-wide truncate ${isComandasActive ? 'text-[#D4AF37]' : ''}`}>
            Comandas
          </span>
        </button>

        {/* 3. Productos */}
        <button
          type="button"
          onClick={() => navigate('/admin/gestion?tab=products')}
          aria-label="Gestionar carta de platos y disponibilidad"
          className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
            isProductsActive
              ? 'text-[#F8E6C1]'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${isProductsActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
            <Utensils className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold tracking-wide truncate ${isProductsActive ? 'text-[#D4AF37]' : ''}`}>
            Productos
          </span>
        </button>

        {/* 4. Gestión */}
        <button
          type="button"
          onClick={() => navigate('/admin/gestion')}
          aria-label="Configuración integral del negocio y tarifas"
          className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
            isGestionActive
              ? 'text-[#F8E6C1]'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition ${isGestionActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}`}>
            <Sliders className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className={`text-[10px] font-bold tracking-wide truncate ${isGestionActive ? 'text-[#D4AF37]' : ''}`}>
            Gestión
          </span>
        </button>
      </div>
    </nav>
  );
};
