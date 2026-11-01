/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RotateCcw,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  DollarSign,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { DeliveryRate } from '../../types/deliveryRate';
import { adminRepository } from '../../services/adminRepository';
import { getUniqueMunicipalities, OFFICIAL_DELIVERY_RATES } from '../../data/officialDeliveryRates';
import { formatCUP } from '../../services/cartCalculations';

interface AdminDeliveryRatesSectionProps {
  rates: DeliveryRate[];
  onRefresh: () => Promise<void>;
  onTriggerToast: (msg: string) => void;
}

export const AdminDeliveryRatesSection: React.FC<AdminDeliveryRatesSectionProps> = ({
  rates,
  onRefresh,
  onTriggerToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(false);

  // Modal / Form state for Add or Edit
  const [editingRate, setEditingRate] = useState<DeliveryRate | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    municipality: string;
    newMunicipality: string;
    zone: string;
    price: string;
    isConsult: boolean;
    active: boolean;
    notes: string;
  }>({
    municipality: '',
    newMunicipality: '',
    zone: '',
    price: '',
    isConsult: false,
    active: true,
    notes: '',
  });

  // Modal for restore confirmation
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // List of unique municipalities
  const municipalities = useMemo(() => {
    const list = getUniqueMunicipalities(rates);
    return list;
  }, [rates]);

  // Filtered rates list
  const filteredRates = useMemo(() => {
    return rates.filter((r) => {
      // Municipality filter
      if (selectedMunicipality !== 'all' && r.municipality.toLowerCase() !== selectedMunicipality.toLowerCase()) {
        return false;
      }
      // Active filter
      if (filterActiveOnly && !r.active) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchZone = r.zone.toLowerCase().includes(q);
        const matchMun = r.municipality.toLowerCase().includes(q);
        if (!matchZone && !matchMun) return false;
      }
      return true;
    }).sort((a, b) => {
      if (a.municipality !== b.municipality) {
        return a.municipality.localeCompare(b.municipality);
      }
      return a.zone.localeCompare(b.zone);
    });
  }, [rates, selectedMunicipality, filterActiveOnly, searchQuery]);

  const openCreateModal = () => {
    setFormData({
      municipality: municipalities[0] || 'Playa',
      newMunicipality: '',
      zone: '',
      price: '1500',
      isConsult: false,
      active: true,
      notes: '',
    });
    setFormError(null);
    setIsCreating(true);
    setEditingRate(null);
  };

  const openEditModal = (rate: DeliveryRate) => {
    setEditingRate(rate);
    setFormData({
      municipality: rate.municipality,
      newMunicipality: '',
      zone: rate.zone,
      price: rate.price !== null ? rate.price.toString() : '',
      isConsult: rate.isConsult,
      active: rate.active,
      notes: rate.notes || '',
    });
    setFormError(null);
    setIsCreating(false);
  };

  const closeModal = () => {
    setEditingRate(null);
    setIsCreating(false);
    setFormError(null);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const targetMunicipality = formData.newMunicipality.trim() || formData.municipality.trim();
    const targetZone = formData.zone.trim();

    if (!targetMunicipality) {
      setFormError('Por favor especifica o selecciona un municipio.');
      return;
    }
    if (!targetZone) {
      setFormError('Por favor introduce el nombre de la zona o reparto.');
      return;
    }

    let parsedPrice: number | null = null;
    if (!formData.isConsult) {
      const num = parseInt(formData.price, 10);
      if (isNaN(num) || num < 0) {
        setFormError('Introduce una tarifa válida en CUP (número entero positivo) o marca «Tarifa por consultar».');
        return;
      }
      parsedPrice = num;
    }

    setSaving(true);
    try {
      if (isCreating) {
        await adminRepository.createDeliveryRate({
          municipality: targetMunicipality,
          zone: targetZone,
          price: parsedPrice,
          isConsult: formData.isConsult,
          active: formData.active,
          notes: formData.notes.trim() || undefined,
        });
        onTriggerToast(`Zona «${targetZone}» creada con éxito.`);
      } else if (editingRate) {
        await adminRepository.updateDeliveryRate(editingRate.id, {
          municipality: targetMunicipality,
          zone: targetZone,
          price: parsedPrice,
          isConsult: formData.isConsult,
          active: formData.active,
          notes: formData.notes.trim() || undefined,
        });
        onTriggerToast(`Tarifa de «${targetZone}» actualizada.`);
      }

      await onRefresh();
      closeModal();
    } catch (err: any) {
      setFormError(err.message || 'Error guardando la tarifa');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rate: DeliveryRate) => {
    try {
      await adminRepository.updateDeliveryRate(rate.id, {
        active: !rate.active,
      });
      await onRefresh();
      onTriggerToast(
        !rate.active
          ? `Destino «${rate.zone}» activado.`
          : `Destino «${rate.zone}» desactivado.`
      );
    } catch (err: any) {
      onTriggerToast(`Error al cambiar estado: ${err.message}`);
    }
  };

  const handleDeleteRate = async (rate: DeliveryRate) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la zona «${rate.zone}» de ${rate.municipality}?`)) {
      return;
    }
    try {
      await adminRepository.deleteDeliveryRate(rate.id);
      await onRefresh();
      onTriggerToast(`Zona «${rate.zone}» eliminada.`);
    } catch (err: any) {
      onTriggerToast(`Error al eliminar: ${err.message}`);
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      await adminRepository.restoreDefaultDeliveryRates();
      await onRefresh();
      setShowRestoreModal(false);
      onTriggerToast(`Se restauraron las ${OFFICIAL_DELIVERY_RATES.length} tarifas oficiales de La Habana.`);
    } catch (err: any) {
      onTriggerToast(`Error al restaurar: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Quick Summary */}
      <div className="p-4 rounded-2xl bg-[#16120E] border border-[#D4AF37]/30 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F8E6C1]">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>Tarifas Oficiales de Mensajería (La Habana)</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed max-w-2xl">
            Gestiona los precios de entrega a domicilio en CUP por municipio y reparto. Los destinos desactivados o no listados se cotizarán bajo modalidad «Tarifa por consultar» sin inventar recargos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nueva Zona</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRestoreModal(true)}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Restablecer las 89 tarifas oficiales iniciales"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar Oficiales</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-2xl bg-[#16120E] border border-white/8">
        {/* Search input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por zona, reparto o municipio..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Municipality Selector Dropdown */}
        <div className="sm:col-span-4">
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] transition cursor-pointer"
          >
            <option value="all">Todos los municipios ({municipalities.length})</option>
            {municipalities.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filter Toggle */}
        <div className="sm:col-span-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className={`w-full h-full py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              filterActiveOnly
                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F8E6C1]'
                : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3 text-[#D4AF37]" />
            <span className="truncate">{filterActiveOnly ? 'Solo activos' : 'Todos'}</span>
          </button>
        </div>
      </div>

      {/* Rates Table / Cards Responsive Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-stone-400">
          <span>
            Mostrando <strong className="text-[#F8E6C1]">{filteredRates.length}</strong> de{' '}
            {rates.length} destinos configurados
          </span>
          {selectedMunicipality !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedMunicipality('all')}
              className="text-[#D4AF37] hover:underline text-[11px]"
            >
              Ver todos los municipios
            </button>
          )}
        </div>

        {filteredRates.length === 0 ? (
          <div className="p-8 text-center bg-[#16120E] rounded-2xl border border-white/8 text-stone-400 text-xs space-y-2">
            <p>No se encontraron zonas que coincidan con los filtros aplicados.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMunicipality('all');
                setFilterActiveOnly(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] text-xs font-semibold transition"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredRates.map((rate) => (
              <div
                key={rate.id}
                className={`p-3.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3 ${
                  rate.active
                    ? 'bg-[#16120E] hover:bg-[#1B1511] border-white/8 hover:border-[#D4AF37]/40 shadow-xs'
                    : 'bg-[#14100D]/60 border-white/5 opacity-65'
                }`}
              >
                <div>
                  {/* Municipality badge + status toggle */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-stone-300 truncate max-w-[170px]">
                      {rate.municipality}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(rate)}
                      title={rate.active ? 'Haga clic para desactivar' : 'Haga clic para activar'}
                      className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition"
                    >
                      {rate.active ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[10px]">Activo</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-stone-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                          <span className="text-[10px]">Inactivo</span>
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Zone Name */}
                  <h3 className="font-display text-sm font-bold text-[#F8E6C1] line-clamp-1">
                    {rate.zone}
                  </h3>

                  {rate.notes && (
                    <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1 italic">
                      {rate.notes}
                    </p>
                  )}
                </div>

                {/* Price & Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="min-w-0">
                    {rate.isConsult || rate.price === null ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                        <HelpCircle className="w-3 h-3 text-amber-400" />
                        <span>Por consultar</span>
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="font-display font-bold text-base text-[#D4AF37]">
                          {formatCUP(rate.price)}
                        </span>
                        <span className="text-[10px] text-stone-500 uppercase">Tarifa</span>
                      </div>
                    )}
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(rate)}
                      aria-label={`Editar tarifa de ${rate.zone}`}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-[#D4AF37] transition cursor-pointer border border-white/10"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRate(rate)}
                      aria-label={`Eliminar tarifa de ${rate.zone}`}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Crear / Editar Zona */}
      {(isCreating || editingRate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-[#16120E] border border-[#D4AF37]/50 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-base font-bold text-[#F8E6C1]">
                  {isCreating ? 'Agregar Nueva Zona de Envío' : `Editar: ${editingRate?.zone}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-stone-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRate} className="space-y-3.5 text-xs text-stone-200">
              {/* Municipality Select or New */}
              <div>
                <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
                  Municipio <span className="text-[#D4AF37]">*</span>
                </label>
                <select
                  value={formData.municipality}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] transition mb-2"
                >
                  {municipalities.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="__other__">+ Nuevo municipio...</option>
                </select>

                {formData.municipality === '__other__' && (
                  <input
                    type="text"
                    value={formData.newMunicipality}
                    onChange={(e) => setFormData({ ...formData, newMunicipality: e.target.value })}
                    placeholder="Escribe el nombre del nuevo municipio..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-[#D4AF37]/50 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
                  />
                )}
              </div>

              {/* Zone / Reparto name */}
              <div>
                <label className="block text-xs font-bold text-[#F8E6C1] uppercase tracking-wider mb-1">
                  Zona / Reparto <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Ej. Poey, Fontanar, El Vedado..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 placeholder-stone-500 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
                />
              </div>

              {/* Rate Type: Fixed Price vs Consult */}
              <div className="p-3 rounded-2xl bg-[#1F1813] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F8E6C1] text-xs">Tipo de Tarifa</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isConsult}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isConsult: e.target.checked,
                          price: e.target.checked ? '' : formData.price || '1500',
                        })
                      }
                      className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                    />
                    <span className="text-xs text-amber-300 font-semibold">Marcar como «Consultar»</span>
                  </label>
                </div>

                {!formData.isConsult ? (
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">
                      Precio de mensajería (CUP):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="Ej. 2000"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-stone-100 text-sm font-bold font-display focus:outline-hidden focus:border-[#D4AF37] transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4AF37]">
                        CUP
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-200/80 leading-relaxed italic bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                    Al marcar como «Consultar», el cliente verá «Mensajería por confirmar» en el checkout y el pedido indicará «Total conocido, sin mensajería» para cotizarlo personalmente.
                  </p>
                )}
              </div>

              {/* Destination Active status */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1F1813] border border-white/10">
                <div>
                  <span className="font-bold text-[#F8E6C1] text-xs block">Disponibilidad</span>
                  <span className="text-[10px] text-stone-400">
                    Habilitar este destino para selección en el checkout
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className="cursor-pointer"
                >
                  {formData.active ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-stone-500" />
                  )}
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Notas u observaciones <span className="font-normal text-stone-500">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej. Tiempo estimado 45 min, distancia extra..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] transition"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-semibold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{saving ? 'Guardando...' : isCreating ? 'Crear Destino' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmación de Restaurar Tarifas Iniciales */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-[#16120E] border border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-sm font-bold text-[#F8E6C1]">
                  ¿Restaurar las tarifas iniciales?
                </h3>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Se restablecerán las <strong>{OFFICIAL_DELIVERY_RATES.length} tarifas oficiales</strong> de los 14 municipios de La Habana a sus precios predeterminados en CUP. Cualquier zona personalizada creada será reemplazada.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1A1A1A] font-bold text-xs transition active:scale-95 cursor-pointer"
              >
                Confirmar Restauración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
