import { AppError } from "../lib/errors.js";
import { findCartById, upsertCartItem } from "../repositories/cartRepository.js";
import { getProductById } from "./productService.js";
import type { AddToCartRequest, Cart } from "../types/cart.js";

/**
 * Adds a product snapshot to the anonymous cart.
 *
 * @param input The add-to-cart request payload.
 * @returns The updated cart with snapshot pricing totals.
 * @throws {AppError} Throws when the product is invalid or unavailable.
 */
export async function addItemToCart(input: AddToCartRequest): Promise<Cart> {
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) {
    throw new AppError("INVALID_QUANTITY", "Quantity must be an integer between 1 and 99.", 400);
  }

  const product = await getProductById(input.productId);

  if (!product.inStock || product.stockQty <= 0) {
    throw new AppError("OUT_OF_STOCK", "Product is out of stock.", 400);
  }

  return upsertCartItem({
    cartId: input.cartId,
    productId: product.id,
    quantity: input.quantity,
    priceUsdc: product.priceUsdc,
    name: product.name,
    imageUrl: product.imageUrl
  });
}

/**
 * Returns an anonymous cart by id.
 *
 * @param cartId The anonymous session cart id.
 * @returns The persisted cart with snapshot totals.
 * @throws {AppError} Throws when no cart exists for the id.
 */
export async function getCartById(cartId: string): Promise<Cart> {
  const cart = await findCartById(cartId);

  if (cart === null) {
    throw new AppError("NOT_FOUND", "Cart not found.", 404);
  }

  return cart;
}
