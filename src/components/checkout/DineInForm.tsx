import React, { useMemo, useState } from 'react';
import { DemoTable, ServiceRhythm } from '../../config/orderSettings';
import { DineInData, parseCoursePass, formatCoursePassLabel } from '../../types/checkout';
import { CartItem } from '../../types/cart';
import { Check, Clock, Plus } from 'lucide-react';

interface DineInFormProps {
  data: DineInData;
  tables: DemoTable[];
  cartItems: CartItem[];
  errors: Record<string, string>;
  onChange: (updated: Partial<DineInData>) => void;
}

export const DineInForm: React.FC<DineInFormProps> = ({
  data,
  tables,
  cartItems,
  errors,
  onChange,
}) => {
  // Group demo tables by zone
  const tablesByZone = useMemo(() => {
    const grouped: Record<string, DemoTable[]> = {};
    tables.forEach((t) => {
      if (!grouped[t.zone]) grouped[t.zone] = [];
      grouped[t.zone].push(t);
    });
    return grouped;
  }, [tables]);

  const serviceRhythms: { id: ServiceRhythm; label: string; desc: string }[] = [
    {
      id: 'all_together',
      label: 'Todo junto',
      desc: 'Servir todos los productos juntos.',
    },
    {
      id: 'drinks_first',
      label: 'Bebidas primero',
      desc: 'Servir primero las bebidas y luego los alimentos.',
    },
    {
      id: 'staged',
      label: 'Servicio escalonado',
      desc: 'Indicar el orden de pase de cada producto (1.º pase, 2.º pase, etc.).',
    },
  ];

  // Dynamic pass count: at least 2, or highest currently assigned, plus any manually added
  const [extraPassCount, setExtraPassCount] = useState<number>(0);

  const availablePasses = useMemo(() => {
    const currentAssignments = data.stagedAssignments || {};
    const assigned = Object.values(currentAssignments).map((val) => parseCoursePass(val));
    const maxAssigned = assigned.length > 0 ? Math.max(...assigned) : 2;
    const count = Math.min(Math.max(2, maxAssigned, extraPassCount), 6);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [data.stagedAssignments, extraPassCount]);

  // Reconcile staged assignments: prune removed lines, ensure all current cart items have an assignment
  React.useEffect(() => {
    if (data.serviceRhythm !== 'staged') return;

    const currentAssignments = data.stagedAssignments || {};
    const validLineIds = new Set(cartItems.map((c) => c.id));
    let hasChanges = false;
    const reconciled: Record<string, number> = {};

    cartItems.forEach((item) => {
      if (currentAssignments[item.id] !== undefined) {
        reconciled[item.id] = parseCoursePass(currentAssignments[item.id]);
      } else {
        reconciled[item.id] = 1;
        hasChanges = true;
      }
    });

    // Check if obsolete keys existed
    for (const key of Object.keys(currentAssignments)) {
      if (!validLineIds.has(key)) {
        hasChanges = true;
      }
    }

    if (hasChanges) {
      onChange({ stagedAssignments: reconciled });
    }
  }, [data.serviceRhythm, cartItems, data.stagedAssignments, onChange]);

  const handleStageAssignment = (lineId: string, course: number) => {
    const current = data.stagedAssignments || {};
    onChange({
      stagedAssignments: {
        ...current,
        [lineId]: course,
      },
    });
  };

  const handleAddPass = () => {
    const nextCount = Math.min(availablePasses.length + 1, 6);
    setExtraPassCount(nextCount);
  };

  return (
    <div className="space-y-3 text-stone-200">
      {/* 1. Table Selector */}
      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-xs">
        <div className="flex items-baseline justify-between">
          <label className="text-xs font-bold text-[#F8E6C1] uppercase tracking-wider">
            Número de Mesa <span className="text-[#D4AF37]">*</span>
          </label>
          <span className="text-[10px] text-stone-400">
            Mesas de demostración
          </span>
        </div>

        {/* Zones / Tables grid */}
        <div className="space-y-2">
          {Object.entries(tablesByZone).map(([zone, zoneTables]) => (
            <div key={zone} className="space-y-1">
              <span className="text-[10px] text-stone-400 font-medium px-0.5">
                {zone}
              </span>
              <div className="grid grid-cols-3 min-[380px]:grid-cols-4 sm:grid-cols-5 gap-1.5">
                {zoneTables.map((t) => {
                  const isSelected = data.tableId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onChange({ tableId: t.id })}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer truncate ${
                        isSelected
                          ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-[0_0_10px_rgba(212,175,55,0.3)] scale-[1.02]'
                          : 'bg-[#1F1813] border border-white/8 text-stone-300 hover:border-[#D4AF37]/40'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {errors.tableId && (
          <p className="text-[11px] text-[#E63946] font-medium pt-1">
            {errors.tableId}
          </p>
        )}
      </div>

      {/* 2. Customer Name (Optional) & Notes (Optional) */}
      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Nombre del cliente{' '}
            <span className="text-[10px] text-stone-400 font-normal lowercase">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            value={data.customerName || ''}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="Ej. Carlos o Mesa de Familia"
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Observaciones o peticiones al camarero{' '}
            <span className="text-[10px] text-stone-400 font-normal lowercase">
              (opcional)
            </span>
          </label>
          <textarea
            rows={2}
            value={data.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Ej. Hielo aparte, platos calientes..."
            className="w-full px-3 py-1.5 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition resize-none"
          />
        </div>
      </div>

      {/* 3. Service Rhythm Selector */}
      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-3 sm:p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          <div>
            <h4 className="text-xs font-bold text-[#F8E6C1] uppercase tracking-wider">
              Ritmo de Servicio
            </h4>
            <p className="text-[11px] text-stone-400">
              ¿Cómo prefieres que se preparen y sirvan tus platos en la mesa?
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {serviceRhythms.map((rhythm) => {
            const isSelected = data.serviceRhythm === rhythm.id;

            return (
              <button
                key={rhythm.id}
                type="button"
                onClick={() => onChange({ serviceRhythm: rhythm.id })}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#1F1812] border-[#D4AF37] text-[#F8E6C1]'
                    : 'bg-[#1F1813] border-white/8 text-stone-300 hover:border-[#D4AF37]/40'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-[#1A1A1A]'
                      : 'border-stone-500'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>

                <div>
                  <span className="text-xs font-semibold block">
                    {rhythm.label}
                  </span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    {rhythm.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Staged service item classification breakdown */}
        {data.serviceRhythm === 'staged' && (
          <div className="mt-3 pt-3 border-t border-white/8 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37]">
                Asignación de Pases por Plato:
              </span>
              {availablePasses.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddPass}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#D4AF37] hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir pase ({availablePasses.length + 1}.º)</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-stone-400">
              Asigna a qué pase pertenece cada plato según tu preferencia de servicio en mesa.
            </p>

            <div className="space-y-2">
              {cartItems.map((item) => {
                const currentPass = parseCoursePass(data.stagedAssignments?.[item.id]);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-[#1A1511] border border-white/5 gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-stone-200 block truncate">
                        {item.quantity}x {item.productName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                      {availablePasses.map((passNum) => {
                        const isCurrent = currentPass === passNum;
                        return (
                          <button
                            key={passNum}
                            type="button"
                            onClick={() => handleStageAssignment(item.id, passNum)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-[#D4AF37] text-[#1A1A1A] shadow-xs'
                                : 'bg-white/5 text-stone-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {formatCoursePassLabel(passNum)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

