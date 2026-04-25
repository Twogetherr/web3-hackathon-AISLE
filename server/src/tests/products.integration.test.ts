import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/productService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/productService")>();

  return {
    ...actual,
    listProducts: vi.fn(),
    getProductById: vi.fn(),
    searchProducts: vi.fn()
  };
});

import { createApp } from "../app";
import { getProductById, listProducts, searchProducts } from "../services/productService";

describe("product routes", () => {
  const listProductsMock = vi.mocked(listProducts);
  const getProductByIdMock = vi.mocked(getProductById);
  const searchProductsMock = vi.mocked(searchProducts);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated products in the standard API envelope", async () => {
    listProductsMock.mockResolvedValueOnce({
      results: [
        {
          id: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
          name: "Organic Oat Milk 1L",
          brand: "Oatly",
          category: "beverages",
          description: "Creamy oat milk for coffee and cereal.",
          priceUsdc: 4.99,
          imageUrl: "https://via.placeholder.com/400x400?text=Organic+Oat+Milk+1L",
          inStock: true,
          stockQty: 24,
          rating: 4.7,
          reviewCount: 142,
          tags: ["organic", "vegan"],
          providerId: "8f6dfb3f-fbc5-4e7e-b5f0-aaf19837c0ce",
          providerName: "Fresh Lane"
        }
      ],
      total: 1,
      limit: 20,
      offset: 0
    });

    const response = await request(createApp()).get("/api/products?limit=20&offset=0");

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.results).toHaveLength(1);
    expect(response.body.data.results[0].name).toBe("Organic Oat Milk 1L");
    expect(response.body.meta.requestId).toEqual(expect.any(String));
    expect(response.body.meta.timestamp).toEqual(expect.any(String));
  });

  it("returns a single product by id", async () => {
    getProductByIdMock.mockResolvedValueOnce({
      id: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
      name: "Organic Oat Milk 1L",
      brand: "Oatly",
      category: "beverages",
      description: "Creamy oat milk for coffee and cereal.",
      priceUsdc: 4.99,
      imageUrl: "https://via.placeholder.com/400x400?text=Organic+Oat+Milk+1L",
      inStock: true,
      stockQty: 24,
      rating: 4.7,
      reviewCount: 142,
      tags: ["organic", "vegan"],
      providerId: "8f6dfb3f-fbc5-4e7e-b5f0-aaf19837c0ce",
      providerName: "Fresh Lane"
    });

    const response = await request(createApp()).get(
      "/api/products/5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1"
    );

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.name).toBe("Organic Oat Milk 1L");
    expect(response.body.meta.requestId).toEqual(expect.any(String));
  });

  it("returns filtered product search results", async () => {
    searchProductsMock.mockResolvedValueOnce({
      results: [
        {
          id: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
          name: "Organic Oat Milk 1L",
          brand: "Oatly",
          category: "beverages",
          description: "Creamy oat milk for coffee and cereal.",
          priceUsdc: 4.99,
          imageUrl: "https://via.placeholder.com/400x400?text=Organic+Oat+Milk+1L",
          inStock: true,
          stockQty: 24,
          rating: 4.7,
          reviewCount: 142,
          tags: ["organic", "vegan"],
          providerId: "8f6dfb3f-fbc5-4e7e-b5f0-aaf19837c0ce",
          providerName: "Fresh Lane"
        }
      ],
      total: 1
    });

    const response = await request(createApp()).get(
      "/api/products/search?q=milk&category=beverages&maxPrice=5&tags=organic,vegan"
    );

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.results[0].priceUsdc).toBe(4.99);
  });

  it("returns INVALID_ID for a malformed product id", async () => {
    const response = await request(createApp()).get("/api/products/not-a-uuid");

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "INVALID_ID",
      message: "Product id must be a valid UUID."
    });
  });

  it("returns INVALID_PRICE for a non-positive maxPrice query", async () => {
    const response = await request(createApp()).get("/api/products/search?maxPrice=0");

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "INVALID_PRICE",
      message: "maxPrice must be greater than 0."
    });
  });
});
