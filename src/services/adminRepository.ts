import { AdminProduct, AdminCategory, AdminTable, AdminBusinessSettings } from '../types/admin';
import { ProductDetails } from '../types/productOptions';
import { DemoTable, DBATULE_ORDER_SETTINGS } from '../config/orderSettings';
import { CATEGORIES_DATA, PRODUCTS_DATA } from '../data/catalogData';
import { PRODUCT_DEMO_DETAILS } from '../data/productDemoDetails';
import { DeliveryRate } from '../types/deliveryRate';
import { OFFICIAL_DELIVERY_RATES } from '../data/officialDeliveryRates';

const DB_NAME = 'dbatule_pwa_admin_db';
const DB_VERSION = 2;
const STORAGE_PREFIX = 'dbatule_admin_store_';

export interface IAdminRepository {
  getProducts(): Promise<AdminProduct[]>;
  getActiveProducts(): Promise<AdminProduct[]>;
  getProductById(id: string): Promise<AdminProduct | null>;
  updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct>;
  setProductAvailability(id: string, available: boolean): Promise<AdminProduct>;

  getProductDetails(productId: string): Promise<ProductDetails | null>;
  updateProductDetails(productId: string, details: Partial<ProductDetails>): Promise<ProductDetails>;

  getCategories(): Promise<AdminCategory[]>;
  getActiveCategories(): Promise<AdminCategory[]>;
  getCategoryById(id: string): Promise<AdminCategory | null>;
  updateCategory(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory>;
  reorderCategories(orderedIds: string[]): Promise<AdminCategory[]>;
  deleteCategory(id: string): Promise<void>;

  getTables(): Promise<AdminTable[]>;
  getActiveTables(): Promise<DemoTable[]>;
  createTable(table: { id?: string; label: string; zone: string; active?: boolean }): Promise<AdminTable>;
  updateTable(id: string, updates: Partial<AdminTable>): Promise<AdminTable>;
  deleteTable(id: string): Promise<void>;
  getZones(): Promise<string[]>;

  // Delivery Rates Management (Prompt 05 / 06)
  getDeliveryRates(): Promise<DeliveryRate[]>;
  getActiveDeliveryRates(): Promise<DeliveryRate[]>;
  getDeliveryRateById(id: string): Promise<DeliveryRate | null>;
  createDeliveryRate(rate: Omit<DeliveryRate, 'id'>): Promise<DeliveryRate>;
  updateDeliveryRate(id: string, updates: Partial<DeliveryRate>): Promise<DeliveryRate>;
  deleteDeliveryRate(id: string): Promise<void>;
  restoreDefaultDeliveryRates(): Promise<DeliveryRate[]>;

  getBusinessSettings(): Promise<AdminBusinessSettings>;
  updateBusinessSettings(updates: Partial<AdminBusinessSettings>): Promise<AdminBusinessSettings>;

  restoreOfficialDemoData(): Promise<void>;
  subscribe(listener: () => void): () => void;
}

function getDefaultProducts(): AdminProduct[] {
  return PRODUCTS_DATA.map((p) => ({
    ...p,
    available: true,
  }));
}

function getDefaultCategories(): AdminCategory[] {
  return CATEGORIES_DATA.map((c) => ({
    ...c,
    active: true,
  })).sort((a, b) => a.order - b.order);
}

function getDefaultProductDetails(): Record<string, ProductDetails> {
  const details: Record<string, ProductDetails> = {};
  PRODUCTS_DATA.forEach((prod) => {
    if (PRODUCT_DEMO_DETAILS[prod.id]) {
      details[prod.id] = { ...PRODUCT_DEMO_DETAILS[prod.id], available: true };
    } else {
      details[prod.id] = {
        productId: prod.id,
        images: [prod.image],
        ingredients: [],
        customizationGroups: [],
        available: true,
        isDemoData: false,
      };
    }
  });
  return details;
}

function getDefaultTables(): AdminTable[] {
  return DBATULE_ORDER_SETTINGS.tables.map((t) => ({
    ...t,
    active: true,
  }));
}

function getDefaultSettings(): AdminBusinessSettings {
  return {
    businessId: DBATULE_ORDER_SETTINGS.businessId,
    businessName: DBATULE_ORDER_SETTINGS.businessName,
    contactPhone: '+53 5 123 4567',
    whatsappPhone: '',
    defaultModality: 'dine_in',
    modalities: DBATULE_ORDER_SETTINGS.modalities.map((m) => ({ ...m })),
    tables: DBATULE_ORDER_SETTINGS.tables.map((t) => ({ ...t })),
    allowServiceRhythm: DBATULE_ORDER_SETTINGS.allowServiceRhythm,
    shippingFeePendingConfirmation: DBATULE_ORDER_SETTINGS.shippingFeePendingConfirmation,
    takeawayNotice: DBATULE_ORDER_SETTINGS.takeawayNotice,
    deliveryNotice: DBATULE_ORDER_SETTINGS.deliveryNotice,
  };
}

class IndexedDBAdminRepository implements IAdminRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isInitialized = false;

