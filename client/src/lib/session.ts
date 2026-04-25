const SESSION_STORAGE_KEY = "aisle_session_id";
const WALLET_STORAGE_PREFIX = "aisle_wallet_address";

/**
 * Returns the anonymous AISLE session id, creating one if absent.
 *
 * @returns The stable anonymous session id stored in localStorage.
 * @throws Never.
 */
export function getOrCreateSessionId(): string {
  const existingSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (existingSessionId !== null && existingSessionId.length > 0) {
    return existingSessionId;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);

  return sessionId;
}

/**
 * Returns the stored wallet address for the active anonymous session.
 *
 * @returns The persisted wallet address, or an empty string when none is stored.
 * @throws Never.
 */
export function getStoredWalletAddress(): string {
  const storageKey = `${WALLET_STORAGE_PREFIX}:${getOrCreateSessionId()}`;

  return window.localStorage.getItem(storageKey) ?? "";
}

/**
 * Persists the wallet address for the active anonymous session.
 *
 * @param walletAddress The wallet address to store for checkout reuse.
 * @returns Never returns a value.
 * @throws Never.
 */
export function setStoredWalletAddress(walletAddress: string): void {
  const storageKey = `${WALLET_STORAGE_PREFIX}:${getOrCreateSessionId()}`;

  if (walletAddress.trim().length === 0) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, walletAddress);
}
