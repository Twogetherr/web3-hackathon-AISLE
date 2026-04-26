import { AppError } from "../lib/errors.js";
import {
  findProductById,
  findProducts,
  searchProductCatalogue
} from "../repositories/productRepository.js";
import type {
  Product,
  ProductListResult,
  ProductSearchParams,
  ProductSearchResult
} from "../types/product.js";
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

/**
 * Returns a paginated list of products.
 *
 * @param params The pagination inputs for the request.
 * @returns The paginated product result.
 * @throws Never.
 */
export async function listProducts(params?: {
  limit?: number;
  offset?: number;
}): Promise<ProductListResult> {
  const limit = params?.limit ?? DEFAULT_LIMIT;
  const offset = params?.offset ?? DEFAULT_OFFSET;

  return findProducts({ limit, offset });
}

/**
 * Returns a single product by id.
 *
 * @param productId The product UUID to fetch.
 * @returns The matching product.
 * @throws {AppError} Throws when the product does not exist.
 */
export async function getProductById(productId: string): Promise<Product> {
  const product = await findProductById(productId);

  if (product === null) {
    throw new AppError("NOT_FOUND", "Product not found.", 404);
  }

  return product;
}

/**
 * Searches products by text, category, max price, and tags.
 *
 * @param params The search inputs used to filter products.
 * @returns The filtered product search result.
 * @throws Never.
 */
export async function searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
  console.info("Product search executed", {
    requestId: "system",
    q: params.q ?? null,
    category: params.category ?? null,
    minPrice: params.minPrice ?? null,
    maxPrice: params.maxPrice ?? null,
    providerNames: params.providerNames ?? [],
    tags: params.tags ?? []
  });

  return searchProductCatalogue(params);
}
