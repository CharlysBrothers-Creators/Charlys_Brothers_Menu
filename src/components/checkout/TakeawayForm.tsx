import React from 'react';
import { TakeawayData } from '../../types/checkout';
import { Clock, Info } from 'lucide-react';

interface TakeawayFormProps {
  data: TakeawayData;
  notice: string;
  errors: Record<string, string>;
  onChange: (updated: Partial<TakeawayData>) => void;
}

export const TakeawayForm: React.FC<TakeawayFormProps> = ({
  data,
  notice,
  errors,
  onChange,
}) => {
  return (
    <div className="space-y-3 text-stone-200">
      {/* Notice box */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#1C1710] border border-[#D4AF37]/30 text-stone-300 text-xs">
        <Clock className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-stone-300 leading-snug">
          {notice}
        </p>
      </div>

      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-3 sm:p-4 space-y-3 shadow-xs">
        {/* Name (Required) */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Nombre de contacto <span className="text-[#D4AF37]">*</span>
          </label>
          <input
            type="text"
            value={data.customerName || ''}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="Ej. Laura Morales"
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
          {errors.customerName && (
            <p className="text-[11px] text-[#E63946] font-medium mt-1">
              {errors.customerName}
            </p>
          )}
        </div>

        {/* Phone (Required) */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Teléfono de contacto <span className="text-[#D4AF37]">*</span>
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="Ej. +53 5 123 4567"
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
          {errors.phone && (
            <p className="text-[11px] text-[#E63946] font-medium mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Observaciones o preferencias{' '}
            <span className="text-[10px] text-stone-400 font-normal lowercase">
              (opcional)
            </span>
          </label>
          <textarea
            rows={2}
            value={data.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Ej. Llevar cubiertos desechables, empacar en bolsas separadas..."
            className="w-full px-3 py-1.5 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition resize-none"
          />
        </div>
      </div>
    </div>
  );
};
