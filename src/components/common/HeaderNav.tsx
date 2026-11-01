import React, { useState } from 'react';
import { Menu, Search, Download } from 'lucide-react';
import { PendingModal } from './PendingModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { DiscreetAdminButton } from './DiscreetAdminButton';

export const HeaderNav: React.FC = () => {
  const [pendingFeature, setPendingFeature] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  const { isInstallable, install } = usePWAInstall();

  const handleMenuClick = () => {
    setPendingFeature({
      isOpen: true,
      title: 'Menú lateral en desarrollo',
      description:
        'El panel de navegación lateral se implementará en la Fase 2 del proyecto junto con las secciones completas del restaurante.',
    });
  };

  const handleSearchClick = () => {
    setPendingFeature({
      isOpen: true,
      title: 'Búsqueda en desarrollo',
      description:
        'El buscador inteligente de platos, bebidas y especialidades estará disponible una vez conectado el catálogo en la siguiente fase.',
    });
  };

  return (
    <>
      <header className="w-full flex items-center justify-between px-5 pt-4 pb-2 z-20">
        {/* Left Hamburger Button */}
        <button
          onClick={handleMenuClick}
          aria-label="Menú lateral (pendiente de implementación)"
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-[#F8E6C1] transition duration-200 border border-white/10 backdrop-blur-sm"
          title="Menú lateral"
        >
          <Menu className="w-6 h-6 stroke-[1.8]" />
        </button>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Discreet Admin Button for development */}
          <DiscreetAdminButton />

          {/* Quick PWA Install Icon Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              aria-label="Instalar aplicación PWA"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4AF37]/90 text-[#1A1A1A] font-semibold text-xs shadow-md hover:bg-[#F8E6C1] active:scale-95 transition"
              title="Instalar D’Batule en tu dispositivo"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}

          {/* Right Search Button */}
          <button
            onClick={handleSearchClick}
            aria-label="Buscar en el menú (pendiente de implementación)"
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-[#F8E6C1] transition duration-200 border border-white/10 backdrop-blur-sm"
            title="Búsqueda"
          >
            <Search className="w-6 h-6 stroke-[1.8]" />
          </button>
        </div>
      </header>

      {/* Non-intrusive Pending notification modal */}
      <PendingModal
        isOpen={pendingFeature.isOpen}
        onClose={() => setPendingFeature((prev) => ({ ...prev, isOpen: false }))}
        title={pendingFeature.title}
        description={pendingFeature.description}
      />
    </>
  );
};
