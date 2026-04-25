import type { GroceryListResponseData, RecommendResponseData } from "../types/agent";
import type { ApiEnvelope } from "../types/api";
import type { Cart } from "../types/cart";
import type { OrderConfirmation } from "../types/checkout";
import type { Product } from "../types/product";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (payload.error !== null || payload.data === null) {
    throw new Error(payload.error?.message ?? "Unknown API error.");
  }

  return payload.data;
}

/**
 * Calls the single-product recommendation endpoint.
 *
 * @param prompt The shopper prompt.
 * @returns The recommendation result payload.
 * @throws {Error} Throws when the API returns a structured error.
 */
export async function fetchRecommendations(prompt: string): Promise<RecommendResponseData> {
  return requestJson<RecommendResponseData>("/api/agent/recommend", {
    method: "POST",
    body: JSON.stringify({ prompt })
  });
}

/**
 * Calls the grocery-list endpoint.
 *
 * @param prompt The shopper prompt.
 * @returns The grocery-list result payload.
 * @throws {Error} Throws when the API returns a structured error.
 */
export async function fetchGroceryList(prompt: string): Promise<GroceryListResponseData> {
  return requestJson<GroceryListResponseData>("/api/agent/grocery-list", {
    method: "POST",
    body: JSON.stringify({ prompt, budget: 30 })
  });
}

/**
 * Adds a product snapshot to the anonymous cart.
 *
 * @param payload The add-to-cart request payload.
 * @returns The updated cart payload.
 * @throws {Error} Throws when the API returns a structured error.
 */
export async function postCartItem(payload: {
  cartId: string;
  productId: string;
  quantity: number;
}): Promise<Cart> {
  return requestJson<Cart>("/api/cart", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Calls the checkout endpoint for the active cart.
 *
 * @param payload The checkout request payload.
 * @returns The checkout confirmation payload.
 * @throws {Error} Throws when the API returns a structured error.
 */
export async function postCheckout(payload: {
  cartId: string;
  walletAddress: string;
  txHash?: string;
}): Promise<OrderConfirmation> {
  return requestJson<OrderConfirmation>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Fetches a single product by id.
 *
 * @param productId The product id to load.
 * @returns The full product payload.
 * @throws {Error} Throws when the API returns a structured error.
 */
export async function fetchProductById(productId: string): Promise<Product> {
  return requestJson<Product>(`/api/products/${productId}`);
}
