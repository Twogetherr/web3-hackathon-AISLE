import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Creates the Vite configuration for the AISLE client.
 *
 * @returns The Vite configuration object.
 * @throws Never.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiProxyTarget =
    env.VITE_DEV_API_PROXY_TARGET?.trim() ||
    env.VITE_API_BASE_URL?.trim() ||
    "http://127.0.0.1:3001";

  return {
    plugins: [react()] as unknown as [],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    }
  };
});
