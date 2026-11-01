export interface Ingredient {
  id: string;
  name: string;
  iconName?: string;
  order?: number;
}

export interface CustomOption {
  id: string;
  name: string;
  type: 'extra' | 'remove' | 'variant';
  priceAdjustment: number; // 0 para gratis o exclusión, > 0 para recargo
  defaultSelected?: boolean;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  description?: string;
  type: 'single' | 'multiple'; // single (variante única) o multiple (extras/exclusiones)
  required?: boolean;
  options: CustomOption[];
}

export interface ProductDetails {
  productId: string;
  description?: string;
  images?: string[];
  ingredients?: Ingredient[];
  allergens?: string;
  allergensUnverifiedDisclaimer?: boolean;
  customizationGroups?: CustomizationGroup[];
  available?: boolean;
  preparationNotes?: string;
  isDemoData: boolean;
}

// Alias de retrocompatibilidad
export type ProductDemoDetails = ProductDetails;

export interface SelectedOptionsState {
  selectedOptionIds: string[];
  totalAdjustment: number;
}
