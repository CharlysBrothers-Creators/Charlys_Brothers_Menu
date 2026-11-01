import React from 'react';
import { BusinessOrderSettings, OrderModalityConfig } from '../../config/orderSettings';
import { CheckoutDraft, parseCoursePass, formatCoursePassLabel } from '../../types/checkout';
import { CartItem, CartSummary } from '../../types/cart';
import { formatCUP } from '../../services/cartCalculations';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  User,
  Phone,
  MapPin,
  Clock,
  Info,
  Edit2,
  AlertTriangle,
  FileText,
  Trash2,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { isValidWhatsAppNumber } from '../../services/whatsappService';

interface OrderReviewProps {
  draft: CheckoutDraft;
  settings: BusinessOrderSettings;
  items: CartItem[];
  summary: CartSummary;
  onEditData: () => void;
  onClearDraft: () => void;
  onCompleteDemo?: () => void;
  onSendWhatsApp: () => void;
  isSubmitting?: boolean;
}

export const OrderReview: React.FC<OrderReviewProps> = ({
  draft,
  settings,
  items,
  summary,
  onEditData,
  onClearDraft,
  onCompleteDemo,
  onSendWhatsApp,
  isSubmitting = false,
}) => {
  const currentModalityConfig =
    settings.modalities.find((m) => m.id === draft.modality) || settings.modalities[0];

  const getModalityIcon = (type: string) => {
    switch (type) {
      case 'utensils':
        return <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />;
      case 'bag':
        return <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />;
      case 'bike':
      default:
        return <Bike className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  const getTableName = (tableId: string) => {
    const table = settings.tables.find((t) => t.id === tableId);
    return table ? `${table.label} (${table.zone})` : tableId;
  };

  const getServiceRhythmLabel = (rhythm: string) => {
    switch (rhythm) {
      case 'drinks_first':
        return 'Bebidas primero, platos después';
      case 'staged':
        return 'Servicio escalonado (por pases ordenados)';
      case 'all_together':
      default:
        return 'Servir todos los productos juntos';
    }
  };

  return (
    <div className="space-y-4 text-stone-200">
      {/* 1. DEMO Testing Notice Banner */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#1C1710] border border-[#D4AF37]/40 text-stone-300 text-xs shadow-xs">
        <Info className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-[#F8E6C1] block mb-0.5">
            Modo de Demostración y Pruebas
          </span>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Estás probando la preparación y revisión del pedido. Los productos y personalizaciones de prueba no generarán cobros ni órdenes reales al restaurante.
          </p>
        </div>
      </div>

      {/* 2. Modality & Customer Details Card */}
      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {getModalityIcon(currentModalityConfig.icon)}
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                Modalidad seleccionada
              </span>
              <h3 className="font-display text-sm font-bold text-[#F8E6C1]">
                {currentModalityConfig.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Editar datos</span>
          </button>
        </div>

        {/* Dynamic customer metadata depending on modality */}
        <div className="space-y-2 text-xs">
          {draft.modality === 'dine_in' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Mesa asignada:</span>
                <span className="font-bold text-[#F8E6C1]">
                  {getTableName(draft.dineIn.tableId)}
                </span>
              </div>

              {draft.dineIn.customerName && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Cliente / Referencia:</span>
                  <span className="text-stone-200">{draft.dineIn.customerName}</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <span className="text-stone-400 flex-shrink-0">Ritmo de servicio:</span>
                <span className="text-right text-[#D4AF37] font-medium">
                  {getServiceRhythmLabel(draft.dineIn.serviceRhythm)}
                </span>
              </div>

              {draft.dineIn.notes && (
                <div className="pt-1.5 border-t border-white/5">
                  <span className="text-stone-400 block text-[11px] mb-0.5">Observaciones:</span>
                  <p className="text-stone-300 italic text-[11px]">«{draft.dineIn.notes}»</p>
                </div>
              )}
            </>
          )}

          {draft.modality === 'takeaway' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Nombre de contacto:</span>
                <span className="font-bold text-[#F8E6C1]">{draft.takeaway.customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-400">Teléfono:</span>
                <span className="text-stone-200">{draft.takeaway.phone}</span>
              </div>

              <div className="flex items-start justify-between gap-2 pt-1">
                <span className="text-stone-400 flex-shrink-0">Horario de recogida:</span>
                <span className="text-right text-stone-300 text-[11px]">
                  A coordinar con el local
                </span>
              </div>

              {draft.takeaway.notes && (
                <div className="pt-1.5 border-t border-white/5">
                  <span className="text-stone-400 block text-[11px] mb-0.5">Observaciones:</span>
                  <p className="text-stone-300 italic text-[11px]">«{draft.takeaway.notes}»</p>
                </div>
              )}
            </>
          )}

          {draft.modality === 'delivery' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Receptor:</span>
                <span className="font-bold text-[#F8E6C1]">{draft.delivery.customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-400">Teléfono:</span>
                <span className="text-stone-200">{draft.delivery.phone}</span>
              </div>

              {draft.delivery.municipality && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Municipio:</span>
                  <span className="text-stone-200 font-medium">{draft.delivery.municipality}</span>
                </div>
              )}

              {draft.delivery.zoneName && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Zona / Reparto:</span>
                  <span className="text-stone-200 font-medium">{draft.delivery.zoneName}</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <span className="text-stone-400 flex-shrink-0">Dirección:</span>
                <span className="text-right text-stone-200 font-medium">
                  {draft.delivery.address}
                </span>
              </div>

              {draft.delivery.landmarks && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-stone-400 flex-shrink-0">Punto de referencia:</span>
                  <span className="text-right text-stone-300 text-[11px]">
                    {draft.delivery.landmarks}
                  </span>
                </div>
              )}

              {draft.delivery.notes && (
                <div className="pt-1.5 border-t border-white/5">
                  <span className="text-stone-400 block text-[11px] mb-0.5">Notas de entrega:</span>
                  <p className="text-stone-300 italic text-[11px]">«{draft.delivery.notes}»</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. Products List Breakdown */}
      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-white/8">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Detalle de platos ({summary.totalItemsCount})
          </h4>
          <span className="text-[10px] text-stone-400">
            {items.length} {items.length === 1 ? 'línea' : 'líneas'}
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const hasOptions = item.selectedOptions && item.selectedOptions.length > 0;
            const stagedCourse =
              draft.modality === 'dine_in' && draft.dineIn.serviceRhythm === 'staged'
                ? parseCoursePass(draft.dineIn.stagedAssignments?.[item.id])
                : null;

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2 rounded-xl bg-[#1A1511] border border-white/5"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <h5 className="font-display text-xs sm:text-sm font-semibold text-[#F8E6C1] truncate">
                        {item.quantity}x {item.productName}
                      </h5>
                      {item.isDemoData && (
                        <span className="text-[9px] font-semibold text-[#D4AF37] px-1.5 py-0.2 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex-shrink-0">
                          DEMO (Prueba)
                        </span>
                      )}
                    </div>
                    <span className="font-display text-xs font-bold text-[#F8E6C1] ml-2 flex-shrink-0">
                      {formatCUP(item.lineTotal)}
                    </span>
                  </div>

                  {/* Staged service badge if staged */}
                  {stagedCourse !== null && (
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 my-0.5">
                      {formatCoursePassLabel(stagedCourse)}
                    </span>
                  )}

                  {/* Price breakdown */}
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    <span>Base: ${item.unitBasePrice.toLocaleString('es-CU')}</span>
                    {item.unitExtrasTotal > 0 && (
                      <span className="ml-1 text-[#D4AF37]">
                        + Extras: ${item.unitExtrasTotal.toLocaleString('es-CU')}
                        {item.isDemoData && <span className="text-[9px] text-stone-500 ml-0.5">(DEMO)</span>}
                      </span>
                    )}
                    <span className="ml-1">· Unitario: {formatCUP(item.unitFinalPrice)}</span>
                  </div>

                  {/* Options list */}
                  {hasOptions && (
                    <ul className="mt-1 space-y-0.5 text-[10px] text-stone-300">
                      {item.selectedOptions.map((opt) => (
                        <li key={`${item.id}_rev_${opt.id}`} className="flex items-center justify-between">
                          <span>{opt.type === 'remove' ? `• Sin ${opt.name.replace(/^Sin\s+/i, '')}` : `• ${opt.name}`}</span>
                          {opt.priceAdjustment > 0 && (
                            <span className="text-[#D4AF37]">
                              +${opt.priceAdjustment.toLocaleString('es-CU')}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Financial Totals Breakdown Card */}
      <div className="bg-[#16120E] border border-white/8 rounded-2xl p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          Resumen económico
        </h4>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-stone-300">
            <span>Subtotal platos base</span>
            <span>{formatCUP(summary.subtotalBase)}</span>
          </div>

          {summary.subtotalExtras > 0 && (
            <div className="flex items-center justify-between text-stone-300">
              <span>Extras y personalizaciones</span>
              <span className="text-[#D4AF37]">
                +{formatCUP(summary.subtotalExtras)}
              </span>
            </div>
          )}

          {draft.modality === 'delivery' && (
            <div className="flex items-center justify-between text-stone-300 pt-1.5 border-t border-white/5">
              <span>
                Mensajería{' '}
                <span className="text-stone-400 text-[11px]">
                  ({draft.delivery.zoneName || 'Zona de entrega'})
                </span>
                :
              </span>
              {draft.delivery.deliveryFee !== null &&
              draft.delivery.deliveryFee !== undefined &&
              !draft.delivery.isFeePending ? (
                <span className="text-[#D4AF37] font-semibold">
                  +{formatCUP(draft.delivery.deliveryFee)}
                </span>
              ) : (
                <span className="text-amber-400 text-[11px] font-semibold">
                  Por confirmar
                </span>
              )}
            </div>
          )}

          <div className="pt-2.5 border-t border-white/10 flex items-baseline justify-between font-display text-base font-bold text-[#F8E6C1]">
            <div>
              {draft.modality === 'delivery' &&
              (draft.delivery.isFeePending || draft.delivery.deliveryFee === null) ? (
                <>
                  <span>Total conocido, sin mensajería</span>
                  <span className="block text-[10px] text-stone-400 font-sans font-normal">
                    (No incluye costo de mensajería por confirmar)
                  </span>
                </>
              ) : (
                <span>Total final</span>
              )}
            </div>
            <span className="text-[#D4AF37] text-lg">
              {formatCUP(
                summary.grandTotal +
                  (draft.modality === 'delivery' &&
                  draft.delivery.deliveryFee !== null &&
                  draft.delivery.deliveryFee !== undefined &&
                  !draft.delivery.isFeePending
                    ? draft.delivery.deliveryFee
                    : 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="pt-2 space-y-2.5">
        {/* Primary Action: Enviar pedido por WhatsApp */}
        {settings.whatsappPhone?.trim() && isValidWhatsAppNumber(settings.whatsappPhone) ? (
          <button
            type="button"
            onClick={onSendWhatsApp}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#D4AF37] text-stone-950 font-bold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2.5 transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
            <span>Enviar pedido por WhatsApp</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-amber-300 block">
                  Canal de WhatsApp no disponible
                </span>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  El restaurante aún no ha configurado su número oficial de WhatsApp para recibir pedidos. Por favor, realiza tu pedido directamente en el local.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full py-3.5 px-4 rounded-xl bg-stone-800 text-stone-500 font-bold text-xs border border-white/5 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp sin configurar en el restaurante</span>
            </button>
          </div>
        )}

        {/* Secondary: Edit Data */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditData}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Modificar datos</span>
          </button>

          {/* Tertiary: Clear Draft personal info */}
          <button
            type="button"
            onClick={onClearDraft}
            title="Borrar borrador y datos personales"
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-[#E63946]/20 border border-white/10 hover:border-[#E63946]/40 text-stone-400 hover:text-[#E63946] text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Borrar borrador</span>
          </button>
        </div>
      </div>
    </div>
  );
};
