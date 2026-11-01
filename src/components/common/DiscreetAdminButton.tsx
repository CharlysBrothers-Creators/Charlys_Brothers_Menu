/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { isDevOrAdminDemoEnabled } from '../../utils/devEnvironment';

interface DiscreetAdminButtonProps {
  className?: string;
}

export const DiscreetAdminButton: React.FC<DiscreetAdminButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Strict check: Only visible in dev/AI Studio preview sandboxes
  if (!isDevOrAdminDemoEnabled()) {
    return null;
  }

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <button
      type="button"
      onClick={() => navigate(isAdmin ? '/' : '/admin')}
      title={isAdmin ? 'Volver a la vista del cliente' : 'Acceso administrativo de desarrollo (/admin)'}
      aria-label="Acceso al panel administrativo DEMO"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold tracking-wide transition-all active:scale-95 cursor-pointer select-none ${
        isAdmin
          ? 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15'
          : 'bg-black/60 hover:bg-[#1C1611] text-[#D4AF37] border border-[#D4AF37]/45 hover:border-[#D4AF37] shadow-xs'
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
      <ChefHat className="w-3.5 h-3.5 text-[#D4AF37] stroke-[2.2] flex-shrink-0" />
      <span className="font-display font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
        {isAdmin ? 'Cliente' : 'Admin'}
      </span>
    </button>
  );
};
