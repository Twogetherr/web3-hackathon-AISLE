import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Creates the Vite configuration for the AISLE client.
 *
 * @returns The Vite configuration object.
 * @throws Never.
 */
export default defineConfig({
  plugins: [react()] as unknown as [],
  server: {
    port: 5173
  }
});
