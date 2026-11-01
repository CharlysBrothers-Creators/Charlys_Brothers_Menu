import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  Info,
} from 'lucide-react';
import { DBATULE_PROFILE } from '../config/business';
import { DBATULE_ORDER_SETTINGS, OrderModalityId, BusinessOrderSettings } from '../config/orderSettings';
import { CheckoutDraft, CheckoutValidationErrors } from '../types/checkout';
import { Comanda } from '../types/comanda';
import { useCart } from '../context/CartContext';
import { checkoutRepository } from '../services/checkoutRepository';
import { comandaRepository } from '../services/comandaRepository';
import { adminRepository } from '../services/adminRepository';
import { validateCheckoutDraft, createDefaultDraft } from '../services/checkoutValidation';
import { CheckoutProgress } from '../components/checkout/CheckoutProgress';
import { ModalitySelector } from '../components/checkout/ModalitySelector';
import { DineInForm } from '../components/checkout/DineInForm';
import { TakeawayForm } from '../components/checkout/TakeawayForm';
import { DeliveryForm } from '../components/checkout/DeliveryForm';
import { OrderReview } from '../components/checkout/OrderReview';
import { CheckoutCompleteModal } from '../components/checkout/CheckoutCompleteModal';
import { WhatsAppOrderModal } from '../components/checkout/WhatsAppOrderModal';
import {
  formatWhatsAppOrderMessage,
  generateOrderReference,
  isValidWhatsAppNumber,
} from '../services/whatsappService';
import { formatCUP } from '../services/cartCalculations';
import { DeliveryRate } from '../types/deliveryRate';
import { DiscreetAdminButton } from '../components/common/DiscreetAdminButton';

