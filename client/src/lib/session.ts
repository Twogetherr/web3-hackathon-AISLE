const SESSION_STORAGE_KEY = "aisle_session_id";

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
