export interface AiContextEndpoints {
  products: string;
  search: string;
  recommend: string;
  groceryList: string;
  cart: string;
  checkout: string;
  productPage: string;
}

export interface AiContextPayment {
  chain: string;
  chainId: number;
  stablecoin: string;
  contractAddress: string;
}

export interface AiContextPriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface AiContextResponse {
  store: string;
  description: string;
  endpoints: AiContextEndpoints;
  payment: AiContextPayment;
  categories: string[];
  priceRange: AiContextPriceRange;
  agentInstructions: string;
  degraded?: boolean;
}
