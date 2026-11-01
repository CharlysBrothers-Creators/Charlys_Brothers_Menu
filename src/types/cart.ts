export interface CartOptionItem {
  id: string;
  name: string;
  groupId: string;
  groupTitle: string;
  type: 'extra' | 'remove' | 'variant';
  priceAdjustment: number; // in CUP (>= 0)
}

export interface CartItem {
  id: string; // Unique line id
  productId: string;
  productName: string;
  productImage: string;
  categoryId: string;
  quantity: number;
  selectedOptions: CartOptionItem[];
  unitBasePrice: number; // in CUP
  unitExtrasTotal: number; // in CUP
  unitFinalPrice: number; // unitBasePrice + unitExtrasTotal
  lineTotal: number; // unitFinalPrice * quantity
  isDemoData?: boolean; // flags whether item uses demo profile / demo options
}

export interface CartSummary {
  items: CartItem[];
  totalItemsCount: number; // total quantity across all lines
  totalUniqueLines: number;
  subtotalBase: number;
  subtotalExtras: number;
  grandTotal: number;
  hasDemoItems: boolean;
}

export interface ICartRepository {
  loadCart(): Promise<CartItem[]>;
  saveCart(items: CartItem[]): Promise<void>;
  clearCart(): Promise<void>;
}
