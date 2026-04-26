import { useCartStore } from "../store/cartStore";

/**
 * Renders the global AISLE header and cart badge.
 *
 * @returns The shared application header.
 * @throws Never.
 */
export function Header(): JSX.Element {
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="flex items-center justify-between border-b-2 border-[#771111]/20 pb-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#771111]/50">
          An Agent Merchant Storefront
        </p>
        <h1 className="mt-1 font-serif text-5xl font-bold tracking-tight text-[#771111]">
          AISLE
        </h1>
      </div>

      <button
        aria-label="Open cart"
        className="relative inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#771111]/30 bg-[#fae7cc] px-6 text-sm font-bold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111] hover:text-[#fae7cc]"
        onClick={openCart}
        type="button"
      >
        <span>Cart</span>
        {itemCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#771111] px-1 text-xs font-bold text-[#fae7cc] ring-2 ring-[#fae7cc]">
            {itemCount}
          </span>
        ) : null}
      </button>
    </header>
  );
}