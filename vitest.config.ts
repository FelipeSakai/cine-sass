import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    fileParallelism: false,
    pool: "forks",
  },
  resolve: {
    alias: {
      "src": path.resolve(__dirname, "src"),
    },
  },
});
