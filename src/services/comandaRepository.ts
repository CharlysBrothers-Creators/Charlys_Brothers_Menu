import {
  Comanda,
  ComandaStatus,
  ComandaLineStatus,
  ComandaLineItem,
  ComandaCustomerSnapshot,
  ComandaFinancialSummary,
  ComandaHistoryEntry,
} from '../types/comanda';
import { CheckoutDraft, parseCoursePass } from '../types/checkout';
import { CartItem, CartSummary } from '../types/cart';
import { BusinessOrderSettings } from '../config/orderSettings';

const DB_NAME = 'dbatule_pwa_orders_db';
const STORE_NAME = 'comandas';
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY = 'dbatule_pwa_comandas_store';
const SEQUENCE_KEY = 'dbatule_pwa_comandas_sequence';

export interface IComandaRepository {
  createComanda(comanda: Comanda): Promise<Comanda>;
  createComandaFromCheckout(
    draft: CheckoutDraft,
    items: CartItem[],
    summary: CartSummary,
    settings: BusinessOrderSettings
  ): Promise<Comanda>;
  listComandas(): Promise<Comanda[]>;
  getComandaById(id: string): Promise<Comanda | null>;
  updateComandaStatus(
    id: string,
    newStatus: ComandaStatus,
    note?: string,
    allowCompletedOverride?: boolean
  ): Promise<Comanda>;
  updateLineStatus(
    comandaId: string,
    lineId: string,
    newLineStatus: ComandaLineStatus,
    note?: string
  ): Promise<Comanda>;
  cancelComanda(id: string, reason: string): Promise<Comanda>;
  clearAllComandas(): Promise<void>; // For demo reset
}

