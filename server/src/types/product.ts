export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  priceUsdc: number;
  imageUrl: string;
  inStock: boolean;
  stockQty: number;
  rating: number | null;
  reviewCount: number;
  tags: string[];
  providerId: string;
  providerName: string;
  /** Present on agent recommendation responses only. */
  matchScore?: number;
}

export interface ProductListResult {
  results: Product[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProductSearchResult {
  results: Product[];
  total: number;
}

export interface ProductSearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  providerNames?: string[];
  tags?: string[];
}
