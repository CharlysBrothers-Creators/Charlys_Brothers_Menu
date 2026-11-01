import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeaderNav } from '../components/common/HeaderNav';
import { BrandLogo } from '../components/common/BrandLogo';
import { FeatureBadge } from '../components/common/FeatureBadge';
import { DBATULE_PROFILE } from '../config/business';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { name, category, slogan, location, features, heroImage } = DBATULE_PROFILE;

  return (
    <div className="relative flex flex-col justify-between min-h-full flex-1 select-none overflow-hidden">
      {/* Background culinary photography */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 hover:scale-105"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />

      {/* Dark gradient overlays for high visual contrast and cinematographic luxury */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120F0D]/90 via-[#120F0D]/40 to-[#120F0D]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-black/40 to-black/80 pointer-events-none" />

      {/* Top Section: Navigation Header */}
      <div className="relative z-20 flex flex-col w-full">
        <HeaderNav />

        {/* Brand Logo & Slogan */}
        <div className="mt-4 px-6 flex flex-col items-center">
          <BrandLogo name={name} category={category} slogan={slogan} />
        </div>
      </div>

      {/* Middle Spacer for Gastronomic Visual Focus */}
      <div className="relative z-10 flex-1 min-h-[120px] flex items-center justify-center pointer-events-none">
        {/* Subtle culinary badge pulse */}
        <div className="px-3 py-1 rounded-full bg-black/40 border border-[#D4AF37]/30 backdrop-blur-md flex items-center gap-1.5 opacity-90 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[11px] font-medium tracking-wider text-[#F8E6C1] uppercase">
            Experiencia Gastronómica
          </span>
        </div>
      </div>

      {/* Bottom Section: Features, CTA and Location */}
      <div className="relative z-20 flex flex-col w-full px-5 pb-6 pt-4 bg-gradient-to-t from-[#120F0D] via-[#120F0D]/90 to-transparent">
        {/* 4 Feature Badges */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 items-start">
          {features.map((feature) => (
            <FeatureBadge key={feature.id} feature={feature} />
          ))}
        </div>

        {/* Main CTA Button: Ver nuestro menú */}
        <button
          onClick={() => navigate('/menu')}
          className="group relative w-full py-4 px-6 rounded-2xl gold-button-gradient text-[#1A1A1A] font-semibold text-base sm:text-lg shadow-[0_8px_25px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(212,175,55,0.5)] active:scale-[0.98] cursor-pointer"
        >
          <span className="tracking-wide">Ver nuestro menú</span>
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 stroke-[2.2]" />
        </button>

        {/* Discreet Location Indicator */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-[#D4AF37]/80">
            <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
            <svg
              className="w-3.5 h-3.5 text-[#D4AF37]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="text-[11px] font-medium tracking-[0.25em] text-[#F8E6C1]/80 uppercase">
              {location}
            </span>
            <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
          </div>

          {/* Bottom home bar indicator */}
          <div className="mt-4 w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};
