import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/agentRecommendationService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/agentRecommendationService")>();

  return {
    ...actual,
    recommendProducts: vi.fn()
  };
});

vi.mock("../services/groceryListService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/groceryListService")>();

  return {
    ...actual,
    generateGroceryList: vi.fn()
  };
});

import { createApp } from "../app";
import { AppError } from "../lib/errors";
import { recommendProducts } from "../services/agentRecommendationService";
import { generateGroceryList } from "../services/groceryListService";

describe("agent routes", () => {
  const recommendProductsMock = vi.mocked(recommendProducts);
  const generateGroceryListMock = vi.mocked(generateGroceryList);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns single-product recommendations in the standard envelope", async () => {
    recommendProductsMock.mockResolvedValueOnce({
      mode: "single",
      recommendations: [],
      reasoning: "These were the closest grocery matches under the budget.",
      searchQuery: "organic oat milk",
      fallback: false
    });

    const response = await request(createApp()).post("/api/agent/recommend").send({
      prompt: "organic oat milk under $5",
      maxPrice: 5,
      filters: {
        tags: ["organic"],
        category: "beverages"
      }
    });

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.mode).toBe("single");
    expect(response.body.data.searchQuery).toBe("organic oat milk");
    expect(response.body.meta.requestId).toEqual(expect.any(String));
  });

  it("returns grocery-list mode in the standard envelope", async () => {
    generateGroceryListMock.mockResolvedValueOnce({
      mode: "list",
      title: "Chocolate Cake - 8 ingredients",
      items: [],
      totalUsdc: 18.4,
      overBudget: false,
      budgetRemaining: 11.6,
      fallback: false
    });

    const response = await request(createApp()).post("/api/agent/grocery-list").send({
      prompt: "ingredients for chocolate cake",
      budget: 30
    });

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.data.mode).toBe("list");
    expect(response.body.data.title).toBe("Chocolate Cake - 8 ingredients");
    expect(response.body.data.totalUsdc).toBe(18.4);
  });

  it("validates prompt length before calling the recommendation service", async () => {
    const response = await request(createApp()).post("/api/agent/recommend").send({
      prompt: "hi"
    });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "INVALID_PROMPT",
      message: "Prompt must be between 3 and 500 characters."
    });
    expect(recommendProductsMock).not.toHaveBeenCalled();
  });

  it("returns OUT_OF_SCOPE when the recommendation service rejects the prompt", async () => {
    recommendProductsMock.mockRejectedValueOnce(
      new AppError("OUT_OF_SCOPE", "Prompt must be grocery-related.", 400)
    );

    const response = await request(createApp()).post("/api/agent/recommend").send({
      prompt: "write me a haiku about the moon"
    });

    expect(response.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "OUT_OF_SCOPE",
      message: "Prompt must be grocery-related."
    });
  });
});
