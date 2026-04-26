import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutModal } from "../components/CheckoutModal";
import { useCheckoutStore } from "../store/checkoutStore";

vi.mock("../lib/wallet", () => ({
  connectBrowserWallet: vi.fn(),
  submitUnsignedTransaction: vi.fn()
}));

import { connectBrowserWallet, submitUnsignedTransaction } from "../lib/wallet";

describe("CheckoutModal", () => {
  const connectBrowserWalletMock = vi.mocked(connectBrowserWallet);
  const submitUnsignedTransactionMock = vi.mocked(submitUnsignedTransaction);

  beforeEach(() => {
    vi.restoreAllMocks();
    connectBrowserWalletMock.mockReset();
    submitUnsignedTransactionMock.mockReset();
    useCheckoutStore.setState({
      isOpen: true,
      items: [
        {
          productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
          quantity: 1,
          priceUsdc: 4.99,
          name: "Organic Oat Milk 1L",
          imageUrl: "https://example.com/oat-milk.png"
        }
      ],
      walletAddress: "0x1111111111111111111111111111111111111111",
      lastOrder: null,
      errorMessage: null,
      isSubmitting: false
    });
  });

  it("opens the shared checkout modal and shows the current order summary", () => {
    render(<CheckoutModal />);

    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getByText("Organic Oat Milk 1L")).toBeInTheDocument();
    expect(screen.getAllByText("$4.99")).toHaveLength(2);
  });

  it("connects a browser wallet from the modal", async () => {
    connectBrowserWalletMock.mockResolvedValueOnce(
      "0x2222222222222222222222222222222222222222"
    );

    useCheckoutStore.setState({
      walletAddress: ""
    });

    render(<CheckoutModal />);

    fireEvent.click(screen.getByRole("button", { name: "Connect MetaMask" }));

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("0x2222222222222222222222222222222222222222")
      ).toBeInTheDocument();
    });
  });

  it("submits checkout and renders the success state", async () => {
    submitUnsignedTransactionMock.mockResolvedValueOnce("0xabc123");
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: "session-cart",
              items: [
                {
                  productId: "5b03e0e7-c73b-4c59-bf95-cf7afbe0e9b1",
                  quantity: 1,
                  priceUsdc: 4.99,
                  name: "Organic Oat Milk 1L",
                  imageUrl: "https://example.com/oat-milk.png"
                }
              ],
              createdAt: "2026-04-25T08:00:00.000Z",
              updatedAt: "2026-04-25T08:00:00.000Z",
              totalUsdc: 4.99
            },
            error: null,
            meta: {
              timestamp: "2026-04-25T08:10:00.000Z",
              requestId: "request-replace"
            }
          })
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              orderId: "draft-order-id",
              txHash: "",
              amountUsdc: 4.99,
              status: "pending",
              confirmedAt: null,
              explorerUrl: "",
              unsignedTransaction: {
                to: "0x5425890298aed601595a70AB815c96711a31Bc65",
                data: "0xa9059cbb",
                value: "0x0",
                gasLimit: "65000"
              }
            },
            error: null,
            meta: {
              timestamp: "2026-04-25T08:10:00.000Z",
              requestId: "request-4a"
            }
          })
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              orderId: "c1bb8f81-393c-4b03-a9c8-a80d365be9e9",
              txHash: "0xabc1234567890def",
              amountUsdc: 4.99,
              status: "confirmed",
              confirmedAt: "2026-04-25T08:10:00.000Z",
              explorerUrl: "https://testnet.snowtrace.io/tx/0xabc1234567890def",
              unsignedTransaction: null
            },
            error: null,
            meta: {
              timestamp: "2026-04-25T08:10:00.000Z",
              requestId: "request-4b"
            }
          })
        )
      );

    render(<CheckoutModal />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm & Pay" }));

    await waitFor(() => {
      expect(screen.getByText("Payment confirmed")).toBeInTheDocument();
    });

    expect(submitUnsignedTransactionMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("c1bb8f81-393c-4b03-a9c8-a80d365be9e9")).toBeInTheDocument();
    expect(screen.getByText("0xabc1...0def")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View transaction" })).toHaveAttribute(
      "href",
      "https://testnet.snowtrace.io/tx/0xabc1234567890def"
    );
  });

  it("renders a pending payment state when confirmation has not arrived yet", () => {
    useCheckoutStore.setState({
      lastOrder: {
        orderId: "pending-order-id",
        txHash: "0xfeed1234567890beef",
        amountUsdc: 4.99,
        status: "pending",
        confirmedAt: null,
        explorerUrl: "https://testnet.snowtrace.io/tx/0xfeed1234567890beef",
        unsignedTransaction: null
      }
    });

    render(<CheckoutModal />);

    expect(screen.getByText("Payment pending")).toBeInTheDocument();
    expect(screen.getByText("pending-order-id")).toBeInTheDocument();
    expect(screen.getByText("0xfeed...beef")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Track transaction" })).toHaveAttribute(
      "href",
      "https://testnet.snowtrace.io/tx/0xfeed1234567890beef"
    );
  });

  it("requires a wallet address before payment submission", async () => {
    useCheckoutStore.setState({
      walletAddress: ""
    });

    render(<CheckoutModal />);

    expect(screen.getByRole("button", { name: "Confirm & Pay" })).toBeDisabled();
  });
});
