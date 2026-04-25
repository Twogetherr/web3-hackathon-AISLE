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
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50">
      <aside className="flex h-full w-full max-w-md flex-col border-l border-[#2A2A2A] bg-[#181818] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00C853]">
              Cart
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Your cart</h2>
          </div>
          <button className="text-sm text-[#A0A0A0]" onClick={closeCart} type="button">
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-md border border-[#2A2A2A] px-4 py-6 text-sm text-[#A0A0A0]">
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  className="flex items-center justify-between rounded-md border border-[#2A2A2A] px-4 py-3"
                  key={item.productId}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-[#A0A0A0]">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.priceUsdc * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 border-t border-[#2A2A2A] pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#A0A0A0]">Total</p>
                <p className="text-2xl font-semibold">${totalUsdc.toFixed(2)}</p>
              </div>
              <button
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#00C853] px-5 text-sm font-semibold text-[#08110A]"
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
