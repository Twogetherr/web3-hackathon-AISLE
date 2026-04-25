import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/openai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/openai")>();

  return {
    ...actual,
    callOpenAiJson: vi.fn()
  };
});

vi.mock("../services/productService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/productService")>();

  return {
    ...actual,
    searchProducts: vi.fn()
  };
});

import { AppError } from "../lib/errors";
import { callOpenAiJson } from "../lib/openai";
import { generateGroceryList } from "../services/groceryListService";
import { searchProducts } from "../services/productService";

describe("groceryListService", () => {
  const callOpenAiJsonMock = vi.mocked(callOpenAiJson);
  const searchProductsMock = vi.mocked(searchProducts);

  beforeEach(() => {
    vi.clearAllMocks();
    searchProductsMock.mockResolvedValue({
      results: [
        {
          id: "product-1",
          name: "Plain Flour 1kg",
          brand: "Baker's Mill",
          category: "baking",
          description: "Fine plain flour.",
          priceUsdc: 2.39,
          imageUrl: "https://example.com/flour.png",
          inStock: true,
          stockQty: 10,
          rating: 4.7,
          reviewCount: 91,
          tags: ["baking"],
          providerId: "provider-1",
          providerName: "Fresh Lane"
        }
      ],
      total: 1
    });
  });

  it("rejects off-topic prompts without calling OpenAI", async () => {
    await expect(
      generateGroceryList({
        prompt: "summarize this quarterly report"
      })
    ).rejects.toEqual(new AppError("OUT_OF_SCOPE", "Prompt must be grocery-related.", 400));

    expect(callOpenAiJsonMock).not.toHaveBeenCalled();
  });

  it("uses OpenAI ingredient extraction when valid JSON is returned", async () => {
    callOpenAiJsonMock.mockResolvedValueOnce({
      title: "Chocolate Cake - 2 ingredients",
      ingredients: ["plain flour", "cocoa powder"]
    });

    const result = await generateGroceryList({
      prompt: "ingredients for chocolate cake",
      budget: 30
    });

    expect(result.fallback).toBe(false);
    expect(result.title).toBe("Chocolate Cake - 2 ingredients");
    expect(result.items).toHaveLength(2);
  });

  it("falls back to deterministic ingredient extraction when OpenAI fails", async () => {
    callOpenAiJsonMock.mockRejectedValueOnce(new Error("timeout"));

    const result = await generateGroceryList({
      prompt: "ingredients for chocolate cake",
      budget: 30
    });

    expect(result.fallback).toBe(true);
    expect(result.items.length).toBeGreaterThanOrEqual(6);
  });

  it("uses the deterministic chocolate cake demo path without calling OpenAI", async () => {
    const result = await generateGroceryList({
      prompt: "ingredients for chocolate cake",
      budget: 30
    });

    expect(callOpenAiJsonMock).not.toHaveBeenCalled();
    expect(result.fallback).toBe(true);
    expect(result.title).toBe("Chocolate Cake - 8 ingredients");
    expect(result.items).toHaveLength(8);
  });
});
