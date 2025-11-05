import { defineConfig, configDefaults } from "vitest/config";
import { mergeConfig } from "vite";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: false,
      setupFiles: ["tests/setup/setupTests.ts"],
      include: ["tests/**/*.{test,spec}.{ts,tsx}"],
      exclude: [
        ...configDefaults.exclude,
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "e2e/**",
      ],
      reporters: ["default"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        all: true,
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/main.tsx",
          "src/App.tsx",
          "src/**/*.d.ts",
          "src/**/index.{ts,tsx}",
          "src/**/types.{ts,tsx}",
          "src/**/stories/**",
          "tests/**",
        ],
        thresholds: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
  })
);
