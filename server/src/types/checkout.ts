export interface UnsignedTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit: string;
}

export interface CheckoutRequest {
  cartId: string;
  walletAddress: string;
  txHash?: string;
}

export interface OrderConfirmation {
  orderId: string;
  txHash: string;
  amountUsdc: number;
  status: "confirmed" | "pending" | "failed";
  confirmedAt: string | null;
  explorerUrl: string;
  unsignedTransaction: UnsignedTransaction | null;
}