  // In-memory cache for synchronous read efficiency and resilience
  private memoryProducts: Map<string, AdminProduct> = new Map();
  private memoryCategories: Map<string, AdminCategory> = new Map();
  private memoryDetails: Map<string, ProductDetails> = new Map();
  private memoryTables: Map<string, AdminTable> = new Map();
  private memoryDeliveryRates: Map<string, DeliveryRate> = new Map();
  private memorySettings: AdminBusinessSettings = getDefaultSettings();

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.seedMemoryWithDefaults();
  }

  private seedMemoryWithDefaults() {
    this.memoryProducts.clear();
    this.memoryCategories.clear();
    this.memoryDetails.clear();
    this.memoryTables.clear();
    this.memoryDeliveryRates.clear();

    getDefaultProducts().forEach((p) => this.memoryProducts.set(p.id, p));
    getDefaultCategories().forEach((c) => this.memoryCategories.set(c.id, c));
    const defDetails = getDefaultProductDetails();
    Object.keys(defDetails).forEach((k) => this.memoryDetails.set(k, defDetails[k]));
    getDefaultTables().forEach((t) => this.memoryTables.set(t.id, t));
    OFFICIAL_DELIVERY_RATES.forEach((r) => this.memoryDeliveryRates.set(r.id, { ...r }));
    this.memorySettings = getDefaultSettings();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error en listener de adminRepository:', err);
      }
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB no está disponible en este entorno.');
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('products')) {
            db.createObjectStore('products', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('categories')) {
            db.createObjectStore('categories', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('product_details')) {
            db.createObjectStore('product_details', { keyPath: 'productId' });
          }
          if (!db.objectStoreNames.contains('tables')) {
            db.createObjectStore('tables', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'businessId' });
          }
          if (!db.objectStoreNames.contains('delivery_rates')) {
            db.createObjectStore('delivery_rates', { keyPath: 'id' });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          this.dbPromise = null;
          reject(req.error || new Error('No se pudo abrir la base de datos IndexedDB'));
        };
      });
    }

    return this.dbPromise;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const db = await this.getDB();
      const storeNames = ['products', 'categories', 'product_details', 'tables', 'settings'];
      if (db.objectStoreNames.contains('delivery_rates')) {
        storeNames.push('delivery_rates');
      }
      const tx = db.transaction(storeNames, 'readonly');

      const getAll = <T>(storeName: string): Promise<T[]> => {
        return new Promise((resolve) => {
          if (!db.objectStoreNames.contains(storeName)) {
            return resolve([]);
          }
          const store = tx.objectStore(storeName);
          const req = store.getAll();
          req.onsuccess = () => resolve((req.result as T[]) || []);
          req.onerror = () => resolve([]);
        });
      };

      const [storedProducts, storedCategories, storedDetails, storedTables, storedSettings, storedRates] = await Promise.all([
        getAll<AdminProduct>('products'),
        getAll<AdminCategory>('categories'),
        getAll<ProductDetails>('product_details'),
        getAll<AdminTable>('tables'),
        getAll<AdminBusinessSettings>('settings'),
        getAll<DeliveryRate>('delivery_rates'),
      ]);

      if (storedProducts.length > 0) {
        this.memoryProducts.clear();
        storedProducts.forEach((p) => this.memoryProducts.set(p.id, p));
      } else {
        await this.persistInitialData();
      }

      if (storedCategories.length > 0) {
        this.memoryCategories.clear();
        storedCategories.forEach((c) => this.memoryCategories.set(c.id, c));
      }

      if (storedDetails.length > 0) {
        this.memoryDetails.clear();
        storedDetails.forEach((d) => this.memoryDetails.set(d.productId, d));
      }

      if (storedTables.length > 0) {
        this.memoryTables.clear();
        storedTables.forEach((t) => this.memoryTables.set(t.id, t));
      }

      if (storedSettings.length > 0 && storedSettings[0]) {
        this.memorySettings = storedSettings[0];
      }

      if (storedRates && storedRates.length > 0) {
        this.memoryDeliveryRates.clear();
        storedRates.forEach((r) => this.memoryDeliveryRates.set(r.id, r));
      } else {
        // If delivery_rates was empty, seed with official rates and persist
        this.memoryDeliveryRates.clear();
        OFFICIAL_DELIVERY_RATES.forEach((r) => this.memoryDeliveryRates.set(r.id, { ...r }));
        await this.persistDeliveryRates();
      }

      this.isInitialized = true;
    } catch (err) {
      // IndexedDB fallback to localStorage or memory
      this.loadFromLocalStorageFallback();
      this.isInitialized = true;
    }
  }

  private loadFromLocalStorageFallback() {
    if (typeof localStorage === 'undefined') return;
    try {
      const p = localStorage.getItem(`${STORAGE_PREFIX}products`);
      if (p) {
        const arr = JSON.parse(p) as AdminProduct[];
        this.memoryProducts.clear();
        arr.forEach((it) => this.memoryProducts.set(it.id, it));
      }
      const c = localStorage.getItem(`${STORAGE_PREFIX}categories`);
      if (c) {
        const arr = JSON.parse(c) as AdminCategory[];
        this.memoryCategories.clear();
        arr.forEach((it) => this.memoryCategories.set(it.id, it));
      }
      const d = localStorage.getItem(`${STORAGE_PREFIX}details`);
      if (d) {
        const arr = JSON.parse(d) as ProductDetails[];
        this.memoryDetails.clear();
        arr.forEach((it) => this.memoryDetails.set(it.productId, it));
      }
      const t = localStorage.getItem(`${STORAGE_PREFIX}tables`);
      if (t) {
        const arr = JSON.parse(t) as AdminTable[];
        this.memoryTables.clear();
        arr.forEach((it) => this.memoryTables.set(it.id, it));
      }
      const s = localStorage.getItem(`${STORAGE_PREFIX}settings`);
      if (s) {
        this.memorySettings = JSON.parse(s);
      }
      const dr = localStorage.getItem(`${STORAGE_PREFIX}delivery_rates`);
      if (dr) {
        const arr = JSON.parse(dr) as DeliveryRate[];
        this.memoryDeliveryRates.clear();
        arr.forEach((it) => this.memoryDeliveryRates.set(it.id, it));
      } else {
        this.memoryDeliveryRates.clear();
        OFFICIAL_DELIVERY_RATES.forEach((r) => this.memoryDeliveryRates.set(r.id, { ...r }));
      }
    } catch (e) {
      console.warn('Fallback localStorage error in admin repository:', e);
    }
  }

  private async persistDeliveryRates(): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db.objectStoreNames.contains('delivery_rates')) return;
      const tx = db.transaction('delivery_rates', 'readwrite');
      OFFICIAL_DELIVERY_RATES.forEach((r) => tx.objectStore('delivery_rates').put(r));
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.saveToLocalStorageFallback();
    }
  }

  private async persistInitialData(): Promise<void> {
    try {
      const db = await this.getDB();
      const storeNames = ['products', 'categories', 'product_details', 'tables', 'settings'];
      if (db.objectStoreNames.contains('delivery_rates')) {
        storeNames.push('delivery_rates');
      }
      const tx = db.transaction(storeNames, 'readwrite');

      getDefaultProducts().forEach((p) => tx.objectStore('products').put(p));
      getDefaultCategories().forEach((c) => tx.objectStore('categories').put(c));
      const defDetails = getDefaultProductDetails();
      Object.values(defDetails).forEach((d) => tx.objectStore('product_details').put(d));
      getDefaultTables().forEach((t) => tx.objectStore('tables').put(t));
      tx.objectStore('settings').put(getDefaultSettings());
      if (db.objectStoreNames.contains('delivery_rates')) {
        OFFICIAL_DELIVERY_RATES.forEach((r) => tx.objectStore('delivery_rates').put(r));
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      this.saveToLocalStorageFallback();
    }
  }

  private saveToLocalStorageFallback() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(Array.from(this.memoryProducts.values())));
      localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(Array.from(this.memoryCategories.values())));
      localStorage.setItem(`${STORAGE_PREFIX}details`, JSON.stringify(Array.from(this.memoryDetails.values())));
      localStorage.setItem(`${STORAGE_PREFIX}tables`, JSON.stringify(Array.from(this.memoryTables.values())));
      localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(this.memorySettings));
      localStorage.setItem(`${STORAGE_PREFIX}delivery_rates`, JSON.stringify(Array.from(this.memoryDeliveryRates.values())));
    } catch (e) {
      // Ignore quota exceeded
    }
  }

  private async putItem<T>(storeName: string, item: T): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(item);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      this.saveToLocalStorageFallback();
    }
  }

  private async deleteItem(storeName: string, key: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      this.saveToLocalStorageFallback();
    }
  }

  // ==================== PRODUCTS ====================

  async getProducts(): Promise<AdminProduct[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryProducts.values());
  }

  async getActiveProducts(): Promise<AdminProduct[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryProducts.values()).filter((p) => p.available !== false);
  }

  async getProductById(id: string): Promise<AdminProduct | null> {
    await this.ensureInitialized();
    return this.memoryProducts.get(id) || null;
  }

  async updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
    await this.ensureInitialized();
    const existing = this.memoryProducts.get(id);
    if (!existing) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }

    const updated: AdminProduct = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
    };

    // Ensure price is valid non-negative integer
    if (updated.price !== undefined) {
      updated.price = Math.max(0, Math.round(Number(updated.price) || 0));
    }

    this.memoryProducts.set(id, updated);
    await this.putItem('products', updated);

    // Keep product details in sync if availability or description changed
    const details = this.memoryDetails.get(id);
    if (details) {
      const updatedDetails: ProductDetails = {
        ...details,
        available: updated.available,
        description: updated.description ?? details.description,
      };
      this.memoryDetails.set(id, updatedDetails);
      await this.putItem('product_details', updatedDetails);
    }

    this.notifyListeners();
    return updated;
  }

  async setProductAvailability(id: string, available: boolean): Promise<AdminProduct> {
    return this.updateProduct(id, { available });
  }

  // ==================== PRODUCT DETAILS ====================

  async getProductDetails(productId: string): Promise<ProductDetails | null> {
    await this.ensureInitialized();
    const product = this.memoryProducts.get(productId);
    if (!product) return null;

    let details = this.memoryDetails.get(productId);
    if (!details) {
      details = {
        productId: product.id,
        images: [product.image],
        ingredients: [],
        customizationGroups: [],
        available: product.available !== false,
        isDemoData: false,
      };
      this.memoryDetails.set(productId, details);
      await this.putItem('product_details', details);
    }
    return details;
  }

  async updateProductDetails(productId: string, updates: Partial<ProductDetails>): Promise<ProductDetails> {
    await this.ensureInitialized();
    let existing = await this.getProductDetails(productId);
    if (!existing) {
      throw new Error(`Detalles para producto ${productId} no encontrados`);
    }

    const updated: ProductDetails = {
      ...existing,
      ...updates,
      productId,
    };

    this.memoryDetails.set(productId, updated);
    await this.putItem('product_details', updated);

    if (updates.available !== undefined) {
      const prod = this.memoryProducts.get(productId);
      if (prod && prod.available !== updates.available) {
        prod.available = updates.available;
        this.memoryProducts.set(productId, prod);
        await this.putItem('products', prod);
      }
    }

    this.notifyListeners();
    return updated;
  }

  // ==================== CATEGORIES ====================

  async getCategories(): Promise<AdminCategory[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryCategories.values()).sort((a, b) => a.order - b.order);
  }

  async getActiveCategories(): Promise<AdminCategory[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryCategories.values())
      .filter((c) => c.active !== false)
      .sort((a, b) => a.order - b.order);
  }

  async getCategoryById(id: string): Promise<AdminCategory | null> {
    await this.ensureInitialized();
    return this.memoryCategories.get(id) || null;
  }

  async updateCategory(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory> {
    await this.ensureInitialized();
    const existing = this.memoryCategories.get(id);
    if (!existing) {
      throw new Error(`Categoría con ID ${id} no encontrada`);
    }

    const updated: AdminCategory = {
      ...existing,
      ...updates,
      id: existing.id,
    };

    this.memoryCategories.set(id, updated);
    await this.putItem('categories', updated);
    this.notifyListeners();
    return updated;
  }

  async reorderCategories(orderedIds: string[]): Promise<AdminCategory[]> {
    await this.ensureInitialized();
    const updatedCategories: AdminCategory[] = [];

    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      const cat = this.memoryCategories.get(id);
      if (cat) {
        cat.order = index + 1;
        this.memoryCategories.set(id, cat);
        await this.putItem('categories', cat);
        updatedCategories.push(cat);
      }
    }

    this.notifyListeners();
    return updatedCategories;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.ensureInitialized();
    this.memoryCategories.delete(id);
    await this.deleteItem('categories', id);
    this.notifyListeners();
  }

  // ==================== TABLES ====================

  async getTables(): Promise<AdminTable[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryTables.values());
  }

  async getActiveTables(): Promise<DemoTable[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryTables.values())
      .filter((t) => t.active !== false)
      .map((t) => ({
        id: t.id,
        label: t.label,
        zone: t.zone as DemoTable['zone'],
      }));
  }

  async createTable(table: { id?: string; label: string; zone: string; active?: boolean }): Promise<AdminTable> {
    await this.ensureInitialized();
    const id = table.id?.trim() || `mesa-${Date.now().toString(36)}`;
    const newTable: AdminTable = {
      id,
      label: table.label.trim(),
      zone: table.zone.trim() || 'Salón Principal',
      active: table.active !== false,
    };

    this.memoryTables.set(id, newTable);
    await this.putItem('tables', newTable);
    this.notifyListeners();
    return newTable;
  }

  async updateTable(id: string, updates: Partial<AdminTable>): Promise<AdminTable> {
    await this.ensureInitialized();
    const existing = this.memoryTables.get(id);
    if (!existing) {
      throw new Error(`Mesa con ID ${id} no encontrada`);
    }

    const updated: AdminTable = {
      ...existing,
      ...updates,
      id: existing.id,
    };

    this.memoryTables.set(id, updated);
    await this.putItem('tables', updated);
    this.notifyListeners();
    return updated;
  }

  async deleteTable(id: string): Promise<void> {
    await this.ensureInitialized();
    this.memoryTables.delete(id);
    await this.deleteItem('tables', id);
    this.notifyListeners();
  }

  async getZones(): Promise<string[]> {
    await this.ensureInitialized();
    const zones = new Set<string>();
    this.memoryTables.forEach((t) => zones.add(t.zone));
    return Array.from(zones);
  }

  // ==================== BUSINESS SETTINGS ====================

  async getBusinessSettings(): Promise<AdminBusinessSettings> {
    await this.ensureInitialized();
    const activeTables = await this.getActiveTables();
    return {
      ...this.memorySettings,
      tables: activeTables,
    };
  }

  async updateBusinessSettings(updates: Partial<AdminBusinessSettings>): Promise<AdminBusinessSettings> {
    await this.ensureInitialized();

    // Guard: Prevent disabling all modalities!
    if (updates.modalities) {
      const activeCount = updates.modalities.filter((m) => m.enabled).length;
      if (activeCount === 0) {
        throw new Error('Debe permanecer habilitada al menos una modalidad de pedido.');
      }
    }

    const updated: AdminBusinessSettings = {
      ...this.memorySettings,
      ...updates,
      businessId: this.memorySettings.businessId,
    };

    // Ensure defaultModality is valid and enabled
    const isDefaultEnabled = updated.modalities.some((m) => m.id === updated.defaultModality && m.enabled);
    if (!isDefaultEnabled) {
      const firstEnabled = updated.modalities.find((m) => m.enabled);
      if (firstEnabled) {
        updated.defaultModality = firstEnabled.id;
      }
    }

    this.memorySettings = updated;
    await this.putItem('settings', updated);
    this.notifyListeners();
    return updated;
  }

  // ==================== DELIVERY RATES ====================

  async getDeliveryRates(): Promise<DeliveryRate[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryDeliveryRates.values());
  }

  async getActiveDeliveryRates(): Promise<DeliveryRate[]> {
    await this.ensureInitialized();
    return Array.from(this.memoryDeliveryRates.values()).filter((r) => r.active);
  }

  async getDeliveryRateById(id: string): Promise<DeliveryRate | null> {
    await this.ensureInitialized();
    return this.memoryDeliveryRates.get(id) || null;
  }

  async createDeliveryRate(rate: Omit<DeliveryRate, 'id'>): Promise<DeliveryRate> {
    await this.ensureInitialized();
    const id = `rate-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRate: DeliveryRate = {
      ...rate,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.memoryDeliveryRates.set(id, newRate);
    await this.putItem('delivery_rates', newRate);
    this.saveToLocalStorageFallback();
    this.notifyListeners();
    return newRate;
  }

  async updateDeliveryRate(id: string, updates: Partial<DeliveryRate>): Promise<DeliveryRate> {
    await this.ensureInitialized();
    const existing = this.memoryDeliveryRates.get(id);
    if (!existing) {
      throw new Error(`Tarifa con ID ${id} no encontrada`);
    }
    const updated: DeliveryRate = {
      ...existing,
      ...updates,
      id: existing.id,
      updated_at: new Date().toISOString(),
    };
    this.memoryDeliveryRates.set(id, updated);
    await this.putItem('delivery_rates', updated);
    this.saveToLocalStorageFallback();
    this.notifyListeners();
    return updated;
  }

  async deleteDeliveryRate(id: string): Promise<void> {
    await this.ensureInitialized();
    this.memoryDeliveryRates.delete(id);
    await this.deleteItem('delivery_rates', id);
    this.saveToLocalStorageFallback();
    this.notifyListeners();
  }

  async restoreDefaultDeliveryRates(): Promise<DeliveryRate[]> {
    await this.ensureInitialized();
    this.memoryDeliveryRates.clear();
    OFFICIAL_DELIVERY_RATES.forEach((r) => this.memoryDeliveryRates.set(r.id, { ...r }));

    try {
      const db = await this.getDB();
      if (db.objectStoreNames.contains('delivery_rates')) {
        const tx = db.transaction('delivery_rates', 'readwrite');
        tx.objectStore('delivery_rates').clear();
        OFFICIAL_DELIVERY_RATES.forEach((r) => tx.objectStore('delivery_rates').put(r));
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch {
      this.saveToLocalStorageFallback();
    }

    this.saveToLocalStorageFallback();
    this.notifyListeners();
    return Array.from(this.memoryDeliveryRates.values());
  }

  // ==================== RESTORE OFFICIAL DEMO DATA ====================

  async restoreOfficialDemoData(): Promise<void> {
    this.seedMemoryWithDefaults();

    try {
      const db = await this.getDB();
      const storeNames = ['products', 'categories', 'product_details', 'tables', 'settings'];
      if (db.objectStoreNames.contains('delivery_rates')) {
        storeNames.push('delivery_rates');
      }
      const tx = db.transaction(storeNames, 'readwrite');
      tx.objectStore('products').clear();
      tx.objectStore('categories').clear();
      tx.objectStore('product_details').clear();
      tx.objectStore('tables').clear();
      tx.objectStore('settings').clear();
      if (db.objectStoreNames.contains('delivery_rates')) {
        tx.objectStore('delivery_rates').clear();
      }

      getDefaultProducts().forEach((p) => tx.objectStore('products').put(p));
      getDefaultCategories().forEach((c) => tx.objectStore('categories').put(c));
      const defDetails = getDefaultProductDetails();
      Object.values(defDetails).forEach((d) => tx.objectStore('product_details').put(d));
      getDefaultTables().forEach((t) => tx.objectStore('tables').put(t));
      tx.objectStore('settings').put(getDefaultSettings());
      if (db.objectStoreNames.contains('delivery_rates')) {
        OFFICIAL_DELIVERY_RATES.forEach((r) => tx.objectStore('delivery_rates').put(r));
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      this.saveToLocalStorageFallback();
    }

    this.notifyListeners();
  }
}

export const adminRepository: IAdminRepository = new IndexedDBAdminRepository();
