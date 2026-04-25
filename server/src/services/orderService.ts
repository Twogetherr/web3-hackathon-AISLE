import { getFujiExplorerUrl } from "../lib/avalanche.js";
import { AppError } from "../lib/errors.js";
import { findOrderById } from "../repositories/orderRepository.js";
import type { OrderConfirmation } from "../types/checkout.js";

/**
 * Returns a stored order confirmation by id.
 *
 * @param orderId The order UUID to fetch.
 * @returns The stored order confirmation payload.
 * @throws {AppError} Throws when the order does not exist.
 */
export async function getOrderById(orderId: string): Promise<OrderConfirmation> {
  const order = await findOrderById(orderId);

  if (order === null) {
    throw new AppError("NOT_FOUND", "Order not found.", 404);
  }

  return {
    ...order,
    explorerUrl: order.txHash.length > 0 ? getFujiExplorerUrl(order.txHash) : "",
    unsignedTransaction: null
  };
}
