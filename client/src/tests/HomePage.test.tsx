import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { useCartStore } from "../store/cartStore";

describe("HomePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCartStore.setState({
      items: [],
      isCartOpen: false
    });
  });

  it("shows inline validation and does not call fetch for prompts under 3 characters", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Shopping prompt"), {
      target: { value: "hi" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByText("Prompt must be between 3 and 500 characters.")
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders single-product recommendations and updates the cart badge optimistically", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith("/api/agent/recommend")) {
        return new Response(
          JSON.stringify({
            data: {
              mode: "single",
              recommendations: [
                {
                  id: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
                  name: "Organic Oat Milk 1L",
                  brand: "Oatly",
                  category: "beverages",
                  description: "Creamy oat milk for coffee and cereal.",
                  priceUsdc: 4.99,
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
              reasoning: "Closest match.",
              searchQuery: "organic oat milk under $5",
              fallback: false
            },
            error: null,
            meta: {
              timestamp: "2026-04-25T08:00:00.000Z",
              requestId: "request-1"
            }
          })
        );
      }

      if (url.endsWith("/api/cart")) {
        return new Response(
          JSON.stringify({
            data: {
              id: "aisle-session-1",
              items: [],
              createdAt: "2026-04-25T08:00:00.000Z",
              updatedAt: "2026-04-25T08:00:00.000Z",
              totalUsdc: 4.99
            },
            error: null,
            meta: {
              timestamp: "2026-04-25T08:00:00.000Z",
              requestId: "request-2"
            }
          })
        );
      }

      throw new Error(`Unhandled fetch URL: ${url}`);
    });

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Shopping prompt"), {
      target: { value: "organic oat milk under $5" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Organic Oat Milk 1L")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("renders grocery list mode and recalculates totals when an item is removed", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            mode: "list",
            title: "Chocolate Cake - 2 ingredients",
            items: [
              {
                ingredient: "plain flour",
                quantity: 1,
                lineTotal: 2.39,
                matched: true,
                product: {
                  id: "flour-1",
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
              },
              {
                ingredient: "cocoa powder",
                quantity: 1,
                lineTotal: 3.99,
                matched: true,
                product: {
                  id: "cocoa-1",
                  name: "Cocoa Powder 250g",
                  brand: "Cacao House",
                  category: "baking",
                  description: "Deep cocoa powder.",
                  priceUsdc: 3.99,
                  imageUrl: "https://example.com/cocoa.png",
                  inStock: true,
                  stockQty: 10,
                  rating: 4.8,
                  reviewCount: 72,
                  tags: ["baking"],
                  providerId: "provider-2",
                  providerName: "Green Cart"
                }
              }
            ],
            totalUsdc: 6.38,
            overBudget: false,
            budgetRemaining: 23.62,
            fallback: false
          },
          error: null,
          meta: {
            timestamp: "2026-04-25T08:00:00.000Z",
            requestId: "request-3"
          }
        })
      )
    );

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Shopping prompt"), {
      target: { value: "ingredients for chocolate cake" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Chocolate Cake - 2 ingredients")).toBeInTheDocument();
    expect(screen.getByText("$6.38")).toBeInTheDocument();
    expect(screen.getByText("Budget: $30.00")).toBeInTheDocument();
    expect(screen.getByText("Spent: $6.38")).toBeInTheDocument();
    expect(screen.getByText("Left: $23.62")).toBeInTheDocument();

    const removeButtons = screen.getAllByRole("button", { name: "Remove item" });
    fireEvent.click(removeButtons[0]!);

    expect(screen.getAllByText("$3.99")).toHaveLength(2);
    expect(screen.getByText("Spent: $3.99")).toBeInTheDocument();
    expect(screen.getByText("Left: $26.01")).toBeInTheDocument();
  });
});
