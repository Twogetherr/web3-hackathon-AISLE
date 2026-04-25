import rateLimit, { type Options } from "express-rate-limit";
import type { RequestHandler } from "express";
import { getEnvConfig } from "../env.js";
import { createErrorResponse } from "./response.js";

/**
 * Creates the shared rate limiter for AI agent endpoints.
 *
 * @returns An Express middleware that enforces the configured agent request limit.
 * @throws Never.
 */
export function createAgentRateLimiter(): RequestHandler {
  const env = getEnvConfig();
  const options: Partial<Options> = {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: false,
    legacyHeaders: false,
    keyGenerator: (request) => request.ip ?? "unknown",
    handler: (_request, response) => {
      console.error("Agent rate limit breached", {
        requestId: "system",
        retryAfterSeconds: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000)
      });

      response.setHeader("Retry-After", String(Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000)));
      response.status(429).json(
        createErrorResponse({
          code: "RATE_LIMITED",
          message: "Too many agent requests. Please retry in 60 seconds."
        })
      );
    }
  };

  return rateLimit(options);
}
