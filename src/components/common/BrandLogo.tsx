import React from 'react';

interface BrandLogoProps {
  name?: string;
  category?: string;
  slogan?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  name = 'D’BATULE',
  category = 'RESTAURANTE',
  slogan = 'Buena comida, buenos momentos',
}) => {
  return (
    <div className="flex flex-col items-center text-center select-none">
      {/* Chef Hat Emblem */}
      <div className="relative mb-2 flex items-center justify-center">
        <svg
          className="w-14 h-14 md:w-16 md:h-16 text-[#D4AF37] drop-shadow-[0_4px_12px_rgba(212,175,55,0.3)] transition-transform duration-300 hover:scale-105"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chef Hat outline */}
          <path
            d="M32 10C26 10 22 14.5 20 18.5C16 18.5 12 22 12 27C12 31.5 14.5 35 18 36.5V48C18 49.6 19.4 51 21 51H43C44.6 51 46 49.6 46 48V36.5C49.5 35 52 31.5 52 27C52 22 48 18.5 44 18.5C42 14.5 38 10 32 10Z"
            stroke="currentColor"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Hat band detail */}
          <line
            x1="18"
            y1="43"
            x2="46"
            y2="43"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Center fold accent */}
          <path
            d="M32 12V24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
        </svg>
      </div>

      {/* Brand Title */}
      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.08em] gold-gradient-text drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        {name}
      </h1>

      {/* Category Subtitle */}
      <p className="mt-1 text-[11px] sm:text-xs font-medium tracking-[0.35em] text-[#F8E6C1]/80 uppercase">
        {category}
      </p>

      {/* Slogan in Elegant Script */}
      <p className="font-script mt-2 text-2xl sm:text-3xl text-white/95 font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transform -rotate-1">
        {slogan}
      </p>
    </div>
  );
};
