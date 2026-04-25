import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductPage } from "../components/ProductPage";
import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";

describe("ProductPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCartStore.setState({
      items: [],
      isCartOpen: false
    });
    useCheckoutStore.setState({
      isOpen: false,
      items: [],
      walletAddress: "",
      lastOrder: null,
      errorMessage: null,
      isSubmitting: false
    });
  });

  it("renders a product by id and opens checkout from Buy Now", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
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
          },
          error: null,
          meta: {
            timestamp: "2026-04-25T08:00:00.000Z",
            requestId: "request-5"
          }
        })
      )
    );

    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={["/products/5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1"]}
      >
        <Routes>
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Organic Oat Milk 1L")).toBeInTheDocument();
    expect(screen.getByText("Creamy oat milk for coffee and cereal.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "3" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Buy Now" }));

    await waitFor(() => {
      expect(useCheckoutStore.getState().isOpen).toBe(true);
    });
    expect(useCheckoutStore.getState().items[0]?.name).toBe("Organic Oat Milk 1L");
    expect(useCheckoutStore.getState().items[0]?.quantity).toBe(3);
  });

  it("shows temporary added confirmation after adding to cart", async () => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
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
            },
            error: null,
            meta: {
              timestamp: "2026-04-25T08:00:00.000Z",
              requestId: "request-7"
            }
          })
        )
      )
      .mockResolvedValueOnce(
        new Response(
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
              requestId: "request-8"
            }
          })
        )
      );

    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={["/products/5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1"]}
      >
        <Routes>
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Organic Oat Milk 1L")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(screen.getByRole("button", { name: "Added ✓" })).toBeInTheDocument();
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add to Cart" })).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it("disables CTAs and shows the out-of-stock banner", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
            name: "Organic Oat Milk 1L",
            brand: "Oatly",
            category: "beverages",
            description: "Creamy oat milk for coffee and cereal.",
            priceUsdc: 4.99,
            imageUrl: "https://example.com/oat-milk.png",
            inStock: false,
            stockQty: 0,
            rating: 4.7,
            reviewCount: 142,
            tags: ["organic", "vegan"],
            providerId: "provider-1",
            providerName: "Fresh Lane"
          },
          error: null,
          meta: {
            timestamp: "2026-04-25T08:00:00.000Z",
            requestId: "request-6"
          }
        })
      )
    );

    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={["/products/5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1"]}
      >
        <Routes>
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Out of stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buy Now" })).toBeDisabled();
  });
});
