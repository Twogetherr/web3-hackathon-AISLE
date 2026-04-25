import { defineConfig } from "vitest/config";

/**
 * Creates the frontend Vitest configuration.
 *
 * @returns The Vitest configuration object for client tests.
 * @throws Never.
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/**/*.test.ts?(x)"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      all: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/tests/**", "src/main.tsx"]
    }
  }
});
