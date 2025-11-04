import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwind from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const r = (p: string) =>
  path.resolve(fileURLToPath(new URL(".", import.meta.url)), p);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      "@app": r("src/app"),
      "@entities": r("src/entities"),
      "@features": r("src/features"),
      "@widgets": r("src/widgets"),
      "@pages": r("src/pages"),
      "@shared": r("src/shared"),
    },
  },
});
