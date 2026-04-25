import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGroceryList, fetchRecommendations, postCartItem } from "../lib/apiClient";
import { getOrCreateSessionId } from "../lib/session";
import { isListModePrompt, validatePrompt } from "../lib/validation";
import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";
import type { GroceryListResponseData, RecommendResponseData } from "../types/agent";
import type { Product } from "../types/product";
import { ProductCard } from "./ProductCard";

/**
 * Renders the main shopper experience for prompt-based discovery.
 *
 * @returns The home page search and results surface.
 * @throws Never.
 */
export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<RecommendResponseData | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryListResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCheckout = useCheckoutStore((state) => state.open);
  const groceryBudget =
    groceryList?.budgetRemaining === null || groceryList === null
      ? null
      : Number((groceryList.totalUsdc + groceryList.budgetRemaining).toFixed(2));

  async function handleSubmit(): Promise<void> {
    const validationMessage = validatePrompt(prompt);

    if (validationMessage !== null) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isListModePrompt(prompt)) {
        const nextGroceryList = await fetchGroceryList(prompt);
        setGroceryList(nextGroceryList);
        setSingleResult(null);
      } else {
        const nextRecommendations = await fetchRecommendations(prompt);
        setSingleResult(nextRecommendations);
        setGroceryList(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddToCart(product: Product): Promise<void> {
    addItem({
      productId: product.id,
      quantity: 1,
      priceUsdc: product.priceUsdc,
      name: product.name,
      imageUrl: product.imageUrl
    });

    try {
      await postCartItem({
        cartId: getOrCreateSessionId(),
        productId: product.id,
        quantity: 1
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add item to cart.");
    }
  }

  function handleBuyNow(product: Product): void {
    openCheckout([
      {
        productId: product.id,
        quantity: 1,
        priceUsdc: product.priceUsdc,
        name: product.name,
        imageUrl: product.imageUrl
      }
    ]);
  }

  function handleRemoveGroceryItem(index: number): void {
    if (groceryList === null) {
      return;
    }

    const nextItems = groceryList.items.filter((_, itemIndex) => itemIndex !== index);
    const nextTotal = Number(nextItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));

    setGroceryList({
      ...groceryList,
      items: nextItems,
      totalUsdc: nextTotal,
      budgetRemaining:
        groceryBudget === null
          ? null
          : Number((groceryBudget - nextTotal).toFixed(2))
    });
  }

  return (
    <section className="space-y-8 py-8">
      <div className="rounded-lg border border-[#2A2A2A] bg-[#181818] p-6">
        <label className="mb-3 block text-sm font-medium text-white" htmlFor="shopping-prompt">
          Shopping prompt
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="h-12 flex-1 rounded-md border border-[#2A2A2A] bg-[#101010] px-4 text-sm text-white outline-none"
            id="shopping-prompt"
            onChange={(event) => setPrompt(event.target.value)}
            value={prompt}
          />
          <button
            className="inline-flex h-12 items-center justify-center rounded-md bg-[#00C853] px-6 text-sm font-semibold text-[#08110A] disabled:cursor-not-allowed disabled:bg-[#235A34]"
            disabled={isLoading}
            onClick={() => {
              void handleSubmit();
            }}
            type="button"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
        {errorMessage !== null ? (
          <p className="mt-3 text-sm text-[#FF7474]">{errorMessage}</p>
        ) : null}
      </div>

      {singleResult !== null ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {singleResult.recommendations.map((product) => (
            <ProductCard
              key={product.id}
              onAddToCart={(nextProduct) => {
                void handleAddToCart(nextProduct);
              }}
              onBuyNow={handleBuyNow}
              onOpenProduct={(nextProduct) => navigate(`/products/${nextProduct.id}`)}
              product={product}
            />
          ))}
        </div>
      ) : null}

      {groceryList !== null ? (
        <section className="rounded-lg border border-[#2A2A2A] bg-[#181818] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{groceryList.title}</h2>
            <p className="text-2xl font-semibold">${groceryList.totalUsdc.toFixed(2)}</p>
          </div>

          {groceryBudget !== null ? (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#A0A0A0]">
              <p>Budget: ${groceryBudget.toFixed(2)}</p>
              <p>Spent: ${groceryList.totalUsdc.toFixed(2)}</p>
              <p>Left: ${groceryList.budgetRemaining?.toFixed(2) ?? "0.00"}</p>
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {groceryList.items.map((item, index) => (
              <div
                className="flex items-center justify-between rounded-md border border-[#2A2A2A] px-4 py-3"
                key={`${item.ingredient}-${index}`}
              >
                <div>
                  <p className="font-medium">{item.ingredient}</p>
                  <p className="text-sm text-[#A0A0A0]">
                    {item.product?.name ?? "No match found"}
                  </p>
                  {item.product !== null ? (
                    <p className="text-xs text-[#6F6F6F]">
                      {item.product.brand} · {item.product.providerName}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">${item.lineTotal.toFixed(2)}</p>
                  <button
                    aria-label="Remove item"
                    className="text-sm text-[#A0A0A0]"
                    onClick={() => handleRemoveGroceryItem(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
