import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar en el menú...',
  resultsCount,
}) => {
  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-[#D4AF37] pointer-events-none stroke-[2.2]" />
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar en el catálogo"
          className="w-full bg-[#1A1A1A] text-stone-100 placeholder-stone-400 text-sm rounded-xl pl-10 pr-9 py-2.5 border border-white/10 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
        />

        {value && (
          <button
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 p-1 rounded-full text-stone-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {value && resultsCount !== undefined && (
        <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] text-stone-400">
          <span>Coincidencias encontradas:</span>
          <span className="font-semibold text-[#D4AF37]">{resultsCount} platos</span>
        </div>
      )}
    </div>
  );
};
