import React, { useEffect, useState } from 'react';
import { Menu, Search, Download, X, Home, BookOpen, ShoppingBag, ClipboardList, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { DiscreetAdminButton } from './DiscreetAdminButton';

export const HeaderNav: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const goTo = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const links = [
    { label: 'Inicio', path: '/', Icon: Home },
    { label: 'Carta gastronómica', path: '/menu', Icon: BookOpen },
    { label: 'Mi carrito', path: '/carrito', Icon: ShoppingBag },
    { label: 'Mi pedido', path: '/checkout', Icon: ClipboardList },
    { label: 'Administración DEMO', path: '/admin', Icon: ChefHat },
  ];

  return (
    <>
      <header className="w-full flex items-center justify-between px-5 pt-4 pb-2 z-20">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú lateral"
          aria-expanded={menuOpen}
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-[#F8E6C1] transition duration-200 border border-white/10 backdrop-blur-sm"
        >
          <Menu className="w-6 h-6 stroke-[1.8]" />
        </button>

        <div className="flex items-center gap-2">
          <DiscreetAdminButton />

          {isInstallable && (
            <button
              type="button"
              onClick={install}
              aria-label="Instalar aplicación"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4AF37]/90 text-[#1A1A1A] font-semibold text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => goTo('/menu')}
            aria-label="Buscar platos y bebidas"
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-[#F8E6C1] transition duration-200 border border-white/10 backdrop-blur-sm"
          >
            <Search className="w-6 h-6 stroke-[1.8]" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <nav
            aria-label="Navegación principal"
            className="relative h-full w-[min(85vw,340px)] bg-[#17120E] border-r border-[#D4AF37]/30 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-7 border-b border-[#D4AF37]/20">
              <div>
                <p className="font-serif text-2xl text-[#F8E6C1] font-bold">D’BATULE</p>
                <p className="text-[10px] tracking-[0.3em] text-[#D4AF37] uppercase">Restaurante</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full border border-white/15 text-[#F8E6C1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
              {links.map(({ label, path, Icon }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => goTo(path)}
                  className="w-full flex items-center gap-4 rounded-xl px-4 py-4 text-left text-[#F8E6C1] hover:bg-[#D4AF37]/10 active:bg-[#D4AF37]/20 transition"
                >
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>

            <div className="px-6 py-6 border-t border-[#D4AF37]/20">
              <p className="text-center text-xs tracking-widest text-[#D4AF37]/80">
                LA HABANA · CUBA
              </p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
