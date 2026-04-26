import { useState } from "react";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
}

const PRODUCT_PLACEHOLDER_URL = "/placeholder-product.svg";

/**
 * Renders a product card with image fallback and purchase actions.
 *
 * @param props The product card props and interaction handlers.
 * @returns The rendered product card component.
 * @throws Never.
 */
export function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onOpenProduct
}: ProductCardProps): JSX.Element {
  const [imageSrc, setImageSrc] = useState(product.imageUrl);
  const isUnavailable = !product.inStock || product.stockQty <= 0;

  return (
    <article className="overflow-hidden rounded-xl border border-[#771111]/20 bg-[#fae7cc] shadow-sm transition hover:shadow-md">
      <button
        className="relative block w-full bg-[#771111]/5"
        onClick={() => onOpenProduct(product)}
        type="button"
      >
        <img
          alt={product.name}
          className="h-56 w-full object-cover"
          onError={() => setImageSrc(PRODUCT_PLACEHOLDER_URL)}
          src={imageSrc}
        />
        {product.matchScore !== undefined ? (
          <span className="absolute right-3 top-3 rounded-full border border-[#771111]/30 bg-[#fae7cc]/95 px-3 py-1 text-xs font-bold text-[#771111] backdrop-blur-sm">
            {product.matchScore}% match
          </span>
        ) : null}
        {isUnavailable ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#fae7cc]/60">
            <span className="rounded-full border border-[#771111]/30 bg-[#fae7cc] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#771111]/60">
              Out of stock
            </span>
          </div>
        ) : null}
      </button>

      <div className="space-y-3 p-5">
        <div className="space-y-0.5">
          <button
            className="text-left font-serif text-lg font-bold text-[#771111] transition hover:text-[#5a0d0d]"
            onClick={() => onOpenProduct(product)}
            type="button"
          >
            {product.name}
          </button>
          <p className="text-xs text-[#771111]/50">
            {product.brand} · {product.providerName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-serif text-xl font-bold text-[#771111]">${product.priceUsdc.toFixed(2)}</p>
          {product.rating !== null ? (
            <p className="text-xs text-[#771111]/50">
              ★ {product.rating.toFixed(1)}{" "}
              <span className="text-[#771111]/30">({product.reviewCount})</span>
            </p>
          ) : null}
        </div>

        <div className="h-px w-full bg-[#771111]/10" />

        <div className="grid grid-cols-2 gap-2">
          <button
            className="h-10 rounded-lg border-2 border-[#771111]/30 bg-transparent text-xs font-bold uppercase tracking-widest text-[#771111] transition hover:border-[#771111] hover:bg-[#771111]/5 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isUnavailable}
            onClick={() => onAddToCart(product)}
            type="button"
          >
            Add to Cart
          </button>
          <button
            className="h-10 rounded-lg bg-[#771111] text-xs font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d] disabled:cursor-not-allowed disabled:bg-[#771111]/30"
            disabled={isUnavailable}
            onClick={() => onBuyNow(product)}
            type="button"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}