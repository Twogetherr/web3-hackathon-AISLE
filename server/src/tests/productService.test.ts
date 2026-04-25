import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../repositories/productRepository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../repositories/productRepository")>();

  return {
    ...actual,
    findProductById: vi.fn(),
    findProducts: vi.fn(),
    searchProductCatalogue: vi.fn()
  };
});

import { AppError } from "../lib/errors";
import { findProductById, findProducts, searchProductCatalogue } from "../repositories/productRepository";
import { getProductById, listProducts, searchProducts } from "../services/productService";

describe("productService", () => {
  const findProductsMock = vi.mocked(findProducts);
  const findProductByIdMock = vi.mocked(findProductById);
  const searchProductCatalogueMock = vi.mocked(searchProductCatalogue);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates paginated product listing to the repository", async () => {
    findProductsMock.mockResolvedValueOnce({
      results: [],
      total: 0,
      limit: 20,
      offset: 0
    });

    const result = await listProducts({ limit: 20, offset: 0 });

    expect(findProductsMock).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    expect(result).toEqual({
      results: [],
      total: 0,
      limit: 20,
      offset: 0
    });
  });

  it("throws NOT_FOUND when the repository returns no product", async () => {
    findProductByIdMock.mockResolvedValueOnce(null);

    await expect(getProductById("5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1")).rejects.toEqual(
      new AppError("NOT_FOUND", "Product not found.", 404)
    );
  });

  it("delegates filtered search to the repository", async () => {
    searchProductCatalogueMock.mockResolvedValueOnce({
      results: [],
      total: 0
    });

    const result = await searchProducts({
      q: "milk",
      category: "beverages",
      maxPrice: 5,
      tags: ["organic", "vegan"]
    });

    expect(searchProductCatalogueMock).toHaveBeenCalledWith({
      q: "milk",
      category: "beverages",
      maxPrice: 5,
      tags: ["organic", "vegan"]
    });
    expect(result).toEqual({
      results: [],
      total: 0
    });
  });
});
