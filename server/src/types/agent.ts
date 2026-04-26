import type { Product } from "./product.js";

export interface AgentFilters {
  tags?: string[];
  category?: string;
  providerNames?: string[];
}

export interface RecommendRequest {
  prompt: string;
  minPrice?: number;
  maxPrice?: number;
  filters?: AgentFilters;
  /** 0 = first page; each increment rotates the next window of up to 3 catalogue picks. */
  refreshGeneration?: number;
}

export interface RecommendResponseData {
  mode: "single";
  recommendations: Product[];
  reasoning: string;
  searchQuery: string;
  fallback: boolean;
}

export interface GroceryListRequest {
  prompt: string;
  budget?: number;
  excludeItems?: string[];
  remainingBudget?: number;
}

export interface GroceryListItem {
  ingredient: string;
  product: Product | null;
  quantity: number;
  lineTotal: number;
  matched: boolean;
}

export interface GroceryListResponseData {
  mode: "list";
  title: string;
  items: GroceryListItem[];
  totalUsdc: number;
  overBudget: boolean;
  budgetRemaining: number | null;
  fallback: boolean;
}