interface StorageNotice {
  type: 'warning' | 'info' | 'error';
  message: string;
  canRetry?: boolean;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, summary, loading: cartLoading, clearCart } = useCart();

  const [businessSettings, setBusinessSettings] = useState<BusinessOrderSettings>(DBATULE_ORDER_SETTINGS);
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRate[]>([]);
  const [currentStep, setCurrentStep] = useState<'details' | 'review'>('details');
  const [draft, setDraft] = useState<CheckoutDraft>(() =>
    createDefaultDraft(DBATULE_ORDER_SETTINGS)
  );
  const [errors, setErrors] = useState<CheckoutValidationErrors>({});
  const [draftLoaded, setDraftLoaded] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
  const [whatsAppRefId, setWhatsAppRefId] = useState<string>('');
  const [whatsAppMsg, setWhatsAppMsg] = useState<string>('');
  const [createdComanda, setCreatedComanda] = useState<Comanda | null>(null);
  const [isCreatingComanda, setIsCreatingComanda] = useState<boolean>(false);
  const [storageNotice, setStorageNotice] = useState<StorageNotice | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPersisted, setIsPersisted] = useState<boolean>(true);

  // Concurrency and race condition guards
  const saveSeqRef = useRef<number>(0);
  const isClearingRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<number | null>(null);

  // 1. Load persisted draft & dynamic business settings on mount
  useEffect(() => {
    let isMounted = true;
    async function initDraft() {
      try {
        const [loadResult, liveSettings, liveRates] = await Promise.all([
          checkoutRepository.loadDraft(),
          adminRepository.getBusinessSettings(),
          adminRepository.getActiveDeliveryRates(),
        ]);

        if (isMounted) {
          setBusinessSettings(liveSettings);
          setDeliveryRates(liveRates);

          if (loadResult.draft) {
            let activeDraft = loadResult.draft;
            // Check if current modality is still enabled in live settings
            const isModalityActive = liveSettings.modalities.some(
              (m) => m.id === activeDraft.modality && m.enabled
            );
            if (!isModalityActive) {
              const fallback = liveSettings.modalities.find((m) => m.enabled)?.id || liveSettings.defaultModality || 'dine_in';
              activeDraft = {
                ...activeDraft,
                modality: fallback,
              };
            }

            setDraft(activeDraft);
            setIsPersisted(loadResult.medium === 'indexeddb' || loadResult.medium === 'localstorage');
            if (loadResult.isStaleReconciled) {
              setStorageNotice({
                type: 'info',
                message: 'Se restauró el borrador más reciente desde el respaldo local.',
              });
            } else if (loadResult.medium === 'memory') {
              setStorageNotice({
                type: 'warning',
                message: 'El borrador actual solo reside en memoria y no persistirá al recargar.',
                canRetry: true,
              });
            }
          }
          if (loadResult.corruptEncountered) {
            setStorageNotice({
              type: 'info',
              message: 'Se detectaron datos no compatibles en el almacenamiento; se recuperó un estado seguro.',
            });
          }
          setDraftLoaded(true);
        }
      } catch (err) {
        console.warn('Error al restaurar borrador de checkout:', err);
        if (isMounted) {
          setStorageNotice({
            type: 'warning',
            message: 'No se pudo leer el almacenamiento persistente. Se inició un borrador nuevo en memoria.',
            canRetry: false,
          });
          setDraftLoaded(true);
        }
      }
    }
    initDraft();
    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Subscribe to live admin repository updates to reflect changes in modalities, tables, or delivery rates
  useEffect(() => {
    return adminRepository.subscribe(async () => {
      const [liveSettings, liveRates] = await Promise.all([
        adminRepository.getBusinessSettings(),
        adminRepository.getActiveDeliveryRates(),
      ]);
      setBusinessSettings(liveSettings);
      setDeliveryRates(liveRates);
      setDraft((prev) => {
        const isStillEnabled = liveSettings.modalities.some((m) => m.id === prev.modality && m.enabled);
        if (!isStillEnabled) {
          const firstEnabled = liveSettings.modalities.find((m) => m.enabled)?.id || 'dine_in';
          return { ...prev, modality: firstEnabled };
        }
        return prev;
      });
    });
  }, []);

  // 2. Perform sequential, decoupled save to repository
  const performSave = useCallback(async (draftToSave: CheckoutDraft) => {
    if (isClearingRef.current) return;
    const seq = ++saveSeqRef.current;
    setIsSaving(true);

    try {
      const res = await checkoutRepository.saveDraft(draftToSave);
      if (seq !== saveSeqRef.current || isClearingRef.current) return;

      if (res.persisted) {
        setIsPersisted(true);
        if (res.medium === 'localstorage') {
          setStorageNotice({
            type: 'info',
            message: 'Guardado en respaldo local (IndexedDB no disponible).',
          });
        } else {
          setStorageNotice(null);
        }
      } else {
        setIsPersisted(false);
        setStorageNotice({
          type: 'warning',
          message: 'No se pudo guardar de forma persistente. Tus datos están en pantalla, pero no sobrevivirán a una recarga.',
          canRetry: true,
        });
      }
    } catch {
      if (seq !== saveSeqRef.current || isClearingRef.current) return;
      setIsPersisted(false);
      setStorageNotice({
        type: 'warning',
        message: 'Fallo al comunicarse con el almacenamiento del navegador.',
        canRetry: true,
      });
    } finally {
      if (seq === saveSeqRef.current) {
        setIsSaving(false);
      }
    }
  }, []);

  // 3. User edit dispatcher: pure state update + debounced asynchronous persistence
  const updateDraft = useCallback(
    (updater: (prev: CheckoutDraft) => CheckoutDraft) => {
      setDraft((prev) => {
        const next = updater(prev);
        const withRev: CheckoutDraft = {
          ...next,
          revision: (prev.revision || 0) + 1,
          lastUpdated: Date.now(),
        };

        // Clear debounce and schedule decoupled save outside of the updater
        if (saveTimeoutRef.current) {
          window.clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = window.setTimeout(() => {
          performSave(withRev);
        }, 300);

        return withRev;
      });

      // Clear inline errors when user edits
      setErrors({});
    },
    [performSave]
  );

  const handleModalityChange = (modality: OrderModalityId) => {
    updateDraft((prev) => ({
      ...prev,
      modality,
    }));
  };

  // 4. Real draft and personal data deletion
  const handleClearDraft = async () => {
    // Lock to cancel any pending saves
    isClearingRef.current = true;
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveSeqRef.current++;

    const fresh = createDefaultDraft(DBATULE_ORDER_SETTINGS);

    try {
      const clearResult = await checkoutRepository.clearDraft();

      if (!clearResult.success) {
        // Did not clear everywhere! Show specific error and do NOT claim full success
        setStorageNotice({
          type: 'error',
          message: 'No se pudieron eliminar todos los datos del almacenamiento persistente. Por favor intenta de nuevo.',
          canRetry: true,
        });
        isClearingRef.current = false;
        return;
      }

      // Success: Reset state to clean draft
      setDraft(fresh);
      setErrors({});
      setStorageNotice(null);
      setIsPersisted(true);
      setCurrentStep('details');
    } catch {
      setStorageNotice({
        type: 'error',
        message: 'Error al intentar limpiar los datos del borrador.',
        canRetry: true,
      });
    } finally {
      isClearingRef.current = false;
    }
  };

  const handleRetrySave = () => {
    performSave(draft);
  };

  const handleProceedToReview = () => {
    const outcome = validateCheckoutDraft(draft, draft.modality, DBATULE_ORDER_SETTINGS);
    if (!outcome.isValid) {
      setErrors(outcome.errors);
      return;
    }
    setErrors({});
    setCurrentStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('details');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/carrito');
    }
  };

  // Loading state
  if (cartLoading || !draftLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-stone-400 bg-[#120F0D]">
        <span className="text-sm font-medium">Cargando preparación del pedido...</span>
      </div>
    );
  }

  // Block access if cart is empty
  if (summary.totalItemsCount === 0 || items.length === 0) {
    return (
      <div className="relative flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none">
        <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 border border-[#D4AF37]/35 text-[#F8E6C1] text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>Volver al Catálogo</span>
          </button>
          <span className="font-display text-sm font-bold gold-gradient-text">
            {DBATULE_PROFILE.name}
          </span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#18130E] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-4">
            <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
          </div>

          <h2 className="font-display text-lg font-bold text-[#F8E6C1] mb-2">
            No tienes productos para preparar
          </h2>

          <p className="text-xs text-stone-400 mb-6 leading-relaxed">
            Para acceder al checkout primero debes seleccionar los platos que deseas ordenar en tu pedido.
          </p>

          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="px-5 py-2.5 rounded-xl gold-button-gradient text-[#1A1A1A] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-2"
          >
            <span>Ver Platos en el Menú</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleCompleteDemo = async () => {
    if (isCreatingComanda) return;
    setIsCreatingComanda(true);

    try {
      // Validate once more before registering the comanda snapshot
      const outcome = validateCheckoutDraft(draft, draft.modality, businessSettings);
      if (!outcome.isValid) {
        setErrors(outcome.errors);
        setCurrentStep('details');
        setIsCreatingComanda(false);
        return;
      }

      const comanda = await comandaRepository.createComandaFromCheckout(
        draft,
        items,
        summary,
        businessSettings
      );

      setCreatedComanda(comanda);
      setShowCompleteModal(true);
    } catch (err) {
      console.error('Error al registrar comanda local:', err);
      setStorageNotice({
        type: 'error',
        message: 'No se pudo guardar la comanda local en el dispositivo. Intenta nuevamente.',
        canRetry: false,
      });
    } finally {
      setIsCreatingComanda(false);
    }
  };

  const handleSendWhatsApp = () => {
    // Validate checkout draft
    const outcome = validateCheckoutDraft(draft, draft.modality, businessSettings);
    if (!outcome.isValid) {
      setErrors(outcome.errors);
      setCurrentStep('details');
      return;
    }

    if (!businessSettings.whatsappPhone?.trim() || !isValidWhatsAppNumber(businessSettings.whatsappPhone)) {
      setStorageNotice({
        type: 'warning',
        message: 'El restaurante aún no ha configurado un número oficial de WhatsApp para recibir pedidos.',
      });
      return;
    }

    const refId = generateOrderReference();
    const message = formatWhatsAppOrderMessage({
      referenceId: refId,
      draft,
      items,
      summary,
      settings: businessSettings,
    });

    setWhatsAppRefId(refId);
    setWhatsAppMsg(message);
    setShowWhatsAppModal(true);
  };

  const handleResetOrder = async () => {
    await clearCart();
    await handleClearDraft();
  };

  return (
    <div className="relative flex flex-col min-h-full flex-1 bg-[#120F0D] text-stone-100 select-none overflow-x-hidden">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#120F0D]/95 backdrop-blur-md border-b border-[#2B1F14]/90 shadow-lg">
        <div className="w-full px-3.5 sm:px-4 py-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label={currentStep === 'review' ? 'Volver a datos' : 'Volver al carrito'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 active:scale-95 border border-[#D4AF37]/35 text-[#F8E6C1] transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2] text-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wide">
              {currentStep === 'review' ? 'Datos' : 'Carrito'}
            </span>
          </button>

          <div className="flex flex-col items-center">
            <h1 className="font-display text-base sm:text-lg font-bold tracking-wider gold-gradient-text">
              {currentStep === 'review' ? 'Revisión del Pedido' : 'Preparar Pedido'}
            </h1>
            <span className="text-[9px] tracking-[0.25em] text-[#F8E6C1]/70 uppercase">
              {DBATULE_PROFILE.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 justify-end">
            <DiscreetAdminButton />
            <span className="text-[10px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
              CUP
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar (Carrito -> Datos -> Revisión) */}
      <CheckoutProgress
        currentStep={currentStep}
        onNavigateStep={(step) => {
          if (step === 'cart') navigate('/carrito');
          if (step === 'details') setCurrentStep('details');
        }}
      />

      {/* Storage & Persistence Status Warning Banner (Visible on screen) */}
      {storageNotice && (
        <aside
          aria-label="Aviso de almacenamiento"
          className="mx-3.5 sm:mx-4 mt-2.5 select-none"
        >
          <div
            className={`p-2.5 rounded-xl border flex items-start justify-between gap-2.5 text-xs ${
              storageNotice.type === 'error'
                ? 'bg-[#E63946]/15 border-[#E63946]/40 text-[#F8E6C1]'
                : storageNotice.type === 'warning'
                ? 'bg-amber-950/40 border-amber-600/40 text-amber-200'
                : 'bg-[#1C1710] border-[#D4AF37]/30 text-stone-300'
            }`}
          >
            <div className="flex items-start gap-2 min-w-0">
              {storageNotice.type === 'info' ? (
                <Info className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-[11px] leading-relaxed">
                {storageNotice.message}
              </p>
            </div>

            {storageNotice.canRetry && (
              <button
                type="button"
                onClick={handleRetrySave}
                disabled={isSaving}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white transition active:scale-95 cursor-pointer flex-shrink-0"
              >
                <RotateCw className={`w-3 h-3 ${isSaving ? 'animate-spin' : ''}`} />
                <span>Reintentar</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 px-3 sm:px-4 py-3 space-y-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {currentStep === 'details' ? (
          <>
            {/* 1. Modality selection cards */}
            <ModalitySelector
              modalities={businessSettings.modalities}
              selectedModality={draft.modality}
              onSelectModality={handleModalityChange}
            />

            {errors.modality && (
              <p className="text-xs text-[#E63946] font-medium bg-[#E63946]/10 p-2.5 rounded-xl border border-[#E63946]/20">
                {errors.modality}
              </p>
            )}

            {/* 2. Modality specific dynamic form */}
            {draft.modality === 'dine_in' && (
              <DineInForm
                data={draft.dineIn}
                tables={businessSettings.tables}
                cartItems={items}
                errors={errors}
                onChange={(updated) =>
                  updateDraft((prev) => ({
                    ...prev,
                    dineIn: { ...prev.dineIn, ...updated },
                  }))
                }
              />
            )}

            {draft.modality === 'takeaway' && (
              <TakeawayForm
                data={draft.takeaway}
                notice={businessSettings.takeawayNotice}
                errors={errors}
                onChange={(updated) =>
                  updateDraft((prev) => ({
                    ...prev,
                    takeaway: { ...prev.takeaway, ...updated },
                  }))
                }
              />
            )}

            {draft.modality === 'delivery' && (
              <DeliveryForm
                data={draft.delivery}
                notice={businessSettings.deliveryNotice}
                errors={errors}
                rates={deliveryRates}
                onChange={(updated) =>
                  updateDraft((prev) => ({
                    ...prev,
                    delivery: { ...prev.delivery, ...updated },
                  }))
                }
              />
            )}

            {/* Total Indicator & Continue to Review CTA */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleProceedToReview}
                className="w-full py-3.5 px-4 rounded-xl gold-button-gradient text-[#1A1A1A] font-bold text-sm shadow-[0_4px_16px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
                <span>Revisar pedido</span>
                <span className="text-xs font-semibold ml-1">
                  ({formatCUP(
                    summary.grandTotal +
                      (draft.modality === 'delivery' &&
                      draft.delivery.deliveryFee !== null &&
                      draft.delivery.deliveryFee !== undefined &&
                      !draft.delivery.isFeePending
                        ? draft.delivery.deliveryFee
                        : 0)
                  )})
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/carrito')}
                className="w-full py-2.5 px-4 rounded-xl bg-black/40 hover:bg-black/70 border border-white/8 text-stone-300 text-xs font-semibold transition cursor-pointer text-center"
              >
                Volver al carrito
              </button>
            </div>
          </>
        ) : (
          /* Step 3: Review Screen */
          <OrderReview
            draft={draft}
            settings={businessSettings}
            items={items}
            summary={summary}
            onEditData={() => {
              setCurrentStep('details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClearDraft={handleClearDraft}
            onCompleteDemo={handleCompleteDemo}
            onSendWhatsApp={handleSendWhatsApp}
            isSubmitting={isCreatingComanda}
          />
        )}
      </div>

      {/* WhatsApp Order Modal */}
      <WhatsAppOrderModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        referenceId={whatsAppRefId}
        whatsappPhone={businessSettings.whatsappPhone || ''}
        orderMessage={whatsAppMsg}
        onResetOrder={handleResetOrder}
      />

      {/* Legacy/Demo completion explanation modal */}
      <CheckoutCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        isPersisted={isPersisted}
        comanda={createdComanda}
      />
    </div>
  );
};
