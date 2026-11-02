import React from 'react';
import { Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { DiscreetAdminButton } from './DiscreetAdminButton';

export const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="w-full flex items-center justify-end px-5 pt-4 pb-2 z-20">
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
          onClick={() => navigate('/menu')}
          aria-label="Buscar platos y bebidas"
          className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 text-[#F8E6C1] transition duration-200 border border-white/10 backdrop-blur-sm"
        >
          <Search className="w-6 h-6 stroke-[1.8]" />
        </button>
      </div>
    </header>
  );
};
