import { Contract, JsonRpcProvider, Interface, formatUnits, isAddress, type TransactionReceipt } from "ethers";
import { getEnvConfig } from "../env.js";

const ERC20_INTERFACE = new Interface([
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
]);

/**
 * Returns the configured Fuji RPC provider for checkout flows.
 *
 * @returns The JSON-RPC provider for Avalanche Fuji.
 * @throws Never.
 */
export function getFujiProvider(): JsonRpcProvider {
  const env = getEnvConfig();

  return new JsonRpcProvider(env.AVALANCHE_FUJI_RPC_URL, env.AVALANCHE_FUJI_CHAIN_ID);
}

/**
 * Returns the configured USDC contract address for the Fuji demo flow.
 *
 * @returns The Fuji USDC contract address.
 * @throws Never.
 */
export function getFujiUsdcContractAddress(): string {
  return getEnvConfig().USDC_FUJI_CONTRACT_ADDRESS;
}

/**
 * Returns the Snowtrace transaction URL for a hash.
 *
 * @param txHash The transaction hash to link to.
 * @returns The Fuji Snowtrace URL for the transaction.
 * @throws Never.
 */
export function getFujiExplorerUrl(txHash: string): string {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}

/**
 * Reads the USDC balance for a wallet on Fuji.
 *
 * @param walletAddress The wallet to inspect.
 * @returns The wallet balance in decimal USDC.
 * @throws {Error} Throws when the chain call fails.
 */
export async function getFujiUsdcBalance(walletAddress: string): Promise<number> {
  const provider = getFujiProvider();
  const contract = new Contract(getFujiUsdcContractAddress(), ERC20_INTERFACE, provider);
  const balance = (await contract.getFunction("balanceOf").staticCall(walletAddress)) as bigint;

  return Number(formatUnits(balance, 6));
}

/**
 * Builds an unsigned USDC transfer transaction for the merchant wallet.
 *
 * @param amountUsdc The decimal USDC amount to transfer.
 * @returns The unsigned transaction request shape for client-side signing.
 * @throws Never.
 */
export function buildUnsignedFujiUsdcTransfer(amountUsdc: number): {
  to: string;
  data: string;
  value: string;
  gasLimit: string;
} {
  const env = getEnvConfig();
  const encodedTransfer = ERC20_INTERFACE.encodeFunctionData("transfer", [
    env.MERCHANT_WALLET_ADDRESS,
    BigInt(Math.round(amountUsdc * 1_000_000))
  ]);

  return {
    to: getFujiUsdcContractAddress(),
    data: encodedTransfer,
    value: "0x0",
    gasLimit: "65000"
  };
}

/**
 * Polls Fuji for a transaction receipt up to the configured retry window.
 *
 * @param txHash The transaction hash to confirm.
 * @returns The transaction receipt, or null when it remains unconfirmed.
 * @throws {Error} Throws when the RPC repeatedly fails.
 */
export async function pollFujiTransaction(
  txHash: string
): Promise<TransactionReceipt | null> {
  const provider = getFujiProvider();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const receipt = await provider.getTransactionReceipt(txHash);

    if (receipt !== null) {
      return receipt;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 10_000);
    });
  }

  return null;
}

/**
 * Determines whether a string is a valid EVM address.
 *
 * @param walletAddress The address to validate.
 * @returns True when the address is a valid EVM address.
 * @throws Never.
 */
export function isValidWalletAddress(walletAddress: string): boolean {
  return isAddress(walletAddress);
}
