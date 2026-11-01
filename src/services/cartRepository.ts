import { CartItem, ICartRepository } from '../types/cart';

const DB_NAME = 'dbatule_pwa_cart_db';
const DB_VERSION = 1;
const STORE_NAME = 'cart_items';
const LOCAL_STORAGE_BACKUP_KEY = 'dbatule_pwa_cart_backup_v1';

export class IndexedDBCartRepository implements ICartRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: CartItem[] = [];

  private isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable()) {
      return Promise.reject(new Error('IndexedDB is not available in this environment.'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
          };

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            console.error('IndexedDB open error:', request.error);
            reject(request.error || new Error('Error al abrir base de datos IndexedDB'));
          };

          request.onblocked = () => {
            console.warn('IndexedDB open blocked: database is locked by another tab.');
          };
        } catch (e) {
          reject(e);
        }
      });
    }

    return this.dbPromise;
  }

  /**
   * Loads cart items from IndexedDB, falling back to localStorage/memory without losing data.
   */
  async loadCart(): Promise<CartItem[]> {
    try {
      const db = await this.getDB();
      return await new Promise<CartItem[]>((resolve, reject) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.getAll();

          request.onsuccess = () => {
            const result = (request.result as CartItem[]) || [];
            // Keep memory fallback in sync
            this.memoryFallback = result;
            this.syncLocalStorageBackup(result);
            resolve(result);
          };

          request.onerror = () => {
            console.warn('Error reading from IndexedDB, trying fallback:', request.error);
            resolve(this.loadFromFallback());
          };
        } catch (txErr) {
          console.warn('Transaction error in IndexedDB load:', txErr);
          resolve(this.loadFromFallback());
        }
      });
    } catch (err) {
      console.warn('IndexedDB unavailable on load, using fallback:', err);
      return this.loadFromFallback();
    }
  }

  /**
   * Saves the entire list of cart items into IndexedDB atomically.
   */
  async saveCart(items: CartItem[]): Promise<void> {
    this.memoryFallback = items;
    this.syncLocalStorageBackup(items);

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);

          // Clear previous items in the store
          const clearReq = store.clear();

          clearReq.onsuccess = () => {
            // Write each new item
            if (items.length === 0) {
              return;
            }
            items.forEach((item) => {
              store.put(item);
            });
          };

          transaction.oncomplete = () => {
            resolve();
          };

          transaction.onerror = () => {
            console.error('IndexedDB save transaction error:', transaction.error);
            // Even if IndexedDB fails, memory and localStorage backup have the items
            resolve();
          };

          transaction.onabort = () => {
            console.warn('IndexedDB save transaction aborted');
            resolve();
          };
        } catch (err) {
          console.error('IndexedDB transaction creation error:', err);
          resolve();
        }
      });
    } catch (err) {
      console.warn('Failed to access IndexedDB during save, saved in fallback:', err);
    }
  }

  /**
   * Clears the cart in IndexedDB and fallback stores.
   */
  async clearCart(): Promise<void> {
    this.memoryFallback = [];
    this.syncLocalStorageBackup([]);

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          store.clear();

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // Ignored since memory and local storage are cleared
    }
  }

  private syncLocalStorageBackup(items: CartItem[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage backup failed:', e);
      }
    }
  }

  private loadFromFallback(): CartItem[] {
    if (this.memoryFallback.length > 0) {
      return [...this.memoryFallback];
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.memoryFallback = parsed;
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Could not read from localStorage fallback:', e);
      }
    }
    return [];
  }
}

// Export singleton repository instance to decouple persistence from components
export const cartRepository: ICartRepository = new IndexedDBCartRepository();
