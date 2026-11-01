import { CartItem, CartOptionItem, CartSummary } from '../types/cart';

/**
 * Generates an order-independent canonical fingerprint of selected options.
 * Does not depend on the array insertion order or position.
 */
export function generateOptionsFingerprint(options: CartOptionItem[]): string {
  if (!options || options.length === 0) return '';
  return [...options]
    .map((opt) => `${opt.groupId}:${opt.id}:${opt.type}:${Math.round(opt.priceAdjustment)}`)
    .sort()
    .join('|');
}

/**
 * Checks whether two sets of selected options are functionally identical.
 * Compares option IDs regardless of array position.
 */
export function areOptionsEqual(a: CartOptionItem[], b: CartOptionItem[]): boolean {
  if (a === b) return true;
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  return generateOptionsFingerprint(a) === generateOptionsFingerprint(b);
}

/**
 * Calculates the total monetary adjustment from selected options in CUP.
 * Pure function with integer rounding.
 */
export function calculateUnitExtrasTotal(options: CartOptionItem[]): number {
  if (!options || options.length === 0) return 0;
  return options.reduce((sum, opt) => {
    const adj = Number.isFinite(opt.priceAdjustment) ? Math.max(0, Math.round(opt.priceAdjustment)) : 0;
    return sum + adj;
  }, 0);
}

/**
 * Calculates unit final price in CUP: unitBasePrice + unitExtrasTotal.
 */
export function calculateUnitFinalPrice(unitBasePrice: number, unitExtrasTotal: number): number {
  const base = Math.max(0, Math.round(unitBasePrice));
  const extras = Math.max(0, Math.round(unitExtrasTotal));
  return base + extras;
}

/**
 * Calculates line subtotal in CUP: unitFinalPrice * quantity.
 */
export function calculateLineTotal(unitFinalPrice: number, quantity: number): number {
  const unit = Math.max(0, Math.round(unitFinalPrice));
  const qty = Math.max(0, Math.round(quantity));
  return unit * qty;
}

/**
 * Calculates overall cart summary from items.
 * Pure function.
 */
export function calculateCartSummary(items: CartItem[]): CartSummary {
  let totalItemsCount = 0;
  let subtotalBase = 0;
  let subtotalExtras = 0;
  let grandTotal = 0;
  let hasDemoItems = false;

  for (const item of items) {
    const qty = Math.max(0, Math.round(item.quantity));
    const base = Math.max(0, Math.round(item.unitBasePrice));
    const extras = Math.max(0, Math.round(item.unitExtrasTotal));
    const finalPrice = base + extras;
    const lineTotal = finalPrice * qty;

    totalItemsCount += qty;
    subtotalBase += base * qty;
    subtotalExtras += extras * qty;
    grandTotal += lineTotal;

    if (item.isDemoData || (item.selectedOptions && item.selectedOptions.length > 0 && item.isDemoData)) {
      hasDemoItems = true;
    }
  }

  return {
    items,
    totalItemsCount,
    totalUniqueLines: items.length,
    subtotalBase,
    subtotalExtras,
    grandTotal,
    hasDemoItems,
  };
}

/**
 * Formats a monetary CUP amount for luxury display with thousands separators.
 */
export function formatCUP(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `$${safe.toLocaleString('es-CU')} CUP`;
}
