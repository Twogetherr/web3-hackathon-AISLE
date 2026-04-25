import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/checkoutService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/checkoutService")>();

  return {
    ...actual,
    createCheckout: vi.fn()
  };
});

vi.mock("../services/orderService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/orderService")>();

  return {
    ...actual,
    getOrderById: vi.fn()
  };
});

import { createApp } from "../app";
import { AppError } from "../lib/errors";
import { createCheckout } from "../services/checkoutService";
import { getOrderById } from "../services/orderService";

describe("checkout and order routes", () => {
  const createCheckoutMock = vi.mocked(createCheckout);
  const getOrderByIdMock = vi.mocked(getOrderById);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a confirmed checkout result in the standard envelope", async () => {
    createCheckoutMock.mockResolvedValueOnce({
      orderId: "c1bb8f81-393c-4b03-a9c8-a80d365be9e9",
      txHash: "0xabc123",
      amountUsdc: 9.98,
      status: "confirmed",
      confirmedAt: "2026-04-25T08:10:00.000Z",
      explorerUrl: "https://testnet.snowtrace.io/tx/0xabc123",
      unsignedTransaction: {
        to: "0x5425890298aed601595a70AB815c96711a31Bc65",
        data: "0xa9059cbb",
        value: "0x0",
        gasLimit: "65000"
      }
    });

    const response = await request(createApp()).post("/api/checkout").send({
      cartId: "aisle-session-1",
      walletAddress: "0x1111111111111111111111111111111111111111"
    });

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.status).toBe("confirmed");
    expect(response.body.data.txHash).toBe("0xabc123");
    expect(response.body.data.explorerUrl).toContain("snowtrace");
  });

  it("returns INSUFFICIENT_BALANCE when balance check fails", async () => {
    createCheckoutMock.mockRejectedValueOnce(
      new AppError("INSUFFICIENT_BALANCE", "Wallet does not have enough USDC.", 400)
    );

    const response = await request(createApp()).post("/api/checkout").send({
      cartId: "aisle-session-1",
      walletAddress: "0x1111111111111111111111111111111111111111"
    });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "INSUFFICIENT_BALANCE",
      message: "Wallet does not have enough USDC."
    });
  });

  it("validates the wallet address before calling checkout service", async () => {
    const response = await request(createApp()).post("/api/checkout").send({
      cartId: "aisle-session-1",
      walletAddress: "not-an-address"
    });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "INVALID_WALLET_ADDRESS",
      message: "walletAddress must be a valid EVM address."
    });
    expect(createCheckoutMock).not.toHaveBeenCalled();
  });

  it("returns a stored order by id", async () => {
    getOrderByIdMock.mockResolvedValueOnce({
      orderId: "c1bb8f81-393c-4b03-a9c8-a80d365be9e9",
      txHash: "0xabc123",
      amountUsdc: 9.98,
      status: "pending",
      confirmedAt: null,
      explorerUrl: "https://testnet.snowtrace.io/tx/0xabc123",
      unsignedTransaction: null
    });

    const response = await request(createApp()).get(
      "/api/orders/c1bb8f81-393c-4b03-a9c8-a80d365be9e9"
    );

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.status).toBe("pending");
  });
});
