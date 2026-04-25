import { randomUUID } from "node:crypto";

/**
 * Creates a request identifier for API tracing.
 *
 * @returns A UUID string suitable for request correlation.
 * @throws Never.
 */
export function createRequestId(): string {
  return randomUUID();
}
