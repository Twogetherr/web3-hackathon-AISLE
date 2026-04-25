import { postCheckout } from "../lib/apiClient";
import { getOrCreateSessionId } from "../lib/session";
import { submitUnsignedTransaction } from "../lib/wallet";
import { useCartStore } from "../store/cartStore";
import { useCheckoutStore } from "../store/checkoutStore";

/**
 * Renders the shared slide-up checkout modal.
 *
 * @returns The checkout modal when open, otherwise null.
 * @throws Never.
 */
export function CheckoutModal(): JSX.Element | null {
  const {
    isOpen,
    items,
    walletAddress,
    lastOrder,
    errorMessage,
    isSubmitting,
    close,
    setWalletAddress,
    setSubmitting,
    setLastOrder,
    setErrorMessage
  } = useCheckoutStore();
  const clearCart = useCartStore((state) => state.clearCart);

  if (!isOpen) {
    return null;
  }

  const totalUsdc = items.reduce((sum, item) => sum + item.priceUsdc * item.quantity, 0);

  async function handleConfirmPayment(): Promise<void> {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const preparedOrder = await postCheckout({
        cartId: getOrCreateSessionId(),
        walletAddress
      });
      const txHash =
        preparedOrder.unsignedTransaction === null
          ? preparedOrder.txHash
          : await submitUnsignedTransaction(preparedOrder.unsignedTransaction);
      const order =
        preparedOrder.unsignedTransaction === null
          ? preparedOrder
          : await postCheckout({
              cartId: getOrCreateSessionId(),
              walletAddress,
              txHash
            });

      setLastOrder(order);

      if (order.status === "confirmed") {
        clearCart();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-4 pt-12">
      <section className="w-full max-w-2xl rounded-lg border border-[#2A2A2A] bg-[#181818] p-6 shadow-2xl">
        {lastOrder?.status === "confirmed" ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00C853]">
              Success
            </p>
            <h2 className="text-3xl font-semibold">Payment confirmed</h2>
            <p className="text-sm text-[#A0A0A0]">{lastOrder.orderId}</p>
            <a
              className="inline-flex text-sm font-medium text-[#00C853]"
              href={lastOrder.explorerUrl}
              rel="noreferrer"
              target="_blank"
            >
              View transaction
            </a>
            <button
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#00C853] px-5 text-sm font-semibold text-[#08110A]"
              onClick={close}
              type="button"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00C853]">
                  Checkout
                </p>
                <h2 className="mt-3 text-2xl font-semibold">Order summary</h2>
              </div>
              <button className="text-sm text-[#A0A0A0]" onClick={close} type="button">
                Close
              </button>
            </div>

            <div className="space-y-3">
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

            <div className="rounded-md border border-[#2A2A2A] px-4 py-3">
              <label className="mb-2 block text-sm font-medium" htmlFor="wallet-address">
                Wallet address
              </label>
              <input
                className="h-11 w-full rounded-md border border-[#2A2A2A] bg-[#101010] px-3 text-sm text-white outline-none"
                id="wallet-address"
                onChange={(event) => setWalletAddress(event.target.value)}
                value={walletAddress}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-[#A0A0A0]">Total</p>
              <p className="text-2xl font-semibold">${totalUsdc.toFixed(2)}</p>
            </div>

            {errorMessage !== null ? (
              <p className="rounded-md border border-[#5A2323] bg-[#2B1414] px-3 py-2 text-sm text-[#FF7474]">
                {errorMessage}
              </p>
            ) : null}

            <button
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#00C853] px-5 text-sm font-semibold text-[#08110A] disabled:cursor-not-allowed disabled:bg-[#235A34]"
              disabled={isSubmitting}
              onClick={() => {
                void handleConfirmPayment();
              }}
              type="button"
            >
              {isSubmitting ? "Preparing payment..." : "Confirm & Pay"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
