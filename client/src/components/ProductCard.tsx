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
    <article className="overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#181818]">
      <button
        className="block w-full bg-[#202020]"
        onClick={() => onOpenProduct(product)}
        type="button"
      >
        <img
          alt={product.name}
          className="h-64 w-full object-cover"
          onError={() => setImageSrc(PRODUCT_PLACEHOLDER_URL)}
          src={imageSrc}
        />
      </button>

      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <button
            className="text-left text-lg font-semibold text-white"
            onClick={() => onOpenProduct(product)}
            type="button"
          >
            {product.name}
          </button>
          <p className="text-sm text-[#A0A0A0]">
            {product.brand} · {product.providerName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-white">${product.priceUsdc.toFixed(2)}</p>
          {product.rating !== null ? (
            <p className="text-sm text-[#A0A0A0]">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </p>
          ) : null}
        </div>

        {isUnavailable ? (
          <p className="inline-flex rounded-full border border-[#5A2323] bg-[#2B1414] px-3 py-1 text-xs font-medium text-[#FF7474]">
            Out of stock
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            className="h-11 rounded-md border border-[#2A2A2A] bg-transparent text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isUnavailable}
            onClick={() => onAddToCart(product)}
            type="button"
          >
            Add to Cart
          </button>
          <button
            className="h-11 rounded-md bg-[#00C853] text-sm font-semibold text-[#08110A] disabled:cursor-not-allowed disabled:bg-[#235A34] disabled:text-[#B7D8C0]"
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
