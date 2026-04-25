import type { ApiEnvelope, ApiErrorBody } from "../types/api.js";
import { createRequestId } from "./requestId.js";

/**
 * Builds a successful API response envelope.
 *
 * @param data The payload to return to the client.
 * @returns The standard AISLE response envelope for a successful request.
 * @throws Never.
 */
export function createSuccessResponse<T>(data: T): ApiEnvelope<T> {
  return {
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: createRequestId()
    }
  };
}

/**
 * Builds an error API response envelope.
 *
 * @param error The structured error to return to the client.
 * @returns The standard AISLE response envelope for a failed request.
 * @throws Never.
 */
export function createErrorResponse(error: ApiErrorBody): ApiEnvelope<null> {
  return {
    data: null,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: createRequestId()
    }
  };
}
