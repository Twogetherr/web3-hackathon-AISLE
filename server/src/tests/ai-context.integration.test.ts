import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/aiContextService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/aiContextService")>();

  return {
    ...actual,
    buildAiContext: vi.fn()
  };
});

import { createApp } from "../app";
import { buildAiContext } from "../services/aiContextService";

describe("GET /ai-context.json", () => {
  const buildAiContextMock = vi.mocked(buildAiContext);

  beforeEach(() => {
    vi.clearAllMocks();
    buildAiContextMock.mockResolvedValue({
      store: "AISLE",
      description: "Agent-friendly grocery storefront. No CAPTCHAs.",
      endpoints: {
        products: "/api/products",
        search: "/api/products/search?q=",
        recommend: "/api/agent/recommend",
        groceryList: "/api/agent/grocery-list",
        cart: "/api/cart",
        checkout: "/api/checkout",
        productPage: "/api/products/:id"
      },
      payment: {
        chain: "Avalanche C-Chain",
        chainId: 43114,
        stablecoin: "USDC",
        contractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
      },
      categories: [
        "dairy",
        "produce",
        "bakery",
        "beverages",
        "pantry",
        "meat",
        "frozen",
        "snacks",
        "condiments",
        "baking"
      ],
      priceRange: {
        min: 0.5,
        max: 50,
        currency: "USDC"
      },
      agentInstructions:
        "For single items: POST /api/agent/recommend. For recipes or grocery lists: POST /api/agent/grocery-list. Add to cart: POST /api/cart. Buy now: POST /api/checkout directly. Pay with USDC on Avalanche C-Chain."
    });
  });

  it("returns the machine-readable agent discovery document", async () => {
    const app = createApp();

    const response = await request(app).get("/ai-context.json");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.body.store).toBe("AISLE");
    expect(response.body.endpoints.recommend).toBe("/api/agent/recommend");
    expect(response.body.endpoints.groceryList).toBe("/api/agent/grocery-list");
    expect(response.body.endpoints.checkout).toBe("/api/checkout");
    expect(response.body.payment.contractAddress).toBe(
      "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"
    );
    expect(response.body.degraded).toBeUndefined();
  });

  it("returns a degraded fallback document when the service fails", async () => {
    buildAiContextMock.mockRejectedValueOnce(new Error("database unavailable"));

    const app = createApp();
    const response = await request(app).get("/ai-context.json");

    expect(response.status).toBe(200);
    expect(response.body.store).toBe("AISLE");
    expect(response.body.degraded).toBe(true);
    expect(response.body.endpoints.recommend).toBe("/api/agent/recommend");
    expect(response.body.endpoints.groceryList).toBe("/api/agent/grocery-list");
    expect(response.body.endpoints.checkout).toBe("/api/checkout");
  });
});
