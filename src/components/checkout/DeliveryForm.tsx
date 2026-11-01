/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { DeliveryData } from '../../types/checkout';
import { DeliveryRate } from '../../types/deliveryRate';
import { MapPin, Info, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { OFFICIAL_DELIVERY_RATES, getUniqueMunicipalities } from '../../data/officialDeliveryRates';
import { formatCUP } from '../../services/cartCalculations';

interface DeliveryFormProps {
  data: DeliveryData;
  notice: string;
  errors: Record<string, string>;
  rates?: DeliveryRate[];
  onChange: (updated: Partial<DeliveryData>) => void;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  data,
  notice,
  errors,
  rates = OFFICIAL_DELIVERY_RATES,
  onChange,
}) => {
  // Extract unique active municipalities
  const activeRates = useMemo(() => {
    return rates.length > 0 ? rates.filter((r) => r.active) : OFFICIAL_DELIVERY_RATES;
  }, [rates]);

  const municipalities = useMemo(() => {
    return getUniqueMunicipalities(activeRates);
  }, [activeRates]);

  const selectedMunicipality = data.municipality || '';
  const selectedZoneId = data.zoneId || '';

  // Filter zones for the selected municipality
  const availableZones = useMemo(() => {
    if (!selectedMunicipality || selectedMunicipality === '__other__') return [];
    return activeRates
      .filter((r) => r.municipality.toLowerCase() === selectedMunicipality.toLowerCase())
      .sort((a, b) => a.zone.localeCompare(b.zone));
  }, [activeRates, selectedMunicipality]);

  // Handle municipality change
  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mun = e.target.value;
    if (mun === '__other__') {
      onChange({
        municipality: '__other__',
        zoneId: '__unlisted__',
        zoneName: 'Destino no listado',
        deliveryFee: null,
        isFeePending: true,
      });
    } else if (!mun) {
      onChange({
        municipality: '',
        zoneId: '',
        zoneName: '',
        customZoneName: '',
        deliveryFee: null,
        isFeePending: false,
      });
    } else {
      onChange({
        municipality: mun,
        zoneId: '',
        zoneName: '',
        customZoneName: '',
        deliveryFee: null,
        isFeePending: false,
      });
    }
  };

  // Handle zone change
  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__unlisted__') {
      onChange({
        zoneId: '__unlisted__',
        zoneName: data.customZoneName || 'Destino por consultar',
        deliveryFee: null,
        isFeePending: true,
      });
      return;
    }

    const foundRate = availableZones.find((z) => z.id === val);
    if (foundRate) {
      if (foundRate.isConsult || foundRate.price === null) {
        onChange({
          zoneId: foundRate.id,
          zoneName: foundRate.zone,
          customZoneName: '',
          deliveryFee: null,
          isFeePending: true,
        });
      } else {
        onChange({
          zoneId: foundRate.id,
          zoneName: foundRate.zone,
          customZoneName: '',
          deliveryFee: foundRate.price,
          isFeePending: false,
        });
      }
    } else {
      onChange({
        zoneId: '',
        zoneName: '',
        deliveryFee: null,
        isFeePending: false,
      });
    }
  };

  return (
    <div className="space-y-3.5 text-stone-200">
      {/* Notice header */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#1C1710] border border-[#D4AF37]/35 text-stone-300 text-xs shadow-xs">
        <Info className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#F8E6C1] block mb-0.5 text-xs">
            Servicio de Entrega a Domicilio (La Habana)
          </span>
          <p className="text-[11px] text-stone-300">
            {notice || 'Selecciona tu municipio y reparto para calcular el costo de mensajería oficial. Los destinos especiales o no listados se coordinarán bajo cotización previa.'}
          </p>
        </div>
      </div>

      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-xs">
        {/* Row 1: Municipality & Zone Dependent Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Municipality Selector */}
          <div>
            <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
              Municipio <span className="text-[#D4AF37]">*</span>
            </label>
            <select
              value={selectedMunicipality}
              onChange={handleMunicipalityChange}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] transition cursor-pointer"
            >
              <option value="">Selecciona tu municipio...</option>
              {municipalities.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
              <option value="__other__">Otro municipio (Tarifa por consultar)</option>
            </select>
            {errors.municipality && (
              <p className="text-[11px] text-[#E63946] font-medium mt-1">
                {errors.municipality}
              </p>
            )}
          </div>

          {/* Zone / Reparto Selector (Dependent) */}
          <div>
            <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
              Zona o Reparto <span className="text-[#D4AF37]">*</span>
            </label>
            <select
              value={selectedZoneId}
              onChange={handleZoneChange}
              disabled={!selectedMunicipality || selectedMunicipality === '__other__'}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedMunicipality
                  ? 'Primero elige el municipio...'
                  : selectedMunicipality === '__other__'
                  ? 'Zona personalizada (ver abajo)'
                  : 'Selecciona tu zona o reparto...'}
              </option>
              {availableZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.zone} — {z.isConsult || z.price === null ? 'Por consultar' : formatCUP(z.price)}
                </option>
              ))}
              {selectedMunicipality && selectedMunicipality !== '__other__' && (
                <option value="__unlisted__">Otro reparto no listado (Consultar cotización)</option>
              )}
            </select>
            {errors.zone && (
              <p className="text-[11px] text-[#E63946] font-medium mt-1">
                {errors.zone}
              </p>
            )}
          </div>
        </div>

        {/* Custom Unlisted Zone Field (when unlisted is chosen) */}
        {(selectedZoneId === '__unlisted__' || selectedMunicipality === '__other__') && (
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Destino para cotización personalizada</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Introduce el nombre de tu reparto o localidad. El costo de mensajería se coordinará directamente contigo antes de preparar el pedido.
            </p>
            <input
              type="text"
              value={data.customZoneName || ''}
              onChange={(e) =>
                onChange({
                  customZoneName: e.target.value,
                  zoneName: e.target.value.trim() || 'Zona por consultar',
                })
              }
              placeholder="Ej. Managua más allá de la curva, Reparto Chibás sector 3..."
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
            />
          </div>
        )}

        {/* Dynamic Delivery Rate Indicator Card */}
        {data.deliveryFee !== null && data.deliveryFee !== undefined && !data.isFeePending && (
          <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/35 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Tarifa fija de mensajería para <strong>{data.zoneName}</strong>:
              </span>
            </div>
            <span className="font-display font-bold text-sm text-[#F8E6C1] flex-shrink-0">
              +{formatCUP(data.deliveryFee)}
            </span>
          </div>
        )}

        {data.isFeePending && (
          <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-500/35 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Tarifa de mensajería para <strong>{data.zoneName || 'esta zona'}</strong>:
              </span>
            </div>
            <span className="font-semibold text-xs text-amber-300 uppercase tracking-wide flex-shrink-0">
              Por confirmar
            </span>
          </div>
        )}

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Nombre de quien recibe <span className="text-[#D4AF37]">*</span>
          </label>
          <input
            type="text"
            value={data.customerName || ''}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="Ej. Manuel Fernández"
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
          {errors.customerName && (
            <p className="text-[11px] text-[#E63946] font-medium mt-1">
              {errors.customerName}
            </p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Teléfono de contacto <span className="text-[#D4AF37]">*</span>
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="Ej. +53 5 987 6543"
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
          {errors.phone && (
            <p className="text-[11px] text-[#E63946] font-medium mt-1">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Dirección exacta de entrega <span className="text-[#D4AF37]">*</span>
          </label>
          <input
            type="text"
            value={data.address || ''}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Ej. Calle 23 #456 e/ H e I, Apto 4B"
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
          {errors.address && (
            <p className="text-[11px] text-[#E63946] font-medium mt-1">
              {errors.address}
            </p>
          )}
        </div>

        {/* Landmarks / References */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Puntos de referencia para el mensajero{' '}
            <span className="text-[10px] text-stone-400 font-normal lowercase">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            value={data.landmarks || ''}
            onChange={(e) => onChange({ landmarks: e.target.value })}
            placeholder="Ej. Timbre blanco, edificio azul frente al parque..."
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
            Notas especiales sobre la entrega{' '}
            <span className="text-[10px] text-stone-400 font-normal lowercase">
              (opcional)
            </span>
          </label>
          <textarea
            rows={2}
            value={data.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Instrucciones adicionales para la entrega..."
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition resize-none"
          />
        </div>
      </div>
    </div>
  );
};
