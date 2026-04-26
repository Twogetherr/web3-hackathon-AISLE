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
