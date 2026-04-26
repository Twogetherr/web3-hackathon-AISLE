import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchGroceryList, fetchRecommendations, postCartItem } from "../lib/apiClient";
import { getOrCreateSessionId } from "../lib/session";
import { isListModePrompt, validatePrompt } from "../lib/validation";
import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";
import type { GroceryListResponseData, RecommendResponseData } from "../types/agent";
import type { Product } from "../types/product";
import { ProductCard } from "./ProductCard";

const PRODUCT_PLACEHOLDER_URL = "/placeholder-product.svg";
const PRICE_BANDS = [
  { id: "under-5", label: "Under $5", minPrice: undefined, maxPrice: 5 },
  { id: "5-10", label: "$5 to $10", minPrice: 5, maxPrice: 10 },
  { id: "10-15", label: "$10 to $15", minPrice: 10, maxPrice: 15 },
  { id: "15-20", label: "$15 to $20", minPrice: 15, maxPrice: 20 },
  { id: "above-20", label: "Above $20", minPrice: 20, maxPrice: undefined }
] as const;
const PROVIDER_OPTIONS = [
  "Countdown",
  "Pak'nSave",
  "New World",
  "Four Square",
  "Fresh Choice"
] as const;

/**
 * Renders the main shopper experience for prompt-based discovery.
 *
 * @returns The home page search and results surface.
 * @throws Never.
 */
