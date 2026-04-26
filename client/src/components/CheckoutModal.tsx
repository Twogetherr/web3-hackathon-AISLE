import { postCheckout, putCartReplace } from "../lib/apiClient";
import { getOrCreateSessionId } from "../lib/session";
import { connectBrowserWallet, submitUnsignedTransaction } from "../lib/wallet";
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
  const truncatedTxHash =
    lastOrder?.txHash !== undefined && lastOrder.txHash.length > 10
      ? `${lastOrder.txHash.slice(0, 6)}...${lastOrder.txHash.slice(-4)}`
      : lastOrder?.txHash ?? "";
 
  async function handleConfirmPayment(): Promise<void> {
    if (walletAddress.trim().length === 0) {
      setErrorMessage("Connect a wallet before checkout.");
      return;
    }
 
    setSubmitting(true);
    setErrorMessage(null);
 
    try {
      await putCartReplace(
        getOrCreateSessionId(),
        items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      );
 
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
 
  async function handleConnectWallet(): Promise<void> {
    try {
      const nextWalletAddress = await connectBrowserWallet();
      setWalletAddress(nextWalletAddress);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  }
 
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#771111]/20 backdrop-blur-sm px-4 pb-4 pt-12">
      <section className="w-full max-w-2xl rounded-xl border border-[#771111]/30 bg-[#fae7cc] p-6 shadow-2xl">
        {lastOrder?.status === "confirmed" ? (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#771111]/60">
              Success
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#771111]">Payment confirmed</h2>
            <p className="text-sm text-[#771111]/50">{lastOrder.orderId}</p>
            <p className="text-sm text-[#771111]/50">{truncatedTxHash}</p>
            <a
              className="inline-flex text-sm font-semibold text-[#771111] underline underline-offset-4"
              href={lastOrder.explorerUrl}
              rel="noreferrer"
              target="_blank"
            >
              View transaction →
            </a>
            <button
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#771111] px-6 text-sm font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d]"
              onClick={close}
              type="button"
            >
              Continue shopping
            </button>
          </div>
        ) : lastOrder?.status === "pending" ? (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">
              Pending
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#771111]">Payment pending</h2>
            <p className="text-sm text-[#771111]/60">
              Your transaction was submitted, but Avalanche has not confirmed it yet.
            </p>
            <p className="text-sm text-[#771111]/50">{lastOrder.orderId}</p>
            <p className="text-sm text-[#771111]/50">{truncatedTxHash}</p>
            <a
              className="inline-flex text-sm font-semibold text-amber-700 underline underline-offset-4"
              href={lastOrder.explorerUrl}
              rel="noreferrer"
              target="_blank"
            >
              Track transaction →
            </a>
            <button
              className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-[#771111]/30 px-6 text-sm font-bold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111]/10"
              onClick={close}
              type="button"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#771111]/60">
                  Checkout
                </p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-[#771111]">Order summary</h2>
              </div>
              <button
                className="rounded-full border border-[#771111]/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#771111] transition hover:bg-[#771111] hover:text-[#fae7cc]"
                onClick={close}
                type="button"
              >
                Close
              </button>
            </div>
 
            <div className="h-px w-full bg-[#771111]/20" />
 
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-[#771111]/20 bg-[#fae7cc]/60 px-4 py-3"
                  key={item.productId}
                >
                  <div>
                    <p className="font-semibold text-[#771111]">{item.name}</p>
                    <p className="text-xs text-[#771111]/50">Qty {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#771111]">${(item.priceUsdc * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
 
            <div className="rounded-lg border border-[#771111]/20 bg-[#fae7cc]/40 px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-[#771111]" htmlFor="wallet-address">
                  Wallet address
                </label>
                <button
                  className="text-xs font-bold uppercase tracking-widest text-[#771111] underline underline-offset-4"
                  onClick={() => {
                    void handleConnectWallet();
                  }}
                  type="button"
                >
                  Connect MetaMask
                </button>
              </div>
              <input
                className="h-11 w-full rounded-lg border border-[#771111]/30 bg-[#fae7cc] px-3 text-sm text-[#771111] outline-none placeholder:text-[#771111]/30 focus:border-[#771111] focus:ring-1 focus:ring-[#771111]/30"
                id="wallet-address"
                onChange={(event) => setWalletAddress(event.target.value)}
                placeholder="0x..."
                value={walletAddress}
              />
            </div>
 
            <div className="rounded-lg border border-[#771111]/20 px-4 py-3 text-sm text-[#771111]/60">
              Paying from{" "}
              <span className="font-semibold text-[#771111]">{walletAddress || "Not connected"}</span>
            </div>
 
            <div className="flex items-center justify-between border-t border-[#771111]/20 pt-3">
              <p className="text-sm text-[#771111]/60">Total</p>
              <p className="font-serif text-2xl font-bold text-[#771111]">${totalUsdc.toFixed(2)}</p>
            </div>
 
            {errorMessage !== null ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}
 
            <button
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#771111] px-5 text-sm font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d] disabled:cursor-not-allowed disabled:bg-[#771111]/40"
              disabled={isSubmitting || walletAddress.trim().length === 0}
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