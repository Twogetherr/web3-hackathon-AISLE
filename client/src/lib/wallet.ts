import { BrowserProvider, type Eip1193Provider } from "ethers";
import type { UnsignedTransaction } from "../types/checkout";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

/**
 * Connects the active browser wallet and returns the selected address.
 *
 * @returns The connected EVM wallet address.
 * @throws {Error} Throws when no browser wallet is available or no account is returned.
 */
export async function connectBrowserWallet(): Promise<string> {
  if (window.ethereum === undefined) {
    throw new Error("MetaMask is required for this checkout flow.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const addresses = (await provider.send("eth_requestAccounts", [])) as string[];
  const walletAddress = addresses[0];

  if (walletAddress === undefined || walletAddress.length === 0) {
    throw new Error("No wallet account was returned.");
  }

  return walletAddress;
}

/**
 * Signs and submits an unsigned EVM transaction through the connected wallet.
 *
 * @param transaction The unsigned transaction prepared by the backend.
 * @returns The submitted transaction hash.
 * @throws {Error} Throws when no browser wallet is available or submission fails.
 */
export async function submitUnsignedTransaction(
  transaction: UnsignedTransaction
): Promise<string> {
  if (window.ethereum === undefined) {
    throw new Error("MetaMask is required for this checkout flow.");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const response = await signer.sendTransaction({
    to: transaction.to,
    data: transaction.data,
    value: transaction.value,
    gasLimit: BigInt(transaction.gasLimit)
  });

  return response.hash;
}
