import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";

describe("CartSidebar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCartStore.setState({
      items: [
        {
          productId: "product-1",
          quantity: 2,
          priceUsdc: 4.99,
          name: "Organic Oat Milk 1L",
          imageUrl: "https://example.com/oat-milk.png"
        }
      ],
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

  it("opens from the header and launches checkout with cart items", async () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open cart" }));

    expect(await screen.findByText("Your cart")).toBeInTheDocument();
    expect(screen.getByText("Organic Oat Milk 1L")).toBeInTheDocument();
    expect(screen.getByText("Qty 2")).toBeInTheDocument();
    expect(screen.getAllByText("$9.98").length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));

    await waitFor(() => {
      expect(useCheckoutStore.getState().isOpen).toBe(true);
    });

    expect(useCheckoutStore.getState().items[0]?.name).toBe("Organic Oat Milk 1L");
    expect(useCheckoutStore.getState().items[0]?.quantity).toBe(2);
  });
});
