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
 * Constantes de emojis Unicode estándar y compatibles con WhatsApp.
 * Se definen de forma explícita en UTF-8 para garantizar que no existan
 * pérdidas de codificación, caracteres de sustitución (U+FFFD) ni doble codificación.
 */
export const WA_EMOJIS = {
  RESTAURANTE: '🏪',
  PEDIDO: '🧾',
  MODALIDAD: '🍽️',
  MESA: '🪑',
  CLIENTE: '👤',
  TELEFONO: '📞',
  MUNICIPIO: '🏘️',
  ZONA: '📍',
  DIRECCION: '📍',
  REFERENCIA: '📌',
  PRODUCTOS: '🛒',
  SERVICIO: '⏱️',
  OBSERVACIONES: '📝',
  MENSAJERIA: '🛵',
  TOTAL: '💰',
  AVISO: '⚠️',
  LOGOTIPO: '🌐',
} as const;

/**
 * Genera el texto del mensaje estructurado para WhatsApp según la especificación de D'Batule.
 * Utiliza emojis compatibles de WhatsApp (🏪, 🧾, 🍽️, 👤, 📞, 📍, 🛵, 💰, 📝).
 * Los mensajes de wa.me son texto plano codificado en UTF-8.
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
  lines.push(`${WA_EMOJIS.RESTAURANTE} *${restaurantName.toUpperCase()}*`);
  lines.push(`${WA_EMOJIS.PEDIDO} *PEDIDO:* #${referenceId}`);
  lines.push('');

  // 2. Modalidad: 🍽️ y Datos del cliente
  if (draft.modality === 'dine_in') {
    const table = settings.tables.find((t) => t.id === draft.dineIn.tableId);
    const tableLabel = table ? `${table.label} (${table.zone})` : draft.dineIn.tableId || 'Sin mesa asignada';
    lines.push(`${WA_EMOJIS.MODALIDAD} *Modalidad:* Consumo en el local`);
    lines.push(`${WA_EMOJIS.MESA} *Mesa:* ${tableLabel}`);
    if (draft.dineIn.customerName?.trim()) {
      lines.push(`${WA_EMOJIS.CLIENTE} *Comensal:* ${draft.dineIn.customerName.trim()}`);
    }
  } else if (draft.modality === 'takeaway') {
    lines.push(`${WA_EMOJIS.MODALIDAD} *Modalidad:* Recogida en el local`);
    if (draft.takeaway.customerName?.trim()) {
      lines.push(`${WA_EMOJIS.CLIENTE} *Cliente:* ${draft.takeaway.customerName.trim()}`);
    }
    if (draft.takeaway.phone?.trim()) {
      lines.push(`${WA_EMOJIS.TELEFONO} *Teléfono:* ${draft.takeaway.phone.trim()}`);
    }
  } else if (draft.modality === 'delivery') {
    lines.push(`${WA_EMOJIS.MODALIDAD} *Modalidad:* Entrega a domicilio`);
    if (draft.delivery.customerName?.trim()) {
      lines.push(`${WA_EMOJIS.CLIENTE} *Cliente:* ${draft.delivery.customerName.trim()}`);
    }
    if (draft.delivery.phone?.trim()) {
      lines.push(`${WA_EMOJIS.TELEFONO} *Teléfono:* ${draft.delivery.phone.trim()}`);
    }
    if (draft.delivery.municipality?.trim()) {
      lines.push(`${WA_EMOJIS.MUNICIPIO} *Municipio:* ${draft.delivery.municipality.trim()}`);
    }
    if (draft.delivery.zoneName?.trim()) {
      lines.push(`${WA_EMOJIS.ZONA} *Zona / Reparto:* ${draft.delivery.zoneName.trim()}`);
    }
    if (draft.delivery.address?.trim()) {
      lines.push(`${WA_EMOJIS.DIRECCION} *Dirección:* ${draft.delivery.address.trim()}`);
    }
    if (draft.delivery.landmarks?.trim()) {
      lines.push(`${WA_EMOJIS.REFERENCIA} *Referencia:* ${draft.delivery.landmarks.trim()}`);
    }
  }

  lines.push('');

  // 3. Productos y Cantidades
  lines.push(`${WA_EMOJIS.PRODUCTOS} *PRODUCTOS (${summary.totalItemsCount} ${summary.totalItemsCount === 1 ? 'unidad' : 'unidades'}):*`);
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
    lines.push(`${WA_EMOJIS.SERVICIO} *Preferencia de servicio:* ${rhythmLabel}`);
  }

  // 5. Observaciones con 📝
  const notes =
    draft.modality === 'dine_in'
      ? draft.dineIn.notes
      : draft.modality === 'takeaway'
      ? draft.takeaway.notes
      : draft.delivery.notes;

  if (notes && notes.trim().length > 0) {
    lines.push(`${WA_EMOJIS.OBSERVACIONES} *Observaciones:* ${notes.trim()}`);
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
      lines.push(`${WA_EMOJIS.MENSAJERIA} *Mensajería:* ${formatCUP(fee)} (${draft.delivery.zoneName || 'Tarifa fija'})`);
      lines.push('');
      lines.push(`${WA_EMOJIS.TOTAL} *DESGLOSE ECONÓMICO:*`);
      lines.push(`• Productos base: ${formatCUP(summary.subtotalBase)}`);
      if (summary.subtotalExtras > 0) {
        lines.push(`• Extras: +${formatCUP(summary.subtotalExtras)}`);
      }
      lines.push(`• Mensajería: +${formatCUP(fee)}`);
      lines.push(`• *TOTAL FINAL:* ${formatCUP(finalGrandTotal)}`);
    } else {
      lines.push(`${WA_EMOJIS.MENSAJERIA} *Mensajería:* Tarifa por consultar (pendiente de confirmación)`);
      lines.push('');
      lines.push(`${WA_EMOJIS.TOTAL} *DESGLOSE ECONÓMICO:*`);
      lines.push(`• Productos base: ${formatCUP(summary.subtotalBase)}`);
      if (summary.subtotalExtras > 0) {
        lines.push(`• Extras: +${formatCUP(summary.subtotalExtras)}`);
      }
      lines.push(`• *Total conocido (sin mensajería):* ${formatCUP(summary.grandTotal)}`);
      lines.push(`${WA_EMOJIS.AVISO} _El total anterior NO incluye el costo de mensajería, el cual se confirmará con el restaurante._`);
    }
  } else {
    lines.push(`${WA_EMOJIS.TOTAL} *TOTAL:*`);
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
    lines.push(`${WA_EMOJIS.LOGOTIPO} Logotipo oficial: ${publicLogoUrl.trim()}`);
  }

  lines.push('');
  lines.push(`_Mensaje generado desde la carta digital de ${restaurantName}._`);

  const rawMessage = lines.join('\n');
  // Sanitización de seguridad: Garantizar que no exista ningún carácter de reemplazo U+FFFD
  return rawMessage.replace(/\uFFFD/g, '');
}

/**
 * Construye el enlace universal oficial de WhatsApp (wa.me)
 * Codifica el parámetro de texto de forma estricta y segura mediante encodeURIComponent,
 * previniendo doble codificación y verificando que no existan caracteres corruptos.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = cleanWhatsAppNumber(phone);
  // Asegurar que no contenga caracteres U+FFFD antes de codificar
  const sanitizedMessage = message.replace(/\uFFFD/g, '');
  const encodedText = encodeURIComponent(sanitizedMessage);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Validador de integridad para pruebas: confirma que el mensaje contenga los emojis exigidos,
 * no contenga caracteres U+FFFD y se pueda decodificar exactamente al texto original.
 */
export function verifyWhatsAppMessageIntegrity(message: string): {
  isValid: boolean;
  hasReplacementChar: boolean;
  emojisFound: string[];
  missingRequired: string[];
} {
  const hasReplacementChar = message.includes('\uFFFD');
  const required = [
    WA_EMOJIS.RESTAURANTE,
    WA_EMOJIS.PEDIDO,
    WA_EMOJIS.MODALIDAD,
    WA_EMOJIS.TOTAL,
  ];
  const missingRequired = required.filter((emoji) => !message.includes(emoji));

  // Verificar roundtrip de codificación URI
  const encoded = encodeURIComponent(message);
  const decoded = decodeURIComponent(encoded);
  const roundtripValid = decoded === message;

  return {
    isValid: !hasReplacementChar && missingRequired.length === 0 && roundtripValid,
    hasReplacementChar,
    emojisFound: Object.values(WA_EMOJIS).filter((e) => message.includes(e)),
    missingRequired,
  };
}
