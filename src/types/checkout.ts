import { OrderModalityId, ServiceRhythm } from '../config/orderSettings';

export interface StagedCourseItem {
  lineId: string;
  course: number;
}

export type StagedCourseAssignment = number | 'first' | 'second';

/**
 * Normalizes any course pass input to a positive integer (1, 2, 3...).
 */
export function parseCoursePass(val: unknown): number {
  if (typeof val === 'number' && Number.isFinite(val) && val >= 1) {
    return Math.floor(val);
  }
  if (val === 'second' || val === '2') return 2;
  if (val === 'third' || val === '3') return 3;
  if (val === 'fourth' || val === '4') return 4;
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 1) return parsed;
  }
  return 1;
}

export function formatCoursePassLabel(pass: number): string {
  return `${pass}.º pase`;
}

export interface DineInData {
  tableId: string;
  customerName?: string;
  serviceRhythm: ServiceRhythm;
  stagedAssignments?: Record<string, number | 'first' | 'second'>; // lineId -> ordered pass number
  notes?: string;
}

export interface TakeawayData {
  customerName: string;
  phone: string;
  notes?: string;
}

export interface DeliveryData {
  customerName: string;
  phone: string;
  municipality?: string;
  zoneId?: string;
  zoneName?: string;
  customZoneName?: string;
  deliveryFee?: number | null;
  isFeePending?: boolean;
  address: string;
  landmarks?: string;
  notes?: string;
}

export interface CheckoutDraft {
  modality: OrderModalityId;
  dineIn: DineInData;
  takeaway: TakeawayData;
  delivery: DeliveryData;
  lastUpdated: number;
  revision: number;
}

export interface CheckoutValidationErrors {
  [field: string]: string;
}

export type StorageMedium = 'indexeddb' | 'localstorage' | 'memory' | 'none';

export interface StorageOperationResult {
  success: boolean;
  persisted: boolean; // true if written to durable storage (indexeddb or localstorage)
  medium: StorageMedium;
  error?: string;
}

export interface ClearDraftResult {
  success: boolean;
  clearedIndexedDB: boolean;
  clearedLocalStorage: boolean;
  clearedMemory: boolean;
  error?: string;
}

export interface LoadDraftResult {
  draft: CheckoutDraft | null;
  medium: StorageMedium;
  isStaleReconciled?: boolean;
  corruptEncountered?: boolean;
  warning?: string;
}

export interface ICheckoutRepository {
  loadDraft(): Promise<LoadDraftResult>;
  saveDraft(draft: CheckoutDraft): Promise<StorageOperationResult>;
  clearDraft(): Promise<ClearDraftResult>;
}