export class IndexedDBComandaRepository implements IComandaRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: Map<string, Comanda> = new Map();
  private isInitialized = false;

  private async getDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is not available in this environment.');
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.dbPromise = null;
          reject(new Error('IndexedDB connection timeout for comandas'));
        }, 3000);

        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
          };

          request.onsuccess = () => {
            clearTimeout(timeout);
            resolve(request.result);
          };

          request.onerror = () => {
            clearTimeout(timeout);
            this.dbPromise = null;
            reject(request.error || new Error('Failed to open comandas IndexedDB'));
          };
        } catch (err) {
          clearTimeout(timeout);
          this.dbPromise = null;
          reject(err);
        }
      });
    }

    return this.dbPromise;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const all = await this.loadFromStorage();
      this.memoryCache.clear();
      all.forEach((c) => this.memoryCache.set(c.id, c));
      this.isInitialized = true;
    } catch {
      this.isInitialized = true;
    }
  }

  private getNextSequence(): number {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const current = parseInt(window.localStorage.getItem(SEQUENCE_KEY) || '100', 10);
        const next = current + 1;
        window.localStorage.setItem(SEQUENCE_KEY, String(next));
        return next;
      }
    } catch {
      // fallback
    }
    return 101 + this.memoryCache.size;
  }

  private async loadFromStorage(): Promise<Comanda[]> {
    try {
      const db = await this.getDB();
      return new Promise<Comanda[]>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const list: Comanda[] = Array.isArray(req.result) ? req.result : [];
          // sync fallback
          this.writeToLocalStorage(list);
          resolve(list);
        };

        req.onerror = () => reject(req.error || new Error('Error reading comandas from IndexedDB'));
      });
    } catch {
      // Fallback to localStorage
      return this.readFromLocalStorage();
    }
  }

  private async persistComanda(comanda: Comanda): Promise<void> {
    // 1. Update memory cache
    this.memoryCache.set(comanda.id, comanda);

    let idbSucceeded = false;
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(comanda);

        tx.oncomplete = () => {
          idbSucceeded = true;
          resolve();
        };
        tx.onerror = () => reject(tx.error || new Error('Error saving comanda in IndexedDB'));
        tx.onabort = () => reject(new Error('Transaction aborted saving comanda'));
      });
    } catch {
      idbSucceeded = false;
    }

    // Always mirror to localStorage as resilient fallback
    this.writeToLocalStorage(Array.from(this.memoryCache.values()));
  }

  private readFromLocalStorage(): Comanda[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {
      // ignore
    }
    return Array.from(this.memoryCache.values());
  }

  private writeToLocalStorage(list: Comanda[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Transforms validated checkout data into an immutable comanda snapshot.
   */
  async createComandaFromCheckout(
    draft: CheckoutDraft,
    items: CartItem[],
    summary: CartSummary,
    settings: BusinessOrderSettings
  ): Promise<Comanda> {
    await this.ensureInitialized();

    const timestamp = Date.now();
    const dateStr = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `DBT-${dateStr}-${randomSuffix}`;
    const seq = this.getNextSequence();
    const code = `#${seq}`;

    // 1. Freeze Line Items with requested passes
    const frozenItems: ComandaLineItem[] = items.map((item, index) => {
      let passNumber = 1;
      if (draft.modality === 'dine_in' && draft.dineIn.serviceRhythm === 'staged') {
        passNumber = parseCoursePass(draft.dineIn.stagedAssignments?.[item.id]);
      }

      return {
        id: `${id}-L${index + 1}`,
        cartLineId: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unitBasePrice: item.unitBasePrice,
        unitExtrasTotal: item.unitExtrasTotal,
        unitFinalPrice: item.unitFinalPrice,
        lineTotal: item.lineTotal,
        selectedOptions: item.selectedOptions ? JSON.parse(JSON.stringify(item.selectedOptions)) : [],
        isDemoData: item.isDemoData,
        status: 'pending',
        passNumber,
        statusUpdatedAt: timestamp,
      };
    });

    // 2. Freeze Customer and Modality Metadata
    let customerSnapshot: ComandaCustomerSnapshot;

    if (draft.modality === 'dine_in') {
      const tableConfig = settings.tables.find((t) => t.id === draft.dineIn.tableId);
      const tableName = tableConfig ? `${tableConfig.label} (${tableConfig.zone})` : draft.dineIn.tableId;
      const rhythmLabels: Record<string, string> = {
        all_together: 'Servir todos los productos juntos',
        drinks_first: 'Bebidas primero, platos después',
        staged: 'Servicio escalonado (por pases)',
      };

      customerSnapshot = {
        modality: 'dine_in',
        modalityTitle: 'Consumo en el local',
        tableId: draft.dineIn.tableId,
        tableName,
        customerName: draft.dineIn.customerName?.trim() || undefined,
        notes: draft.dineIn.notes?.trim() || undefined,
        serviceRhythm: draft.dineIn.serviceRhythm,
        serviceRhythmLabel: rhythmLabels[draft.dineIn.serviceRhythm] || 'Todo junto',
      };
    } else if (draft.modality === 'takeaway') {
      customerSnapshot = {
        modality: 'takeaway',
        modalityTitle: 'Recogida en el local',
        customerName: draft.takeaway.customerName.trim(),
        phone: draft.takeaway.phone.trim(),
        notes: draft.takeaway.notes?.trim() || undefined,
        serviceRhythm: 'all_together',
        serviceRhythmLabel: 'Preparación para entrega directa',
      };
    } else {
      customerSnapshot = {
        modality: 'delivery',
        modalityTitle: 'Entrega a domicilio',
        customerName: draft.delivery.customerName.trim(),
        phone: draft.delivery.phone.trim(),
        address: draft.delivery.address.trim(),
        landmarks: draft.delivery.landmarks?.trim() || undefined,
        notes: draft.delivery.notes?.trim() || undefined,
        serviceRhythm: 'all_together',
        serviceRhythmLabel: 'Preparación para mensajería',
      };
    }

    // 3. Freeze Financial Totals
    const financialSummary: ComandaFinancialSummary = {
      subtotalBase: summary.subtotalBase,
      subtotalExtras: summary.subtotalExtras,
      grandTotal: summary.grandTotal,
      totalItemsCount: summary.totalItemsCount,
      shippingStatus: draft.modality === 'delivery' ? 'pending_confirmation' : (draft.modality === 'takeaway' ? 'free' : 'none'),
    };

    // 4. Initial Audit History Entry
    const initialHistory: ComandaHistoryEntry = {
      id: `${id}-H1`,
      timestamp,
      action: 'Comanda registrada en el dispositivo DEMO',
      toStatus: 'new',
      note: `Modalidad: ${customerSnapshot.modalityTitle}. Total: $${summary.grandTotal.toLocaleString('es-CU')} CUP.`,
    };

    const newComanda: Comanda = {
      id,
      code,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'new',
      customer: customerSnapshot,
      items: frozenItems,
      summary: financialSummary,
      history: [initialHistory],
    };

    await this.persistComanda(newComanda);
    return newComanda;
  }

  async createComanda(comanda: Comanda): Promise<Comanda> {
    await this.ensureInitialized();
    await this.persistComanda(comanda);
    return comanda;
  }

  async listComandas(): Promise<Comanda[]> {
    await this.ensureInitialized();
    const list = Array.from(this.memoryCache.values());
    // Sort descending by creation date
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  async getComandaById(id: string): Promise<Comanda | null> {
    await this.ensureInitialized();
    return this.memoryCache.get(id) || null;
  }

  /**
   * Updates comanda status with transition validation and audit logging.
   */
  async updateComandaStatus(
    id: string,
    newStatus: ComandaStatus,
    note?: string,
    allowCompletedOverride = false
  ): Promise<Comanda> {
    await this.ensureInitialized();
    const comanda = this.memoryCache.get(id);
    if (!comanda) {
      throw new Error(`Comanda con ID ${id} no encontrada.`);
    }

    if (comanda.status === 'cancelled') {
      throw new Error('No se puede modificar una comanda que ha sido cancelada.');
    }

    if (comanda.status === 'completed' && !allowCompletedOverride) {
      throw new Error('No se puede alterar una comanda completada sin reapertura administrativa explícita.');
    }

    if (comanda.status === newStatus) {
      return comanda;
    }

    const timestamp = Date.now();
    const prevStatus = comanda.status;

    // Synchronize item line statuses if transitioning globally to completed or in_preparation
    let updatedItems = comanda.items;
    if (newStatus === 'completed') {
      updatedItems = comanda.items.map((item) =>
        item.status === 'cancelled'
          ? item
          : { ...item, status: 'delivered' as ComandaLineStatus, statusUpdatedAt: timestamp }
      );
    } else if (newStatus === 'ready') {
      updatedItems = comanda.items.map((item) =>
        item.status === 'cancelled' || item.status === 'delivered'
          ? item
          : { ...item, status: 'ready' as ComandaLineStatus, statusUpdatedAt: timestamp }
      );
    } else if (newStatus === 'in_preparation' && prevStatus === 'new') {
      updatedItems = comanda.items.map((item) =>
        item.status === 'pending'
          ? { ...item, status: 'preparing' as ComandaLineStatus, statusUpdatedAt: timestamp }
          : item
      );
    }

    const historyEntry: ComandaHistoryEntry = {
      id: `${id}-H${comanda.history.length + 1}`,
      timestamp,
      action: `Cambio de estado: ${prevStatus} ➔ ${newStatus}`,
      fromStatus: prevStatus,
      toStatus: newStatus,
      note,
    };

    const updatedComanda: Comanda = {
      ...comanda,
      status: newStatus,
      items: updatedItems,
      updatedAt: timestamp,
      history: [...comanda.history, historyEntry],
    };

    await this.persistComanda(updatedComanda);
    return updatedComanda;
  }

  /**
   * Updates an individual item line status and reactively re-evaluates comanda state.
   */
  async updateLineStatus(
    comandaId: string,
    lineId: string,
    newLineStatus: ComandaLineStatus,
    note?: string
  ): Promise<Comanda> {
    await this.ensureInitialized();
    const comanda = this.memoryCache.get(comandaId);
    if (!comanda) {
      throw new Error(`Comanda con ID ${comandaId} no encontrada.`);
    }

    if (comanda.status === 'cancelled') {
      throw new Error('No se pueden modificar platos de una comanda cancelada.');
    }

    if (comanda.status === 'completed') {
      throw new Error('No se pueden modificar platos de una comanda completada.');
    }

    const targetLine = comanda.items.find((i) => i.id === lineId);
    if (!targetLine) {
      throw new Error(`Línea ${lineId} no encontrada en la comanda.`);
    }

    if (targetLine.status === newLineStatus) {
      return comanda;
    }

    const timestamp = Date.now();
    const prevLineStatus = targetLine.status;

    const updatedItems = comanda.items.map((item) =>
      item.id === lineId
        ? { ...item, status: newLineStatus, statusUpdatedAt: timestamp }
        : item
    );

    // Compute derived aggregate status from lines
    const activeLines = updatedItems.filter((i) => i.status !== 'cancelled');
    let nextComandaStatus: ComandaStatus = comanda.status;

    if (activeLines.length === 0) {
      nextComandaStatus = 'cancelled';
    } else {
      const allDelivered = activeLines.every((i) => i.status === 'delivered');
      const allReadyOrDelivered = activeLines.every((i) => i.status === 'ready' || i.status === 'delivered');
      const anyReadyOrDelivered = activeLines.some((i) => i.status === 'ready' || i.status === 'delivered');
      const anyPreparing = activeLines.some((i) => i.status === 'preparing');

      if (allDelivered) {
        nextComandaStatus = 'completed';
      } else if (allReadyOrDelivered) {
        nextComandaStatus = 'ready';
      } else if (anyReadyOrDelivered) {
        nextComandaStatus = 'partially_ready';
      } else if (anyPreparing) {
        nextComandaStatus = 'in_preparation';
      } else {
        nextComandaStatus = 'new';
      }
    }

    const historyEntry: ComandaHistoryEntry = {
      id: `${comandaId}-H${comanda.history.length + 1}`,
      timestamp,
      action: `Plato «${targetLine.productName}»: ${prevLineStatus} ➔ ${newLineStatus}`,
      lineId,
      fromStatus: comanda.status,
      toStatus: nextComandaStatus,
      note,
    };

    const updatedComanda: Comanda = {
      ...comanda,
      status: nextComandaStatus,
      items: updatedItems,
      updatedAt: timestamp,
      history: [...comanda.history, historyEntry],
    };

    await this.persistComanda(updatedComanda);
    return updatedComanda;
  }

  /**
   * Safely cancels a comanda with mandatory reason and marks pending lines as cancelled.
   */
  async cancelComanda(id: string, reason: string): Promise<Comanda> {
    await this.ensureInitialized();
    const comanda = this.memoryCache.get(id);
    if (!comanda) {
      throw new Error(`Comanda con ID ${id} no encontrada.`);
    }

    if (comanda.status === 'cancelled') {
      return comanda;
    }

    if (!reason || reason.trim().length < 3) {
      throw new Error('Se requiere un motivo de cancelación detallado (mínimo 3 caracteres).');
    }

    const timestamp = Date.now();
    const prevStatus = comanda.status;

    // Mark non-delivered items as cancelled
    const updatedItems = comanda.items.map((item) =>
      item.status === 'delivered'
        ? item
        : { ...item, status: 'cancelled' as ComandaLineStatus, statusUpdatedAt: timestamp }
    );

    const historyEntry: ComandaHistoryEntry = {
      id: `${id}-H${comanda.history.length + 1}`,
      timestamp,
      action: `Comanda Cancelada: ${prevStatus} ➔ cancelled`,
      fromStatus: prevStatus,
      toStatus: 'cancelled',
      note: `Motivo: ${reason.trim()}`,
    };

    const updatedComanda: Comanda = {
      ...comanda,
      status: 'cancelled',
      cancellationReason: reason.trim(),
      items: updatedItems,
      updatedAt: timestamp,
      history: [...comanda.history, historyEntry],
    };

    await this.persistComanda(updatedComanda);
    return updatedComanda;
  }

  async clearAllComandas(): Promise<void> {
    this.memoryCache.clear();
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}

export const comandaRepository = new IndexedDBComandaRepository();
