import type { Product } from "./product";

export interface RecommendResponseData {
  mode: "single";
  recommendations: Product[];
  reasoning: string;
  searchQuery: string;
  fallback: boolean;
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
