import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/cartService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/cartService")>();

  return {
    ...actual,
    addItemToCart: vi.fn(),
    getCartById: vi.fn(),
    replaceCartItems: vi.fn()
  };
});

import { createApp } from "../app";
import { AppError } from "../lib/errors";
import { addItemToCart, getCartById, replaceCartItems } from "../services/cartService";

describe("cart routes", () => {
  const addItemToCartMock = vi.mocked(addItemToCart);
  const getCartByIdMock = vi.mocked(getCartById);
  const replaceCartItemsMock = vi.mocked(replaceCartItems);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds a snapshot item to the cart and returns the cart envelope", async () => {
    addItemToCartMock.mockResolvedValueOnce({
      id: "aisle-session-1",
      items: [
        {
          productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
          quantity: 2,
          priceUsdc: 4.99,
          name: "Organic Oat Milk 1L",
          imageUrl: "https://example.com/oat-milk.png"
        }
      ],
      createdAt: "2026-04-25T08:00:00.000Z",
      updatedAt: "2026-04-25T08:01:00.000Z",
      totalUsdc: 9.98
    });

    const response = await request(createApp()).post("/api/cart").send({
      cartId: "aisle-session-1",
      productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
      quantity: 2
    });

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.id).toBe("aisle-session-1");
    expect(response.body.data.totalUsdc).toBe(9.98);
    expect(response.body.data.items[0].name).toBe("Organic Oat Milk 1L");
  });

  it("returns a persisted cart by id", async () => {
    getCartByIdMock.mockResolvedValueOnce({
      id: "aisle-session-1",
      items: [],
      createdAt: "2026-04-25T08:00:00.000Z",
      updatedAt: "2026-04-25T08:01:00.000Z",
      totalUsdc: 0
    });

    const response = await request(createApp()).get("/api/cart/aisle-session-1");

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.id).toBe("aisle-session-1");
    expect(response.body.data.items).toEqual([]);
  });

  it("validates quantity before calling the cart service", async () => {
    const response = await request(createApp()).post("/api/cart").send({
      cartId: "aisle-session-1",
      productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
      quantity: 0
    });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "INVALID_QUANTITY",
      message: "Quantity must be an integer between 1 and 99."
    });
    expect(addItemToCartMock).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when the cart service cannot find the cart", async () => {
    getCartByIdMock.mockRejectedValueOnce(new AppError("NOT_FOUND", "Cart not found.", 404));

    const response = await request(createApp()).get("/api/cart/missing-cart");

    expect(response.status).toBe(404);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "NOT_FOUND",
      message: "Cart not found."
    });
  });

  it("replaces a cart snapshot when a valid items payload is provided", async () => {
    replaceCartItemsMock.mockResolvedValueOnce({
      id: "aisle-session-1",
      items: [
        {
          productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
          quantity: 1,
          priceUsdc: 4.99,
          name: "Organic Oat Milk 1L",
          imageUrl: "https://example.com/oat-milk.png"
        }
      ],
      createdAt: "2026-04-25T08:00:00.000Z",
      updatedAt: "2026-04-25T08:02:00.000Z",
      totalUsdc: 4.99
    });

    const response = await request(createApp())
      .put("/api/cart/aisle-session-1/replace")
      .send({
        items: [{ productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1", quantity: 1 }]
      });

    expect(response.status).toBe(200);
    expect(replaceCartItemsMock).toHaveBeenCalledWith("aisle-session-1", [
      { productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1", quantity: 1 }
    ]);
    expect(response.body.data.totalUsdc).toBe(4.99);
  });
});
