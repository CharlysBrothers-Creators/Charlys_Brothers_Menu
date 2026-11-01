import { BusinessOrderSettings, DBATULE_ORDER_SETTINGS } from '../config/orderSettings';
import {
  CheckoutDraft,
  ClearDraftResult,
  ICheckoutRepository,
  LoadDraftResult,
  StorageOperationResult,
} from '../types/checkout';
import { validateRestoredDraft } from './checkoutValidation';

const DB_NAME = 'dbatule_pwa_checkout_db';
const DB_VERSION = 1;
const STORE_NAME = 'checkout_draft';
const DRAFT_STORAGE_KEY = 'dbatule_pwa_checkout_draft_backup_v1';
const TOMBSTONE_STORAGE_KEY = 'dbatule_pwa_checkout_tombstone_v1';
const DRAFT_DOC_ID = 'current_draft';
const TOMBSTONE_DOC_ID = 'tombstone';
const OPEN_TIMEOUT_MS = 2500;

export interface StoredRecord {
  id: string;
  draft?: CheckoutDraft;
  isTombstone?: boolean;
  deletedAt?: number;
  revision?: number;
}

export class IndexedDBCheckoutRepository implements ICheckoutRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: CheckoutDraft | null = null;
  private memoryTombstone: { deletedAt: number; revision: number } | null = null;
  private settings: BusinessOrderSettings;

  // Custom hooks for test simulations
  private simulateIndexedDBFailure = false;
  private simulateLocalStorageFailure = false;
  private simulateTransactionAbort = false;

  constructor(settings: BusinessOrderSettings = DBATULE_ORDER_SETTINGS) {
    this.settings = settings;
  }

  /**
   * For automated testing: allows simulating specific storage failure modes.
   */
  public _setSimulatedFailures(options: {
    indexedDB?: boolean;
    localStorage?: boolean;
    abortTx?: boolean;
  }) {
    if (options.indexedDB !== undefined) this.simulateIndexedDBFailure = options.indexedDB;
    if (options.localStorage !== undefined) this.simulateLocalStorageFailure = options.localStorage;
    if (options.abortTx !== undefined) this.simulateTransactionAbort = options.abortTx;
    if (options.indexedDB) {
      this.dbPromise = null;
    }
  }

  private isIndexedDBAvailable(): boolean {
    if (this.simulateIndexedDBFailure) return false;
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable()) {
      return Promise.reject(new Error('IndexedDB no está disponible en este entorno.'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        let isSettled = false;

        const timer = setTimeout(() => {
          if (!isSettled) {
            isSettled = true;
            this.dbPromise = null; // Reset so next attempt can retry
            reject(new Error('Tiempo de espera agotado al abrir IndexedDB (posible bloqueo).'));
          }
        }, OPEN_TIMEOUT_MS);

        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
          };

          request.onsuccess = () => {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timer);
              resolve(request.result);
            }
          };

          request.onerror = () => {
            if (!isSettled) {
              isSettled = true;
              clearTimeout(timer);
              this.dbPromise = null; // Reset on error so retry is permitted
              reject(request.error || new Error('Error al abrir IndexedDB para checkout'));
            }
          };

          request.onblocked = () => {
            console.warn('IndexedDB checkout open blocked: base de datos bloqueada por otra pestaña.');
          };
        } catch (e) {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            this.dbPromise = null;
            reject(e);
          }
        }
      });
    }

    return this.dbPromise;
  }

  /**
   * Loads the draft with revision coherence between IndexedDB and localStorage,
   * respecting tombstone deletion markers and validating data structure.
   */
  async loadDraft(): Promise<LoadDraftResult> {
    let idbDraft: CheckoutDraft | null = null;
    let idbTombstone: { deletedAt: number; revision: number } | null = null;
    let idbCorrupt = false;
    let idbAvailable = false;

    // 1. Try reading from IndexedDB
    try {
      const db = await this.getDB();
      const readResult = await new Promise<{ draft: CheckoutDraft | null; tombstone: { deletedAt: number; revision: number } | null }>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const reqDraft = store.get(DRAFT_DOC_ID);
          const reqTombstone = store.get(TOMBSTONE_DOC_ID);

          let loadedDraft: CheckoutDraft | null = null;
          let loadedTombstone: { deletedAt: number; revision: number } | null = null;

          reqDraft.onsuccess = () => {
            if (reqDraft.result && reqDraft.result.draft) {
              loadedDraft = reqDraft.result.draft;
            }
          };

          reqTombstone.onsuccess = () => {
            if (reqTombstone.result && reqTombstone.result.isTombstone) {
              loadedTombstone = {
                deletedAt: reqTombstone.result.deletedAt || 0,
                revision: reqTombstone.result.revision || 0,
              };
            }
          };

          tx.oncomplete = () => {
            resolve({ draft: loadedDraft, tombstone: loadedTombstone });
          };

          tx.onerror = () => {
            this.dbPromise = null;
            reject(tx.error || new Error('Error en transacción de lectura IndexedDB'));
          };

          tx.onabort = () => {
            this.dbPromise = null;
            reject(new Error('Transacción de lectura abortada en IndexedDB'));
          };
        } catch (err) {
          this.dbPromise = null;
          reject(err);
        }
      });

      idbAvailable = true;
      idbTombstone = readResult.tombstone;

      if (readResult.draft) {
        const val = validateRestoredDraft(readResult.draft, this.settings);
        if (val.isValid && val.draft) {
          idbDraft = val.draft;
        } else if (val.isCorrupt) {
          idbCorrupt = true;
        }
      }
    } catch {
      idbAvailable = false;
      this.dbPromise = null;
    }

    // 2. Read from localStorage
    const localResult = this.readLocalStorage();
    const localDraft = localResult.draft;
    const localTombstone = localResult.tombstone;
    const localCorrupt = localResult.isCorrupt;

    // 3. Resolve active Tombstone
    const activeTombstone = this.getLatestTombstone(idbTombstone, localTombstone, this.memoryTombstone);

    // Filter out drafts invalidated by tombstone
    if (activeTombstone) {
      if (idbDraft && (idbDraft.revision <= activeTombstone.revision || idbDraft.lastUpdated <= activeTombstone.deletedAt)) {
        idbDraft = null;
      }
      if (localDraft && (localDraft.revision <= activeTombstone.revision || localDraft.lastUpdated <= activeTombstone.deletedAt)) {
        // Obsolete draft in localStorage
        this.clearLocalStorageKey(DRAFT_STORAGE_KEY);
      }
    }

    // 4. Revision Coherence: compare IndexedDB vs localStorage
    if (idbDraft && localDraft) {
      if (localDraft.revision > idbDraft.revision || (localDraft.revision === idbDraft.revision && localDraft.lastUpdated > idbDraft.lastUpdated)) {
        // localStorage is newer! Use localStorage and reconcile by updating IndexedDB
        this.memoryFallback = localDraft;
        this.reconcileToIndexedDB(localDraft).catch(() => {});
        return {
          draft: localDraft,
          medium: 'localstorage',
          isStaleReconciled: true,
          corruptEncountered: idbCorrupt || localCorrupt,
        };
      } else {
        // IndexedDB is newer or equal
        this.memoryFallback = idbDraft;
        this.writeLocalStorage(idbDraft);
        return {
          draft: idbDraft,
          medium: 'indexeddb',
          corruptEncountered: idbCorrupt || localCorrupt,
        };
      }
    }

    if (idbDraft) {
      this.memoryFallback = idbDraft;
      this.writeLocalStorage(idbDraft);
      return {
        draft: idbDraft,
        medium: 'indexeddb',
        corruptEncountered: idbCorrupt || localCorrupt,
      };
    }

    if (localDraft) {
      this.memoryFallback = localDraft;
      // Reconcile to IndexedDB if available
      if (idbAvailable) {
        this.reconcileToIndexedDB(localDraft).catch(() => {});
      }
      return {
        draft: localDraft,
        medium: 'localstorage',
        corruptEncountered: idbCorrupt || localCorrupt,
      };
    }

    // Check memory fallback
    if (this.memoryFallback) {
      if (activeTombstone && (this.memoryFallback.revision <= activeTombstone.revision || this.memoryFallback.lastUpdated <= activeTombstone.deletedAt)) {
        this.memoryFallback = null;
      } else {
        return {
          draft: this.memoryFallback,
          medium: 'memory',
          corruptEncountered: idbCorrupt || localCorrupt,
        };
      }
    }

    return {
      draft: null,
      medium: idbAvailable ? 'indexeddb' : 'none',
      corruptEncountered: idbCorrupt || localCorrupt,
    };
  }

  /**
   * Saves the draft following strict tier hierarchy:
   * 1. Attempt IndexedDB write. Confirm only when tx.oncomplete fires.
   * 2. If IndexedDB fails, attempt localStorage write.
   * 3. If both fail, keep in memory and return failure so UI can warn user.
   */
  async saveDraft(draft: CheckoutDraft): Promise<StorageOperationResult> {
    // Keep in-memory copy with updated revision
    this.memoryFallback = draft;
    this.memoryTombstone = null;

    let idbSucceeded = false;
    let idbError: string | undefined;

    // 1. Try IndexedDB
    try {
      if (this.simulateTransactionAbort) {
        throw new Error('Transacción abortada simulada');
      }

      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);

          // Clear any obsolete tombstone and write draft
          store.delete(TOMBSTONE_DOC_ID);
          store.put({ id: DRAFT_DOC_ID, draft });

          tx.oncomplete = () => {
            idbSucceeded = true;
            resolve();
          };

          tx.onerror = () => {
            this.dbPromise = null;
            reject(tx.error || new Error('Error en transacción de escritura IndexedDB'));
          };

          tx.onabort = () => {
            this.dbPromise = null;
            reject(new Error('Transacción abortada en IndexedDB'));
          };
        } catch (txErr) {
          this.dbPromise = null;
          reject(txErr);
        }
      });
    } catch (err: unknown) {
      idbSucceeded = false;
      this.dbPromise = null;
      idbError = err instanceof Error ? err.message : 'Fallo en IndexedDB';
    }

    if (idbSucceeded) {
      // Also sync to localStorage as secondary safety backup
      this.writeLocalStorage(draft);
      this.clearLocalStorageKey(TOMBSTONE_STORAGE_KEY);
      return {
        success: true,
        persisted: true,
        medium: 'indexeddb',
      };
    }

    // 2. Fallback: Try saving to localStorage
    const localSucceeded = this.writeLocalStorage(draft);
    if (localSucceeded) {
      this.clearLocalStorageKey(TOMBSTONE_STORAGE_KEY);
      return {
        success: true,
        persisted: true,
        medium: 'localstorage',
        error: idbError,
      };
    }

    // 3. Both failed: Data is only in memory
    return {
      success: false,
      persisted: false,
      medium: 'memory',
      error: 'No se pudo guardar el borrador en almacenamiento persistente (IndexedDB ni localStorage).',
    };
  }

  /**
   * Real deletion of personal draft data across IndexedDB, localStorage, and memory.
   * Writes a deletion tombstone to prevent resurrection from delayed or race-condition reads.
   */
  async clearDraft(): Promise<ClearDraftResult> {
    const deletedAt = Date.now();
    const tombstoneRev = (this.memoryFallback?.revision || 0) + 1;

    // 1. Clear memory
    this.memoryFallback = null;
    this.memoryTombstone = { deletedAt, revision: tombstoneRev };

    // 2. Clear localStorage and write local tombstone
    let localCleared = false;
    try {
      if (!this.simulateLocalStorageFailure) {
        this.clearLocalStorageKey(DRAFT_STORAGE_KEY);
        this.writeTombstoneToLocalStorage(deletedAt, tombstoneRev);
        localCleared = true;
      }
    } catch {
      localCleared = false;
    }

    // 3. Delete from IndexedDB and record tombstone
    let idbCleared = false;
    let idbError: string | undefined;

    try {
      if (this.simulateTransactionAbort) {
        throw new Error('Transacción de borrado abortada');
      }

      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);

          store.delete(DRAFT_DOC_ID);
          store.put({ id: TOMBSTONE_DOC_ID, isTombstone: true, deletedAt, revision: tombstoneRev });

          tx.oncomplete = () => {
            idbCleared = true;
            resolve();
          };

          tx.onerror = () => {
            this.dbPromise = null;
            reject(tx.error || new Error('Error al borrar borrador en IndexedDB'));
          };

          tx.onabort = () => {
            this.dbPromise = null;
            reject(new Error('Transacción de borrado abortada en IndexedDB'));
          };
        } catch (e) {
          this.dbPromise = null;
          reject(e);
        }
      });
    } catch (err: unknown) {
      idbCleared = false;
      this.dbPromise = null;
      idbError = err instanceof Error ? err.message : 'Fallo al borrar en IndexedDB';
    }

    // If at least one persistent tier (or fallback) was cleared, overall operation is successful
    const overallSuccess = idbCleared || localCleared;

    return {
      success: overallSuccess,
      clearedIndexedDB: idbCleared,
      clearedLocalStorage: localCleared,
      clearedMemory: true,
      error: (idbCleared && localCleared) ? undefined : (idbError || (localCleared ? undefined : 'Fallo al limpiar el almacenamiento local')),
    };
  }

  // --- Helper Methods ---

  private readLocalStorage(): {
    draft: CheckoutDraft | null;
    tombstone: { deletedAt: number; revision: number } | null;
    isCorrupt: boolean;
  } {
    if (this.simulateLocalStorageFailure || typeof window === 'undefined' || !window.localStorage) {
      return { draft: null, tombstone: null, isCorrupt: false };
    }

    let tombstone: { deletedAt: number; revision: number } | null = null;
    try {
      const rawTombstone = window.localStorage.getItem(TOMBSTONE_STORAGE_KEY);
      if (rawTombstone) {
        const parsed = JSON.parse(rawTombstone);
        if (parsed && typeof parsed.deletedAt === 'number') {
          tombstone = { deletedAt: parsed.deletedAt, revision: parsed.revision || 0 };
        }
      }
    } catch {
      // Ignore tombstone parse error
    }

    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return { draft: null, tombstone, isCorrupt: false };
      }

      const parsed = JSON.parse(raw);
      const val = validateRestoredDraft(parsed, this.settings);
      if (val.isValid && val.draft) {
        return { draft: val.draft, tombstone, isCorrupt: false };
      } else {
        return { draft: null, tombstone, isCorrupt: val.isCorrupt };
      }
    } catch {
      return { draft: null, tombstone, isCorrupt: true };
    }
  }

  private writeLocalStorage(draft: CheckoutDraft): boolean {
    if (this.simulateLocalStorageFailure || typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      return true;
    } catch {
      return false;
    }
  }

  private clearLocalStorageKey(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    }
  }

  private writeTombstoneToLocalStorage(deletedAt: number, revision: number): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          TOMBSTONE_STORAGE_KEY,
          JSON.stringify({ isTombstone: true, deletedAt, revision })
        );
      } catch {
        // Ignore
      }
    }
  }

  private getLatestTombstone(
    a: { deletedAt: number; revision: number } | null,
    b: { deletedAt: number; revision: number } | null,
    c: { deletedAt: number; revision: number } | null
  ): { deletedAt: number; revision: number } | null {
    const list = [a, b, c].filter(Boolean) as { deletedAt: number; revision: number }[];
    if (list.length === 0) return null;
    return list.reduce((prev, curr) => (curr.deletedAt > prev.deletedAt ? curr : prev));
  }

  private async reconcileToIndexedDB(draft: CheckoutDraft): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.delete(TOMBSTONE_DOC_ID);
          store.put({ id: DRAFT_DOC_ID, draft });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(new Error('Transacción abortada'));
        } catch (e) {
          reject(e);
        }
      });
    } catch {
      // Reconcile is best-effort
    }
  }
}

export const checkoutRepository = new IndexedDBCheckoutRepository();
