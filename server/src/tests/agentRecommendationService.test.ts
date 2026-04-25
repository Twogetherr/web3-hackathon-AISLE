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

describe("agentRecommendationService", () => {
  const callOpenAiJsonMock = vi.mocked(callOpenAiJson);
  const searchProductsMock = vi.mocked(searchProducts);

  beforeEach(() => {
    vi.clearAllMocks();
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
      maxPrice: 5,
      tags: ["organic"]
    });
  });
});
