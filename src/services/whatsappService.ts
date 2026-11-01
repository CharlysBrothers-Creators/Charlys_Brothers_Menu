/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckoutDraft, parseCoursePass, formatCoursePassLabel } from '../types/checkout';
import { CartItem, CartSummary } from '../types/cart';
import { BusinessOrderSettings } from '../config/orderSettings';
import { formatCUP } from './cartCalculations';

export interface WhatsAppOrderPayload {
  referenceId: string;
  draft: CheckoutDraft;
  items: CartItem[];
  summary: CartSummary;
  settings: BusinessOrderSettings;
}

/**
 * Genera un código de referencia único para el pedido (ej. DB-8492)
 */
export function generateOrderReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestamp = Date.now().toString().slice(-2);
  return `DB-${code}${timestamp}`;
}

/**
 * Limpia y normaliza un número telefónico para la URL de WhatsApp (wa.me)
 * Remueve caracteres no numéricos
 */
export function cleanWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Valida si un número telefónico es válido para WhatsApp
 */
export function isValidWhatsAppNumber(phone?: string): boolean {
  const cleaned = cleanWhatsAppNumber(phone);
  // Al menos 8 dígitos (ej. Cuba 53 + 8 dígitos = 10 dígitos)
  return cleaned.length >= 8 && cleaned.length <= 15;
}

/**
 * Genera el texto del mensaje estructurado para WhatsApp según la especificación de D'Batule.
 * Utiliza emojis compatibles de WhatsApp (🏪, 🧾, 🍽️, 📍, 🛵, 💰, 📝).
 * Los mensajes de wa.me son texto plano.
 */
