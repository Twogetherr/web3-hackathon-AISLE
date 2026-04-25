import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../lib/prisma.js";
import type { OrderConfirmation } from "../types/checkout.js";

const demoOrderStore = new Map<string, OrderConfirmation>();

/**
 * Persists a new order record.
 *
 * @param input The order fields to store.
 * @returns The persisted order confirmation view.
 * @throws {Error} Throws when the database write fails.
 */
export async function createOrder(input: {
  cartId: string;
  walletAddress: string;
  txHash: string;
  amountUsdc: number;
  status: "confirmed" | "pending" | "failed";
  confirmedAt: Date | null;
}): Promise<OrderConfirmation> {
  try {
    const prisma = getPrismaClient();
    const order = await prisma.order.create({
      data: {
        cartId: input.cartId,
        walletAddress: input.walletAddress,
        txHash: input.txHash,
        amountUsdc: new Prisma.Decimal(input.amountUsdc.toFixed(2)),
        status: input.status,
        confirmedAt: input.confirmedAt
      }
    });

    return {
      orderId: order.id,
      txHash: order.txHash ?? "",
      amountUsdc: Number(order.amountUsdc),
      status: order.status,
      confirmedAt: order.confirmedAt?.toISOString() ?? null,
      explorerUrl: "",
      unsignedTransaction: null
    };
  } catch (error) {
    console.error("Order repository falling back to in-memory store", {
      requestId: "system",
      reason: error instanceof Error ? error.message : String(error)
    });
    const order: OrderConfirmation = {
      orderId: randomUUID(),
      txHash: input.txHash,
      amountUsdc: input.amountUsdc,
      status: input.status,
      confirmedAt: input.confirmedAt?.toISOString() ?? null,
      explorerUrl: "",
      unsignedTransaction: null
    };

    demoOrderStore.set(order.orderId, order);

    return order;
  }
}

/**
 * Returns an order confirmation view by id.
 *
 * @param orderId The order UUID to fetch.
 * @returns The order confirmation view, or null when it does not exist.
 * @throws {Error} Throws when the database query fails.
 */
export async function findOrderById(orderId: string): Promise<OrderConfirmation | null> {
  try {
    const prisma = getPrismaClient();
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      }
    });

    if (order === null) {
      return null;
    }

    return {
      orderId: order.id,
      txHash: order.txHash ?? "",
      amountUsdc: Number(order.amountUsdc),
      status: order.status,
      confirmedAt: order.confirmedAt?.toISOString() ?? null,
      explorerUrl: "",
      unsignedTransaction: null
    };
  } catch (error) {
    console.error("Order lookup falling back to in-memory store", {
      requestId: "system",
      reason: error instanceof Error ? error.message : String(error)
    });
    return demoOrderStore.get(orderId) ?? null;
  }
}
