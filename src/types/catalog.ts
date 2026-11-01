export interface FeatureItem {
  id: string;
  title: string;
  iconName: 'utensils' | 'leaf' | 'bell' | 'heart';
}

export interface BusinessTheme {
  primaryGold: string;
  lightCream: string;
  darkSurface: string;
  darkBrown: string;
  warmBrown: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  slogan: string;
  location: string;
  heroImage: string;
  ambienceImage: string;
  features: FeatureItem[];
  theme: BusinessTheme;
}

// Backwards compatibility alias
export type BusinessProfile = Business;

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  currency: 'CUP';
  image: string;
  isIllustrativePhoto: boolean;
  notes?: string;
  available?: boolean;
}

export interface CatalogFilterOptions {
  categoryId?: string | null;
  searchQuery?: string;
}
