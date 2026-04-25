import { randomUUID } from "node:crypto";
import {
  buildUnsignedFujiUsdcTransfer,
  getFujiExplorerUrl,
  getFujiUsdcBalance,
  pollFujiTransaction
} from "../lib/avalanche.js";
import { AppError } from "../lib/errors.js";
import { getCartById } from "./cartService.js";
import { createOrder } from "../repositories/orderRepository.js";
import type { CheckoutRequest, OrderConfirmation } from "../types/checkout.js";

/**
 * Creates or finalizes a Fuji-first checkout flow for a cart.
 *
 * @param input The checkout request payload.
 * @returns The order confirmation payload or unsigned transaction for signing.
 * @throws {AppError} Throws when the cart is invalid, empty, or underfunded.
 */
export async function createCheckout(input: CheckoutRequest): Promise<OrderConfirmation> {
  const cart = await getCartById(input.cartId);

  if (cart.items.length === 0 || cart.totalUsdc <= 0) {
    throw new AppError("EMPTY_CART", "Cart must contain at least one in-stock item.", 400);
  }

  const balanceUsdc = await getFujiUsdcBalance(input.walletAddress);

  if (balanceUsdc < cart.totalUsdc) {
    throw new AppError("INSUFFICIENT_BALANCE", "Wallet does not have enough USDC.", 400);
  }

  const unsignedTransaction = buildUnsignedFujiUsdcTransfer(cart.totalUsdc);

  console.info("Checkout transaction prepared", {
    requestId: "system",
    cartId: input.cartId,
    amountUsdc: cart.totalUsdc,
    walletAddress: input.walletAddress
  });

  if (input.txHash === undefined || input.txHash.length === 0) {
    return {
      orderId: randomUUID(),
      txHash: "",
      amountUsdc: cart.totalUsdc,
      status: "pending",
      confirmedAt: null,
      explorerUrl: "",
      unsignedTransaction
    };
  }

  const receipt = await pollFujiTransaction(input.txHash);
  const status = receipt === null ? "pending" : "confirmed";
  const confirmedAt = receipt === null ? null : new Date().toISOString();
  const persistedOrder = await createOrder({
    cartId: input.cartId,
    walletAddress: input.walletAddress,
    txHash: input.txHash,
    amountUsdc: cart.totalUsdc,
    status,
    confirmedAt: confirmedAt === null ? null : new Date(confirmedAt)
  });

  console.info("Checkout transaction submitted", {
    requestId: "system",
    cartId: input.cartId,
    txHash: input.txHash,
    status
  });

  return {
    ...persistedOrder,
    explorerUrl: getFujiExplorerUrl(input.txHash),
    unsignedTransaction
  };
}
