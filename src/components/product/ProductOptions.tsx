import React, { useState, useEffect, useMemo } from 'react';
import { CustomizationGroup, CustomOption } from '../../types/productOptions';
import { CartOptionItem } from '../../types/cart';
import { Settings2, Plus, Minus, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductOptionsProps {
  groups?: CustomizationGroup[];
  onRecargoChange: (totalRecargo: number) => void;
  onOptionsChange?: (options: CartOptionItem[], totalRecargo: number) => void;
}

export const ProductOptions: React.FC<ProductOptionsProps> = ({
  groups,
  onRecargoChange,
  onOptionsChange,
}) => {
  // Estado para opciones seleccionadas de tipo single: { [groupId]: optionId }
  const [singleSelections, setSingleSelections] = useState<Record<string, string>>({});
  // Estado para opciones seleccionadas de tipo multiple: string[] (array de optionIds)
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  // Inicializar selecciones predeterminadas cuando cambian los grupos
  useEffect(() => {
    if (!groups || groups.length === 0) return;

    const initialSingle: Record<string, string> = {};
    const initialMulti: string[] = [];

    groups.forEach((group) => {
      if (group.type === 'single') {
        const defaultOpt = group.options.find((o) => o.defaultSelected) || group.options[0];
        if (defaultOpt) {
          initialSingle[group.id] = defaultOpt.id;
        }
      } else {
        group.options.forEach((opt) => {
          if (opt.defaultSelected) {
            initialMulti.push(opt.id);
          }
        });
      }
    });

    setSingleSelections(initialSingle);
    setMultiSelections(initialMulti);
  }, [groups]);

  // Recopilar objetos de opciones seleccionadas
  const selectedCartOptions = useMemo<CartOptionItem[]>(() => {
    if (!groups || groups.length === 0) return [];
    const list: CartOptionItem[] = [];

    groups.forEach((group) => {
      if (group.type === 'single') {
        const selectedId = singleSelections[group.id];
        const opt = group.options.find((o) => o.id === selectedId);
        if (opt) {
          list.push({
            id: opt.id,
            name: opt.name,
            groupId: group.id,
            groupTitle: group.title,
            type: opt.type,
            priceAdjustment: Math.max(0, opt.priceAdjustment || 0),
          });
        }
      } else {
        group.options.forEach((opt) => {
          if (multiSelections.includes(opt.id)) {
            list.push({
              id: opt.id,
              name: opt.name,
              groupId: group.id,
              groupTitle: group.title,
              type: opt.type,
              priceAdjustment: Math.max(0, opt.priceAdjustment || 0),
            });
          }
        });
      }
    });

    return list;
  }, [groups, singleSelections, multiSelections]);

  // Calcular ajuste total de precio desacoplado
  const totalAdjustment = useMemo(() => {
    return selectedCartOptions.reduce((sum, opt) => sum + opt.priceAdjustment, 0);
  }, [selectedCartOptions]);

  // Notificar al componente padre cuando cambian las opciones o el recargo
  useEffect(() => {
    onRecargoChange(totalAdjustment);
    if (onOptionsChange) {
      onOptionsChange(selectedCartOptions, totalAdjustment);
    }
  }, [totalAdjustment, selectedCartOptions, onRecargoChange, onOptionsChange]);

  // Si no hay grupos o están vacíos, no renderizar nada (sin espacios vacíos)
  if (!groups || groups.length === 0) {
    return null;
  }

  const handleSingleSelect = (groupId: string, optionId: string) => {
    setSingleSelections((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };

  const handleMultiToggle = (optionId: string) => {
    setMultiSelections((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  return (
    <div className="w-full bg-[#16120E] border border-white/8 rounded-2xl p-4 shadow-sm select-none transition-all space-y-4">
      {/* Header with collapse toggle */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-start gap-2.5">
          <Settings2 className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" strokeWidth={2.2} />
          <div>
            <h3 className="font-display text-sm sm:text-base font-semibold text-[#F8E6C1]">
              Opciones y Personalizaciones{' '}
              <span className="text-xs font-normal text-stone-400">(opcionales)</span>
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Solicita tu pedido con tus preferencias y extras.
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isOpen ? 'Cerrar opciones' : 'Abrir opciones'}
          className="p-1 text-stone-400 hover:text-white transition"
        >
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
          )}
        </button>
      </div>

      {/* Groups Container */}
      {isOpen && (
        <div className="space-y-4 pt-1">
          {groups.map((group) => (
            <div key={group.id} className="space-y-2 pt-2 border-t border-white/5 first:border-t-0 first:pt-0">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-[#F8E6C1]/90">
                  {group.title}
                </span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                  {group.type === 'single' ? 'Selección única' : 'Opciones múltiples'}
                </span>
              </div>

              {group.description && (
                <p className="text-[11px] text-stone-400">
                  {group.description}
                </p>
              )}

              {/* Options list */}
              <div className="flex flex-wrap gap-2 pt-1">
                {group.options.map((opt) => {
                  // Caso 1: Selección única (variantes)
                  if (group.type === 'single') {
                    const isSelected = singleSelections[group.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSingleSelect(group.id, opt.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F8E6C1] shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                            : 'bg-[#1F1813] border border-white/8 text-stone-300 hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#D4AF37] bg-[#D4AF37] text-[#1A1A1A]'
                              : 'border-stone-500'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{opt.name}</span>
                        {opt.priceAdjustment > 0 && (
                          <span className="text-[10px] text-[#D4AF37] font-semibold">
                            +${opt.priceAdjustment}
                          </span>
                        )}
                      </button>
                    );
                  }

                  // Caso 2: Selección múltiple (extras con/sin recargo y exclusiones)
                  const isSelected = multiSelections.includes(opt.id);

                  if (opt.type === 'remove') {
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleMultiToggle(opt.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#E63946]/20 border border-[#E63946] text-[#F8E6C1] shadow-[0_0_10px_rgba(230,57,70,0.2)]'
                            : 'bg-[#1F1813] border border-white/8 text-stone-300 hover:border-[#E63946]/40'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-[#E63946] text-white' : 'bg-white/10 text-stone-400'
                          }`}
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className={isSelected ? 'line-through text-stone-300' : ''}>
                          {opt.name}
                        </span>
                      </button>
                    );
                  }

                  // Extras (gratuitos o con recargo)
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleMultiToggle(opt.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F8E6C1] shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                          : 'bg-[#1F1813] border border-white/8 text-stone-300 hover:border-[#D4AF37]/40'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-[#D4AF37] text-[#1A1A1A]' : 'bg-white/10 text-[#D4AF37]'
                        }`}
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{opt.name}</span>
                      {opt.priceAdjustment > 0 ? (
                        <span className="text-[10px] text-[#D4AF37] font-semibold">
                          +${opt.priceAdjustment}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#D4AF37]/80 font-normal">
                          (Gratis)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
