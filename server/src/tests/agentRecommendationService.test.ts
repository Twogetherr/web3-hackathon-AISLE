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
import { recommendProducts } from "../services/agentRecommendationService";
import { searchProducts } from "../services/productService";
import type { Product } from "../types/product";

describe("agentRecommendationService", () => {
  const callOpenAiJsonMock = vi.mocked(callOpenAiJson);
  const searchProductsMock = vi.mocked(searchProducts);

  beforeEach(() => {
    vi.clearAllMocks();
    callOpenAiJsonMock.mockReset();
    searchProductsMock.mockResolvedValue({
      results: [
        {
          id: "product-1",
          name: "Organic Oat Milk 1L",
          brand: "Oatly",
          category: "beverages",
          description: "Creamy oat milk.",
          priceUsdc: 4.79,
          imageUrl: "https://example.com/oat-milk.png",
          inStock: true,
          stockQty: 10,
          rating: 4.7,
          reviewCount: 142,
          tags: ["organic", "vegan"],
          providerId: "provider-1",
          providerName: "Fresh Lane"
        }
      ],
      total: 1
    });
  });

  it("rejects off-topic prompts without calling OpenAI", async () => {
    await expect(
      recommendProducts({
        prompt: "write me a haiku about the moon"
      })
    ).rejects.toEqual(new AppError("OUT_OF_SCOPE", "Prompt must be grocery-related.", 400));

    expect(callOpenAiJsonMock).not.toHaveBeenCalled();
  });

  it("uses OpenAI-ranked recommendations when valid JSON is returned", async () => {
    callOpenAiJsonMock.mockResolvedValueOnce({
      recommendations: [
        {
          id: "product-1"
        }
      ],
      reasoning: "This is the best organic oat milk under budget.",
      searchQuery: "organic oat milk"
    });

    const result = await recommendProducts({
      prompt: "organic oat milk under $5"
    });

    expect(result.fallback).toBe(false);
    expect(result.recommendations[0]?.name).toBe("Organic Oat Milk 1L");
    expect(result.searchQuery).toBe("organic oat milk");
  });

  it("falls back to catalogue ordering when OpenAI times out", async () => {
    callOpenAiJsonMock.mockRejectedValueOnce(new Error("timeout"));

    const result = await recommendProducts({
      prompt: "organic oat milk under $5"
    });

    expect(result.fallback).toBe(true);
    expect(result.recommendations).toHaveLength(1);
  });

  it("parses natural-language constraints before searching the catalogue", async () => {
    callOpenAiJsonMock.mockRejectedValueOnce(new Error("timeout"));

    await recommendProducts({
      prompt: "organic oat milk under $5"
    });

    expect(searchProductsMock).toHaveBeenCalledWith({
      q: "oat milk",
      category: undefined,
      minPrice: undefined,
      maxPrice: 5,
      providerNames: undefined,
      tags: ["organic"]
    });
  });

  it("returns a lower-scoring second page when refreshGeneration increments", async () => {
    callOpenAiJsonMock.mockRejectedValue(new Error("timeout"));

    const demoMilk = (suffix: string, name: string, priceUsdc: number): Product => ({
      id: `10000000-0000-4000-8000-0000000000${suffix}`,
      name,
      brand: "Demo",
      category: "dairy",
      description: "Fresh milk for cereal and baking.",
      priceUsdc,
      imageUrl: "https://example.com/milk.png",
      inStock: true,
      stockQty: 10,
      rating: 4.5,
      reviewCount: 10,
      tags: ["dairy"],
      providerId: "11111111-1111-4111-8111-111111111111",
      providerName: "Fresh Lane"
    });

    searchProductsMock.mockResolvedValue({
      results: [
        demoMilk("31", "Whole Milk 2L", 3.1),
        demoMilk("32", "Skim Milk 2L", 3.2),
        demoMilk("33", "Chocolate Milk 1L", 3.3),
        demoMilk("34", "Almond Milk 1L", 3.4),
        demoMilk("35", "Soy Milk 1L", 3.5),
        demoMilk("36", "Lactose-Free Milk 2L", 3.6)
      ],
      total: 6
    });

    const first = await recommendProducts({ prompt: "milk", refreshGeneration: 0 });
    const second = await recommendProducts({ prompt: "milk", refreshGeneration: 1 });

    expect(first.recommendations.map((product) => product.id)).not.toEqual(
      second.recommendations.map((product) => product.id)
    );
    expect(first.recommendations[0]?.matchScore ?? 0).toBeGreaterThan(
      second.recommendations[0]?.matchScore ?? 0
    );
  });
});
