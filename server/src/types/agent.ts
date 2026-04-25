import type { Product } from "./product.js";

export interface AgentFilters {
  tags?: string[];
  category?: string;
}

export interface RecommendRequest {
  prompt: string;
  maxPrice?: number;
  filters?: AgentFilters;
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
