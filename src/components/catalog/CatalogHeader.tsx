import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DBATULE_PROFILE } from '../../config/business';
import { CartButton } from '../cart/CartButton';
import { DiscreetAdminButton } from '../common/DiscreetAdminButton';

interface CatalogHeaderProps {
  title?: string;
  subtitle?: string;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  title = DBATULE_PROFILE.name,
  subtitle = DBATULE_PROFILE.category,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full px-3.5 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#2B1F14]/70 select-none">
      {/* Primary Return Button to Home */}
      <button
        onClick={() => navigate('/')}
        aria-label="Volver a la portada"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 active:scale-95 border border-[#D4AF37]/35 text-[#F8E6C1] transition-all cursor-pointer shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.2] text-[#D4AF37]" />
        <span className="text-xs font-semibold tracking-wide">Portada</span>
      </button>

      {/* Center Logo branding */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4.5 h-4.5 text-[#D4AF37]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M32 10C26 10 22 14.5 20 18.5C16 18.5 12 22 12 27C12 31.5 14.5 35 18 36.5V48C18 49.6 19.4 51 21 51H43C44.6 51 46 49.6 46 48V36.5C49.5 35 52 31.5 52 27C52 22 48 18.5 44 18.5C42 14.5 38 10 32 10Z" />
            <line x1="18" y1="43" x2="46" y2="43" strokeWidth="2.5" />
          </svg>
          <span className="font-display text-base sm:text-lg font-bold tracking-wider gold-gradient-text">
            {title}
          </span>
        </div>
        <span className="text-[9px] tracking-[0.25em] text-[#F8E6C1]/70 uppercase">
          {subtitle}
        </span>
      </div>

      {/* Currency badge, Admin Dev link & Cart Access */}
      <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
        <DiscreetAdminButton />
        <span className="text-[10px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 hidden sm:inline">
          CUP
        </span>
        <CartButton />
      </div>
    </div>
  );
};
