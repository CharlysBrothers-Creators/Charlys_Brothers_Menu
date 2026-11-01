import React from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { resolveAssetUrl } from '../../utils/assetHelper';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="relative h-screen w-full bg-[#0D0A08] flex items-center justify-center p-0 md:p-3 overflow-hidden selection:bg-[#D4AF37]/30 selection:text-[#F8E6C1]">
      {/* Ambient background for desktop view */}
      <div
        className="fixed inset-0 pointer-events-none hidden md:block bg-cover bg-center opacity-25 filter blur-xl scale-105"
        style={{ backgroundImage: `url('${resolveAssetUrl('/images/restaurant-ambience.jpg')}')` }}
      />
      <div className="fixed inset-0 pointer-events-none hidden md:block bg-gradient-to-b from-[#0D0A08]/90 via-[#0D0A08]/85 to-[#0D0A08]" />

      {/* Main container: Full-bleed on mobile, smartphone mockup for catalog/checkout, wide responsive canvas for admin */}
      <main
        className={`relative w-full h-[100dvh] overflow-hidden flex flex-col bg-[#120F0D] transition-all duration-200 ${
          isAdmin
            ? 'md:max-w-6xl xl:max-w-7xl md:h-[min(96vh,960px)] md:rounded-3xl md:border md:border-[#2B231D] md:shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
            : 'md:max-w-[430px] md:h-[min(94vh,880px)] md:rounded-[44px] md:border-[7px] md:border-[#2B231D] md:shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* Subtle iOS status bar for desktop phone frame (only on customer routes) */}
        {!isAdmin && (
          <div className="hidden md:flex items-center justify-between px-7 pt-3.5 pb-1 text-[11px] font-semibold text-white/70 select-none z-30 flex-shrink-0">
            <span>9:41</span>
            <div className="w-20 h-4 bg-black/60 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-white/80 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* Content viewport: Unico contenedor principal de desplazamiento vertical con margen para la barra inferior */}
        <div className="relative flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden scrollbar-none overscroll-contain">
          {children}
        </div>

        {/* Fixed Bottom Navigation (Client & Admin independent) */}
        <BottomNavigation />
      </main>
    </div>
  );
};
