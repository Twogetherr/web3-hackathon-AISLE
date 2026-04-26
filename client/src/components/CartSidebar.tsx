import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";
 
/**
 * Renders the slide-over cart sidebar for the current anonymous session.
 *
 * @returns The cart sidebar when open, otherwise null.
 * @throws Never.
 */
export function CartSidebar(): JSX.Element | null {
  const { items, isCartOpen, closeCart } = useCartStore();
  const openCheckout = useCheckoutStore((state) => state.open);
 
  if (!isCartOpen) {
    return null;
  }
 
  const totalUsdc = items.reduce((sum, item) => sum + item.priceUsdc * item.quantity, 0);
 
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#771111]/20 backdrop-blur-sm">
      <aside className="flex h-full w-full max-w-md flex-col border-l-2 border-[#771111]/30 bg-[#fae7cc] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#771111]/60">
              Your Selection
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-[#771111]">Cart</h2>
          </div>
          <button
            className="rounded-full border border-[#771111]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111] hover:text-[#fae7cc]"
            onClick={closeCart}
            type="button"
          >
            Close
          </button>
        </div>
 
        <div className="mt-4 h-px w-full bg-[#771111]/20" />
 
        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-[#771111]/30 px-4 py-8 text-center text-sm text-[#771111]/50">
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-[#771111]/20 bg-[#fae7cc]/60 px-4 py-3 shadow-sm"
                  key={item.productId}
                >
                  <div>
                    <p className="font-semibold text-[#771111]">{item.name}</p>
                    <p className="mt-0.5 text-xs text-[#771111]/50">Qty {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#771111]">${(item.priceUsdc * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
 
            <div className="mt-6 space-y-4 border-t border-[#771111]/20 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#771111]/60">Total</p>
                <p className="font-serif text-2xl font-bold text-[#771111]">${totalUsdc.toFixed(2)}</p>
              </div>
              <button
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#771111] px-5 text-sm font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d]"
                onClick={() => {
                  openCheckout(items);
                  closeCart();
                }}
                type="button"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}