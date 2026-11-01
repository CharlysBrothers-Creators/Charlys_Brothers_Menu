import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Phone, Building2, Sliders, UtensilsCrossed, ShoppingBag, Bike, MessageSquare } from 'lucide-react';
import { AdminBusinessSettings } from '../../types/admin';
import { OrderModalityId, OrderModalityConfig } from '../../config/orderSettings';
import { adminRepository } from '../../services/adminRepository';
import { isValidWhatsAppNumber, cleanWhatsAppNumber } from '../../services/whatsappService';

interface AdminSettingsSectionProps {
  settings: AdminBusinessSettings;
  onRefresh: () => void;
}

export const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({
  settings,
  onRefresh,
}) => {
  const [businessName, setBusinessName] = useState<string>(settings.businessName);
  const [contactPhone, setContactPhone] = useState<string>(settings.contactPhone || '+53 5 123 4567');
  const [whatsappPhone, setWhatsappPhone] = useState<string>(settings.whatsappPhone || '');
  const [modalities, setModalities] = useState<OrderModalityConfig[]>(settings.modalities);
  const [defaultModality, setDefaultModality] = useState<OrderModalityId>(settings.defaultModality || 'dine_in');
  const [takeawayNotice, setTakeawayNotice] = useState<string>(settings.takeawayNotice);
  const [deliveryNotice, setDeliveryNotice] = useState<string>(settings.deliveryNotice);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setBusinessName(settings.businessName);
    setContactPhone(settings.contactPhone || '+53 5 123 4567');
    setWhatsappPhone(settings.whatsappPhone || '');
    setModalities(settings.modalities.map((m) => ({ ...m })));
    setDefaultModality(settings.defaultModality || 'dine_in');
    setTakeawayNotice(settings.takeawayNotice);
    setDeliveryNotice(settings.deliveryNotice);
  }, [settings]);

  // Toggle modality enabled
  const handleToggleModality = (id: OrderModalityId) => {
    setModalities((prev) => {
      const target = prev.find((m) => m.id === id);
      const currentlyEnabledCount = prev.filter((m) => m.enabled).length;

      // Prevent disabling the LAST remaining modality
      if (target?.enabled && currentlyEnabledCount <= 1) {
        setErrorMessage('No puedes desactivar todas las modalidades. Al menos una debe permanecer habilitada.');
        return prev;
      }

      setErrorMessage(null);
      const next = prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));

      // If the disabled one was default, switch default to another enabled one
      const targetBecameDisabled = target?.enabled;
      if (targetBecameDisabled && defaultModality === id) {
        const remainingEnabled = next.find((m) => m.enabled && m.id !== id);
        if (remainingEnabled) {
          setDefaultModality(remainingEnabled.id);
        }
      }

      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage('El nombre comercial no puede estar vacío.');
      return;
    }

    // Validate WhatsApp number if specified
    if (whatsappPhone.trim() && !isValidWhatsAppNumber(whatsappPhone)) {
      setErrorMessage('El número de WhatsApp no parece válido. Debe incluir al menos 8 dígitos (ej. +53 5 123 4567 o 5351234567).');
      return;
    }

    const enabledCount = modalities.filter((m) => m.enabled).length;
    if (enabledCount === 0) {
      setErrorMessage('Debe haber al menos una modalidad habilitada para los clientes.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await adminRepository.updateBusinessSettings({
        businessName: businessName.trim(),
        contactPhone: contactPhone.trim(),
        whatsappPhone: whatsappPhone.trim(),
        modalities,
        defaultModality,
        takeawayNotice: takeawayNotice.trim(),
        deliveryNotice: deliveryNotice.trim(),
      });

      setSuccessMessage('Configuración del restaurante guardada con éxito.');
      setTimeout(() => setSuccessMessage(null), 3500);
      onRefresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al guardar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalityIcon = (id: OrderModalityId) => {
    switch (id) {
      case 'dine_in':
        return <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />;
      case 'takeaway':
        return <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />;
      case 'delivery':
        return <Bike className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-xs">
      {/* Toast / Notification feedback */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. General Business Information */}
      <div className="bg-[#16120E] p-4 rounded-2xl border border-white/8 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
          Identidad y Contacto
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Nombre Comercial <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Teléfono de Contacto <span className="text-[#D4AF37]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. WhatsApp Ordering Channel Configuration */}
      <div className="bg-[#16120E] p-4 rounded-2xl border border-white/8 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Canal de Pedidos por WhatsApp
            </span>
            <span className="text-[11px] text-stone-400">
              Número donde los clientes enviarán su pedido prellenado desde el checkout.
            </span>
          </div>

          {whatsappPhone.trim() ? (
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Canal Activo
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              Sin Configurar
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">
            Número de WhatsApp del Restaurante (con código de país)
          </label>
          <div className="relative">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              placeholder="Ej: +53 5 123 4567 o 5351234567"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37]"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-stone-400 leading-relaxed">
            {whatsappPhone.trim()
              ? `✓ Los clientes podrán enviar su pedido a este número (${cleanWhatsAppNumber(whatsappPhone)}).`
              : '⚠️ Si no configuras un número, el checkout bloqueará el envío y explicará al cliente que el canal aún no está activo.'}
          </p>
        </div>
      </div>

      {/* 3. Modalities Configuration */}
      <div className="bg-[#16120E] p-4 rounded-2xl border border-white/8 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Modalidades de Pedido
            </span>
            <span className="text-[11px] text-stone-500">
              Activa o desactiva qué canales están disponibles para los clientes en el Checkout.
            </span>
          </div>

          <span className="text-[10px] font-semibold text-[#D4AF37]">
            {modalities.filter((m) => m.enabled).length} de 3 activas
          </span>
        </div>

        <div className="space-y-2.5">
          {modalities.map((mod) => (
            <div
              key={mod.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                mod.enabled
                  ? 'bg-[#1F1813] border-white/10'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {getModalityIcon(mod.id)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-xs font-bold text-[#F8E6C1]">
                      {mod.title}
                    </span>
                    {defaultModality === mod.id && mod.enabled && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400 block">
                    {mod.description}
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => handleToggleModality(mod.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                  mod.enabled ? 'bg-[#D4AF37]' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mod.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Default modality select */}
        <div className="pt-2 border-t border-white/5">
          <label className="block text-xs font-semibold text-stone-300 mb-1">
            Modalidad predeterminada en Checkout
          </label>
          <select
            value={defaultModality}
            onChange={(e) => setDefaultModality(e.target.value as OrderModalityId)}
            className="w-full sm:w-64 px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] cursor-pointer"
          >
            {modalities
              .filter((m) => m.enabled)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 3. Notices visible to customers */}
      <div className="bg-[#16120E] p-4 rounded-2xl border border-white/8 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
          Avisos Informativos para el Cliente
        </span>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">
            Aviso para Recogida en el Local
          </label>
          <textarea
            rows={2}
            value={takeawayNotice}
            onChange={(e) => setTakeawayNotice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">
            Aviso para Entrega a Domicilio (Mensajería)
          </label>
          <textarea
            rows={2}
            value={deliveryNotice}
            onChange={(e) => setDeliveryNotice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1F1813] border border-white/10 text-stone-100 text-xs focus:outline-hidden focus:border-[#D4AF37] resize-none"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-1 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Save className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
          <span>{isSubmitting ? 'Guardando...' : 'Guardar Configuración'}</span>
        </button>
      </div>
    </form>
  );
};
