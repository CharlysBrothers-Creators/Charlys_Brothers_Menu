import { Product, Category } from './catalog';
import { OrderModalityConfig, OrderModalityId, DemoTable } from '../config/orderSettings';
import { ProductDetails } from './productOptions';

export interface AdminProduct extends Product {
  description?: string;
  available: boolean;
}

export interface AdminCategory extends Category {
  active: boolean;
}

export interface AdminTable {
  id: string;
  label: string;
  zone: string;
  active: boolean;
}

import { BusinessOrderSettings } from '../config/orderSettings';
import { DeliveryRate } from './deliveryRate';

export interface AdminBusinessSettings extends BusinessOrderSettings {
  contactPhone: string;
  defaultModality: OrderModalityId;
  publicLogoUrl?: string;
}

export interface AdminDataSnapshot {
  products: AdminProduct[];
  categories: AdminCategory[];
  productDetails: Record<string, ProductDetails>;
  tables: AdminTable[];
  settings: AdminBusinessSettings;
  deliveryRates: DeliveryRate[];
  version: number;
}
