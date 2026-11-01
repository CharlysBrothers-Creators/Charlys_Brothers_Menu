import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product } from '../types/catalog';
import { CartItem, CartOptionItem, CartSummary } from '../types/cart';
import {
  areOptionsEqual,
  calculateCartSummary,
  calculateLineTotal,
  calculateUnitExtrasTotal,
  calculateUnitFinalPrice,
} from '../services/cartCalculations';
import { cartRepository } from '../services/cartRepository';
import { adminRepository } from '../services/adminRepository';

export interface CartToastInfo {
  id: string;
  title: string;
  subtext?: string;
  type?: 'success' | 'info' | 'warning';
}

interface CartContextValue {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  toast: CartToastInfo | null;
  dismissToast: () => void;
  addItem: (
    product: Product,
    quantity: number,
    selectedOptions?: CartOptionItem[],
    isDemoData?: boolean
  ) => Promise<{ success: boolean; lineId: string; wasGrouped: boolean }>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<CartToastInfo | null>(null);

  // Lock to avoid double click rapid fire
  const isAddingRef = useRef<boolean>(false);
  const toastTimeoutRef = useRef<number | null>(null);

  const triggerToast = useCallback((title: string, subtext?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({
      id: `toast_${Date.now()}`,
      title,
      subtext,
      type,
    });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Sync to repository whenever items change (after initial loading)
  const saveItems = useCallback(async (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      await cartRepository.saveCart(newItems);
    } catch (e) {
      console.warn('Error al guardar carrito en repositorio:', e);
    }
  }, []);

  // Reconcile prices and availability against active catalog
  const reconcileCart = useCallback(async (currentItems: CartItem[]) => {
    if (currentItems.length === 0) return;
    let anyChanged = false;
    let noticeMessage = '';

    const reconciled = await Promise.all(
      currentItems.map(async (item) => {
        const live = await adminRepository.getProductById(item.productId);
        if (!live) return item;

        const priceChanged = live.price !== item.unitBasePrice;
        if (priceChanged) {
          anyChanged = true;
          noticeMessage = `${item.productName}: $${live.price.toLocaleString('es-CU')} CUP`;
          const extrasTotal = item.unitExtrasTotal;
          const unitFinal = live.price + extrasTotal;
          const lineTotal = unitFinal * item.quantity;
          return {
            ...item,
            productName: live.name,
            unitBasePrice: live.price,
            unitFinalPrice: unitFinal,
            lineTotal,
          };
        }
        return item;
      })
    );

    if (anyChanged) {
      saveItems(reconciled);
      triggerToast('Precios de carta actualizados', `Se sincronizó el pedido: ${noticeMessage}`, 'info');
    }
  }, [saveItems, triggerToast]);

  // Load cart from repository on initial render & reconcile
  useEffect(() => {
    let isMounted = true;
    async function initCart() {
      try {
        const persistedItems = await cartRepository.loadCart();
        if (isMounted) {
          setItems(persistedItems);
          setLoading(false);
          // Check for price updates against active store
          reconcileCart(persistedItems);
        }
      } catch (err) {
        console.error('Error cargando carrito desde repositorio:', err);
        if (isMounted) setLoading(false);
      }
    }
    initCart();
    return () => {
      isMounted = false;
    };
  }, [reconcileCart]);

  // Subscribe to live admin repository changes to keep cart in sync
  useEffect(() => {
    return adminRepository.subscribe(() => {
      reconcileCart(items);
    });
  }, [items, reconcileCart]);

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast(null);
  }, []);

  /**
   * Adds an item to the cart with pure mathematical recalculations.
   * Compares options independently of array position.
   * Prevents rapid duplicate clicks.
   */
  const addItem = useCallback(
    async (
      product: Product,
      quantity: number,
      selectedOptions: CartOptionItem[] = [],
      isDemoData: boolean = false
    ): Promise<{ success: boolean; lineId: string; wasGrouped: boolean }> => {
      if (!product || !product.id || quantity <= 0) {
        return { success: false, lineId: '', wasGrouped: false };
      }

      // Check live availability
      const liveProduct = await adminRepository.getProductById(product.id);
      if (liveProduct && liveProduct.available === false) {
        triggerToast('Producto agotado', `${liveProduct.name} no se encuentra disponible actualmente`, 'warning');
        return { success: false, lineId: '', wasGrouped: false };
      }

      // Double-press lock (150ms throttle)
      if (isAddingRef.current) {
        return { success: false, lineId: '', wasGrouped: false };
      }
      isAddingRef.current = true;
      setTimeout(() => {
        isAddingRef.current = false;
      }, 150);

      const activePrice = liveProduct ? liveProduct.price : product.price;
      const qty = Math.max(1, Math.round(quantity));
      const extrasTotal = calculateUnitExtrasTotal(selectedOptions);
      const unitFinal = calculateUnitFinalPrice(activePrice, extrasTotal);

      // Search for existing item with same product ID AND identical options (order-independent)
      const existingIndex = items.findIndex(
        (it) => it.productId === product.id && areOptionsEqual(it.selectedOptions, selectedOptions)
      );

      let updatedList: CartItem[];
      let targetLineId: string;
      let wasGrouped = false;

      if (existingIndex >= 0) {
        // Group with existing line: increase quantity
        wasGrouped = true;
        const currentItem = items[existingIndex];
        const newQty = currentItem.quantity + qty;
        targetLineId = currentItem.id;

        const updatedItem: CartItem = {
          ...currentItem,
          quantity: newQty,
          lineTotal: calculateLineTotal(currentItem.unitFinalPrice, newQty),
        };

        updatedList = [...items];
        updatedList[existingIndex] = updatedItem;
      } else {
        // Create new independent line
        targetLineId = `line_${product.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newItem: CartItem = {
          id: targetLineId,
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          categoryId: product.categoryId,
          quantity: qty,
          selectedOptions: [...selectedOptions],
          unitBasePrice: Math.round(product.price),
          unitExtrasTotal: extrasTotal,
          unitFinalPrice: unitFinal,
          lineTotal: calculateLineTotal(unitFinal, qty),
          isDemoData: isDemoData || Boolean(selectedOptions.length && isDemoData),
        };
        updatedList = [...items, newItem];
      }

      await saveItems(updatedList);

      const optCount = selectedOptions.length;
      const optNote = optCount > 0 ? ` (${optCount} opción${optCount > 1 ? 'es' : ''})` : '';
      triggerToast(
        wasGrouped ? `Se sumaron ${qty} más de ${product.name}` : `Agregado al pedido: ${product.name}`,
        `${qty} unidad${qty > 1 ? 'es' : ''}${optNote} · Total línea: $${(unitFinal * (wasGrouped ? items[existingIndex].quantity + qty : qty)).toLocaleString('es-CU')} CUP`
      );

      return { success: true, lineId: targetLineId, wasGrouped };
    },
    [items, saveItems, triggerToast]
  );

  /**
   * Updates quantity on an existing line. Does not allow 0 or negative quantities.
   */
  const updateQuantity = useCallback(
    async (lineId: string, newQuantity: number) => {
      const targetQty = Math.round(newQuantity);
      if (targetQty < 1) {
        // Strict requirement: No negative or zero quantities on existing lines
        return;
      }

      const updated = items.map((item) => {
        if (item.id === lineId) {
          return {
            ...item,
            quantity: targetQty,
            lineTotal: calculateLineTotal(item.unitFinalPrice, targetQty),
          };
        }
        return item;
      });

      await saveItems(updated);
    },
    [items, saveItems]
  );

  /**
   * Removes a single line item.
   */
  const removeItem = useCallback(
    async (lineId: string) => {
      const target = items.find((i) => i.id === lineId);
      const updated = items.filter((item) => item.id !== lineId);
      await saveItems(updated);

      if (target) {
        triggerToast(`Eliminado del pedido`, target.productName, 'info');
      }
    },
    [items, saveItems, triggerToast]
  );

  /**
   * Completely clears the cart.
   */
  const clearCart = useCallback(async () => {
    setItems([]);
    await cartRepository.clearCart();
    triggerToast('Carrito vaciado', 'Todos los productos han sido retirados', 'info');
  }, [triggerToast]);

  // Derived pure summary
  const summary = useMemo(() => calculateCartSummary(items), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        loading,
        toast,
        dismissToast,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};