export function formatWhatsAppOrderMessage({
  referenceId,
  draft,
  items,
  summary,
  settings,
}: WhatsAppOrderPayload): string {
  const lines: string[] = [];
  const restaurantName = settings.businessName || "D’Batule Restaurante";

  // 1. Encabezado: 🏪 Restaurante y 🧾 Pedido
  lines.push(`🏪 *${restaurantName.toUpperCase()}*`);
  lines.push(`🧾 *PEDIDO:* #${referenceId}`);
  lines.push('');

  // 2. Modalidad: 🍽️ y Datos del cliente
  if (draft.modality === 'dine_in') {
    const table = settings.tables.find((t) => t.id === draft.dineIn.tableId);
    const tableLabel = table ? `${table.label} (${table.zone})` : draft.dineIn.tableId || 'Sin mesa asignada';
    lines.push(`🍽️ *Modalidad:* Consumo en el local`);
    lines.push(`🪑 *Mesa:* ${tableLabel}`);
    if (draft.dineIn.customerName?.trim()) {
      lines.push(`👤 *Comensal:* ${draft.dineIn.customerName.trim()}`);
    }
  } else if (draft.modality === 'takeaway') {
    lines.push(`🍽️ *Modalidad:* Recogida en el local`);
    if (draft.takeaway.customerName?.trim()) {
      lines.push(`👤 *Cliente:* ${draft.takeaway.customerName.trim()}`);
    }
    if (draft.takeaway.phone?.trim()) {
      lines.push(`📞 *Teléfono:* ${draft.takeaway.phone.trim()}`);
    }
  } else if (draft.modality === 'delivery') {
    lines.push(`🍽️ *Modalidad:* Entrega a domicilio`);
    if (draft.delivery.customerName?.trim()) {
      lines.push(`👤 *Cliente:* ${draft.delivery.customerName.trim()}`);
    }
    if (draft.delivery.phone?.trim()) {
      lines.push(`📞 *Teléfono:* ${draft.delivery.phone.trim()}`);
    }
    if (draft.delivery.municipality?.trim()) {
      lines.push(`🏘️ *Municipio:* ${draft.delivery.municipality.trim()}`);
    }
    if (draft.delivery.zoneName?.trim()) {
      lines.push(`📍 *Zona / Reparto:* ${draft.delivery.zoneName.trim()}`);
    }
    if (draft.delivery.address?.trim()) {
      lines.push(`📍 *Dirección:* ${draft.delivery.address.trim()}`);
    }
    if (draft.delivery.landmarks?.trim()) {
      lines.push(`📌 *Referencia:* ${draft.delivery.landmarks.trim()}`);
    }
  }

  lines.push('');

  // 3. Productos y Cantidades
  lines.push(`🛒 *PRODUCTOS (${summary.totalItemsCount} ${summary.totalItemsCount === 1 ? 'unidad' : 'unidades'}):*`);
  items.forEach((item, index) => {
    lines.push(`${index + 1}. *${item.quantity}x ${item.productName}* — ${formatCUP(item.lineTotal)}`);

    // Extras
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      item.selectedOptions.forEach((opt) => {
        const sign = opt.priceAdjustment > 0 ? ` (+${formatCUP(opt.priceAdjustment)})` : '';
        lines.push(`   • ${opt.name}${sign}`);
      });
    }

    // Ritmo de servicio por pases si aplica
    if (draft.modality === 'dine_in' && draft.dineIn.serviceRhythm === 'staged') {
      const assignment = draft.dineIn.stagedAssignments?.[item.id];
      if (assignment !== undefined) {
        const pass = parseCoursePass(assignment);
        lines.push(`   ↳ _Pase: ${formatCoursePassLabel(pass)}_`);
      }
    }
  });

  lines.push('');

  // 4. Preferencias de servicio
  if (draft.modality === 'dine_in') {
    let rhythmLabel = 'Servir todos los productos juntos';
    if (draft.dineIn.serviceRhythm === 'drinks_first') {
      rhythmLabel = 'Bebidas primero, platos después';
    } else if (draft.dineIn.serviceRhythm === 'staged') {
      rhythmLabel = 'Servicio escalonado (por pases ordenados)';
    }
    lines.push(`⏱️ *Preferencia de servicio:* ${rhythmLabel}`);
  }

  // 5. Observaciones con 📝
  const notes =
    draft.modality === 'dine_in'
      ? draft.dineIn.notes
      : draft.modality === 'takeaway'
      ? draft.takeaway.notes
      : draft.delivery.notes;

  if (notes && notes.trim().length > 0) {
    lines.push(`📝 *Observaciones:* ${notes.trim()}`);
  }

  lines.push('');

  // 6. Mensajería con 🛵 y Resumen Económico con 💰
  if (draft.modality === 'delivery') {
    const hasFixedFee =
      draft.delivery.deliveryFee !== null &&
      draft.delivery.deliveryFee !== undefined &&
      !draft.delivery.isFeePending;

    if (hasFixedFee) {
      const fee = draft.delivery.deliveryFee as number;
      const finalGrandTotal = summary.grandTotal + fee;
      lines.push(`🛵 *Mensajería:* ${formatCUP(fee)} (${draft.delivery.zoneName || 'Tarifa fija'})`);
      lines.push('');
      lines.push(`💰 *DESGLOSE ECONÓMICO:*`);
      lines.push(`• Productos base: ${formatCUP(summary.subtotalBase)}`);
      if (summary.subtotalExtras > 0) {
        lines.push(`• Extras: +${formatCUP(summary.subtotalExtras)}`);
      }
      lines.push(`• Mensajería: +${formatCUP(fee)}`);
      lines.push(`• *TOTAL FINAL:* ${formatCUP(finalGrandTotal)}`);
    } else {
      lines.push(`🛵 *Mensajería:* Tarifa por consultar (pendiente de confirmación)`);
      lines.push('');
      lines.push(`💰 *DESGLOSE ECONÓMICO:*`);
      lines.push(`• Productos base: ${formatCUP(summary.subtotalBase)}`);
      if (summary.subtotalExtras > 0) {
        lines.push(`• Extras: +${formatCUP(summary.subtotalExtras)}`);
      }
      lines.push(`• *Total conocido (sin mensajería):* ${formatCUP(summary.grandTotal)}`);
      lines.push(`⚠️ _El total anterior NO incluye el costo de mensajería, el cual se confirmará con el restaurante._`);
    }
  } else {
    lines.push(`💰 *TOTAL:*`);
    lines.push(`• Subtotal base: ${formatCUP(summary.subtotalBase)}`);
    if (summary.subtotalExtras > 0) {
      lines.push(`• Extras: +${formatCUP(summary.subtotalExtras)}`);
    }
    lines.push(`• *TOTAL FINAL:* ${formatCUP(summary.grandTotal)}`);
  }

  // Opcional: enlace HTTPS público al logotipo si está configurado en settings
  const publicLogoUrl = (settings as any).publicLogoUrl;
  if (publicLogoUrl && typeof publicLogoUrl === 'string' && publicLogoUrl.startsWith('https://')) {
    lines.push('');
    lines.push(`🌐 Logotipo oficial: ${publicLogoUrl.trim()}`);
  }

  lines.push('');
  lines.push(`_Mensaje generado desde la carta digital de ${restaurantName}._`);

  return lines.join('\n');
}

/**
 * Construye el enlace universal oficial de WhatsApp (wa.me)
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = cleanWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
