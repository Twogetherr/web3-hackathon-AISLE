import {
  AI_CONTEXT_AGENT_INSTRUCTIONS,
  AI_CONTEXT_DESCRIPTION,
  AI_CONTEXT_PRICE_RANGE,
  PRODUCT_CATEGORIES
} from "../constants.js";
import { getEnvConfig } from "../env.js";
import type { AiContextResponse } from "../types/aiContext.js";

/**
 * Builds the AI discovery document for AISLE.
 *
 * @returns The machine-readable discovery document for AI agents.
 * @throws {Error} Throws when required environment configuration is invalid.
 */
export async function buildAiContext(): Promise<AiContextResponse> {
  const env = getEnvConfig();

  return {
    store: "AISLE",
    description: AI_CONTEXT_DESCRIPTION,
    endpoints: {
      products: "/api/products",
      search: "/api/products/search?q=",
      recommend: "/api/agent/recommend",
      groceryList: "/api/agent/grocery-list",
      cart: "/api/cart",
      checkout: "/api/checkout",
      productPage: "/api/products/:id"
    },
    payment: {
      chain: "Avalanche C-Chain",
      chainId: env.AVALANCHE_CHAIN_ID,
      stablecoin: "USDC",
      contractAddress: env.USDC_CONTRACT_ADDRESS
    },
    categories: [...PRODUCT_CATEGORIES],
    priceRange: { ...AI_CONTEXT_PRICE_RANGE },
    agentInstructions: AI_CONTEXT_AGENT_INSTRUCTIONS
  };
}

/**
 * Builds the degraded fallback discovery document when dynamic generation fails.
 *
 * @returns The static fallback discovery document with degraded mode enabled.
 * @throws {Error} Throws when required environment configuration is invalid.
 */
export function buildFallbackAiContext(): AiContextResponse {
  return {
    ...{
      store: "AISLE",
      description: AI_CONTEXT_DESCRIPTION,
      endpoints: {
        products: "/api/products",
        search: "/api/products/search?q=",
        recommend: "/api/agent/recommend",
        groceryList: "/api/agent/grocery-list",
        cart: "/api/cart",
        checkout: "/api/checkout",
        productPage: "/api/products/:id"
      },
      payment: {
        chain: "Avalanche C-Chain",
        chainId: getEnvConfig().AVALANCHE_CHAIN_ID,
        stablecoin: "USDC",
        contractAddress: getEnvConfig().USDC_CONTRACT_ADDRESS
      },
      categories: [...PRODUCT_CATEGORIES],
      priceRange: { ...AI_CONTEXT_PRICE_RANGE },
      agentInstructions: AI_CONTEXT_AGENT_INSTRUCTIONS
    },
    degraded: true
  };
}
