import { OrderModalityId, ServiceRhythm } from '../config/orderSettings';
import { CartOptionItem } from './cart';

export type ComandaStatus =
  | 'new'
  | 'in_preparation'
  | 'partially_ready'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type ComandaLineStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface ComandaLineItem {
  id: string; // Unique per comanda line
  cartLineId: string;
  productId: string;
  productName: string;
  productImage: string;
  categoryId: string;
  quantity: number;
  unitBasePrice: number;
  unitExtrasTotal: number;
  unitFinalPrice: number;
  lineTotal: number;
  selectedOptions: CartOptionItem[];
  isDemoData?: boolean;
  status: ComandaLineStatus;
  passNumber: number; // 1, 2, 3...
  statusUpdatedAt: number;
}

export interface ComandaCustomerSnapshot {
  modality: OrderModalityId;
  modalityTitle: string;
  tableId?: string;
  tableName?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  landmarks?: string;
  notes?: string;
  serviceRhythm: ServiceRhythm;
  serviceRhythmLabel: string;
}

export interface ComandaFinancialSummary {
  subtotalBase: number;
  subtotalExtras: number;
  grandTotal: number;
  totalItemsCount: number;
  shippingStatus: 'pending_confirmation' | 'free' | 'none';
}

export interface ComandaHistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  fromStatus?: ComandaStatus;
  toStatus?: ComandaStatus;
  lineId?: string;
  note?: string;
}

export interface Comanda {
  id: string; // e.g. "DBT-20261030-9842"
  code: string; // Short code, e.g. "#101"
  createdAt: number;
  updatedAt: number;
  status: ComandaStatus;
  customer: ComandaCustomerSnapshot;
  items: ComandaLineItem[];
  summary: ComandaFinancialSummary;
  history: ComandaHistoryEntry[];
  cancellationReason?: string;
}

export interface ComandaFilter {
  status?: ComandaStatus | 'all' | 'active';
  modality?: OrderModalityId | 'all';
  search?: string;
}