export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState("");
  const [listPrompt, setListPrompt] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<RecommendResponseData | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryListResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendRefreshGeneration, setRecommendRefreshGeneration] = useState(0);
  const [priceBandId, setPriceBandId] = useState<(typeof PRICE_BANDS)[number]["id"] | "">("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [resultHistory, setResultHistory] = useState<RecommendResponseData[]>([]);
  const [resultHistoryIndex, setResultHistoryIndex] = useState(-1);

  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const openCheckout = useCheckoutStore((state) => state.open);

  useEffect(() => {
    const restore = (
      location.state as { restoreSearch?: { prompt: string; singleResult: RecommendResponseData } } | null
    )?.restoreSearch;

    if (restore === undefined) {
      return;
    }

    setPrompt(restore.prompt);
    setSingleResult(restore.singleResult);
    setGroceryList(null);
    setErrorMessage(null);
    setRecommendRefreshGeneration(0);
    setResultHistory([restore.singleResult]);
    setResultHistoryIndex(0);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.key, location.pathname, navigate]);

  const groceryBudget =
    groceryList?.budgetRemaining === null || groceryList === null
      ? null
      : Number((groceryList.totalUsdc + groceryList.budgetRemaining).toFixed(2));

  async function handleSubmit(options?: { isRefresh?: boolean }): Promise<void> {
    const validationMessage = validatePrompt(prompt);

    if (validationMessage !== null) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isListModePrompt(prompt)) {
        const nextGroceryList = await fetchGroceryList({ prompt, budget: 30 });
        setGroceryList(nextGroceryList);
        setListPrompt(prompt);
        setSingleResult(null);
        setRecommendRefreshGeneration(0);
        setResultHistory([]);
        setResultHistoryIndex(-1);
      } else {
        const selectedPriceBand =
          priceBandId.length === 0
            ? undefined
            : PRICE_BANDS.find((priceBand) => priceBand.id === priceBandId);
        const refreshGen = options?.isRefresh === true ? recommendRefreshGeneration + 1 : 0;
        const nextRecommendations = await fetchRecommendations(prompt, {
          refreshGeneration: refreshGen,
          minPrice: selectedPriceBand?.minPrice,
          maxPrice: selectedPriceBand?.maxPrice,
          providerNames: selectedProviders.length > 0 ? selectedProviders : undefined
        });
        setSingleResult(nextRecommendations);
        setGroceryList(null);
        setRecommendRefreshGeneration(refreshGen);
        setResultHistory((currentHistory) => {
          if (options?.isRefresh === true) {
            const nextHistory = currentHistory.slice(0, resultHistoryIndex + 1);
            nextHistory.push(nextRecommendations);
            return nextHistory;
          }
          return [nextRecommendations];
        });
        setResultHistoryIndex(options?.isRefresh === true ? resultHistoryIndex + 1 : 0);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePromptKeyDown(key: string): void {
    if (key === "Enter") {
      void handleSubmit();
    }
  }

  function handleToggleProvider(providerName: string): void {
    setSelectedProviders((currentProviders) =>
      currentProviders.includes(providerName)
        ? currentProviders.filter((entry) => entry !== providerName)
        : [...currentProviders, providerName]
    );
  }

  function handleShowPreviousRecommendations(): void {
    if (resultHistoryIndex <= 0) return;
    const previousIndex = resultHistoryIndex - 1;
    setSingleResult(resultHistory[previousIndex] ?? null);
    setResultHistoryIndex(previousIndex);
    setRecommendRefreshGeneration(previousIndex);
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
    clearCart();
    addItem({
      productId: product.id,
      quantity: 1,
      priceUsdc: product.priceUsdc,
      name: product.name,
      imageUrl: product.imageUrl
    });
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

  function updateGroceryListItems(
    updater: (items: GroceryListResponseData["items"]) => GroceryListResponseData["items"]
  ): void {
    setGroceryList((currentGroceryList) => {
      if (currentGroceryList === null) return null;

      const nextItems = updater(currentGroceryList.items);
      const nextTotal = Number(nextItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
      const groceryListBudget =
        currentGroceryList.budgetRemaining === null
          ? null
          : Number((currentGroceryList.totalUsdc + currentGroceryList.budgetRemaining).toFixed(2));

      return {
        ...currentGroceryList,
        items: nextItems,
        totalUsdc: nextTotal,
        budgetRemaining:
          groceryListBudget === null
            ? null
            : Number((groceryListBudget - nextTotal).toFixed(2))
      };
    });
  }

  function handleRemoveGroceryItem(index: number): void {
    updateGroceryListItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleUpdateGroceryQuantity(index: number, nextQuantityValue: number): void {
    updateGroceryListItems((items) =>
      items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const nextQuantity = Math.min(99, Math.max(1, Math.floor(nextQuantityValue)));
        const lineTotal =
          item.product === null || item.product.inStock === false
            ? 0
            : Number((item.product.priceUsdc * nextQuantity).toFixed(2));

        return { ...item, quantity: nextQuantity, lineTotal };
      })
    );
  }

  async function handleAddAllToCart(): Promise<void> {
    if (groceryList === null) return;

    const eligibleItems = groceryList.items.filter(
      (item): item is GroceryListResponseData["items"][number] & { product: Product } =>
        item.product !== null && item.product.inStock
    );

    for (const item of eligibleItems) {
      addItem({
        productId: item.product.id,
        quantity: item.quantity,
        priceUsdc: item.product.priceUsdc,
        name: item.product.name,
        imageUrl: item.product.imageUrl
      });
    }

    try {
      for (const item of eligibleItems) {
        await postCartItem({
          cartId: getOrCreateSessionId(),
          productId: item.product.id,
          quantity: item.quantity
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to add list to cart.");
    }
  }

  function handleBuyAllNow(): void {
    if (groceryList === null) return;

    clearCart();
    const checkoutLines = groceryList.items
      .filter(
        (item): item is GroceryListResponseData["items"][number] & { product: Product } =>
          item.product !== null && item.product.inStock
      )
      .map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceUsdc: item.product.priceUsdc,
        name: item.product.name,
        imageUrl: item.product.imageUrl
      }));

    for (const line of checkoutLines) {
      addItem(line);
    }

    openCheckout(checkoutLines);
  }

  async function handleFindItemsForRemainingBudget(): Promise<void> {
    if (groceryList === null || groceryList.budgetRemaining === null || groceryList.budgetRemaining <= 0) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextGroceryList = await fetchGroceryList({
        prompt: listPrompt.length > 0 ? listPrompt : prompt,
        budget: groceryBudget ?? undefined,
        remainingBudget: groceryList.budgetRemaining,
        excludeItems: groceryList.items.map((item) => item.ingredient)
      });

      updateGroceryListItems((items) => [...items, ...nextGroceryList.items]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to find more items for the remaining budget."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-8 py-8">
      {/* Search panel */}
      <div className="rounded-xl border border-[#771111]/20 bg-[#fae7cc] p-6 shadow-sm">
        <label className="mb-3 block text-xs font-bold uppercase tracking-[0.3em] text-[#771111]/60" htmlFor="shopping-prompt">
          What are you looking for?
        </label>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="h-12 flex-1 rounded-lg border-2 border-[#771111]/20 bg-[#fae7cc] px-4 text-sm text-[#771111] outline-none placeholder:text-[#771111]/30 focus:border-[#771111]/50 focus:ring-0"
            id="shopping-prompt"
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => handlePromptKeyDown(event.key)}
            placeholder="e.g. ingredients for pasta carbonara…"
            value={prompt}
          />
          <button
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#771111] px-8 text-sm font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d] disabled:cursor-not-allowed disabled:bg-[#771111]/40"
            disabled={isLoading}
            onClick={() => { void handleSubmit(); }}
            type="button"
          >
            {isLoading ? "Searching…" : "Search"}
          </button>
        </div>

        {prompt.trim().length > 0 ? (
          <div className="mt-5 grid gap-4 border-t border-[#771111]/10 pt-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.25em] text-[#771111]/60" htmlFor="budget-range">
                Budget range
              </label>
              <select
                className="h-10 w-full rounded-lg border border-[#771111]/20 bg-[#fae7cc] px-3 text-sm text-[#771111] outline-none focus:border-[#771111]/50"
                id="budget-range"
                onChange={(event) =>
                  setPriceBandId(event.target.value as (typeof PRICE_BANDS)[number]["id"] | "")
                }
                value={priceBandId}
              >
                <option value="">Any budget</option>
                {PRICE_BANDS.map((priceBand) => (
                  <option key={priceBand.id} value={priceBand.id}>
                    {priceBand.label}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#771111]/60">Preferred provider</legend>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDER_OPTIONS.map((providerName) => (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#771111]" key={providerName}>
                    <input
                      checked={selectedProviders.includes(providerName)}
                      className="h-4 w-4 rounded border border-[#771111]/30 accent-[#771111]"
                      onChange={() => handleToggleProvider(providerName)}
                      type="checkbox"
                    />
                    <span>{providerName}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {errorMessage !== null ? (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {/* Single product results */}
      {singleResult !== null ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#771111]/20 bg-[#fae7cc] px-4 py-3">
            <p className="text-sm italic text-[#771111]/60">{singleResult.reasoning}</p>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#771111]/30 px-4 text-xs font-bold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111]/10"
                onClick={() => { void handleSubmit({ isRefresh: true }); }}
                type="button"
              >
                Refresh
              </button>
              {resultHistoryIndex > 0 ? (
                <button
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#771111]/30 px-4 text-xs font-bold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111]/10"
                  onClick={handleShowPreviousRecommendations}
                  type="button"
                >
                  ← Previous
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {singleResult.recommendations.map((product) => (
              <ProductCard
                key={product.id}
                onAddToCart={(nextProduct) => { void handleAddToCart(nextProduct); }}
                onBuyNow={handleBuyNow}
                onOpenProduct={(nextProduct) =>
                  navigate(`/products/${nextProduct.id}`, {
                    state: { searchSnapshot: { prompt, singleResult } }
                  })
                }
                product={product}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Grocery list results */}
      {groceryList !== null ? (
        <section className="rounded-xl border border-[#771111]/20 bg-[#fae7cc] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#771111]">{groceryList.title}</h2>
            <p className="font-serif text-2xl font-bold text-[#771111]">${groceryList.totalUsdc.toFixed(2)}</p>
          </div>

          {groceryBudget !== null ? (
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#771111]/60 border-t border-[#771111]/10 pt-3">
              <p>Budget: <span className="font-semibold text-[#771111]">${groceryBudget.toFixed(2)}</span></p>
              <p>Spent: <span className="font-semibold text-[#771111]">${groceryList.totalUsdc.toFixed(2)}</span></p>
              <p>Left: <span className="font-semibold text-[#771111]">${groceryList.budgetRemaining?.toFixed(2) ?? "0.00"}</span></p>
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {groceryList.items.map((item, index) => {
              const matchedProduct = item.product;

              return (
                <div
                  className="grid gap-4 rounded-lg border border-[#771111]/15 bg-[#fae7cc]/70 px-4 py-3 md:grid-cols-[72px_1fr_auto]"
                  key={`${item.ingredient}-${index}`}
                >
                  <button
                    className="h-[72px] w-[72px] overflow-hidden rounded-lg bg-[#771111]/10"
                    disabled={matchedProduct === null}
                    onClick={() => {
                      if (matchedProduct !== null) navigate(`/products/${matchedProduct.id}`);
                    }}
                    type="button"
                  >
                    <img
                      alt={matchedProduct?.name ?? item.ingredient}
                      className="h-full w-full object-cover"
                      onError={(event) => { event.currentTarget.src = PRODUCT_PLACEHOLDER_URL; }}
                      src={matchedProduct?.imageUrl ?? PRODUCT_PLACEHOLDER_URL}
                    />
                  </button>

                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#771111]">{item.ingredient}</p>
                    {matchedProduct !== null ? (
                      <button
                        className="text-left text-sm text-[#771111]/60 hover:text-[#771111]"
                        onClick={() => navigate(`/products/${matchedProduct.id}`)}
                        type="button"
                      >
                        {matchedProduct.name}
                      </button>
                    ) : (
                      <p className="text-sm text-[#771111]/40">No match found</p>
                    )}
                    {matchedProduct !== null ? (
                      <p className="text-xs text-[#771111]/40">
                        {matchedProduct.brand} — {matchedProduct.providerName}
                      </p>
                    ) : null}
                    {matchedProduct?.inStock === false ? (
                      <p className="text-xs font-semibold text-red-600">Out of stock</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-4">
                    <div>
                      <label
                        className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#771111]/40"
                        htmlFor={`grocery-quantity-${index}`}
                      >
                        Qty
                      </label>
                      <input
                        aria-label={`Quantity for ${item.ingredient}`}
                        className="h-9 w-20 rounded-lg border border-[#771111]/20 bg-[#fae7cc] px-3 text-sm text-[#771111] outline-none focus:border-[#771111]/50"
                        id={`grocery-quantity-${index}`}
                        max={99}
                        min={1}
                        onChange={(event) => {
                          const parsedValue = Number(event.target.value);
                          handleUpdateGroceryQuantity(index, Number.isFinite(parsedValue) ? parsedValue : 1);
                        }}
                        type="number"
                        value={item.quantity}
                      />
                    </div>
                    <p className="min-w-16 text-right font-bold text-[#771111]">${item.lineTotal.toFixed(2)}</p>
                    <button
                      aria-label="Remove item"
                      className="text-xs font-semibold uppercase tracking-widest text-[#771111]/40 hover:text-[#771111]"
                      onClick={() => handleRemoveGroceryItem(index)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-[#771111]/15 pt-5">
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#771111]/30 px-5 text-xs font-bold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111]/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isLoading || groceryList.budgetRemaining === null || groceryList.budgetRemaining <= 0}
              onClick={() => { void handleFindItemsForRemainingBudget(); }}
              title={
                groceryList.budgetRemaining !== null && groceryList.budgetRemaining <= 0
                  ? "No remaining budget"
                  : undefined
              }
              type="button"
            >
              Fill remaining budget
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#771111]/30 px-5 text-xs font-bold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111]/10"
              onClick={() => { void handleAddAllToCart(); }}
              type="button"
            >
              Add all to cart
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#771111] px-5 text-xs font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d]"
              onClick={handleBuyAllNow}
              type="button"
            >
              Buy all now
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}