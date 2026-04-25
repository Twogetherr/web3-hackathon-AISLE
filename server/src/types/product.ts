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
  maxPrice?: number;
  tags?: string[];
}
