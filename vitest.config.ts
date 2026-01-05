import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts", "**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/dist/",
        "**/build/",
        "prisma/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/src": path.resolve(__dirname, "./src"),
    },
  },
})

