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
import { recommendProducts } from "../services/agentRecommendationService";
import { generateGroceryList } from "../services/groceryListService";

describe("agent rate limiting", () => {
  const recommendProductsMock = vi.mocked(recommendProducts);
  const generateGroceryListMock = vi.mocked(generateGroceryList);

  beforeEach(() => {
    vi.clearAllMocks();
    recommendProductsMock.mockResolvedValue({
      mode: "single",
      recommendations: [],
      reasoning: "Closest match.",
      searchQuery: "oat milk",
      fallback: false
    });
    generateGroceryListMock.mockResolvedValue({
      mode: "list",
      title: "Chocolate Cake - 8 ingredients",
      items: [],
      totalUsdc: 18.4,
      overBudget: false,
      budgetRemaining: 11.6,
      fallback: false
    });
  });

  it("rate limits the eleventh shared agent request within the window", async () => {
    const app = createApp();

    for (let index = 0; index < 10; index += 1) {
      const response = await request(app)
        .post("/api/agent/recommend")
        .set("X-Forwarded-For", "203.0.113.10")
        .send({ prompt: "organic oat milk under $5" });

      expect(response.status).toBe(200);
    }

    const response = await request(app)
      .post("/api/agent/grocery-list")
      .set("X-Forwarded-For", "203.0.113.10")
      .send({ prompt: "ingredients for chocolate cake" });

    expect(response.status).toBe(429);
    expect(response.headers["retry-after"]).toBe("60");
    expect(response.body.data).toBeNull();
    expect(response.body.error).toEqual({
      code: "RATE_LIMITED",
      message: "Too many agent requests. Please retry in 60 seconds."
    });
  });
});
