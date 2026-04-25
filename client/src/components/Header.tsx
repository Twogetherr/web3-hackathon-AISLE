import { useCartStore } from "../store/cartStore";

/**
 * Renders the global AISLE header and cart badge.
 *
 * @returns The shared application header.
 * @throws Never.
 */
export function Header(): JSX.Element {
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="flex items-center justify-between border-b border-[#2A2A2A] pb-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00C853]">AISLE</p>
        <h1 className="mt-3 text-4xl font-semibold">An Agent Merchant Storefront</h1>
      </div>

      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#2A2A2A]">
        <span className="text-lg font-semibold">Cart</span>
        {itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#00C853] px-1 text-xs font-bold text-[#08110A]">
            {itemCount}
          </span>
        ) : null}
      </div>
    </header>
  );
}
