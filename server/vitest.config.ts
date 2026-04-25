import { defineConfig } from "vitest/config";

/**
 * Creates the backend Vitest configuration.
 *
 * @returns The Vitest configuration object for backend tests.
 * @throws Never.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["src/tests/**", "src/index.ts"]
    }
  }
});
