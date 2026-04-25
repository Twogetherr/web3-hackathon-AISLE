export const PRODUCT_CATEGORIES = [
  "dairy",
  "produce",
  "bakery",
  "beverages",
  "pantry",
  "meat",
  "frozen",
  "snacks",
  "condiments",
  "baking"
] as const;

export const AI_CONTEXT_PRICE_RANGE = {
  min: 0.5,
  max: 50,
  currency: "USDC"
} as const;

export const AI_CONTEXT_DESCRIPTION = "Agent-friendly grocery storefront. No CAPTCHAs.";

export const AI_CONTEXT_AGENT_INSTRUCTIONS =
  "For single items: POST /api/agent/recommend. For recipes or grocery lists: POST /api/agent/grocery-list. Add to cart: POST /api/cart. Buy now: POST /api/checkout directly. Pay with USDC on Avalanche C-Chain.";
