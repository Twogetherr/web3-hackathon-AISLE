import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  AVALANCHE_RPC_URL: z.string().url(),
  AVALANCHE_FUJI_RPC_URL: z.string().url(),
  AVALANCHE_CHAIN_ID: z.coerce.number().int().positive(),
  AVALANCHE_FUJI_CHAIN_ID: z.coerce.number().int().positive(),
  USDC_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  USDC_FUJI_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  MERCHANT_WALLET_ADDRESS: z.string().min(1),
  MERCHANT_WALLET_PRIVATE_KEY: z.string().min(1),
  PORT: z.coerce.number().int().positive(),
  VITE_API_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive()
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

/**
 * Reads and validates the process environment for the AISLE server.
 *
 * @param source The process environment object to validate.
 * @returns The validated environment configuration.
 * @throws {Error} Throws when any required environment variable is invalid or missing.
 */
export function getEnvConfig(source: NodeJS.ProcessEnv = process.env): EnvConfig {
  if (cachedEnv !== null && source === process.env) {
    return cachedEnv;
  }

  const parsedEnv = envSchema.parse(source);

  if (source === process.env) {
    cachedEnv = parsedEnv;
  }

  return parsedEnv;
}
