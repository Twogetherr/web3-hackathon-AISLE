import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types/product";

const baseProduct: Product = {
  id: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
  name: "Organic Oat Milk 1L",
  brand: "Oatly",
  category: "beverages",
  description: "Creamy oat milk for coffee and cereal.",
  priceUsdc: 4.99,
  imageUrl: "https://example.com/oat-milk.png",
  inStock: true,
  stockQty: 12,
  rating: 4.7,
  reviewCount: 142,
  tags: ["organic", "vegan"],
  providerId: "8f6dfb3f-fbc5-4e7e-b5f0-aaf19837c0ce",
  providerName: "Fresh Lane"
};

describe("ProductCard", () => {
  it("falls back to the grey placeholder when the product image fails to load", () => {
    render(
      <ProductCard
        product={baseProduct}
        onAddToCart={vi.fn()}
        onBuyNow={vi.fn()}
        onOpenProduct={vi.fn()}
      />
    );

    const image = screen.getByRole("img", { name: "Organic Oat Milk 1L" });

    fireEvent.error(image);

    expect(image).toHaveAttribute("src", "/placeholder-product.svg");
  });

  it("disables both CTAs when the product is out of stock", () => {
    render(
      <ProductCard
        product={{ ...baseProduct, inStock: false, stockQty: 0 }}
        onAddToCart={vi.fn()}
        onBuyNow={vi.fn()}
        onOpenProduct={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buy Now" })).toBeDisabled();
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });
});
