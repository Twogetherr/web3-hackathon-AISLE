import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchProductById, postCartItem } from "../lib/apiClient";
import { getOrCreateSessionId } from "../lib/session";
import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";
import type { RecommendResponseData } from "../types/agent";
import type { Product } from "../types/product";

/**
 * Renders the full product detail page.
 *
 * @returns The routed product page component.
 * @throws Never.
 */
export function ProductPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const openCheckout = useCheckoutStore((state) => state.open);

  const searchSnapshot = (
    location.state as {
      searchSnapshot?: { prompt: string; singleResult: RecommendResponseData };
    } | null
  )?.searchSnapshot;

  const [product, setProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("/placeholder-product.svg");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (id === undefined) {
      setErrorMessage("Product not found.");
      return () => undefined;
    }

    void fetchProductById(id)
      .then((nextProduct) => {
        if (!isActive) return;
        setProduct(nextProduct);
        setImageSrc(nextProduct.imageUrl);
      })
      .catch((error) => {
        if (!isActive) return;
        setErrorMessage(error instanceof Error ? error.message : "Product not found.");
      });

    return () => { isActive = false; };
  }, [id]);

  useEffect(() => {
    if (!isAdded) return () => undefined;

    const timeoutId = window.setTimeout(() => { setIsAdded(false); }, 2000);
    return () => { window.clearTimeout(timeoutId); };
  }, [isAdded]);

  async function handleAddToCart(): Promise<void> {
    if (product === null) return;

    addItem({
      productId: product.id,
      quantity,
      priceUsdc: product.priceUsdc,
      name: product.name,
      imageUrl: product.imageUrl
    });

    try {
      await postCartItem({ cartId: getOrCreateSessionId(), productId: product.id, quantity });
      setIsAdded(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add item to cart.");
    }
  }

  function handleBuyNow(): void {
    if (product === null) return;

    clearCart();
    addItem({
      productId: product.id,
      quantity,
      priceUsdc: product.priceUsdc,
      name: product.name,
      imageUrl: product.imageUrl
    });
    openCheckout([
      {
        productId: product.id,
        quantity,
        priceUsdc: product.priceUsdc,
        name: product.name,
        imageUrl: product.imageUrl
      }
    ]);
  }

  function handleBackToResults(): void {
    if (searchSnapshot !== undefined) {
      navigate("/", { state: { restoreSearch: searchSnapshot } });
      return;
    }
    navigate("/");
  }

  if (errorMessage !== null) {
    return (
      <section className="py-8">
        <div className="rounded-xl border border-[#771111]/20 bg-[#fae7cc] p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#771111]/50">Error</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-[#771111]">Product not found</h2>
          <p className="mt-3 text-sm text-[#771111]/60">{errorMessage}</p>
          <Link
            className="mt-6 inline-flex text-sm font-bold text-[#771111] underline underline-offset-4"
            to="/"
          >
            ← Back to search
          </Link>
        </div>
      </section>
    );
  }

  if (product === null) {
    return (
      <section className="py-8">
        <div className="rounded-xl border border-[#771111]/20 bg-[#fae7cc] p-8 shadow-sm">
          <p className="text-sm text-[#771111]/50">Loading product…</p>
        </div>
      </section>
    );
  }

  const isUnavailable = !product.inStock || product.stockQty <= 0;

  return (
    <section className="py-8">
      {isUnavailable ? (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          This item is currently out of stock.
        </div>
      ) : null}

      <div className="grid gap-8 rounded-xl border border-[#771111]/20 bg-[#fae7cc] p-6 shadow-sm md:grid-cols-[1.2fr_1fr]">
        <img
          alt={product.name}
          className="h-[420px] w-full rounded-xl bg-[#771111]/5 object-cover"
          onError={() => setImageSrc("/placeholder-product.svg")}
          src={imageSrc}
        />

        <div className="space-y-5">
          <button
            className="text-xs font-bold uppercase tracking-widest text-[#771111] underline underline-offset-4"
            onClick={handleBackToResults}
            type="button"
          >
            ← Back to results
          </button>

          <div>
            <p className="text-xs text-[#771111]/50">
              {product.brand} · {product.providerName}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-[#771111]">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#771111]/60">
              {product.rating !== null ? (
                <p>★ {product.rating.toFixed(1)} <span className="text-[#771111]/40">({product.reviewCount} reviews)</span></p>
              ) : (
                <p>Unrated</p>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  isUnavailable
                    ? "border border-red-300 bg-red-50 text-red-600"
                    : "border border-[#771111]/30 bg-[#771111]/10 text-[#771111]"
                }`}
              >
                {isUnavailable ? "Out of Stock" : "In Stock"}
              </span>
            </div>
          </div>

          <p className="font-serif text-3xl font-bold text-[#771111]">${product.priceUsdc.toFixed(2)}</p>

          <div className="h-px w-full bg-[#771111]/10" />

          <p className="text-sm leading-6 text-[#771111]/70">{product.description}</p>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                className="rounded-full border border-[#771111]/20 px-3 py-1 text-xs text-[#771111]/60"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="rounded-lg border border-[#771111]/20 px-4 py-3">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.25em] text-[#771111]/60" htmlFor="product-quantity">
              Quantity
            </label>
            <input
              className="h-10 w-24 rounded-lg border border-[#771111]/20 bg-[#fae7cc] px-3 text-sm text-[#771111] outline-none focus:border-[#771111]/50"
              id="product-quantity"
              max={99}
              min={1}
              onChange={(event) => {
                const parsedValue = Number(event.target.value);
                if (!Number.isFinite(parsedValue)) { setQuantity(1); return; }
                setQuantity(Math.min(99, Math.max(1, Math.floor(parsedValue))));
              }}
              type="number"
              value={quantity}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="h-11 rounded-lg border-2 border-[#771111]/30 text-xs font-bold uppercase tracking-widest text-[#771111] transition hover:border-[#771111] hover:bg-[#771111]/5 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isUnavailable}
              onClick={() => { void handleAddToCart(); }}
              type="button"
            >
              {isAdded ? "Added ✓" : "Add to Cart"}
            </button>
            <button
              className="h-11 rounded-lg bg-[#771111] text-xs font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d] disabled:cursor-not-allowed disabled:bg-[#771111]/30"
              disabled={isUnavailable}
              onClick={handleBuyNow}
              type="button"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}