import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "tests/unit/**/*.test.ts",
      "tests/unit/**/*.spec.ts",
      "tests/integration/**/*.test.ts",
      "tests/integration/**/*.spec.ts",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "client/tests/playwright/**"],
  },
});
