import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProductById, postCartItem } from "../lib/apiClient";
import { getOrCreateSessionId } from "../lib/session";
import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";
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
  const addItem = useCartStore((state) => state.addItem);
  const openCheckout = useCheckoutStore((state) => state.open);

  const [product, setProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("/placeholder-product.svg");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let isActive = true;

    if (id === undefined) {
      setErrorMessage("Product not found.");
      return () => undefined;
    }

    void fetchProductById(id)
      .then((nextProduct) => {
        if (!isActive) {
          return;
        }

        setProduct(nextProduct);
        setImageSrc(nextProduct.imageUrl);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Product not found.");
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  async function handleAddToCart(): Promise<void> {
    if (product === null) {
      return;
    }

    addItem({
      productId: product.id,
      quantity,
      priceUsdc: product.priceUsdc,
      name: product.name,
      imageUrl: product.imageUrl
    });

    try {
      await postCartItem({
        cartId: getOrCreateSessionId(),
        productId: product.id,
        quantity
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add item to cart.");
    }
  }

  function handleBuyNow(): void {
    if (product === null) {
      return;
    }

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

  if (errorMessage !== null) {
    return (
      <section className="py-8">
        <div className="rounded-lg border border-[#2A2A2A] bg-[#181818] p-8">
          <h2 className="text-2xl font-semibold">Product not found</h2>
          <p className="mt-3 text-sm text-[#A0A0A0]">{errorMessage}</p>
          <Link className="mt-6 inline-flex text-sm font-medium text-[#00C853]" to="/">
            Back to search
          </Link>
        </div>
      </section>
    );
  }

  if (product === null) {
    return (
      <section className="py-8">
        <div className="rounded-lg border border-[#2A2A2A] bg-[#181818] p-8">
          <p className="text-sm text-[#A0A0A0]">Loading product...</p>
        </div>
      </section>
    );
  }

  const isUnavailable = !product.inStock || product.stockQty <= 0;

  return (
    <section className="py-8">
      {isUnavailable ? (
        <div className="mb-4 rounded-md border border-[#5A2323] bg-[#2B1414] px-4 py-3 text-sm font-medium text-[#FF7474]">
          Out of stock
        </div>
      ) : null}

      <div className="grid gap-8 rounded-lg border border-[#2A2A2A] bg-[#181818] p-6 md:grid-cols-[1.2fr_1fr]">
        <img
          alt={product.name}
          className="h-[420px] w-full rounded-md bg-[#2A2A2A] object-cover"
          onError={() => setImageSrc("/placeholder-product.svg")}
          src={imageSrc}
        />

        <div className="space-y-5">
          <button
            className="text-sm font-medium text-[#00C853]"
            onClick={() => navigate(-1)}
            type="button"
          >
            Back to results
          </button>

          <div>
            <p className="text-sm text-[#A0A0A0]">
              {product.brand} · {product.providerName}
            </p>
            <h1 className="mt-2 text-4xl font-semibold">{product.name}</h1>
          </div>

          <p className="text-3xl font-semibold">${product.priceUsdc.toFixed(2)}</p>

          <p className="text-sm leading-6 text-[#A0A0A0]">{product.description}</p>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#A0A0A0]"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="rounded-md border border-[#2A2A2A] px-4 py-3">
            <label className="mb-2 block text-sm font-medium" htmlFor="product-quantity">
              Quantity
            </label>
            <input
              className="h-11 w-24 rounded-md border border-[#2A2A2A] bg-[#101010] px-3 text-sm text-white outline-none"
              id="product-quantity"
              min={1}
              onChange={(event) => {
                const parsedValue = Number(event.target.value);
                setQuantity(Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 1);
              }}
              type="number"
              value={quantity}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="h-11 rounded-md border border-[#2A2A2A] text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUnavailable}
              onClick={() => {
                void handleAddToCart();
              }}
              type="button"
            >
              Add to Cart
            </button>
            <button
              className="h-11 rounded-md bg-[#00C853] text-sm font-semibold text-[#08110A] disabled:cursor-not-allowed disabled:bg-[#235A34]"
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
